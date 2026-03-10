import { useState, useEffect } from 'react'

const STORAGE_KEY = 'buzbirds-daily-v1'

function todayStr() {
  return new Date().toISOString().slice(0, 10) // "2026-03-10"
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Deterministic shuffle — same date + same pool = same 5 birds on any device
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
  // Use first 500 species (consistent, high-quality, loads fast)
  const pool = species.filter(s => s.taxon?.default_photo).slice(0, 500)
  const shuffled = seededShuffle(pool, dateSeed(dateStr))
  return shuffled.slice(0, 5)
}

function shuffleChoices(correct, allSpecies) {
  const distractorPool = allSpecies.filter(s => s.taxon?.id !== correct.taxon?.id && s.taxon?.default_photo)
  const distractors = seededShuffle(distractorPool, correct.taxon?.id).slice(0, 3)
  const choices = [...distractors, correct].sort(() => Math.random() - 0.5)
  return { choices, correctIndex: choices.findIndex(c => c.taxon?.id === correct.taxon?.id) }
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
        <img src={src} alt={alt} className="w-full h-full object-cover"
          onLoad={() => setLoaded(true)} onError={() => setErr(true)} />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DailyChallenge({ species, onClose, addToCollection }) {
  const today     = todayStr()
  const yesterday = yesterdayStr()

  // Load persisted state
  const [daily, setDaily] = useState(() => {
    const saved = loadState()
    return saved || { date: null, completed: false, score: 0, streak: 0, lastCompletedDate: null }
  })

  const [phase, setPhase]           = useState('intro') // intro | quiz | result
  const [birds, setBirds]           = useState([])
  const [questions, setQuestions]   = useState([])
  const [qIndex, setQIndex]         = useState(0)
  const [score, setScore]           = useState(0)
  const [feedback, setFeedback]     = useState(null) // null | { selectedIndex, isCorrect }

  const alreadyDoneToday = daily.date === today && daily.completed

  // Build questions when species loads
  useEffect(() => {
    if (species.length < 10) return
    const dailyBirds = getDailyBirds(species, today)
    setBirds(dailyBirds)
    setQuestions(dailyBirds.map(b => ({ correct: b, ...shuffleChoices(b, species) })))
  }, [species.length])

  const startQuiz = () => {
    setQIndex(0)
    setScore(0)
    setFeedback(null)
    setPhase('quiz')
  }

  const handleAnswer = (choiceIndex) => {
    if (feedback) return
    const current   = questions[qIndex]
    const isCorrect = choiceIndex === current.correctIndex
    if (isCorrect) {
      setScore(s => s + 1)
      const taxon = current.correct.taxon
      addToCollection(taxon?.id, {
        name:     taxon?.preferred_common_name || taxon?.name,
        sciName:  taxon?.name,
        photoUrl: taxon?.default_photo?.medium_url || taxon?.default_photo?.url,
      })
    }
    setFeedback({ selectedIndex: choiceIndex, isCorrect })
  }

  // Auto-advance
  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => {
      setFeedback(null)
      if (qIndex + 1 >= questions.length) {
        // Save result
        const finalScore = score + (feedback.isCorrect ? 0 : 0) // score already updated
        const streakContinues = daily.lastCompletedDate === yesterday
        const newStreak = streakContinues ? (daily.streak || 0) + 1 : 1
        const newState = {
          date: today,
          completed: true,
          score: score + (feedback?.isCorrect ? 1 : 0),
          streak: newStreak,
          lastCompletedDate: today,
        }
        setDaily(newState)
        saveState(newState)
        setPhase('result')
      } else {
        setQIndex(i => i + 1)
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [feedback, qIndex, questions.length])

  const current = questions[qIndex]
  const streakContinues = daily.lastCompletedDate === yesterday || daily.lastCompletedDate === today

  const choiceStyle = (i) => {
    if (!feedback) return 'border-white/20 text-white hover:border-green-400 hover:bg-green-950/30'
    if (!current) return ''
    if (i === current.correctIndex) return 'border-green-500 bg-green-900/60 text-white'
    if (i === feedback.selectedIndex && !feedback.isCorrect) return 'border-red-500 bg-red-900/40 text-white'
    return 'border-white/10 text-white/30'
  }

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
            {/* Streak display */}
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
                  <p className="text-white text-lg font-semibold">5 birds · one chance · no retries</p>
                  <p className="text-white/40 text-sm">Same birds for everyone today</p>
                </div>

                {/* Bird silhouette preview */}
                {birds.length > 0 && (
                  <div className="flex gap-2 justify-center">
                    {birds.map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg opacity-60">🐦</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={startQuiz}
                  disabled={questions.length < 5}
                  className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-lg transition-colors"
                >
                  {questions.length < 5 ? 'Loading birds…' : 'Start Challenge →'}
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
                {questions.map((_, i) => (
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
            <div className="flex-1 relative overflow-hidden">
              <QuizPhoto
                src={current.correct.taxon?.default_photo?.medium_url || current.correct.taxon?.default_photo?.url}
                alt="Identify this bird"
                className="absolute inset-0 w-full h-full"
              />
              {feedback && (
                <div className={`absolute inset-0 flex items-center justify-center ${feedback.isCorrect ? 'bg-green-900/70' : 'bg-red-900/70'}`}>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{feedback.isCorrect ? '✓' : '✗'}</div>
                    {!feedback.isCorrect && (
                      <p className="text-white text-sm px-4">{current.correct.taxon?.preferred_common_name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 shrink-0">
              {current.choices.map((choice, i) => (
                <button
                  key={choice.taxon?.id}
                  onClick={() => handleAnswer(i)}
                  disabled={!!feedback}
                  className={`py-3 px-3 rounded-xl border text-sm font-medium text-left transition-all leading-tight ${choiceStyle(i)}`}
                >
                  <span className="text-white/40 text-xs mr-1">{['A','B','C','D'][i]}.</span>
                  {choice.taxon?.preferred_common_name || choice.taxon?.name}
                </button>
              ))}
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

          {/* Streak */}
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
