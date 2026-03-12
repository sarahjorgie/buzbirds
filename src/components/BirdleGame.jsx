import { useState, useEffect, useRef } from 'react'
import { getTraits } from '../data/birdTraits'

const MAX_GUESSES  = 6
const STORAGE_KEY  = 'buzbirds-birdle-v1'
const SEED_OFFSET  = 8317 // ensures different bird from Daily Challenge

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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

// ── Trait chip ──────────────────────────────────────────────────────────────
function Chip({ label, value, match }) {
  return (
    <div className={`flex-1 flex flex-col items-center px-1 py-1.5 rounded-lg min-w-0 ${match ? 'bg-green-700/80' : 'bg-red-900/70'}`}>
      <span className="text-white/50 text-[8px] uppercase tracking-wide mb-0.5">{label}</span>
      <span className="text-white text-[10px] font-semibold leading-tight text-center">{value}</span>
    </div>
  )
}

// ── Single guess row ────────────────────────────────────────────────────────
function GuessRow({ guess, mysteryTraits }) {
  const { taxon, traits, isCorrect } = guess
  const photo = taxon?.default_photo?.square_url || taxon?.default_photo?.url
  const name  = taxon?.preferred_common_name || taxon?.name
  if (!traits || !mysteryTraits) return null

  return (
    <div className={`rounded-xl border overflow-hidden ${isCorrect ? 'border-green-500/60' : 'border-white/10'} bg-white/5`}>
      <div className="flex items-center gap-2 px-2 py-2">
        {photo
          ? <img src={photo} alt={name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
          : <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm shrink-0">🐦</div>
        }
        <span className="text-white text-sm font-medium flex-1 truncate">{name}</span>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
          traits.groupId === mysteryTraits.groupId ? 'bg-green-700/80 text-white' : 'bg-red-900/70 text-white/70'
        }`}>
          {traits.group?.split(' ')[0]}
        </span>
      </div>
      <div className="flex gap-1 px-2 pb-2">
        <Chip label="Size"    value={traits.size}    match={traits.size    === mysteryTraits.size} />
        <Chip label="Food"    value={traits.food}    match={traits.food    === mysteryTraits.food} />
        <Chip label="Feet"    value={traits.feet}    match={traits.feet    === mysteryTraits.feet} />
        <Chip label="Habitat" value={traits.habitat} match={traits.habitat === mysteryTraits.habitat} />
      </div>
    </div>
  )
}

// ── Empty placeholder row ───────────────────────────────────────────────────
function EmptyRow() {
  return <div className="h-[76px] rounded-xl border border-white/5 bg-white/[0.02]" />
}

// ── Main component ──────────────────────────────────────────────────────────
export default function BirdleGame({ species, onClose }) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  const mystery       = getMysteryBird(species, today)
  const mysteryTraits = mystery ? getTraits(mystery.taxon) : null

  const saved = loadState()
  const playedToday = saved?.date === today

  const [guessIds,   setGuessIds]   = useState(() => playedToday ? (saved.guessIds || []) : [])
  const [gameState,  setGameState]  = useState(() => playedToday ? (saved.gameState || 'playing') : 'playing')
  const [streak,     setStreak]     = useState(() => saved?.streak || 0)
  const [lastWon,    setLastWon]    = useState(() => saved?.lastWon || null)

  const [input,       setInput]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [revealed,    setRevealed]    = useState(playedToday && saved.gameState !== 'playing')

  const inputRef = useRef(null)

  const isGameOver = gameState === 'won' || gameState === 'lost'

  // Build guess objects from stored IDs
  const guesses = guessIds.map(id => {
    const s = species.find(sp => sp.taxon?.id === id)
    if (!s) return null
    return {
      taxon:     s.taxon,
      traits:    getTraits(s.taxon),
      isCorrect: id === mystery?.taxon?.id,
    }
  }).filter(Boolean)

  // Autocomplete filtering
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

  const makeGuess = (speciesItem) => {
    if (gameState !== 'playing') return
    const id = speciesItem.taxon?.id
    if (!id || guessIds.includes(id)) return

    const newIds      = [...guessIds, id]
    const isCorrect   = id === mystery?.taxon?.id
    const newState    = isCorrect ? 'won' : newIds.length >= MAX_GUESSES ? 'lost' : 'playing'

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
      </div>

      {/* Trait key */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 shrink-0">
        <div className="w-8 shrink-0" />
        <div className="flex-1 min-w-0 mr-1" />
        {['Group', 'Size', 'Food', 'Feet', 'Habitat'].map(label => (
          <div key={label} className="flex-1 text-center text-white/25 text-[8px] uppercase tracking-wide">{label}</div>
        ))}
      </div>

      {/* Guesses + empty slots */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {guesses.map((g, i) => <GuessRow key={i} guess={g} mysteryTraits={mysteryTraits} />)}
        {gameState === 'playing' && <div className="h-[76px] rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center"><p className="text-white/20 text-xs">Your guess</p></div>}
        {Array.from({ length: emptySlots }).map((_, i) => <EmptyRow key={i} />)}

        {isGameOver && (
          <button
            onClick={onClose}
            onMouseUp={e => e.currentTarget.blur()}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors mt-1"
          >
            Back to Flashcards
          </button>
        )}
      </div>

      {/* Input + autocomplete — sticky bottom */}
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
