import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'buzbirds-daily-v1'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed | 0 || 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    const j = (s >>> 0) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dateSeed(dateStr) {
  return parseInt(dateStr.replace(/-/g, ''), 10)
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function getDailyBirds(species, dateStr) {
  const pool = species.filter(s => s.taxon?.default_photo).slice(0, 500)
  const shuffled = seededShuffle(pool, dateSeed(dateStr))
  return shuffled.slice(0, 5)
}

// Normalize: lowercase, trim, remove hyphens/dashes, collapse spaces
function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/[-–']/g, ' ').replace(/\s+/g, ' ')
}

// Levenshtein distance
function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function isCorrectAnswer(input, taxon) {
  const guess = normalize(input)
  if (!guess) return false
  const common = normalize(taxon?.preferred_common_name || '')
  const sci    = normalize(taxon?.name || '')
  // Exact match
  if (guess === common || guess === sci) return true
  // Allow up to 2 typos for names of 8+ chars, 1 typo for shorter
  const tolerance = common.length >= 8 ? 2 : 1
  if (levenshtein(guess, common) <= tolerance) return true
  return false
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FlameIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-1.5-.5-3-1.5-4.5C15 8 14 10 12 11c0-3-1-6-1-9z" />
    </svg>
  )
}

function QuizPhoto({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState(false)
  return (
    <div className={`relative bg-gray-800 overflow-hidden ${className}`}>
      {!loaded && !err && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-400/40 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}
      {err ? (
        <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-30">🐦</div>
      ) : (
        <img src={src} alt={alt} className="w-full h-full object-contain"
          onLoad={() => setLoaded(true)} onError={() => setErr(true)} />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DailyChallenge({ species, onClose, addToCollection }) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  const [daily, setDaily] = useState(() => {
    const saved = loadState()
    return saved || { date: null, completed: false, score: 0, streak: 0, lastCompletedDate: null }
  })

  const [phase, setPhase]       = useState('intro')
  const [birds, setBirds]       = useState([])
  const [qIndex, setQIndex]     = useState(0)
  const [score, setScore]       = useState(0)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState(null) // null | { isCorrect, correctName }
  const inputRef = useRef(null)

  const alreadyDoneToday = daily.date === today && daily.completed

  useEffect(() => {
    if (species.length < 10) return
    setBirds(getDailyBirds(species, today))
  }, [species.length])

  // Auto-focus input when question changes
  useEffect(() => {
    if (phase === 'quiz' && !feedback) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase, qIndex, feedback])

  const startQuiz = () => {
    setQIndex(0)
    setScore(0)
    setUserInput('')
    setFeedback(null)
    setPhase('quiz')
  }

  const handleSubmit = () => {
    if (feedback || !userInput.trim()) return
    const current = birds[qIndex]
    const isCorrect = isCorrectAnswer(userInput, current?.taxon)
    if (isCorrect) {
      setScore(s => s + 1)
      const taxon = current.taxon
      addToCollection(taxon?.id, {
        name:     taxon?.preferred_common_name || taxon?.name,
        sciName:  taxon?.name,
        photoUrl: taxon?.default_photo?.medium_url || taxon?.default_photo?.url,
      })
    }
    setFeedback({ isCorrect, correctName: current?.taxon?.preferred_common_name || current?.taxon?.name })
  }

  // Auto-advance after feedback
  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => {
      setFeedback(null)
      setUserInput('')
      if (qIndex + 1 >= birds.length) {
        const finalScore = score + (feedback.isCorrect ? 1 : 0)
        const streakContinues = daily.lastCompletedDate === yesterday
        const newStreak = streakContinues ? (daily.streak || 0) + 1 : 1
        const newState = {
          date: today,
          completed: true,
          score: finalScore,
          streak: newStreak,
          lastCompletedDate: today,
        }
        setDaily(newState)
        saveState(newState)
        setPhase('result')
      } else {
        setQIndex(i => i + 1)
      }
    }, 1800)
    return () => clearTimeout(t)
  }, [feedback])

  const current = birds[qIndex]
  const streakContinues = daily.lastCompletedDate === yesterday || daily.lastCompletedDate === today

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* ── INTRO ──────────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-white font-bold text-xl">Daily Challenge</h2>
              <p className="text-green-400 text-xs">{today}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className={`flex items-center gap-2 ${streakContinues && daily.streak > 0 ? 'text-orange-400' : 'text-white/30'}`}>
                <FlameIcon className="w-10 h-10" />
                <span className="text-5xl font-bold">{daily.streak || 0}</span>
              </div>
              <p className="text-white/50 text-sm">
                {daily.streak > 1 ? `${daily.streak} day streak!` : 'day streak'}
              </p>
            </div>

            {alreadyDoneToday ? (
              <>
                <div className="bg-white/5 rounded-2xl p-5 w-full space-y-2">
                  <p className="text-white/60 text-sm uppercase tracking-widest">Today's score</p>
                  <p className="text-5xl font-bold text-white">{daily.score} <span className="text-white/30 text-2xl">/ 5</span></p>
                  <p className="text-white/40 text-sm">Come back tomorrow for a new challenge</p>
                </div>
                <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">
                  Back to Flashcards
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2 text-center">
                  <p className="text-white text-lg font-semibold">5 birds · type the name · no retries</p>
                  <p className="text-white/40 text-sm">Same birds for everyone today</p>
                </div>

                {birds.length > 0 && (
                  <div className="flex gap-2 justify-center">
                    {birds.map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg opacity-60">🐦</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={startQuiz}
                  disabled={birds.length < 5}
                  className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-lg transition-colors"
                >
                  {birds.length < 5 ? 'Loading birds…' : 'Start Challenge →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── QUIZ ───────────────────────────────────────────────────────── */}
      {phase === 'quiz' && current && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <div className={`flex items-center gap-1 ${streakContinues && daily.streak > 0 ? 'text-orange-400' : 'text-white/30'}`}>
              <FlameIcon className="w-4 h-4" />
              <span className="text-sm font-bold">{daily.streak || 0}</span>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Bird {qIndex + 1} of 5</p>
              <div className="flex gap-1.5 mt-1 justify-center">
                {birds.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < qIndex ? 'bg-green-400' : i === qIndex ? 'bg-white' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-bold">{score}</p>
              <p className="text-white/30 text-xs">correct</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Photo */}
            <div className="flex-1 relative overflow-hidden">
              <QuizPhoto
                src={current.taxon?.default_photo?.medium_url || current.taxon?.default_photo?.url}
                alt="Identify this bird"
                className="absolute inset-0 w-full h-full"
              />
              {feedback && (
                <div className={`absolute inset-0 flex items-center justify-center ${feedback.isCorrect ? 'bg-green-900/80' : 'bg-red-900/80'}`}>
                  <div className="text-center px-6">
                    <div className="text-5xl mb-3">{feedback.isCorrect ? '✓' : '✗'}</div>
                    <p className="text-white font-semibold text-lg">{feedback.correctName}</p>
                    {!feedback.isCorrect && userInput.trim() && (
                      <p className="text-white/50 text-sm mt-1">You typed: "{userInput}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="p-4 shrink-0 space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="Type the bird name…"
                disabled={!!feedback}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={!!feedback || !userInput.trim()}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── RESULT ─────────────────────────────────────────────────────── */}
      {phase === 'result' && (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
          <div className="text-5xl">
            {daily.score === 5 ? '🎉' : daily.score >= 3 ? '👍' : '📚'}
          </div>

          <div>
            <p className="text-white/50 text-sm uppercase tracking-widest mb-2">Today's score</p>
            <p className="text-6xl font-bold text-white">{daily.score}<span className="text-white/30 text-3xl"> / 5</span></p>
          </div>

          <div className={`flex items-center gap-2 ${daily.streak > 0 ? 'text-orange-400' : 'text-white/30'}`}>
            <FlameIcon className="w-7 h-7" />
            <span className="text-2xl font-bold">{daily.streak}</span>
            <span className="text-sm">day streak</span>
          </div>

          <p className="text-white/40 text-sm">New challenge tomorrow</p>

          <div className="w-full space-y-3">
            <button onClick={() => setPhase('intro')} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              View Score
            </button>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
              Back to Flashcards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
