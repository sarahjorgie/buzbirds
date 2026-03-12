import { useState, useEffect, useRef, useMemo } from 'react'

const MAX_ATTEMPTS = 2

function parseNameToSegments(name) {
  let li = 0
  return (name || '').split(' ').filter(Boolean).map(word => ({
    chars: word.split('').map(c => {
      const isLetter = /[a-zA-Z]/.test(c)
      return { char: c, isLetter, li: isLetter ? li++ : null }
    }),
  }))
}

function calcTileWidth(segments) {
  const max = Math.max(...segments.map(s => s.chars.length), 1)
  if (max <= 7)  return 34
  if (max <= 10) return 28
  if (max <= 13) return 24
  if (max <= 16) return 20
  return 17
}

// Compact row shown after a completed (wrong) attempt
function CompactAttempt({ segments, attempt }) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 opacity-75">
      {segments.map((seg, si) => (
        <div key={si} className="flex items-center" style={{ gap: 2 }}>
          {seg.chars.map((ch, ci) => {
            if (!ch.isLetter) {
              return (
                <span key={ci} className="text-white/30 font-bold" style={{ fontSize: 9 }}>
                  {ch.char}
                </span>
              )
            }
            const entered = attempt.inputValue[ch.li] || ''
            const correct = attempt.perLetter[ch.li]
            return (
              <div
                key={ci}
                style={{ width: 14, height: 16, fontSize: 9 }}
                className={`rounded-sm flex items-center justify-center font-bold text-white ${
                  correct ? 'bg-green-700' : 'bg-red-800/90'
                }`}
              >
                {entered}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function TileInput({ name, questionKey, onSubmit }) {
  const segments = useMemo(() => parseNameToSegments(name), [name])
  const totalLetters = useMemo(
    () => segments.reduce((n, s) => n + s.chars.filter(c => c.isLetter).length, 0),
    [segments]
  )
  const actualLetters = useMemo(
    () => segments.flatMap(s => s.chars.filter(c => c.isLetter).map(c => c.char.toUpperCase())),
    [segments]
  )

  const [prevAttempts, setPrevAttempts] = useState([]) // completed wrong attempts shown compact
  const [currentInput, setCurrentInput] = useState('')
  const [currentResult, setCurrentResult] = useState(null) // perLetter[] after submitting current
  const [done, setDone] = useState(false)

  const inputRef = useRef(null)

  const resetKey = questionKey ?? name

  useEffect(() => {
    setPrevAttempts([])
    setCurrentInput('')
    setCurrentResult(null)
    setDone(false)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [resetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  // Block input while result is showing (transition) or when done
  const isBlocked = done || currentResult !== null

  const handleChange = (e) => {
    if (isBlocked) return
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase()
    const capped = raw.slice(0, totalLetters)
    setCurrentInput(capped)
    setTimeout(() => {
      const el = inputRef.current
      if (el) el.setSelectionRange(capped.length, capped.length)
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (isBlocked) return
    if (e.key === 'Enter') handleSubmit()
  }

  const handleSubmit = () => {
    if (isBlocked || currentInput.length < totalLetters) return

    const results = currentInput.split('').map((l, i) => l === actualLetters[i])
    const isCorrect = results.every(Boolean)
    const isLastAttempt = prevAttempts.length >= MAX_ATTEMPTS - 1

    setCurrentResult(results)

    if (isCorrect || isLastAttempt) {
      setDone(true)
      onSubmit(isCorrect)
    } else {
      // Wrong on first attempt — show colors for 1s then reveal second attempt tiles
      setTimeout(() => {
        setPrevAttempts(prev => [...prev, { inputValue: currentInput, perLetter: results }])
        setCurrentInput('')
        setCurrentResult(null)
        setTimeout(() => inputRef.current?.focus(), 80)
      }, 1000)
    }
  }

  const tileW = calcTileWidth(segments)
  const tileH = tileW + 6
  const gap   = 4

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* Compact previous attempts */}
      {prevAttempts.map((attempt, ai) => (
        <CompactAttempt key={ai} segments={segments} attempt={attempt} />
      ))}

      {/* Active tile row(s) + hidden input */}
      <div
        className="relative flex justify-center w-full"
        onClick={() => !isBlocked && inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={totalLetters}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          readOnly={isBlocked}
          aria-label="Type the bird name"
          className="absolute inset-0 opacity-0 w-full h-full cursor-default"
        />

        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {segments.map((seg, si) => (
            <div key={si} className="flex items-center justify-center" style={{ gap }}>
              {seg.chars.map((ch, ci) => {
                if (!ch.isLetter) {
                  return (
                    <div
                      key={ci}
                      style={{ width: Math.round(tileW * 0.55), height: tileH, fontSize: tileW * 0.5 }}
                      className="flex items-center justify-center text-white/40 font-bold"
                    >
                      {ch.char}
                    </div>
                  )
                }

                const entered  = currentInput[ch.li] || ''
                const isCursor = ch.li === currentInput.length && !isBlocked

                let cls = 'border-2 rounded flex items-center justify-center font-bold transition-colors select-none'
                if (currentResult) {
                  cls += currentResult[ch.li]
                    ? ' border-green-500 bg-green-900/60 text-white'
                    : ' border-red-500 bg-red-900/50 text-white'
                } else if (entered) {
                  cls += ' border-white/50 bg-white/10 text-white'
                } else if (isCursor) {
                  cls += ' border-green-400 bg-transparent'
                } else {
                  cls += ' border-white/20 bg-transparent'
                }

                return (
                  <div
                    key={ci}
                    style={{ width: tileW, height: tileH, fontSize: Math.round(tileW * 0.48) }}
                    className={cls}
                  >
                    {entered}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Submit — hidden during result transitions and when done */}
      {!done && currentResult === null && (
        <button
          onClick={handleSubmit}
          disabled={currentInput.length < totalLetters}
          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold transition-colors"
        >
          Submit
        </button>
      )}
    </div>
  )
}
