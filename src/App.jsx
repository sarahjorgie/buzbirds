import { useState, useEffect, useCallback, useRef } from 'react'
import FlashCard from './components/FlashCard'
import FilterMenu from './components/FilterMenu'
import CardProgress from './components/CardProgress'
import QuizMode from './components/QuizMode'
import Collection from './components/Collection'
import CollectionReview from './components/CollectionReview'
import BirdleGame, { STORAGE_KEY as BIRDLE_KEY } from './components/BirdleGame'
import { useProgress } from './hooks/useProgress'
import WelcomeMessage, { hasSeenWelcome } from './components/WelcomeMessage'
import { SA_PROVINCES } from './data/provinces'
import { BIRD_GROUPS } from './data/birdGroups'
import { TRIP_DESTINATIONS } from './data/tripDestinations'
import { resolvePlaceId, resolveTaxonId, preloadIds } from './utils/apiLookup'
import { prefetchTaxonomy } from './utils/gbif'

const PER_PAGE = 200
const MAX_PAGES = 10

async function fetchPage(placeId, taxonId, page) {
  const params = new URLSearchParams({
    taxon_id: taxonId,
    place_id: placeId,
    per_page: PER_PAGE,
    page,
    verifiable: 'true',
    order: 'desc',
    order_by: 'observations_count',
  })
  const res = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?${params}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen({ loaded, total, page, message }) {
  const pct = total > 0 ? Math.min(100, Math.round((loaded / Math.min(total, MAX_PAGES * PER_PAGE)) * 100)) : 0
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-7xl mb-6 animate-bounce">🦅</div>
      <h1 className="text-3xl font-bold text-white mb-1">Loading Birds…</h1>
      <p className="text-green-300 mb-8 text-sm">{message}</p>
      <div className="w-72 bg-white/10 rounded-full h-3 overflow-hidden mb-3">
        <div
          className="h-full rounded-full progress-shimmer transition-all duration-500"
          style={{ width: `${Math.max(5, pct)}%` }}
        />
      </div>
      <p className="text-white/50 text-sm">
        {loaded > 0 ? `${loaded} species loaded` : 'Loading…'}
      </p>
    </div>
  )
}

// ── Resolving overlay ─────────────────────────────────────────────────────
function ResolvingScreen({ label }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-white mb-2">Applying Filter…</h2>
      <p className="text-green-300 text-sm">{label || 'Looking up from iNaturalist'}</p>
    </div>
  )
}

