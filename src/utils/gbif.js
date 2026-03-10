// GBIF (Global Biodiversity Information Facility) cross-reference
// Free, no API key required. https://api.gbif.org/v1/

const taxonomyCache = new Map()

/**
 * Fetch authoritative taxonomy for a bird by scientific name.
 * Returns { family, order, familyKey, orderKey, confidence, status, usageKey }
 * or null if not found.
 */
export async function fetchGBIFTaxonomy(scientificName) {
  if (!scientificName) return null
  if (taxonomyCache.has(scientificName)) return taxonomyCache.get(scientificName)

  // Mark as in-progress to avoid duplicate fetches
  taxonomyCache.set(scientificName, null)

  try {
    const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&class=Aves&strict=false`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    if (data.matchType === 'NONE' || !data.family) {
      taxonomyCache.set(scientificName, null)
      return null
    }

    const result = {
      family:      data.family     || null,
      order:       data.order      || null,
      familyKey:   data.familyKey  || null,
      orderKey:    data.orderKey   || null,
      confidence:  data.confidence || 0,
      status:      data.status     || null,
      usageKey:    data.usageKey   || null,
      matchType:   data.matchType  || null,
    }

    taxonomyCache.set(scientificName, result)
    return result
  } catch {
    return null
  }
}

/**
 * Batch-prefetch taxonomy for an array of scientific names.
 * Runs concurrently with a small delay to be a good API citizen.
 */
export async function prefetchTaxonomy(names) {
  const unique = [...new Set(names)].filter(n => n && !taxonomyCache.has(n))
  const chunks = []
  for (let i = 0; i < unique.length; i += 10) chunks.push(unique.slice(i, i + 10))
  for (const chunk of chunks) {
    await Promise.all(chunk.map(name => fetchGBIFTaxonomy(name)))
    await new Promise(r => setTimeout(r, 200))
  }
}

/**
 * Check if a species has GBIF occurrence records in a specific SA province.
 * Uses stateProvince string matching. Returns count (0 = not recorded there).
 */
export async function checkGBIFProvince(scientificName, stateProvince) {
  try {
    const url = `https://api.gbif.org/v1/occurrence/search?country=ZA&stateProvince=${encodeURIComponent(stateProvince)}&scientificName=${encodeURIComponent(scientificName)}&limit=0`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.count ?? null
  } catch {
    return null
  }
}
