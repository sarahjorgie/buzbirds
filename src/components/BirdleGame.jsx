import { useState, useEffect, useRef } from 'react'
import { getTraits } from '../data/birdTraits'
import { fetchBirdCall } from '../utils/xencanto'

const MAX_GUESSES = 6
const STORAGE_KEY = 'buzbirds-birdle-v1'
const SEED_OFFSET = 8317

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) }
function dateSeed(s)    { return parseInt(s.replace(/-/g, ''), 10) }

function seededShuffle(arr, seed) {
  const a = [...arr]; let s = seed | 0 || 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    const j = (s >>> 0) % (i + 1);[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getMysteryBird(species, dateStr) {
  const pool = species.filter(s => s.taxon?.default_photo && s.taxon?.ancestor_ids?.length > 0).slice(0, 500)
  return seededShuffle(pool, dateSeed(dateStr) + SEED_OFFSET)[0] || null
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {} }

// ── SVG icon paths keyed by trait value ──────────────────────────────────────
const ICONS = {
  // Food
  Seeds:    <><path d="M12 20V8"/><path d="M8.5 12l3.5-3.5 3.5 3.5"/><path d="M8.5 16l3.5-3.5 3.5 3.5"/><path d="M9 8l3-4 3 4"/></>,
  Fish:     <><path d="M4 12C5 8 14 8 17 12C14 16 5 16 4 12Z"/><path d="M17 12L21 8V16Z"/></>,
  Meat:     <><line x1="7" y1="17" x2="17" y2="7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/></>,
  Insects:  <><ellipse cx="12" cy="13" rx="3" ry="4"/><circle cx="12" cy="8" r="2"/><line x1="9" y1="11" x2="5" y2="8"/><line x1="9" y1="13.5" x2="4" y2="13.5"/><line x1="9" y1="16" x2="5" y2="19"/><line x1="15" y1="11" x2="19" y2="8"/><line x1="15" y1="13.5" x2="20" y2="13.5"/><line x1="15" y1="16" x2="19" y2="19"/></>,
  Omnivore: <><circle cx="12" cy="12" r="7"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/></>,
  Fruit:    <><path d="M12 19C8.7 19 6 15.9 6 12c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3.9-2.7 7-6 7z"/><path d="M12 6V4"/><path d="M10 4c0-1 4-1.5 4 0"/></>,
  Nectar:   <><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="5.5" rx="2" ry="3"/><ellipse cx="12" cy="18.5" rx="2" ry="3"/><ellipse cx="5.5" cy="12" rx="3" ry="2"/><ellipse cx="18.5" cy="12" rx="3" ry="2"/></>,

  // Size
  Tiny:   <><circle cx="13" cy="14" r="2"/><circle cx="14.5" cy="12" r="1"/><path d="M11 13.5L7 10l5 2z"/><path d="M15 12.5l2.5-1"/></>,
  Small:  <><ellipse cx="12" cy="14" rx="3.5" ry="2.5"/><circle cx="14.5" cy="11" r="1.5"/><path d="M10 13L5 9l6 3z"/><path d="M15.5 11.5l3-1.5"/></>,
  Medium: <><ellipse cx="11" cy="14" rx="4.5" ry="3"/><circle cx="14.5" cy="10" r="2"/><path d="M9 12L3 8l7 3.5z"/><path d="M16 11l4-2"/></>,
  Large:  <><ellipse cx="11" cy="15" rx="5.5" ry="3.5"/><circle cx="15" cy="9.5" r="2.5"/><path d="M8 13L2 8l8 4z"/><path d="M17 11l4-2"/></>,

  // Feet
  Webbed:   <><path d="M12 20L5.5 10c2-2 13-2 13 0L12 20Z"/><path d="M7.5 11.5Q12 9 16.5 11.5"/><path d="M9 14.5Q12 13 15 14.5"/><path d="M10.5 17.5Q12 16.5 13.5 17.5"/></>,
  Talons:   <><path d="M12 5C12 10 7 13 6 17"/><path d="M12 5C12 11 12 14 12 17"/><path d="M12 5C12 10 17 13 18 17"/><path d="M12 5C11 8.5 8 10 7.5 13"/></>,
  Perching: <><line x1="3" y1="15" x2="21" y2="15"/><path d="M9 15l-2.5 5M12 15v5M15 15l2.5 5M10 15l-2-5"/><circle cx="12" cy="9" r="2.5"/></>,
  Climbing: <><path d="M9.5 12L4 16.5M9.5 12L4 7.5M14.5 12L20 16.5M14.5 12L20 7.5"/><circle cx="12" cy="12" r="3"/></>,
  Wading:   <><path d="M10 5L8 18"/><path d="M14 5L16 18"/><path d="M4 18Q12 21 20 18"/></>,

  // Habitat
  Wetland:   <><path d="M2 18Q5 14 8 18T14 18T20 18"/><line x1="8" y1="18" x2="7.5" y2="9"/><path d="M6.5 9L8 5L9.5 9Z"/><line x1="13" y1="18" x2="13.5" y2="9"/><path d="M12 9L13.5 5L15 9Z"/></>,
  Forest:    <><path d="M8 20V13H4L12 4L20 13H16V20H8Z"/></>,
  Savanna:   <><line x1="12" y1="20" x2="12" y2="10"/><path d="M5 10Q8.5 5 19 10Z"/><line x1="9" y1="15" x2="5" y2="19"/><line x1="15" y1="15" x2="19" y2="19"/></>,
  Coastal:   <><path d="M2 18Q5 13 8 18T14 18T20 18"/><path d="M2 12Q5 7 8 12T14 12T20 12"/></>,
  Urban:     <><rect x="3" y="8" width="8" height="12" rx="0.5"/><rect x="13" y="12" width="8" height="8" rx="0.5"/><rect x="5" y="11" width="1.5" height="2"/><rect x="8" y="11" width="1.5" height="2"/><rect x="5" y="15" width="1.5" height="2"/><rect x="8" y="15" width="1.5" height="2"/><rect x="15" y="15" width="1.5" height="2"/><rect x="18" y="15" width="1.5" height="2"/></>,
  Woodland:  <><circle cx="12" cy="9" r="6"/><rect x="11" y="15" width="2" height="5" rx="1"/></>,
  Grassland: <><path d="M4 19C4 15 5.5 11 6.5 8"/><path d="M8.5 19C8.5 14 9.5 9 10.5 6"/><path d="M13.5 19C13.5 14 12.5 9 11.5 6"/><path d="M17.5 19C17.5 15 16 11 15 8"/><path d="M21 19C21 16 20 12 19 9"/></>,
  Garden:    <><circle cx="12" cy="12" r="2.5"/><path d="M12 5.5V9M12 15V18.5M5.5 12H9M15 12H18.5M7.5 7.5L10 10M14 14L16.5 16.5M16.5 7.5L14 10M10 14L7.5 16.5"/></>,
}

// ── Icon tile ─────────────────────────────────────────────────────────────────
function IconTile({ value, match }) {
  return (
    <div className={`flex-1 flex items-center justify-center rounded-lg ${match ? 'bg-green-700' : 'bg-slate-700/80'}`}
         style={{ minHeight: 52 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        {ICONS[value] ?? (
          <text x="12" y="16" textAnchor="middle" fontSize="7" fill="white" stroke="none">{value?.slice(0,4)}</text>
        )}
      </svg>
    </div>
  )
}

// ── Column header row ─────────────────────────────────────────────────────────
function HeaderRow() {
  const labels = ['Size', 'Food', 'Feet', 'Habitat', 'Name']
  return (
    <div className="flex gap-1 px-3 pb-1">
      {labels.map((l, i) => (
        <div key={l} className={`text-center text-white/25 text-[9px] uppercase tracking-wide ${i < 4 ? 'flex-1' : 'flex-[1.6]'}`}>{l}</div>
      ))}
    </div>
  )
}

// ── Single guess row ──────────────────────────────────────────────────────────
function GuessRow({ guess, mysteryTraits }) {
  const { taxon, traits, isCorrect } = guess
  const photo = taxon?.default_photo?.square_url || taxon?.default_photo?.url
  const name  = taxon?.preferred_common_name || taxon?.name
  if (!traits || !mysteryTraits) return null

  const groupMatch = traits.groupId === mysteryTraits.groupId

  return (
    <div className={`flex gap-1 px-3`}>
      <IconTile value={traits.size}    match={traits.size    === mysteryTraits.size} />
      <IconTile value={traits.food}    match={traits.food    === mysteryTraits.food} />
      <IconTile value={traits.feet}    match={traits.feet    === mysteryTraits.feet} />
      <IconTile value={traits.habitat} match={traits.habitat === mysteryTraits.habitat} />
      <div className={`flex-[1.6] flex items-center gap-1.5 rounded-lg px-2 ${isCorrect ? 'bg-green-700/30 border border-green-500/40' : 'bg-white/5'}`}
           style={{ minHeight: 52 }}>
        {photo
          ? <img src={photo} alt={name} className="w-7 h-7 rounded-md object-cover shrink-0" />
          : <div className="w-7 h-7 rounded-md bg-white/10 shrink-0 flex items-center justify-center text-xs">🐦</div>
        }
        <div className="min-w-0 flex-1">
          <p className="text-white text-[11px] font-medium leading-tight truncate">{name}</p>
          <p className={`text-[9px] leading-tight ${groupMatch ? 'text-green-400' : 'text-white/35'}`}>
            {traits.group?.split(' ')[0]}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Empty placeholder row ─────────────────────────────────────────────────────
function EmptyRow() {
  return (
    <div className="flex gap-1 px-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="flex-1 rounded-lg border border-white/10 bg-white/[0.02]" style={{ minHeight: 52 }} />
      ))}
      <div className="flex-[1.6] rounded-lg border border-white/10 bg-white/[0.02]" style={{ minHeight: 52 }} />
    </div>
  )
}

// ── Active / next guess row placeholder ───────────────────────────────────────
function ActiveRow() {
  return (
    <div className="flex gap-1 px-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="flex-1 rounded-lg border-2 border-dashed border-white/20 bg-white/[0.02]" style={{ minHeight: 52 }} />
      ))}
      <div className="flex-[1.6] rounded-lg border-2 border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center" style={{ minHeight: 52 }}>
        <p className="text-white/20 text-[10px]">your guess</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BirdleGame({ species, onClose }) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  const mystery       = getMysteryBird(species, today)
  const mysteryTraits = mystery ? getTraits(mystery.taxon) : null

  const saved       = loadState()
  const playedToday = saved?.date === today

  const [guessIds,  setGuessIds]  = useState(() => playedToday ? (saved.guessIds || []) : [])
  const [gameState, setGameState] = useState(() => playedToday ? (saved.gameState || 'playing') : 'playing')
  const [streak,    setStreak]    = useState(() => saved?.streak || 0)
  const [lastWon,   setLastWon]   = useState(() => saved?.lastWon || null)

  const [input,       setInput]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [revealed,    setRevealed]    = useState(playedToday && saved.gameState !== 'playing')

  // Audio
  const [callUrl,  setCallUrl]  = useState(null)
  const [playing,  setPlaying]  = useState(false)
  const audioRef = useRef(null)

  const inputRef   = useRef(null)
  const isGameOver = gameState === 'won' || gameState === 'lost'

  // Build guess objects from stored IDs
  const guesses = guessIds.map(id => {
    const s = species.find(sp => sp.taxon?.id === id)
    if (!s) return null
    return { taxon: s.taxon, traits: getTraits(s.taxon), isCorrect: id === mystery?.taxon?.id }
  }).filter(Boolean)

  // Fetch mystery bird's call
  useEffect(() => {
    if (!mystery?.taxon?.id) return
    fetchBirdCall(mystery.taxon.id).then(r => { if (r?.url) setCallUrl(r.url) })
  }, [mystery?.taxon?.id])

  // Autocomplete
  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return }
    const q    = input.toLowerCase()
    const used = new Set(guessIds)
    setSuggestions(
      species
        .filter(s => {
          const name = s.taxon?.preferred_common_name?.toLowerCase() || ''
          return name.includes(q) && !used.has(s.taxon?.id) && s.taxon?.ancestor_ids?.length > 0
        })
        .slice(0, 8)
    )
  }, [input, guessIds, species])

  // Reveal photo after game ends
  useEffect(() => {
    if (isGameOver) setTimeout(() => setRevealed(true), 400)
  }, [isGameOver])

  const handlePlayCall = () => {
    if (!callUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(callUrl)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  const makeGuess = (speciesItem) => {
    if (gameState !== 'playing') return
    const id = speciesItem.taxon?.id
    if (!id || guessIds.includes(id)) return

    const newIds    = [...guessIds, id]
    const isCorrect = id === mystery?.taxon?.id
    const newState  = isCorrect ? 'won' : newIds.length >= MAX_GUESSES ? 'lost' : 'playing'

    let newStreak = streak, newLastWon = lastWon
    if (newState === 'won') {
      newStreak  = (lastWon === yesterday || lastWon === today) ? streak + 1 : 1
      newLastWon = today
      setStreak(newStreak)
      setLastWon(newLastWon)
    }

    setGuessIds(newIds)
    setGameState(newState)
    setInput('')
    setSuggestions([])
    saveState({ date: today, guessIds: newIds, gameState: newState, streak: newStreak, lastWon: newLastWon })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter'  && suggestions.length > 0) makeGuess(suggestions[0])
    if (e.key === 'Escape') setSuggestions([])
  }

  const mysteryPhoto = mystery?.taxon?.default_photo?.medium_url || mystery?.taxon?.default_photo?.url
  const mysteryName  = mystery?.taxon?.preferred_common_name || mystery?.taxon?.name
  const emptySlots   = Math.max(0, MAX_GUESSES - guesses.length - (gameState === 'playing' ? 1 : 0))

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <button onClick={onClose} onMouseUp={e => e.currentTarget.blur()} className="text-white/50 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg tracking-tight">BuzBirdle</h2>
          <p className="text-green-400 text-xs">{today}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-1.5-.5-3-1.5-4.5C15 8 14 10 12 11c0-3-1-6-1-9z" />
            </svg>
            <span className="font-bold text-sm">{streak}</span>
          </div>
        )}
        <span className="text-white/40 text-sm font-mono">{guesses.length}/{MAX_GUESSES}</span>
      </div>

      {/* Mystery bird — blurred until game over */}
      <div className="relative shrink-0 h-28 overflow-hidden bg-black/30">
        {mysteryPhoto && (
          <img
            src={mysteryPhoto}
            alt={revealed ? mysteryName : 'Mystery bird'}
            className={`w-full h-full object-cover transition-all duration-1000 ${revealed ? '' : 'blur-2xl scale-110'}`}
          />
        )}
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
            <span className="text-4xl">🐦</span>
            <p className="text-white/30 text-xs">Who am I?</p>
          </div>
        )}
        {revealed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end px-3 pb-2">
            <div>
              <p className={`font-bold text-base leading-tight ${gameState === 'won' ? 'text-green-400' : 'text-white'}`}>
                {gameState === 'won' ? `🎉 ${mysteryName}` : `The bird was ${mysteryName}`}
              </p>
              {mysteryTraits && (
                <p className="text-white/50 text-[10px]">
                  {mysteryTraits.group} · {mysteryTraits.size} · {mysteryTraits.food} · {mysteryTraits.feet} · {mysteryTraits.habitat}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Play call button */}
        {callUrl && (
          <button
            onClick={handlePlayCall}
            onTouchStart={e => e.stopPropagation()}
            className={`absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              playing ? 'bg-green-500 text-white' : 'bg-black/50 text-white/80 hover:bg-black/70'
            }`}
          >
            {playing ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Column headers */}
      <div className="shrink-0 pt-2">
        <HeaderRow />
      </div>

      {/* Guesses + empty slots */}
      <div className="flex-1 overflow-y-auto py-1 space-y-1.5">
        {guesses.map((g, i) => <GuessRow key={i} guess={g} mysteryTraits={mysteryTraits} />)}
        {gameState === 'playing' && <ActiveRow />}
        {Array.from({ length: emptySlots }).map((_, i) => <EmptyRow key={i} />)}

        {isGameOver && (
          <div className="px-3 pt-1">
            <button
              onClick={onClose}
              onMouseUp={e => e.currentTarget.blur()}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
            >
              Back to Flashcards
            </button>
          </div>
        )}
      </div>

      {/* Input + autocomplete */}
      {gameState === 'playing' && (
        <div className="shrink-0 px-3 pb-5 pt-2 border-t border-white/10 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a bird name to guess…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />

          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-green-950 border border-white/20 rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
              {suggestions.map(s => (
                <button
                  key={s.taxon?.id}
                  onClick={() => makeGuess(s)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  {s.taxon?.default_photo?.square_url && (
                    <img src={s.taxon.default_photo.square_url} className="w-7 h-7 rounded-md object-cover shrink-0" alt="" />
                  )}
                  <span className="text-white text-sm flex-1">{s.taxon?.preferred_common_name}</span>
                  <span className="text-white/30 text-xs italic shrink-0">{s.taxon?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
