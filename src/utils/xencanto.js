// Fetch bird call recordings using iNaturalist's sounds API.
// Falls back to any SA research-grade sound observation for the species.
// Results cached in memory per session.

const cache = new Map()

export async function fetchBirdCall(taxonId) {
  if (!taxonId) return null
  if (cache.has(taxonId)) return cache.get(taxonId)

  try {
    // Try SA observations first, then global if nothing found
    for (const placeId of [113055, null]) {
      const params = new URLSearchParams({
        taxon_id: taxonId,
        sounds: 'true',
        quality_grade: 'research',
        per_page: 5,
        order_by: 'votes',
        ...(placeId ? { place_id: placeId } : {}),
      })
      const res = await fetch(`https://api.inaturalist.org/v1/observations?${params}`)
      if (!res.ok) continue
      const data = await res.json()

      const obs = data.results?.find(o => o.sounds?.length > 0)
      if (!obs) continue

      const sound = obs.sounds[0]
      const fileUrl = sound?.file_url || sound?.file
      if (!fileUrl) continue

      const result = {
        url:         fileUrl,
        attribution: sound.attribution || obs.user?.login || '',
        type:        'call',
        quality:     obs.quality_grade === 'research' ? 'A' : 'B',
      }
      cache.set(taxonId, result)
      return result
    }

    cache.set(taxonId, null)
    return null
  } catch {
    cache.delete(taxonId)
    return null
  }
}