// ── Empty / error state ───────────────────────────────────────────────────
function EmptyState({ title, message, onClearFilters, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/50 mb-6 text-sm max-w-sm">{message}</p>
      <div className="flex gap-3 flex-wrap justify-center">
        {onClearFilters && (
          <button onClick={onClearFilters} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors">
            Clear Filters
          </button>
        )}
        {onRetry && (
          <button onClick={onRetry} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors">
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [filters, setFilters] = useState({
    placeId: 113055, taxonIds: [3],
    provinceKey: 'all', groupIds: ['all'], tripKey: null,
  })
  const [resolving, setResolving] = useState(false)
  const [resolvingLabel, setResolvingLabel] = useState('')

  // Keep species (source of truth) and deck (what's displayed, may be shuffled) separate
  const [species, setSpecies] = useState([])
  const [deck, setDeck]       = useState([])

  const [loadingFirst, setLoadingFirst] = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [currentPage, setCurrentPage]       = useState(1)
  const [error, setError] = useState(null)

  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped]     = useState(false)
  const [shuffled, setShuffled]   = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [menuTab, setMenuTab]           = useState('Region')
  const [hideKnown, setHideKnown]       = useState(true)
  const [quizOpen, setQuizOpen]         = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [reviewOpen, setReviewOpen]         = useState(false)
  const [birdleOpen, setBirdleOpen]     = useState(false)
  const [birdleDone, setBirdleDone]     = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(BIRDLE_KEY))
      return s?.date === new Date().toISOString().slice(0, 10) && s?.gameState !== 'playing'
    } catch { return false }
  })
  const [welcomeOpen, setWelcomeOpen]   = useState(() => !hasSeenWelcome())

  const [cardAnim, setCardAnim] = useState({ x: 0, rotate: 0, transition: false })

  const abortRef      = useRef(null)
  const touchStartX   = useRef(null)
  const touchStartY   = useRef(null)
  const didSwipe      = useRef(false)
  const animatingRef  = useRef(false)
  const deckLengthRef = useRef(1)
  const cardWrapperRef = useRef(null)

  // Non-passive touchmove so we can preventDefault for horizontal swipes.
  // React synthetic handlers are passive — iOS Safari ignores preventDefault there.
  useEffect(() => {
    const el = cardWrapperRef.current
    if (!el) return
    const onMove = (e) => {
      if (animatingRef.current || touchStartX.current === null) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - touchStartY.current
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        e.preventDefault()
        setCardAnim({ x: dx, rotate: dx / 25, transition: false })
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [])
  const { progress, markCard, clearProgress, collected, addToCollection, removeFromCollection, clearCollection, needsReview, markNeedsReview, clearNeedsReview } = useProgress()

  // ── Preload all province/group IDs silently on startup ────────────────
  useEffect(() => {
    preloadIds(SA_PROVINCES, BIRD_GROUPS)
  }, [])

  // ── Fetch species pages ───────────────────────────────────────────────
  const loadSpecies = useCallback(async (placeId, taxonIds) => {
    if (abortRef.current) abortRef.current.aborted = true
    const abort = { aborted: false }
    abortRef.current = abort

    setLoadingFirst(true)
    setError(null)
    setCardIndex(0)
    setFlipped(false)
    setShuffled(false)
    setCurrentPage(1)
    setSpecies([])
    setDeck([])

    try {
      if (taxonIds.length === 1) {
        // ── Single group: paginate fully ────────────────────────────────
        const taxonId = taxonIds[0]
        const first = await fetchPage(placeId, taxonId, 1)
        if (abort.aborted) return

        setTotalAvailable(first.total_results)
        const withPhotos = first.results.filter(s => s.taxon?.default_photo)
        setSpecies(withPhotos)
        setDeck(withPhotos)
        setLoadingFirst(false)
        prefetchTaxonomy(withPhotos.slice(0, 50).map(s => s.taxon?.name).filter(Boolean))

        const maxPages = Math.min(MAX_PAGES, Math.ceil(first.total_results / PER_PAGE))
        if (maxPages > 1) {
          setLoadingMore(true)
          for (let page = 2; page <= maxPages; page++) {
            if (abort.aborted) return
            await new Promise(r => setTimeout(r, 350))
            if (abort.aborted) return
            setCurrentPage(page)
            const data = await fetchPage(placeId, taxonId, page)
            if (abort.aborted) return
            const filtered = data.results.filter(s => s.taxon?.default_photo)
            if (filtered.length > 0) {
              setSpecies(prev => [...prev, ...filtered])
              setDeck(prev => [...prev, ...filtered])
            }
          }
          setLoadingMore(false)
        }
      } else {
        // ── Multiple groups: fetch first 2 pages each in parallel, merge ─
        const pages = await Promise.all(
          taxonIds.flatMap(id => [
            fetchPage(placeId, id, 1),
            fetchPage(placeId, id, 2),
          ])
        )
        if (abort.aborted) return
        const seen = new Set()
        const merged = pages
          .flatMap(d => d.results.filter(s => s.taxon?.default_photo))
          .filter(s => { if (seen.has(s.taxon.id)) return false; seen.add(s.taxon.id); return true })
          .sort((a, b) => b.count - a.count)
        setTotalAvailable(merged.length)
        setSpecies(merged)
        setDeck(merged)
        setLoadingFirst(false)
        prefetchTaxonomy(merged.slice(0, 50).map(s => s.taxon?.name).filter(Boolean))
      }
    } catch (err) {
      if (!abort.aborted) {
        setError(err.message)
        setLoadingFirst(false)
        setLoadingMore(false)
      }
    }
  }, [])

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    loadSpecies(113055, [3])
  }, [loadSpecies])

  // ── Filter changes — resolve IDs first, then fetch ────────────────────
  const handleFilterChange = useCallback(async ({ provinceKey, groupIds, tripKey }) => {
    if (tripKey !== undefined && tripKey !== null) setMenuOpen(false)

    try {
      let placeId        = filters.placeId
      let newProvinceKey = provinceKey ?? filters.provinceKey
      let newGroupIds    = groupIds    ?? filters.groupIds
      let newTripKey     = tripKey     !== undefined ? tripKey : filters.tripKey

      // Trip and province are mutually exclusive region filters
      if (tripKey !== undefined) {
        if (tripKey === null) {
          placeId = 113055
          newProvinceKey = 'all'
        } else {
          const trip = TRIP_DESTINATIONS.find(t => t.key === tripKey)
          if (trip) {
            placeId = trip.placeId
            newProvinceKey = 'all'
          }
        }
      } else if (provinceKey !== undefined && provinceKey !== filters.provinceKey) {
        // Switching province clears trip
        newTripKey = null
        const province = SA_PROVINCES.find(p => p.key === provinceKey)
        if (province) {
          if (province.placeId) {
            placeId = province.placeId
          } else if (province.searchQuery) {
            setResolving(true)
            setResolvingLabel(`Finding ${province.name} on iNaturalist…`)
            placeId = await resolvePlaceId(province.searchQuery)
            province.placeId = placeId
          }
        }
      }

      // Resolve taxon IDs for all selected groups
      const resolvedTaxonIds = await Promise.all(
        newGroupIds.map(async (gid) => {
          if (gid === 'all') return 3
          const group = BIRD_GROUPS.find(g => g.id === gid)
          if (!group) return null
          if (group.taxonId) return group.taxonId
          if (group.searchQuery) {
            setResolving(true)
            setResolvingLabel(`Finding ${group.name} taxonomy…`)
            const id = await resolveTaxonId(group.searchQuery)
            group.taxonId = id
            return id
          }
          return null
        })
      )
      const taxonIds = resolvedTaxonIds.filter(Boolean)

      setResolving(false)
      setFilters({ placeId, taxonIds, provinceKey: newProvinceKey, groupIds: newGroupIds, tripKey: newTripKey })
      loadSpecies(placeId, taxonIds)

    } catch (err) {
      setResolving(false)
      setError(`Filter lookup failed: ${err.message}. Showing previous results.`)
    }
  }, [filters, loadSpecies])

  // ── Keyboard nav ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuOpen) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev()
      if (e.key === ' ' || e.key === 'Enter') setFlipped(f => !f)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleNext = useCallback(() => {
    setFlipped(false)
    setCardAnim({ x: 0, rotate: 0, transition: false })
    setTimeout(() => setCardIndex(i => (i + 1) % Math.max(1, deck.length)), 120)
  }, [deck.length])

  const handlePrev = useCallback(() => {
    setFlipped(false)
    setCardAnim({ x: 0, rotate: 0, transition: false })
    setTimeout(() => setCardIndex(i => (i - 1 + deck.length) % Math.max(1, deck.length)), 120)
  }, [deck.length])

  const swipeNavigate = useCallback((direction) => {
    if (animatingRef.current) return
    animatingRef.current = true

    const exitX  = direction === 'left' ? -750 : 750
    const enterX = direction === 'left' ?  750 : -750

    // 1. Fly current card off-screen
    setCardAnim({ x: exitX, rotate: exitX / 35, transition: true })

    setTimeout(() => {
      // 2. Swap to next card, position it off-screen (no transition)
      setFlipped(false)
      if (direction === 'left') {
        setCardIndex(i => (i + 1) % Math.max(1, deckLengthRef.current))
      } else {
        setCardIndex(i => (i - 1 + deckLengthRef.current) % Math.max(1, deckLengthRef.current))
      }
      setCardAnim({ x: enterX, rotate: 0, transition: false })

      // 3. On next frame, animate new card to center
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setCardAnim({ x: 0, rotate: 0, transition: true })
        setTimeout(() => { animatingRef.current = false }, 320)
      }))
    }, 280)
  }, [])

  const handleShuffle = () => {
    setFlipped(false)
    setDeck(shuffleArray(species))
    setCardIndex(0)
    setShuffled(true)
  }

  const handleReset = () => {
    setFlipped(false)
    setDeck([...species])
    setCardIndex(0)
    setShuffled(false)
  }

  const clearFilters = () => {
    handleFilterChange({ provinceKey: 'all', groupIds: ['all'], tripKey: null })
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (resolving) return <ResolvingScreen label={resolvingLabel} />

  if (loadingFirst) {
    const province   = SA_PROVINCES.find(p => p.key === filters.provinceKey)
    const trip       = filters.tripKey ? TRIP_DESTINATIONS.find(t => t.key === filters.tripKey) : null
    const groupNames = filters.groupIds.filter(id => id !== 'all').map(id => BIRD_GROUPS.find(g => g.id === id)?.name).filter(Boolean)
    const parts = [
      trip ? trip.name : (province?.key !== 'all' ? province.name : 'All of South Africa'),
      groupNames.length > 0 ? groupNames.join(' + ') : null,
    ].filter(Boolean)
    return (
      <LoadingScreen
        loaded={species.length}
        total={totalAvailable}
        page={currentPage}
        message={parts.join(' · ')}
      />
    )
  }

  if (error && deck.length === 0) {
    return (
      <EmptyState
        title="Something went wrong"
        message={error}
        onClearFilters={filters.placeId !== 113055 || !filters.taxonIds.every(id => id === 3) ? clearFilters : null}
        onRetry={() => loadSpecies(filters.placeId, filters.taxonIds)}
      />
    )
  }

  if (deck.length === 0) {
    return (
      <EmptyState
        title="No birds found"
        message="No species with photos found for this filter. Try a different region or group."
        onClearFilters={clearFilters}
      />
    )
  }

  // Derive visible deck — hideKnown filters out marked cards without changing deck state
  // (deck stays full for quiz distractor pool)
  const visibleDeck = hideKnown
    ? deck.filter(s => progress[s.taxon?.id] !== 'known')
    : deck

  // Clamp cardIndex if visibleDeck shrinks
  const safeIndex = visibleDeck.length > 0
    ? Math.min(cardIndex, visibleDeck.length - 1)
    : 0

  const current    = visibleDeck[safeIndex]
  const cardStatus = progress[current?.taxon?.id]
  const knownCount = deck.filter(s => progress[s.taxon?.id] === 'known').length

  const activeProvince  = SA_PROVINCES.find(p => p.key === filters.provinceKey)
  const activeTrip      = filters.tripKey ? TRIP_DESTINATIONS.find(t => t.key === filters.tripKey) : null
  const activeGroups    = filters.groupIds.filter(id => id !== 'all').map(id => BIRD_GROUPS.find(g => g.id === id)).filter(Boolean)
  const filtersActive   = filters.placeId !== 113055 || activeGroups.length > 0

  // Keep ref in sync so swipeNavigate setTimeout doesn't stale-close over deck length
  deckLengthRef.current = visibleDeck.length

  return (
    <>
      {welcomeOpen && <WelcomeMessage onClose={() => setWelcomeOpen(false)} />}

      {quizOpen && (
        <QuizMode
          species={species}
          deck={deck}
          progress={progress}
          onClose={() => setQuizOpen(false)}
          onMarkKnown={(id) => markCard(id, 'known')}
          addToCollection={addToCollection}
          markNeedsReview={markNeedsReview}
          clearNeedsReview={clearNeedsReview}
        />
      )}

      {collectionOpen && (
        <Collection
          collected={collected}
          totalSpecies={species.length}
          onClose={() => setCollectionOpen(false)}
          onClearCollection={clearCollection}
          onRemoveBird={removeFromCollection}
          onReview={() => { setCollectionOpen(false); setReviewOpen(true) }}
          needsReview={needsReview}
          onDismissFlag={clearNeedsReview}
        />
      )}

      {reviewOpen && (
        <CollectionReview
          collected={collected}
          onClose={() => { setReviewOpen(false); setCollectionOpen(true) }}
          markNeedsReview={markNeedsReview}
          clearNeedsReview={clearNeedsReview}
        />
      )}

      {birdleOpen && (
        <BirdleGame
          species={species}
          onClose={() => {
            setBirdleOpen(false)
            try {
              const s = JSON.parse(localStorage.getItem(BIRDLE_KEY))
              setBirdleDone(s?.date === new Date().toISOString().slice(0, 10) && s?.gameState !== 'playing')
            } catch {}
          }}
        />
      )}

      <FilterMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        progress={progress}
        deck={deck}
        onClearProgress={clearProgress}
        groupIds={filters.groupIds}
        tripKey={filters.tripKey}
        activeTab={menuTab}
        onTabChange={setMenuTab}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center px-4 py-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>

        {/* Header */}
        <header className="w-full max-w-md mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white leading-tight">BuzBirds</h1>
                <button
                  onClick={() => setWelcomeOpen(true)}
                  title="A note for you"
                  className="text-rose-400/50 hover:text-rose-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-green-400 text-xs">
                  {species.length.toLocaleString()} species
                  {loadingMore && <span className="text-green-600 ml-1">· loading…</span>}
                </span>
                {activeTrip && (
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                    {activeTrip.name}
                    <button onClick={() => handleFilterChange({ tripKey: null })} className="text-blue-500 hover:text-white">×</button>
                  </span>
                )}
                {!activeTrip && activeProvince?.key !== 'all' && (
                  <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {activeProvince.emoji} {activeProvince.name}
                    <button onClick={() => handleFilterChange({ provinceKey: 'all' })} className="text-green-500 hover:text-white">×</button>
                  </span>
                )}
                {activeGroups.map(group => (
                  <span key={group.id} className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {group.name}
                    <button onClick={() => handleFilterChange({ groupIds: filters.groupIds.filter(id => id !== group.id) || ['all'] })} className="text-emerald-500 hover:text-white">×</button>
                  </span>
                ))}
                {hideKnown && (
                  <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                    hiding {knownCount} known
                  </span>
                )}
                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-white/40 hover:text-white/70 px-2 py-0.5 rounded-full border border-white/15 hover:border-white/30 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-1.5 mt-0.5 shrink-0">
              {/* Shuffle */}
              <button
                onClick={shuffled ? handleReset : handleShuffle}
                title={shuffled ? 'Restore order' : 'Shuffle'}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                {shuffled ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h7M4 18h7m7 0l3-3m0 0l-3-3m3 3h-6" />
                  </svg>
                )}
              </button>

              {/* Hide known */}
              <button
                onClick={() => { setHideKnown(h => !h); setCardIndex(0) }}
                title={hideKnown ? 'Show all birds' : 'Hide known birds'}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${hideKnown ? 'bg-green-600 hover:bg-green-500' : 'bg-white/10 hover:bg-white/20'} text-white`}
              >
                {hideKnown ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>

              {/* Filters */}
              <button
                onClick={() => setMenuOpen(true)}
                title="Filters"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${filtersActive ? 'bg-green-600 hover:bg-green-500' : 'bg-white/10 hover:bg-white/20'} text-white`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar — known only */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${deck.length > 0 ? (knownCount / deck.length) * 100 : 0}%` }} />
            </div>
            <span className="text-white/40 text-xs shrink-0">
              {safeIndex + 1} / {visibleDeck.length}
            </span>
          </div>
          {knownCount > 0 && (
            <p className="text-right text-green-500/60 text-xs mt-0.5">
              {knownCount} known · {deck.length - knownCount} to learn
            </p>
          )}
        </header>

        {/* Feature buttons */}
        <div className="w-full max-w-md mb-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => setQuizOpen(true)}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-green-500/50 text-white font-medium transition-all flex flex-col items-center gap-1 text-xs"
          >
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Quiz
          </button>

          <button
            onClick={() => setBirdleOpen(true)}
            className={`py-2.5 rounded-xl border font-medium transition-all flex flex-col items-center gap-1 text-xs ${birdleDone ? 'bg-white/10 hover:bg-white/15 border-white/10 hover:border-green-500/50 text-white' : 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-orange-300 animate-pulse'}`}
          >
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            BuzBirdle
          </button>

          <button
            onClick={() => setCollectionOpen(true)}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-green-500/50 text-white font-medium transition-all flex flex-col items-center gap-1 text-xs"
          >
            {/* Collection/grid icon */}
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {Object.keys(collected).length > 0
              ? `${Object.keys(collected).length} birds`
              : 'Collection'}
          </button>
        </div>

        {/* Flashcard */}
        <div
          ref={cardWrapperRef}
          className="w-full max-w-md"
          style={{
            touchAction: 'manipulation',
            transform: `translateX(${cardAnim.x}px) rotate(${cardAnim.rotate}deg)`,
            transition: cardAnim.transition ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
            willChange: 'transform',
          }}
          onTouchStart={e => {
            if (animatingRef.current) return
            touchStartX.current = e.touches[0].clientX
            touchStartY.current = e.touches[0].clientY
            didSwipe.current = false
          }}
          onTouchEnd={e => {
            if (animatingRef.current) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            const dy = e.changedTouches[0].clientY - touchStartY.current
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
              didSwipe.current = true
              swipeNavigate(dx < 0 ? 'left' : 'right')
            } else {
              setCardAnim({ x: 0, rotate: 0, transition: true })
            }
          }}
        >
          <FlashCard
            key={current?.taxon?.id}
            species={current}
            flipped={flipped}
            onFlip={() => { if (!didSwipe.current) setFlipped(f => !f) }}
          />
        </div>

        {/* Progress buttons */}
        <CardProgress
          taxonId={current?.taxon?.id}
          status={cardStatus}
          onMark={(id, status) => {
            if (status === 'known') {
              const taxon = current?.taxon
              // Navigate first so the card exits before visibleDeck recomputes
              swipeNavigate('left')
              setTimeout(() => addToCollection(id, {
                name:     taxon?.preferred_common_name || taxon?.name,
                sciName:  taxon?.name,
                photoUrl: taxon?.default_photo?.medium_url || taxon?.default_photo?.url,
              }), 320)
            } else {
              removeFromCollection(id)
            }
          }}
        />

        {/* Nav controls */}
        <div className="w-full max-w-md mt-3 flex items-center gap-3">
          <button onClick={handlePrev} onMouseUp={e => e.currentTarget.blur()} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <button onClick={() => setFlipped(f => !f)} onMouseUp={e => e.currentTarget.blur()} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
            {flipped ? 'Hide' : 'Reveal'}
          </button>

          <button onClick={handleNext} onMouseUp={e => e.currentTarget.blur()} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2">
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-white/20 text-xs text-center">Arrow keys · Space to flip</p>

        {error && deck.length > 0 && (
          <div className="mt-3 bg-red-950/50 border border-red-800 text-red-400 text-xs px-4 py-2 rounded-lg max-w-md w-full text-center">
            {error}
          </div>
        )}
      </div>
    </>
  )
}
