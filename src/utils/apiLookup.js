// Fallback ID resolution for any future provinces/groups without hardcoded IDs.
// All current provinces and groups have verified hardcoded IDs in their data files.

const placeCache = {}
const taxonCache = {}

export async function resolvePlaceId(query) {
  if (placeCache[query]) return placeCache[query]

  const url = `https://api.inaturalist.org/v1/places/autocomplete?q=${encodeURIComponent(query)}&per_page=20`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Place lookup failed: ${res.status}`)
  const data = await res.json()
  const results = data.results || []

  // SA provinces have admin_level=10 on iNaturalist (not 1!)
  const match =
    results.find(p => p.admin_level === 10) ||
    results.find(p => p.place_type === 103) ||
    results[0]

  if (!match) throw new Error(`No place found for "${query}"`)
  placeCache[query] = match.id
  return match.id
}

export async function resolveTaxonId(query) {
  if (taxonCache[query]) return taxonCache[query]

  const url = `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}&per_page=10`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Taxon lookup failed: ${res.status}`)
  const data = await res.json()
  const results = data.results || []

  const isBird = (t) => {
    const anc = t.ancestry || ''
    return anc.split('/').includes('3') || t.iconic_taxon_name === 'Aves'
  }

  const match =
    results.find(t => t.name.toLowerCase() === query.toLowerCase() && isBird(t)) ||
    results.find(t => isBird(t)) ||
    results[0]

  if (!match) throw new Error(`No taxon found for "${query}"`)
  taxonCache[query] = match.id
  return match.id
}

// No-op preload since all IDs are now hardcoded
export async function preloadIds() {}
