export default function CardProgress({ taxonId, status, onMark }) {
  const isKnown = status === 'known'

  return (
    <div className="w-full max-w-md mt-3">
      <p className="text-center text-white/30 text-xs mb-2">Know this bird?</p>
      <div className="flex gap-2">

        {/* Mark as Known */}
        <button
          onClick={() => onMark(taxonId, isKnown ? null : 'known')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            isKnown
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-white/20 text-white/50 hover:border-green-500 hover:text-green-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {isKnown ? 'Known' : 'Mark as Known'}
        </button>

        {/* Unmark (only useful when already known) */}
        {isKnown && (
          <button
            onClick={() => onMark(taxonId, null)}
            title="Remove from known"
            className="w-11 flex items-center justify-center rounded-xl border border-white/10 text-white/30 hover:border-white/30 hover:text-white/60 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
