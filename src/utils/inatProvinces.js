// Fetch which SA provinces a bird has been observed in, using iNaturalist.
// Results cached in memory — each taxon is only looked up once per session.

const cache = new Map()

const PROVINCES = [
  { key: 'limpopo',      name: 'Limpopo',       abbr: 'LP',  placeId: 9074  },
  { key: 'mpumalanga',   name: 'Mpumalanga',    abbr: 'MP',  placeId: 7478  },
  { key: 'gauteng',      name: 'Gauteng',        abbr: 'GP',  placeId: 9576  },
  { key: 'northwest',    name: 'North West',     abbr: 'NW',  placeId: 12513 },
  { key: 'freestate',    name: 'Free State',     abbr: 'FS',  placeId: 50327 },
  { key: 'kwazulunatal', name: 'KwaZulu-Natal',  abbr: 'KZN', placeId: 13313 },
  { key: 'northerncape', name: 'Northern Cape',  abbr: 'NC',  placeId: 13314 },
  { key: 'easterncape',  name: 'Eastern Cape',   abbr: 'EC',  placeId: 8872  },
  { key: 'westerncape',  name: 'Western Cape',   abbr: 'WC',  placeId: 6987  },
]

async function checkProvince(taxonId, placeId) {
  const url = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${placeId}&per_page=0&verifiable=true`
  const res = await fetch(url)
  if (!res.ok) return false
  const data = await res.json()
  return (data.total_results ?? 0) > 0
}

/**
 * Returns an array of province objects with an added `present: boolean` field.
 * Fires all 9 province checks in parallel.
 */
export async function fetchProvincePresence(taxonId) {
  if (!taxonId) return null
  if (cache.has(taxonId)) return cache.get(taxonId)

  // Mark as in-progress
  cache.set(taxonId, null)

  try {
    const results = await Promise.all(
      PROVINCES.map(async prov => ({
        ...prov,
        present: await checkProvince(taxonId, prov.placeId),
      }))
    )
    cache.set(taxonId, results)
    return results
  } catch {
    cache.delete(taxonId)
    return null
  }
}
