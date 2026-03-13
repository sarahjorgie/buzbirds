/**
 * Check how many valid Birdle mystery birds exist in iNat SA data
 * and list the mystery bird for each of the next 30 days.
 *
 * Run: node scripts/check-birdle-pool.mjs
 */

// ── Exact same constants/logic as BirdleGame.jsx ──────────────────────────────
const SEED_OFFSET = 8317
const SA_PLACE_ID = 113055
const TAXON_ID    = 3       // Birds

// Exact same BIRD_GROUPS taxon IDs from birdGroups.js
const ANCESTOR_IDS = new Set([
  3806,   // penguins
  67565,  // seabirds
  4203,   // grebes
  4255,   // flamingos
  4323,   // pelicans
  4262,   // cormorants
  4929,   // herons
  4730,   // storks
  3727,   // ibises
  6888,   // ducks
  67561,  // waders
  4342,   // gulls
  154,    // rails
  23,     // cranes
  5067,   // raptors
  4637,   // falcons
  19350,  // owls
  573,    // gamebirds
  75,     // bustards
  200960, // sandgrouse
  2715,   // pigeons
  18874,  // parrots
  1627,   // cuckoos
  19376,  // nightjars
  6544,   // swifts
  3687,   // mousebirds
  20716,  // trogons
  2314,   // kingfishers
  2183,   // bee-eaters
  2262,   // rollers
  20967,  // hoopoes
  5438,   // hornbills
  17599,  // woodpeckers
  200961, // barbets
  17551,  // honeyguides
  7284,   // larks
  11853,  // swallows
  71339,  // wagtails
  14556,  // bulbuls
  12704,  // robins
  71333,  // shrikes
  13273,  // sunbirds
  71354,  // weavers
  71322,  // waxbills
  14841,  // starlings
  7251,   // passerines (catch-all)
])

function hasValidGroup(taxon) {
  if (!taxon?.ancestor_ids) return false
  for (const id of taxon.ancestor_ids) {
    if (ANCESTOR_IDS.has(id)) return true
  }
  return false
}

function dayIndex(dateStr) {
  const epoch = new Date('2024-01-01').getTime()
  return Math.floor((new Date(dateStr).getTime() - epoch) / 86400000)
}

function seededShuffle(arr, seed) {
  const out = [...arr]
  let s = seed | 0 || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    const j = (s >>> 0) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function getMysteryBird(pool, dateStr) {
  const shuffled = seededShuffle(pool, SEED_OFFSET)
  return shuffled[dayIndex(dateStr) % shuffled.length] || null
}

// ── Fetch all pages from iNat ─────────────────────────────────────────────────
async function fetchAllSpecies() {
  let all = []
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.inaturalist.org/v1/observations/species_counts?taxon_id=${TAXON_ID}&place_id=${SA_PLACE_ID}&per_page=200&page=${page}&verifiable=true`
    console.log(`Fetching page ${page}...`)
    const res  = await fetch(url)
    const data = await res.json()
    const results = data.results || []
    all = all.concat(results)
    if (results.length < 200) break
    await new Promise(r => setTimeout(r, 400)) // be polite to iNat API
  }
  return all
}

// ── Main ──────────────────────────────────────────────────────────────────────
const all = await fetchAllSpecies()
console.log(`\nTotal species fetched: ${all.length}`)

// Filter to valid mystery candidates (same as getMysteryBird pool filter)
const validPool = all.filter(s =>
  s.taxon?.default_photo &&
  s.taxon?.ancestor_ids?.length > 0 &&
  hasValidGroup(s.taxon)
)
console.log(`Valid mystery candidates (have photo + known group): ${validPool.length}`)

// Show 30-day schedule
console.log('\n── Mystery bird for each of the next 30 days ──────────────────')
const today = new Date()
const seen = new Set()
let repeats = 0
for (let i = 0; i < 30; i++) {
  const d = new Date(today)
  d.setDate(today.getDate() + i)
  const dateStr = d.toISOString().slice(0, 10)
  const bird = getMysteryBird(validPool, dateStr)
  const name = bird?.taxon?.preferred_common_name || bird?.taxon?.name || '???'
  const id   = bird?.taxon?.id
  const dup  = seen.has(id) ? ' ⚠️ REPEAT' : ''
  if (seen.has(id)) repeats++
  seen.add(id)
  console.log(`  ${dateStr}: ${name}${dup}`)
}
console.log(`\nRepeats in next 30 days: ${repeats}`)
console.log(`Pool size vs 30 days: ${validPool.length} birds → ${validPool.length >= 30 ? 'OK' : 'RISK of repeats'}`)
