import { useState, useEffect, useRef, useMemo } from 'react'
import { fetchPoolTraits, getTraits } from '../data/birdTraits'
import { fetchBirdCall } from '../utils/xencanto'

const MAX_GUESSES = 5
export const STORAGE_KEY = 'buzbirds-birdle-v3'
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

// ~30 birds — spread across ancestor_ids groupings, mystery bird guaranteed included
function getBirdPool(species, dateStr, mystery) {
  if (!mystery) return []
  const eligible = species.filter(s => s.taxon?.default_photo && s.taxon?.ancestor_ids?.length)
  const shuffled = seededShuffle(eligible, dateSeed(dateStr) + SEED_OFFSET + 999)
  const pool = new Map()
  for (const s of shuffled) {
    if (pool.size >= 34) break
    pool.set(s.taxon.id, s)
  }
  pool.set(mystery.taxon.id, mystery) // always include
  const byName = (a, b) => (a.taxon?.preferred_common_name || '').localeCompare(b.taxon?.preferred_common_name || '')
  return Array.from(pool.values()).sort(byName)
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

// ── SVG icon paths keyed by trait value ───────────────────────────────────────
const ICON_PATHS = {
  // Food
  Insects:        <><ellipse cx="12" cy="13" rx="3" ry="4"/><circle cx="12" cy="8" r="2"/><line x1="9" y1="11" x2="5" y2="8"/><line x1="9" y1="13.5" x2="4" y2="13.5"/><line x1="9" y1="16" x2="5" y2="19"/><line x1="15" y1="11" x2="19" y2="8"/><line x1="15" y1="13.5" x2="20" y2="13.5"/><line x1="15" y1="16" x2="19" y2="19"/></>,
  Fish:           <><path d="M4 12C5 8 14 8 17 12C14 16 5 16 4 12Z"/><path d="M17 12L21 8V16Z"/></>,
  'Seeds/Grain':  <><path d="M12 20V8"/><path d="M8.5 12l3.5-3.5 3.5 3.5"/><path d="M8.5 16l3.5-3.5 3.5 3.5"/><path d="M9 8l3-4 3 4"/></>,
  'Meat/Carrion': <><line x1="7" y1="17" x2="17" y2="7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="5.5" r="2"/></>,
  Nectar:         <><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="5.5" rx="2" ry="3"/><ellipse cx="12" cy="18.5" rx="2" ry="3"/><ellipse cx="5.5" cy="12" rx="3" ry="2"/><ellipse cx="18.5" cy="12" rx="3" ry="2"/></>,
  Fruit:          <><path d="M12 19C8.7 19 6 15.9 6 12c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3.9-2.7 7-6 7z"/><path d="M12 6V4"/><path d="M10 4c0-1 4-1.5 4 0"/></>,
  Omnivore:       <><circle cx="12" cy="12" r="7"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/></>,
  // Size
  Tiny:           <><circle cx="13" cy="14" r="2"/><circle cx="14.5" cy="12" r="1"/><path d="M11 13.5L7 10l5 2z"/><path d="M15 12.5l2.5-1"/></>,
  Small:          <><ellipse cx="12" cy="14" rx="3.5" ry="2.5"/><circle cx="14.5" cy="11" r="1.5"/><path d="M10 13L5 9l6 3z"/><path d="M15.5 11.5l3-1.5"/></>,
  Medium:         <><ellipse cx="11" cy="14" rx="4.5" ry="3"/><circle cx="14.5" cy="10" r="2"/><path d="M9 12L3 8l7 3.5z"/><path d="M16 11l4-2"/></>,
  Large:          <><ellipse cx="11" cy="15" rx="5.5" ry="3.5"/><circle cx="15" cy="9.5" r="2.5"/><path d="M8 13L2 8l8 4z"/><path d="M17 11l4-2"/></>,
  // Feet
  Webbed:         <><path d="M12 20L5.5 10c2-2 13-2 13 0L12 20Z"/><path d="M7.5 11.5Q12 9 16.5 11.5"/><path d="M9 14.5Q12 13 15 14.5"/><path d="M10.5 17.5Q12 16.5 13.5 17.5"/></>,
  Talons:         <><path d="M12 5C12 10 7 13 6 17"/><path d="M12 5C12 11 12 14 12 17"/><path d="M12 5C12 10 17 13 18 17"/><path d="M12 5C11 8.5 8 10 7.5 13"/></>,
  Perching:       <><line x1="3" y1="15" x2="21" y2="15"/><path d="M9 15l-2.5 5M12 15v5M15 15l2.5 5M10 15l-2-5"/><circle cx="12" cy="9" r="2.5"/></>,
  Climbing:       <><path d="M9.5 12L4 16.5M9.5 12L4 7.5M14.5 12L20 16.5M14.5 12L20 7.5"/><circle cx="12" cy="12" r="3"/></>,
  Wading:         <><path d="M10 5L8 18"/><path d="M14 5L16 18"/><path d="M4 18Q12 21 20 18"/></>,
  // Habitat
  'Grassland/Savanna': <><line x1="12" y1="20" x2="12" y2="10"/><path d="M5 10Q8.5 5 19 10Z"/><line x1="9" y1="15" x2="5" y2="19"/><line x1="15" y1="15" x2="19" y2="19"/></>,
  'Forest/Woodland':   <><path d="M8 20V13H4L12 4L20 13H16V20H8Z"/></>,
  'Wetland/Water':     <><path d="M2 18Q5 14 8 18T14 18T20 18"/><line x1="8" y1="18" x2="7.5" y2="9"/><path d="M6.5 9L8 5L9.5 9Z"/><line x1="13" y1="18" x2="13.5" y2="9"/><path d="M12 9L13.5 5L15 9Z"/></>,
  'Coastal/Marine':    <><path d="M2 18Q5 13 8 18T14 18T20 18"/><path d="M2 12Q5 7 8 12T14 12T20 12"/></>,
  'Urban/Garden':      <><rect x="3" y="8" width="8" height="12" rx="0.5"/><rect x="13" y="12" width="8" height="8" rx="0.5"/><rect x="5" y="11" width="1.5" height="2"/><rect x="8" y="11" width="1.5" height="2"/><rect x="5" y="15" width="1.5" height="2"/><rect x="8" y="15" width="1.5" height="2"/><rect x="15" y="15" width="1.5" height="2"/><rect x="18" y="15" width="1.5" height="2"/></>,
  'Rocky/Cliff':       <><path d="M3 20L8 8L12 13L15 9L21 20H3Z"/></>,
}

function SvgIcon({ value, size = 24, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      {ICON_PATHS[value] ?? null}
    </svg>
  )
}

// ── Category definitions ───────────────────────────────────────────────────────
const CATEGORIES = {
  size: {
    label: 'BIRD SIZE',
    question: 'What is the size of this bird?',
    colLabel: 'Size',
    representative: 'Medium',
    options: [
      { value: 'Tiny',   sub: '~5–12 cm'  },
      { value: 'Small',  sub: '~13–25 cm' },
      { value: 'Medium', sub: '~26–50 cm' },
      { value: 'Large',  sub: '~50+ cm'   },
    ],
  },
  food: {
    label: 'DIET',
    question: 'What does this bird mainly eat?',
    colLabel: 'Diet',
    representative: 'Seeds/Grain',
    options: [
      { value: 'Fish'          },
      { value: 'Fruit'         },
      { value: 'Insects'       },
      { value: 'Meat/Carrion'  },
      { value: 'Nectar'        },
      { value: 'Omnivore'      },
      { value: 'Seeds/Grain'   },
    ],
  },
  feet: {
    label: 'FOOT TYPE',
    question: "What are this bird's feet adapted for?",
    colLabel: 'Feet',
    representative: 'Perching',
    options: [
      { value: 'Climbing' },
      { value: 'Perching' },
      { value: 'Talons',  label: 'Talons (hunting)' },
      { value: 'Wading'   },
      { value: 'Webbed',  label: 'Webbed (swimming)' },
    ],
  },
  habitat: {
    label: 'HABITAT',
    question: 'Where is this bird usually found?',
    colLabel: 'Habitat',
    representative: 'Grassland/Savanna',
    options: [
      { value: 'Coastal/Marine'     },
      { value: 'Forest/Woodland'    },
      { value: 'Grassland/Savanna'  },
      { value: 'Rocky/Cliff'        },
      { value: 'Urban/Garden'       },
      { value: 'Wetland/Water'      },
    ],
  },
}

// ── Picker modal (bottom sheet, light style matching birdle.co.za) ─────────────
function PickerModal({ catKey, birdPool, current, onSelect, onClose }) {
  if (!catKey) return null
  const isBird = catKey === 'bird'
  const cat    = CATEGORIES[catKey]

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={onClose}>
      <div className="w-full bg-slate-100 rounded-t-2xl max-h-[78vh] flex flex-col shadow-2xl"
           onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center px-4 pt-4 pb-1 gap-3 shrink-0">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
            <SvgIcon value={isBird ? 'Medium' : cat.representative} size={28} color="#374151" />
          </div>
          <h2 className="flex-1 text-slate-800 font-black text-xl tracking-tight">
            {isBird ? 'BIRD' : cat.label}
          </h2>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full border-2 border-slate-300 text-slate-500 flex items-center justify-center text-xl font-light leading-none">
            ×
          </button>
        </div>
        <p className="text-slate-500 text-sm text-center px-6 pb-3 shrink-0">
          {isBird ? 'What is the name of the bird?' : cat.question}
        </p>

        {/* Option list */}
        <div className="overflow-y-auto px-4 pb-8 space-y-2">
          {isBird
            ? birdPool.map(s => {
                const name = s.taxon?.preferred_common_name || s.taxon?.name
                const sci  = s.taxon?.name
                const sel  = current.birdId === s.taxon?.id
                return (
                  <button key={s.taxon?.id}
                    onClick={() => { onSelect('birdId', s.taxon?.id); onClose() }}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                      sel ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 active:bg-slate-100'
                    }`}>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">{name}</p>
                      <p className={`text-xs italic leading-tight ${sel ? 'text-white/60' : 'text-slate-400'}`}>{sci}</p>
                    </div>
                  </button>
                )
              })
            : cat.options.map(opt => {
                const sel = current[catKey] === opt.value
                return (
                  <button key={opt.value}
                    onClick={() => { onSelect(catKey, opt.value); onClose() }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-colors ${
                      sel ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 active:bg-slate-100'
                    }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      sel ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      <SvgIcon value={opt.value} size={30} color={sel ? 'white' : '#374151'} />
                    </div>
                    <div>
                      <p className="font-semibold">{opt.label || opt.value}</p>
                      {opt.sub && <p className={`text-sm ${sel ? 'text-white/70' : 'text-slate-400'}`}>{opt.sub}</p>}
                    </div>
                  </button>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}

// ── Selector button (active input row) ────────────────────────────────────────
function SelectorBtn({ catKey, value, onOpen }) {
  return (
    <button onClick={() => onOpen(catKey)}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 transition-colors ${
        value ? 'border-green-500/50 bg-green-900/20' : 'border-dashed border-white/25 bg-white/[0.03]'
      }`}>
      {value
        ? <>
            <SvgIcon value={value} size={22} color="white" />
            <span className="text-white/60 text-[7px] uppercase tracking-wide leading-none mt-0.5">{value}</span>
          </>
        : <span className="text-white/25 text-lg leading-none">+</span>
      }
    </button>
  )
}

// ── Result row (past rounds) ──────────────────────────────────────────────────
function RoundRow({ round, birdPool, revealing }) {
  const bird = round.birdName ? null : birdPool.find(s => s.taxon?.id === round.answers.birdId)
  const name = round.birdName || bird?.taxon?.preferred_common_name || bird?.taxon?.name || '?'

  return (
    <div className="flex-1 flex gap-1 px-3">
      {['size','food','feet','habitat'].map((k, i) => (
        <div key={k}
          className={`flex-1 flex items-center justify-center rounded-lg ${
            round.results[k] ? 'bg-green-700' : 'bg-slate-700/80'
          } ${revealing ? 'tile-reveal' : ''}`}
          style={revealing ? { animationDelay: `${i * 180}ms` } : {}}>
          <SvgIcon value={round.answers[k]} size={26} color="white" />
        </div>
      ))}
      <div
        className={`flex-[1.6] flex items-center justify-center rounded-lg px-2 min-w-0 ${
          round.results.bird ? 'bg-green-700' : 'bg-slate-700/80'
        } ${revealing ? 'tile-reveal' : ''}`}
        style={revealing ? { animationDelay: '720ms' } : {}}>
        <p className="text-white text-[11px] font-medium leading-tight truncate text-center">{name}</p>
      </div>
    </div>
  )
}

// ── Empty placeholder row ─────────────────────────────────────────────────────
function EmptyRow() {
  return (
    <div className="flex-1 flex gap-1 px-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="flex-1 rounded-lg border border-white/15 bg-white/[0.04]" />
      ))}
      <div className="flex-[1.6] rounded-lg border border-white/15 bg-white/[0.04]" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BirdleGame({ species, onClose }) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  const mystery  = useMemo(() => getMysteryBird(species, today), [species, today])
  const birdPool = useMemo(() => getBirdPool(species, today, mystery), [species, today, mystery])

  // Use instant ancestor-based traits immediately; upgrade to accurate family traits when API resolves
  const [mysteryTraits, setMysteryTraits] = useState(() => mystery ? getTraits(mystery.taxon) : null)
  useEffect(() => {
    if (!mystery?.taxon?.id) return
    setMysteryTraits(getTraits(mystery.taxon)) // instant fallback
    fetchPoolTraits([mystery]).then(traits => {
      const t = traits[mystery.taxon.id]
      if (t) setMysteryTraits(t) // upgrade to accurate if API returned a match
    }).catch(() => {})
  }, [mystery?.taxon?.id])

  const saved       = loadState()
  const playedToday = saved?.date === today

  const [rounds,    setRounds]    = useState(() => playedToday ? (saved.rounds || []) : [])
  const [gameState, setGameState] = useState(() => playedToday ? (saved.gameState || 'playing') : 'playing')
  const [streak,    setStreak]    = useState(() => saved?.streak || 0)
  const [lastWon,   setLastWon]   = useState(() => saved?.lastWon || null)
  const [current,   setCurrent]   = useState({ size: null, food: null, feet: null, habitat: null, birdId: null })
  const [modal,     setModal]     = useState(null)
  const [revealed,  setRevealed]  = useState(playedToday && saved?.gameState !== 'playing')
  const [callUrl,      setCallUrl]      = useState(null)
  const [playing,      setPlaying]      = useState(false)
  const [revealingIdx, setRevealingIdx] = useState(-1)
  const audioRef = useRef(null)

  const isGameOver = gameState === 'won' || gameState === 'lost'
  const allFilled  = current.size && current.food && current.feet && current.habitat && current.birdId

  useEffect(() => {
    if (!mystery?.taxon?.id) return
    fetchBirdCall(mystery.taxon.id).then(r => { if (r?.url) setCallUrl(r.url) })
  }, [mystery?.taxon?.id])

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
      audioRef.current.pause(); audioRef.current.currentTime = 0; setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {}); setPlaying(true)
    }
  }

  const makeGuess = () => {
    if (!allFilled || gameState !== 'playing' || !mysteryTraits) return
    const guessedBird = birdPool.find(s => s.taxon?.id === current.birdId)
    const results = {
      size:    current.size    === mysteryTraits.size,
      food:    current.food    === mysteryTraits.food,
      feet:    current.feet    === mysteryTraits.feet,
      habitat: current.habitat === mysteryTraits.habitat,
      bird:    current.birdId  === mystery?.taxon?.id,
    }
    const newRounds = [...rounds, {
      answers: { ...current },
      results,
      birdName:  guessedBird?.taxon?.preferred_common_name || guessedBird?.taxon?.name || '',
      birdPhoto: guessedBird?.taxon?.default_photo?.square_url || '',
    }]
    const won       = Object.values(results).every(Boolean)
    const newState  = won ? 'won' : newRounds.length >= MAX_GUESSES ? 'lost' : 'playing'

    let newStreak = streak, newLastWon = lastWon
    if (newState === 'won') {
      newStreak  = (lastWon === yesterday || lastWon === today) ? streak + 1 : 1
      newLastWon = today
      setStreak(newStreak); setLastWon(newLastWon)
    }

    setRevealingIdx(newRounds.length - 1)
    setTimeout(() => setRevealingIdx(-1), 5 * 200 + 500)
    setRounds(newRounds)
    setGameState(newState)
    if (newState === 'playing') setCurrent({ size: null, food: null, feet: null, habitat: null, birdId: null })
    saveState({ date: today, rounds: newRounds, gameState: newState, streak: newStreak, lastWon: newLastWon })
  }

  const emptySlots   = Math.max(0, MAX_GUESSES - rounds.length - (gameState === 'playing' ? 1 : 0))
  const mysteryPhoto = mystery?.taxon?.default_photo?.medium_url || mystery?.taxon?.default_photo?.url
  const mysteryName  = mystery?.taxon?.preferred_common_name || mystery?.taxon?.name
  const selectedBird = current.birdId ? birdPool.find(s => s.taxon?.id === current.birdId) : null
  const score        = gameState === 'won' ? 5
    : Math.max(0, ...rounds.map(r => Object.values(r.results).filter(Boolean).length))

  // ── Completion screen ─────────────────────────────────────────────────────
  if (revealed) return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col"
         style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <button onClick={onClose} onMouseUp={e => e.currentTarget.blur()} className="text-white/50 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg tracking-tight">BuzBirdle</h2>
          <p className="text-green-400 text-xs">{today}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Streak */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-1.5-.5-3-1.5-4.5C15 8 14 10 12 11c0-3-1-6-1-9z" />
            </svg>
            <span className="text-orange-400 font-black text-5xl">{streak}</span>
          </div>
          <p className="text-white/50 text-sm">day streak</p>
        </div>

        {/* Score card */}
        <div className="w-full rounded-2xl bg-white/10 px-6 py-5 flex flex-col items-center gap-2">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">Today's Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-black text-6xl">{score}</span>
            <span className="text-white/40 text-2xl font-light">/ 5</span>
          </div>
          <p className="text-white/40 text-sm mt-1">
            {gameState === 'won' ? `Got it in ${rounds.length} guess${rounds.length === 1 ? '' : 'es'}!` : 'Come back tomorrow for a new challenge'}
          </p>
        </div>

        {/* Bird name reveal */}
        {mysteryName && (
          <p className="text-white/30 text-sm text-center">
            The bird was <span className="text-white/60 font-semibold">{mysteryName}</span>
          </p>
        )}
      </div>

      {/* Back button */}
      <div className="shrink-0 px-6 pb-8 pt-2">
        <button onClick={onClose} onMouseUp={e => e.currentTarget.blur()}
          className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors">
          Back to Flashcards
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col"
         style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <button onClick={onClose} onMouseUp={e => e.currentTarget.blur()} className="text-white/50 hover:text-white">
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
        <span className="text-white/40 text-sm font-mono">{rounds.length}/{MAX_GUESSES}</span>
      </div>

      {/* Mystery bird */}
      <div className="relative shrink-0 overflow-hidden bg-black/40" style={{ height: 200 }}>
        {mysteryPhoto
          ? <img src={mysteryPhoto} alt={revealed ? mysteryName : 'Mystery bird'}
                 className="w-full h-full object-contain transition-all duration-1000"
                 style={{ filter: revealed ? 'none' : `blur(${Math.max(0, 18 - rounds.length * 4)}px)` }} />
          : <div className="w-full h-full bg-green-950/60" />
        }
        {/* Dark vignette so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {!revealed && (
          <div className="absolute bottom-2 left-3">
            <span className="text-white/40 text-xs font-medium tracking-wide">Who am I?</span>
          </div>
        )}
        {revealed && (
          <div className="absolute inset-0 flex items-end px-3 pb-2">
            <div>
              <p className={`font-bold text-base leading-tight ${gameState === 'won' ? 'text-green-400' : 'text-white'}`}>
                {gameState === 'won' ? `🎉 ${mysteryName}` : `The bird was ${mysteryName}`}
              </p>
              {mysteryTraits && (
                <p className="text-white/50 text-[10px]">
                  {mysteryTraits.size} · {mysteryTraits.food} · {mysteryTraits.feet} · {mysteryTraits.habitat}
                </p>
              )}
            </div>
          </div>
        )}
        {callUrl && (
          <button onClick={handlePlayCall} onTouchStart={e => e.stopPropagation()}
            className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              playing ? 'bg-green-500' : 'bg-black/50 hover:bg-black/70'
            }`}>
            {playing
              ? <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
        )}
      </div>

      {/* Column headers */}
      <div className="flex gap-1 px-3 pt-2 pb-1 shrink-0">
        {Object.values(CATEGORIES).map(c => (
          <div key={c.colLabel} className="flex-1 text-center text-white/25 text-[9px] uppercase tracking-wide">{c.colLabel}</div>
        ))}
        <div className="flex-[1.6] text-center text-white/25 text-[9px] uppercase tracking-wide">Bird</div>
      </div>

      {/* Rows — flex column, each row gets equal share of remaining height */}
      <div className="flex-1 min-h-0 flex flex-col gap-1.5 py-1.5">
        {rounds.map((r, i) => <RoundRow key={i} round={r} birdPool={birdPool} revealing={i === revealingIdx} />)}

        {/* Active input row */}
        {gameState === 'playing' && (
          <div className="flex-1 flex gap-1 px-3">
            <SelectorBtn catKey="size"    value={current.size}    onOpen={setModal} />
            <SelectorBtn catKey="food"    value={current.food}    onOpen={setModal} />
            <SelectorBtn catKey="feet"    value={current.feet}    onOpen={setModal} />
            <SelectorBtn catKey="habitat" value={current.habitat} onOpen={setModal} />
            <button onClick={() => setModal('bird')}
              className={`flex-[1.6] flex items-center justify-center rounded-lg border-2 px-2 transition-colors ${
                selectedBird ? 'border-green-500/50 bg-green-900/20' : 'border-dashed border-white/25 bg-white/[0.03]'
              }`}>
              {selectedBird
                ? <span className="text-white text-[10px] font-medium leading-tight truncate text-center px-1">
                    {selectedBird.taxon?.preferred_common_name || selectedBird.taxon?.name}
                  </span>
                : <span className="text-white/25 text-[10px] text-center">tap to select</span>
              }
            </button>
          </div>
        )}

        {Array.from({ length: emptySlots }).map((_, i) => <EmptyRow key={i} />)}
      </div>

      {/* Bottom action */}
      <div className="shrink-0 px-3 pb-5 pt-2 border-t border-white/10">
        {gameState === 'playing'
          ? <button onClick={makeGuess} disabled={!allFilled}
              className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-base tracking-wide transition-colors">
              GUESS
            </button>
          : <button onClick={onClose} onMouseUp={e => e.currentTarget.blur()}
              className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
              Back to Flashcards
            </button>
        }
      </div>

      {/* Picker modal */}
      <PickerModal
        catKey={modal}
        birdPool={birdPool}
        current={current}
        onSelect={(key, val) => setCurrent(prev => ({ ...prev, [key]: val }))}
        onClose={() => setModal(null)}
      />
    </div>
  )
}
