import { useState, useEffect } from 'react'
import TileInput from './TileInput'

const REVIEW_LOG_KEY = 'buzbirds-review-log-v1'
const REVIEW_COUNT   = 10

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function loadReviewLog() {
  try { return JSON.parse(localStorage.getItem(REVIEW_LOG_KEY)) || {} }
  catch { return {} }
}

function saveReviewLog(log) {
  try { localStorage.setItem(REVIEW_LOG_KEY, JSON.stringify(log)) } catch {}
}

// Pick birds to review: never-reviewed first, then oldest reviewed
function selectBirds(collected, reviewLog, count) {
  const birds = Object.values(collected)
  birds.sort((a, b) => {
    const aDate = reviewLog[a.id] || '0000-00-00'
    const bDate = reviewLog[b.id] || '0000-00-00'
    return aDate.localeCompare(bDate)
  })
  return birds.slice(0, Math.min(count, birds.length))
}

function ReviewPhoto({ photoUrl, name, feedback }) {
  const [loaded, setLoaded] = useState(false)
  const [err, setErr]       = useState(false)

  // Reset on question change
  useEffect(() => {
    setLoaded(false)
    setErr(false)
  }, [photoUrl])

  return (
    <div className="relative flex-1 bg-gray-800 overflow-hidden">
      {!loaded && !err && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-400/40 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}
      {err ? (
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">🐦</div>
      ) : (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-contain"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
      {feedback && (
        <div className={`absolute inset-0 flex items-center justify-center ${feedback.correct ? 'bg-green-900/80' : 'bg-red-900/80'}`}>
          <div className="text-center px-6">
            <div className="text-5xl mb-3">{feedback.correct ? '✓' : '✗'}</div>
            {!feedback.correct && (
              <p className="text-white font-semibold text-lg">{feedback.name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CollectionReview({ collected, onClose, markNeedsReview, clearNeedsReview }) {
  const [reviewLog] = useState(loadReviewLog)
  const [birds]     = useState(() => selectBirds(collected, loadReviewLog(), REVIEW_COUNT))
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore]   = useState(0)
  const [feedback, setFeedback] = useState(null) // { correct, name }
  const [phase, setPhase]   = useState('quiz')   // 'quiz' | 'result'

  const current = birds[qIndex]

  const handleAnswer = (isCorrect) => {
    if (feedback) return
    if (isCorrect) {
      setScore(s => s + 1)
      clearNeedsReview?.(current.id)
    } else {
      markNeedsReview?.(current.id)
    }
    setFeedback({ correct: isCorrect, name: current.name })

    // Record review date
    const log = loadReviewLog()
    saveReviewLog({ ...log, [current.id]: todayStr() })

    setTimeout(() => {
      setFeedback(null)
      if (qIndex + 1 >= birds.length) {
        setPhase('result')
      } else {
        setQIndex(i => i + 1)
      }
    }, 1800)
  }

  if (birds.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <span className="text-5xl opacity-40">🐦</span>
        <p className="text-white font-semibold text-lg">No birds to review yet</p>
        <p className="text-white/40 text-sm">Collect some birds first by completing quizzes or marking birds as known.</p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >

      {/* ── QUIZ ───────────────────────────────────────────────────────── */}
      {phase === 'quiz' && current && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quit
            </button>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">{qIndex + 1} / {birds.length}</p>
              <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${((qIndex + 1) / birds.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-bold">{score}</p>
              <p className="text-white/30 text-xs">correct</p>
            </div>
          </div>

          <ReviewPhoto photoUrl={current.photoUrl} name={current.name} feedback={feedback} />

          <div className="p-4 shrink-0">
            <TileInput
              name={current.name}
              questionKey={current.id}
              onSubmit={handleAnswer}
            />
          </div>
        </>
      )}

      {/* ── RESULT ─────────────────────────────────────────────────────── */}
      {phase === 'result' && (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
          <div className="text-5xl">
            {score === birds.length ? '🎉' : score >= Math.ceil(birds.length * 0.6) ? '👍' : '📚'}
          </div>
          <div>
            <p className="text-white/50 text-sm uppercase tracking-widest mb-2">Review complete</p>
            <p className="text-6xl font-bold text-white">
              {score}<span className="text-white/30 text-3xl"> / {birds.length}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors"
          >
            Back to Collection
          </button>
        </div>
      )}
    </div>
  )
}
