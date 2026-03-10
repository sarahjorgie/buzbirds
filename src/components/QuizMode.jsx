import { useState, useEffect, useRef } from 'react'
import { fetchBirdCall } from '../utils/xencanto'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(config, deck, species, progress) {
  let pool = config.unknownOnly
    ? deck.filter(s => progress[s.taxon?.id] !== 'known')
    : [...deck]

  pool = pool.filter(s => s.taxon?.default_photo)
  if (pool.length < 1 || species.length < 4) return []

  const targets = shuffleArray(pool).slice(0, config.questionCount)

  return targets.map(correct => {
    const distractorPool = species.filter(
      s => s.taxon?.id !== correct.taxon?.id && s.taxon?.default_photo
    )
    const distractors = shuffleArray(distractorPool).slice(0, 3)
    const choices = shuffleArray([correct, ...distractors])
    return { correct, choices, correctIndex: choices.findIndex(c => c.taxon?.id === correct.taxon?.id) }
  })
}

// ── Shared: image with load state ─────────────────────────────────────────
function QuizPhoto({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  return (
    <div className={`relative bg-gray-800 overflow-hidden ${className}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-green-400/40 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-3xl">🐦</div>
      ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover"
          onLoad={() => setLoaded(true)} onError={() => setErrored(true)} />
      )}
    </div>
  )
}

// ── Call quiz: audio player + question ────────────────────────────────────
function CallQuestion({ question, feedbackState, onAnswer, onSkip }) {
  const [sound, setSound] = useState(undefined) // undefined=loading, null=not found
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const taxonId = question.correct.taxon?.id

  useEffect(() => {
    setSound(undefined)
    setPlaying(false)
    let cancelled = false
    fetchBirdCall(taxonId).then(data => {
      if (!cancelled) setSound(data)
    })
    return () => { cancelled = true }
  }, [taxonId])

  // Stop audio when feedback shown
  useEffect(() => {
    if (feedbackState) {
      audioRef.current?.pause()
      setPlaying(false)
    }
  }, [feedbackState])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const photo = question.correct.taxon?.default_photo
  const photoUrl = photo?.medium_url || photo?.url

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Audio player area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 relative">

        {/* Feedback overlay: reveal the bird photo */}
        {feedbackState && photoUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 flex items-center justify-center ${feedbackState.isCorrect ? 'bg-green-900/70' : 'bg-red-900/70'}`}>
              <div className="text-center">
                <div className="text-5xl mb-2">{feedbackState.isCorrect ? '✓' : '✗'}</div>
                {!feedbackState.isCorrect && (
                  <p className="text-white font-bold text-lg px-4">
                    {question.correct.taxon?.preferred_common_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-white/50 text-sm uppercase tracking-widest">Name this bird call</p>

        {sound === undefined && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-green-400/40 border-t-green-400 rounded-full animate-spin" />
            </div>
            <p className="text-white/30 text-sm">Loading recording…</p>
          </div>
        )}

        {sound === null && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl">🔇</div>
            <p className="text-white/40 text-sm text-center">No recording available for this bird</p>
            <button
              onClick={onSkip}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 text-sm transition-colors"
            >
              Skip →
            </button>
          </div>
        )}

        {sound && !feedbackState && (
          <div className="flex flex-col items-center gap-4">
            {/* Waveform bars decoration */}
            <div className={`flex items-center gap-1 h-10 ${playing ? '' : 'opacity-40'}`}>
              {[3,6,8,5,9,7,4,8,6,5,7,9,4,6,8,5,3].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full bg-green-400 transition-all ${playing ? 'animate-pulse' : ''}`}
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>

            {/* Play button */}
            <button
              onClick={toggle}
              className="w-20 h-20 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition-colors shadow-lg shadow-green-900/50"
            >
              {playing ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <p className="text-white/30 text-xs capitalize">{sound.type} · Q:{sound.quality}</p>
            <audio ref={audioRef} src={sound.url} onEnded={() => setPlaying(false)} preload="auto" />
          </div>
        )}
      </div>

      {/* Name choices */}
      <div className="p-3 grid grid-cols-2 gap-2 shrink-0">
        {question.choices.map((choice, i) => {
          let style = 'border-white/20 text-white hover:border-green-400 hover:bg-green-950/30'
          if (feedbackState) {
            if (i === question.correctIndex) style = 'border-green-500 bg-green-900/60 text-white'
            else if (i === feedbackState.selectedIndex && !feedbackState.isCorrect) style = 'border-red-500 bg-red-900/40 text-white'
            else style = 'border-white/10 text-white/30'
          }
          return (
            <button
              key={choice.taxon?.id}
              onClick={() => !feedbackState && sound && onAnswer(i)}
              disabled={!!feedbackState || !sound}
              className={`py-3 px-3 rounded-xl border text-sm font-medium text-left transition-all leading-tight ${style} disabled:opacity-50`}
            >
              <span className="text-white/40 text-xs mr-1">{['A','B','C','D'][i]}.</span>
              {choice.taxon?.preferred_common_name || choice.taxon?.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Setup Screen ──────────────────────────────────────────────────────────
function SetupScreen({ config, onChange, onStart, onClose, deck, species, progress }) {
  const unknownCount = deck.filter(s => progress[s.taxon?.id] !== 'known').length
  const poolSize     = config.unknownOnly ? unknownCount : deck.length
  const canStart     = poolSize >= 1 && species.length >= 4

  const counts = [10, 20, 50]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-white font-bold text-xl">Quiz Mode</h2>
          <p className="text-green-400 text-xs">{deck.length} birds available</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* Quiz type */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Quiz Type</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'name', label: 'Name the Bird', desc: 'Photo → name',  icon: '📸' },
              { id: 'find', label: 'Find the Bird',  desc: 'Name → photo', icon: '🔍' },
              { id: 'call', label: 'Name That Call', desc: 'Sound → name', icon: '🔊' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => onChange({ quizType: opt.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.quizType === opt.id
                    ? 'border-green-500 bg-green-900/40 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <div className="text-xl mb-1.5">{opt.icon}</div>
                <p className="font-semibold text-xs">{opt.label}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Number of questions */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Questions</p>
          <div className="flex gap-2">
            {counts.map(n => {
              const available = Math.min(n, poolSize)
              const disabled  = poolSize < 1
              return (
                <button
                  key={n}
                  onClick={() => !disabled && onChange({ questionCount: n })}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    config.questionCount === n
                      ? 'border-green-500 bg-green-900/40 text-white'
                      : disabled
                        ? 'border-white/5 text-white/20 cursor-not-allowed'
                        : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {available < n ? available : n}
                </button>
              )
            })}
          </div>
        </div>

        {/* Unknown only toggle */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Bird Filter</p>
          <button
            onClick={() => onChange({ unknownOnly: !config.unknownOnly })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
              config.unknownOnly
                ? 'border-green-500 bg-green-900/40'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="text-left">
              <p className={`text-sm font-medium ${config.unknownOnly ? 'text-white' : 'text-white/70'}`}>
                Unknown birds only
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                Skip birds already marked as known ({unknownCount} remaining)
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ml-3 ${config.unknownOnly ? 'bg-green-600' : 'bg-white/20'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config.unknownOnly ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {!canStart && (
          <p className="text-yellow-400/70 text-sm text-center bg-yellow-950/40 rounded-xl px-4 py-3 border border-yellow-900/50">
            {poolSize < 1
              ? 'No birds match your filter. Try turning off "Unknown only".'
              : 'Need at least 4 species loaded to generate quiz choices.'}
          </p>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-white/10">
        <button
          onClick={onStart}
          disabled={!canStart}
          className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-lg transition-colors"
        >
          Start Quiz →
        </button>
      </div>
    </div>
  )
}

// ── End Screen ────────────────────────────────────────────────────────────
function EndScreen({ score, total, onRetry, onClose }) {
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'
  const msg   = pct >= 80 ? 'Excellent birding!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'

  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
      <div className="text-5xl">{emoji}</div>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#22c55e" strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{pct}%</span>
          <span className="text-white/50 text-xs">score</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{msg}</p>
        <p className="text-white/50 mt-1">{score} correct · {total - score} wrong · {total} questions</p>
      </div>
      <div className="w-full space-y-3">
        <button onClick={onRetry} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
          Try Again
        </button>
        <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
          Back to Flashcards
        </button>
      </div>
    </div>
  )
}

// ── Main QuizMode ─────────────────────────────────────────────────────────
export default function QuizMode({ species, deck, progress, onClose, onMarkKnown, addToCollection }) {
  const [phase, setPhase]   = useState('setup')
  const [config, setConfig] = useState({ quizType: 'name', questionCount: 20, unknownOnly: true })
  const [questions, setQuestions]         = useState([])
  const [qIndex, setQIndex]               = useState(0)
  const [score, setScore]                 = useState(0)
  const [feedbackState, setFeedbackState] = useState(null)

  const current = questions[qIndex]

  const startQuiz = () => {
    const qs = buildQuestions(config, deck, species, progress)
    if (qs.length === 0) return
    setQuestions(qs)
    setQIndex(0)
    setScore(0)
    setFeedbackState(null)
    setPhase('question')
  }

  const advance = () => {
    setFeedbackState(null)
    if (qIndex + 1 >= questions.length) {
      setPhase('end')
    } else {
      setQIndex(i => i + 1)
    }
  }

  const handleAnswer = (choiceIndex) => {
    if (feedbackState) return
    const isCorrect = choiceIndex === current.correctIndex
    if (isCorrect) {
      setScore(s => s + 1)
      const taxon = current.correct.taxon
      addToCollection?.(taxon?.id, {
        name:     taxon?.preferred_common_name || taxon?.name,
        sciName:  taxon?.name,
        photoUrl: taxon?.default_photo?.medium_url || taxon?.default_photo?.url,
      })
    }
    setFeedbackState({ selectedIndex: choiceIndex, isCorrect })
  }

  // Auto-advance after feedback
  useEffect(() => {
    if (!feedbackState) return
    const t = setTimeout(advance, 1500)
    return () => clearTimeout(t)
  }, [feedbackState, qIndex, questions.length])

  const choiceStyle = (i) => {
    if (!feedbackState) return 'border-white/20 text-white hover:border-green-400 hover:bg-green-950/30'
    if (i === current.correctIndex) return 'border-green-500 bg-green-900/60 text-white'
    if (i === feedbackState.selectedIndex && !feedbackState.isCorrect) return 'border-red-500 bg-red-900/40 text-white'
    return 'border-white/10 text-white/30'
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col">

      {phase === 'setup' && (
        <SetupScreen
          config={config}
          onChange={partial => setConfig(c => ({ ...c, ...partial }))}
          onStart={startQuiz}
          onClose={onClose}
          deck={deck}
          species={species}
          progress={progress}
        />
      )}

      {phase === 'question' && current && (
        <>
          {/* Quiz header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <button onClick={() => setPhase('setup')} className="text-white/50 hover:text-white text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quit
            </button>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Q {qIndex + 1} / {questions.length}</p>
              <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-bold">{score}</p>
              <p className="text-white/30 text-xs">correct</p>
            </div>
          </div>

          {/* ── NAME THE BIRD ────────────────────────────────────────── */}
          {config.quizType === 'name' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative overflow-hidden">
                <QuizPhoto
                  src={current.correct.taxon?.default_photo?.medium_url || current.correct.taxon?.default_photo?.url}
                  alt="Identify this bird"
                  className="absolute inset-0 w-full h-full"
                />
                {feedbackState && (
                  <div className={`absolute inset-0 flex items-center justify-center ${feedbackState.isCorrect ? 'bg-green-900/70' : 'bg-red-900/70'}`}>
                    <div className="text-center">
                      <div className="text-5xl mb-2">{feedbackState.isCorrect ? '✓' : '✗'}</div>
                      {!feedbackState.isCorrect && (
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
                    disabled={!!feedbackState}
                    className={`py-3 px-3 rounded-xl border text-sm font-medium text-left transition-all leading-tight ${choiceStyle(i)}`}
                  >
                    <span className="text-white/40 text-xs mr-1">{['A','B','C','D'][i]}.</span>
                    {choice.taxon?.preferred_common_name || choice.taxon?.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── FIND THE BIRD ─────────────────────────────────────────── */}
          {config.quizType === 'find' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-5 py-5 text-center shrink-0">
                <p className="text-white/50 text-sm uppercase tracking-widest mb-1">Find this bird</p>
                <h2 className="text-2xl font-bold text-white">{current.correct.taxon?.preferred_common_name}</h2>
                <p className="text-green-300 text-sm italic mt-0.5">{current.correct.taxon?.name}</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2 px-3 pb-4 overflow-hidden">
                {current.choices.map((choice, i) => (
                  <button
                    key={choice.taxon?.id}
                    onClick={() => handleAnswer(i)}
                    disabled={!!feedbackState}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                      feedbackState
                        ? i === current.correctIndex
                          ? 'border-green-500 scale-[1.02]'
                          : i === feedbackState.selectedIndex && !feedbackState.isCorrect
                            ? 'border-red-500'
                            : 'border-transparent opacity-40'
                        : 'border-transparent hover:border-green-400'
                    }`}
                  >
                    <QuizPhoto
                      src={choice.taxon?.default_photo?.medium_url || choice.taxon?.default_photo?.url}
                      alt={choice.taxon?.name}
                      className="w-full h-full absolute inset-0"
                    />
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center">
                      {['A','B','C','D'][i]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── NAME THAT CALL ────────────────────────────────────────── */}
          {config.quizType === 'call' && (
            <CallQuestion
              key={current.correct.taxon?.id}
              question={current}
              feedbackState={feedbackState}
              onAnswer={handleAnswer}
              onSkip={advance}
            />
          )}
        </>
      )}

      {phase === 'end' && (
        <EndScreen
          score={score}
          total={questions.length}
          onRetry={startQuiz}
          onClose={onClose}
        />
      )}
    </div>
  )
}
