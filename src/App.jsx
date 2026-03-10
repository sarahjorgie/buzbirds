import { useState, useEffect, useCallback, useRef } from 'react'
import FlashCard from './components/FlashCard'
import FilterMenu from './components/FilterMenu'
import CardProgress from './components/CardProgress'
import QuizMode from './components/QuizMode'
import Collection from './components/Collection'
import DailyChallenge from './components/DailyChallenge'
import { useProgress } from './hooks/useProgress'
import { SA_PROVINCES } from './data/provinces'
import { BIRD_GROUPS } from './data/birdGroups'
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
        {loaded > 0 ? `${loaded} species loaded (page ${page})` : 'Connecting to iNaturalist…'}
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
    placeId: 113055, taxonId: 3,
    provinceKey: 'all', groupId: 'all',
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
  const [hideKnown, setHideKnown]       = useState(true)
  const [quizOpen, setQuizOpen]         = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [dailyOpen, setDailyOpen]       = useState(false)

  const [cardAnim, setCardAnim] = useState({ x: 0, rotate: 0, transition: false })

  const abortRef      = useRef(null)
  const touchStartX   = useRef(null)
  const touchStartY   = useRef(null)
  const didSwipe      = useRef(false)
  const animatingRef  = useRef(false)
  const deckLengthRef = useRef(1)
  const { progress, clearProgress, collected, addToCollection, removeFromCollection, clearCollection } = useProgress()

  // ── Preload all province/group IDs silently on startup ────────────────
  useEffect(() => {
    preloadIds(SA_PROVINCES, BIRD_GROUPS)
  }, [])

  // ── Fetch species pages ───────────────────────────────────────────────
  const loadSpecies = useCallback(async (placeId, taxonId) => {
    if (abortRef.current) abortRef.current.aborted = true
    const abort = { aborted: false }
    abortRef.current = abort

    setLoadingFirst(true)
    setError(null)
    setCardIndex(0)
    setFlipped(false)
    setShuffled(false)
    setCurrentPage(1)
    // Clear data immediately
    setSpecies([])
    setDeck([])

    try {
      const first = await fetchPage(placeId, taxonId, 1)
      if (abort.aborted) return

      setTotalAvailable(first.total_results)

      const withPhotos = first.results.filter(s => s.taxon?.default_photo)
      // Set both from the same array reference for first page
      setSpecies(withPhotos)
      setDeck(withPhotos)
      setLoadingFirst(false)
      // Prefetch GBIF taxonomy for first 50 cards in background
      prefetchTaxonomy(withPhotos.slice(0, 50).map(s => s.taxon?.name).filter(Boolean))

      const maxPages = Math.min(MAX_PAGES, Math.ceil(first.total_results / PER_PAGE))
      if (maxPages > 1) {
        setLoadingMore(true)
        // Accumulate all remaining pages, then batch-update state once per page
        for (let page = 2; page <= maxPages; page++) {
          if (abort.aborted) return
          await new Promise(r => setTimeout(r, 350))
          if (abort.aborted) return
          setCurrentPage(page)

          const data = await fetchPage(placeId, taxonId, page)
          if (abort.aborted) return

          const filtered = data.results.filter(s => s.taxon?.default_photo)
          if (filtered.length > 0) {
            // Use a single state updater to append to both arrays atomically
            setSpecies(prev => [...prev, ...filtered])
            setDeck(prev => [...prev, ...filtered])
          }
        }
        setLoadingMore(false)
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
    loadSpecies(113055, 3)
  }, [loadSpecies])

  // ── Filter changes — resolve IDs first, then fetch ────────────────────
  const handleFilterChange = useCallback(async ({ provinceKey, groupId }) => {
    setMenuOpen(false)

    try {
      let placeId = filters.placeId
      let taxonId = filters.taxonId
      let newProvinceKey = provinceKey ?? filters.provinceKey
      let newGroupId     = groupId     ?? filters.groupId

      // Resolve province place_id
      if (provinceKey !== undefined && provinceKey !== filters.provinceKey) {
        const province = SA_PROVINCES.find(p => p.key === provinceKey)
        if (province) {
          if (province.placeId) {
            // Already resolved (either hardcoded or preloaded)
            placeId = province.placeId
          } else if (province.searchQuery) {
            setResolving(true)
            setResolvingLabel(`Finding ${province.name} on iNaturalist…`)
            placeId = await resolvePlaceId(province.searchQuery)
            province.placeId = placeId // cache
          }
        }
      }

      // Resolve group taxon_id
      if (groupId !== undefined && groupId !== filters.groupId) {
        const group = BIRD_GROUPS.find(g => g.id === groupId)
        if (group) {
          if (group.taxonId) {
            taxonId = group.taxonId
          } else if (group.searchQuery) {
            setResolving(true)
            setResolvingLabel(`Finding ${group.name} taxonomy…`)
            taxonId = await resolveTaxonId(group.searchQuery)
            group.taxonId = taxonId // cache
          }
        }
      }

      setResolving(false)
      setFilters({ placeId, taxonId, provinceKey: newProvinceKey, groupId: newGroupId })
      loadSpecies(placeId, taxonId)

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
    handleFilterChange({ provinceKey: 'all', groupId: 'all' })
  }

  // ── Render ────────────────────────────────────────────────────────────
  if (resolving) return <ResolvingScreen label={resolvingLabel} />

  if (loadingFirst) {
    const province = SA_PROVINCES.find(p => p.key === filters.provinceKey)
    const group    = BIRD_GROUPS.find(g => g.id === filters.groupId)
    const parts = [
      province?.key !== 'all' ? province.name : 'All of South Africa',
      group?.id !== 'all' ? group.name : null,
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
        onClearFilters={filters.placeId !== 113055 || filters.taxonId !== 3 ? clearFilters : null}
        onRetry={() => loadSpecies(filters.placeId, filters.taxonId)}
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

  const activeProvince = SA_PROVINCES.find(p => p.key === filters.provinceKey)
  const activeGroup    = BIRD_GROUPS.find(g => g.id    === filters.groupId)
  const filtersActive  = filters.placeId !== 113055 || filters.taxonId !== 3

  // Keep ref in sync so swipeNavigate setTimeout doesn't stale-close over deck length
  deckLengthRef.current = visibleDeck.length

  return (
    <>
      {quizOpen && (
        <QuizMode
          species={species}
          deck={deck}
          progress={progress}
          onClose={() => setQuizOpen(false)}
          onMarkKnown={(id) => markCard(id, 'known')}
          addToCollection={addToCollection}
        />
      )}

      {collectionOpen && (
        <Collection
          collected={collected}
          totalSpecies={species.length}
          onClose={() => setCollectionOpen(false)}
          onClearCollection={clearCollection}
          onRemoveBird={removeFromCollection}
        />
      )}

      {dailyOpen && (
        <DailyChallenge
          species={species}
          onClose={() => setDailyOpen(false)}
          addToCollection={addToCollection}
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
      />

      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center px-4 py-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>

        {/* Header */}
        <header className="w-full max-w-md mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                BuzBirds
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-green-400 text-xs">
                  {species.length.toLocaleString()} species
                  {loadingMore && <span className="text-green-600 ml-1">· loading…</span>}
                </span>
                {activeProvince?.key !== 'all' && (
                  <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {activeProvince.emoji} {activeProvince.name}
                    <button onClick={() => handleFilterChange({ provinceKey: 'all' })} className="text-green-500 hover:text-white">×</button>
                  </span>
                )}
                {activeGroup?.id !== 'all' && (
                  <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {activeGroup.icon} {activeGroup.name}
                    <button onClick={() => handleFilterChange({ groupId: 'all' })} className="text-emerald-500 hover:text-white">×</button>
                  </span>
                )}
                {hideKnown && (
                  <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                    hiding {knownCount} known
                  </span>
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
            onClick={() => setDailyOpen(true)}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-green-500/50 text-white font-medium transition-all flex flex-col items-center gap-1 text-xs"
          >
            {/* Sun/daily icon */}
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            Daily
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
          className="w-full max-w-md"
          style={{
            touchAction: 'pan-y',
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
          onTouchMove={e => {
            if (animatingRef.current) return
            const dx = e.touches[0].clientX - touchStartX.current
            const dy = e.touches[0].clientY - touchStartY.current
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
              setCardAnim({ x: dx, rotate: dx / 25, transition: false })
            }
          }}
          onTouchEnd={e => {
            if (animatingRef.current) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            const dy = e.changedTouches[0].clientY - touchStartY.current
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
              didSwipe.current = true
              swipeNavigate(dx < 0 ? 'left' : 'right')
            } else {
              // Snap back to center
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
              addToCollection(id, {
                name:     taxon?.preferred_common_name || taxon?.name,
                sciName:  taxon?.name,
                photoUrl: taxon?.default_photo?.medium_url || taxon?.default_photo?.url,
              })
              setTimeout(handleNext, 300)
            } else {
              removeFromCollection(id)
            }
          }}
        />

        {/* Nav controls */}
        <div className="w-full max-w-md mt-3 flex items-center gap-3">
          <button onClick={handlePrev} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <button onClick={() => setFlipped(f => !f)} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
            {flipped ? 'Hide' : 'Reveal'}
          </button>

          <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2">
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
