import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'buzbirds-welcome-seen'

export function hasSeenWelcome() {
  try { return !!localStorage.getItem(STORAGE_KEY) } catch { return false }
}

export function markWelcomeSeen() {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
}

export default function WelcomeMessage({ onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    markWelcomeSeen()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      <div
        className="w-full max-w-md bg-gradient-to-b from-green-950 to-gray-950 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-rose-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-white/60 text-xs uppercase tracking-widest">A note for you</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center transition-colors text-sm leading-none"
          >×</button>
        </div>

        {/* Letter */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="space-y-4 text-white/85 text-[15px] leading-relaxed">

            <p className="text-white font-semibold text-base">Dear Huz,</p>

            <p>
              Happy 30th! I cannot believe I've been blessed enough to have gotten to spend your entire 20s with you 🥹 What a decade it has been! From little Sarah and Dean just starting out at UKZN, having no idea what the future would bring except that we would be together. To now, our lives more incredible than I could ever have dreamed and, most importantly getting to being parents to our most beautiful baby boy ❤️
            </p>

            <p>
              You are truly the best husband and dad in the world! It brings tears to my eyes when I think about how lucky Koah is to get to have you as his dad. He is going to be your biggest fan! I can just imagine him saying — wow look how good dad is at running, look at the cool videos he makes, look how adventurous he is, look at what he can build, look how creative he is, look at the how much he knows, look how much he loves mama, look how much he loves God and Jesus and look how much he loves me ❤️
            </p>

            <p>
              So, to make you even more elite, here's the app you've been asking for — your very own (Huz)BuzBirds 🦜 Now we just need to book that game trip so you can test out your knowledge 😘
            </p>

            <p>I love you more than words could ever say ❤️</p>

            <p className="text-white/60 italic">
              Lots of love,<br />
              <span className="text-white/85 not-italic font-medium">Sezzies</span>
            </p>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
          >
            Start birding 🦜
          </button>
        </div>
      </div>
    </div>
  )
}
