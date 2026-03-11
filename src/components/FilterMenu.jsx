import { useState, useEffect, useRef } from 'react'
import SAMap from './SAMap'
import { BIRD_GROUPS } from '../data/birdGroups'
import { SA_PROVINCES } from '../data/provinces'

const TABS = ['Region', 'Groups', 'Progress']

export default function FilterMenu({ open, onClose, filters, onFilterChange, progress, deck, onClearProgress, groupIds }) {
  const [activeTab, setActiveTab] = useState('Region')
  const drawerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const known    = deck.filter(s => progress[s.taxon?.id] === 'known').length
  const unmarked = deck.length - known

  // Use provinceKey / groupId from filters (display keys, not IDs)
  const activeProvinceKey = filters.provinceKey || 'all'
  const activeGroupIds    = groupIds || ['all']
  const activeProvince    = SA_PROVINCES.find(p => p.key === activeProvinceKey) || SA_PROVINCES[0]

  const toggleGroup = (id) => {
    if (id === 'all') {
      onFilterChange({ groupIds: ['all'] })
      return
    }
    const current = activeGroupIds.filter(g => g !== 'all')
    const next = current.includes(id)
      ? current.filter(g => g !== id)
      : [...current, id]
    onFilterChange({ groupIds: next.length === 0 ? ['all'] : next })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-gray-950 border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Active filters summary */}
        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex flex-wrap gap-2 min-h-[44px] items-center">
          {activeProvinceKey !== 'all' && (
            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
              {activeProvince.emoji} {activeProvince.name}
              <button onClick={() => onFilterChange({ provinceKey: 'all' })} className="text-green-500 hover:text-white leading-none">×</button>
            </span>
          )}
          {activeGroupIds.filter(id => id !== 'all').map(id => {
            const g = BIRD_GROUPS.find(x => x.id === id)
            return g ? (
              <span key={id} className="text-xs bg-emerald-900 text-emerald-300 px-2 py-1 rounded-full flex items-center gap-1">
                {g.name}
                <button onClick={() => toggleGroup(id)} className="text-emerald-500 hover:text-white leading-none">×</button>
              </span>
            ) : null
          })}
          {activeProvinceKey === 'all' && activeGroupIds.every(id => id === 'all') && (
            <span className="text-xs text-white/30">No filters active</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-green-400 border-b-2 border-green-400' : 'text-white/50 hover:text-white/70'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── REGION TAB ────────────────────────────────────────────── */}
          {activeTab === 'Region' && (
            <div className="p-4 space-y-4">
              <SAMap
                selectedKey={activeProvinceKey}
                onSelect={(key) => onFilterChange({ provinceKey: key })}
              />

              <div className="space-y-1">
                {SA_PROVINCES.map(prov => {
                  const isSelected = activeProvinceKey === prov.key
                  return (
                    <button
                      key={prov.key}
                      onClick={() => onFilterChange({ provinceKey: prov.key })}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isSelected ? 'bg-green-900/60 text-green-300' : 'hover:bg-white/5 text-white/70'}`}
                    >
                      <span className="text-lg">{prov.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{prov.name}</p>
                        {prov.description && (
                          <p className="text-xs text-white/30 truncate">{prov.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── GROUPS TAB ────────────────────────────────────────────── */}
          {activeTab === 'Groups' && (
            <div className="p-4 space-y-1">
              <p className="text-xs text-white/30 mb-3 px-1">
                Tap to select. Select multiple to combine groups.
              </p>
              {BIRD_GROUPS.map(group => {
                const isSelected = group.id === 'all'
                  ? activeGroupIds.every(id => id === 'all')
                  : activeGroupIds.includes(group.id)
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isSelected ? 'bg-green-900/60 text-green-300' : 'hover:bg-white/5 text-white/70'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-white/30 truncate">{group.description}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* ── PROGRESS TAB ──────────────────────────────────────────── */}
          {activeTab === 'Progress' && (
            <div className="p-4 space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm">Session Progress</h3>

                <div className="h-3 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${deck.length > 0 ? (known / deck.length) * 100 : 0}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-green-950/60 rounded-xl p-3">
                    <p className="text-2xl font-bold text-green-400">{known}</p>
                    <p className="text-xs text-green-600">Known</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-bold text-white/60">{unmarked}</p>
                    <p className="text-xs text-white/30">To Learn</p>
                  </div>
                </div>

                <p className="text-center text-white/30 text-xs">{deck.length} cards total</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-white/40 px-1">
                  Use the buttons below each card to mark your progress. Saved automatically.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all progress? This cannot be undone.')) {
                      onClearProgress()
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-900 text-red-400 hover:bg-red-950/50 text-sm font-medium transition-colors"
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
