// Fetch multiple taxon photos from iNaturalist.
// iNat's species_counts response only includes default_photo — this fetches the full set.
// Results cached in memory per session.

const cache = new Map()

export async function fetchTaxonPhotos(taxonId) {
  if (!taxonId) return []
  if (cache.has(taxonId)) return cache.get(taxonId)

  try {
    const res = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`)
    if (!res.ok) return []
    const data = await res.json()
    const taxon = data.results?.[0]
    if (!taxon) return []

    const photos = (taxon.taxon_photos || [])
      .map(tp => tp.photo)
      .filter(p => p && (p.medium_url || p.url))
      .slice(0, 8)
      .map(p => ({
        url: p.medium_url || p.url,
        attribution: p.attribution,
      }))

    cache.set(taxonId, photos)
    return photos
  } catch {
    return []
  }
}
