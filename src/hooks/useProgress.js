import { useState, useEffect, useCallback } from 'react'

const PROGRESS_KEY   = 'bird-flashcard-progress'
const COLLECTION_KEY = 'buzbirds-collection'

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY)
      if (!stored) return {}
      const parsed = JSON.parse(stored)
      const migrated = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v === 'known') migrated[k] = 'known'
      }
      return migrated
    } catch { return {} }
  })

  const [collected, setCollected] = useState(() => {
    try {
      const raw = localStorage.getItem(COLLECTION_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  useEffect(() => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch {}
  }, [progress])

  useEffect(() => {
    try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(collected)) } catch {}
  }, [collected])

  // ── Unified: adding to collection also marks as known ───────────────────
  const addToCollection = useCallback((taxonId, birdData) => {
    if (!taxonId) return
    setCollected(prev => {
      if (prev[taxonId]) return prev
      return {
        ...prev,
        [taxonId]: {
          id:          taxonId,
          name:        birdData?.name || 'Unknown',
          sciName:     birdData?.sciName || '',
          photoUrl:    birdData?.photoUrl || '',
          collectedAt: new Date().toISOString().slice(0, 10),
        },
      }
    })
    // Keep progress in sync
    setProgress(prev => prev[taxonId] === 'known' ? prev : { ...prev, [taxonId]: 'known' })
  }, [])

  // ── Unified: removing from collection also unmarks known ────────────────
  const removeFromCollection = useCallback((taxonId) => {
    if (!taxonId) return
    setCollected(prev => {
      const next = { ...prev }
      delete next[taxonId]
      return next
    })
    setProgress(prev => {
      const next = { ...prev }
      delete next[taxonId]
      return next
    })
  }, [])

  // markCard kept for backwards compat (unmark still works via this)
  const markCard = useCallback((taxonId, status) => {
    if (status === 'known') return // use addToCollection instead
    setProgress(prev => {
      const next = { ...prev }
      delete next[taxonId]
      return next
    })
  }, [])

  // Clears both progress and collection
  const clearProgress = useCallback(() => {
    setProgress({})
    setCollected({})
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(COLLECTION_KEY)
  }, [])

  const clearCollection = useCallback(() => {
    setCollected({})
    setProgress({})
    localStorage.removeItem(COLLECTION_KEY)
    localStorage.removeItem(PROGRESS_KEY)
  }, [])

  const getStats = useCallback((deck) => {
    const total    = deck.length
    const known    = deck.filter(s => progress[s.taxon?.id] === 'known').length
    const unmarked = total - known
    return { total, known, unmarked }
  }, [progress])

  return {
    progress, markCard, clearProgress, getStats,
    collected, addToCollection, removeFromCollection, clearCollection,
  }
}
