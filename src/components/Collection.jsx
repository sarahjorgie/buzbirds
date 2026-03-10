import { useState } from 'react'

function CollectedCard({ bird, onRemove }) {
  const [imgErr, setImgErr] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-800">
      {!imgErr && bird.photoUrl ? (
        <img
          src={bird.photoUrl}
          alt={bird.name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🐦</div>
      )}
      {/* Name overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pt-4 pb-1.5">
        <p className="text-white text-[10px] font-medium leading-tight truncate">{bird.name}</p>
      </div>
      {/* Remove button — tap × to confirm, tap again to remove */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 text-white/50 hover:bg-black/70 hover:text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
          <p className="text-white text-[10px] text-center leading-tight">Remove from collection?</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => onRemove(bird.id)}
              className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-semibold"
            >
              Remove
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 rounded-lg bg-white/20 text-white text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyCard() {
  return (
    <div className="aspect-square rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
      <span className="text-2xl opacity-20">🐦</span>
      <p className="text-white/15 text-[9px]">???</p>
    </div>
  )
}

export default function Collection({ collected, totalSpecies, onClose, onClearCollection, onRemoveBird }) {
  const birds = Object.values(collected).sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
  const count = birds.length

  // Build display grid: collected birds first, then empty slots (up to a reasonable max)
  const GRID_SIZE = Math.max(count + 12, 30)
  const empties   = GRID_SIZE - count

  const pct = totalSpecies > 0 ? Math.round((count / totalSpecies) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl">My Collection</h2>
          <p className="text-green-400 text-xs">{count} of {totalSpecies} birds identified</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white">{pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-2 shrink-0">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Empty state */}
      {count === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <span className="text-6xl opacity-30">🐦</span>
          <p className="text-white font-semibold text-lg">No birds collected yet</p>
          <p className="text-white/40 text-sm">
            Get quiz answers correct or mark birds as Known to add them to your collection.
          </p>
        </div>
      )}

      {/* Grid */}
      {count > 0 && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="grid grid-cols-3 gap-2">
            {birds.map(bird => (
              <CollectedCard key={bird.id} bird={bird} onRemove={onRemoveBird} />
            ))}
            {Array.from({ length: empties }).map((_, i) => (
              <EmptyCard key={`empty-${i}`} />
            ))}
          </div>

          {/* Clear button */}
          <div className="mt-6 pb-4">
            <button
              onClick={() => {
                if (window.confirm('Clear your entire collection? This cannot be undone.')) {
                  onClearCollection()
                }
              }}
              className="w-full py-2.5 rounded-xl border border-red-900 text-red-400 hover:bg-red-950/50 text-sm transition-colors"
            >
              Clear Collection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
