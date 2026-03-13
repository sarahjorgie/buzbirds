/**
 * Show traits for upcoming Birdle mystery birds using the new family-ID approach.
 * Run: node scripts/check-traits.mjs
 */

const SEED_OFFSET = 8317
const SA_PLACE_ID = 113055
const TAXON_ID    = 3

// Mirror of src/data/birdTraits.js FAMILY_ID_TRAITS
const FAMILY_ID_TRAITS = {
  5067:{size:'Large',food:'Meat/Carrion',feet:'Talons',habitat:'Grassland/Savanna'},
  4637:{size:'Medium',food:'Meat/Carrion',feet:'Talons',habitat:'Grassland/Savanna'},
  200958:{size:'Large',food:'Fish',feet:'Talons',habitat:'Wetland/Water'},
  200957:{size:'Large',food:'Meat/Carrion',feet:'Wading',habitat:'Grassland/Savanna'},
  71306:{size:'Large',food:'Meat/Carrion',feet:'Talons',habitat:'Grassland/Savanna'},
  19728:{size:'Medium',food:'Meat/Carrion',feet:'Talons',habitat:'Forest/Woodland'},
  20413:{size:'Medium',food:'Meat/Carrion',feet:'Talons',habitat:'Grassland/Savanna'},
  4929:{size:'Large',food:'Fish',feet:'Wading',habitat:'Wetland/Water'},
  4730:{size:'Large',food:'Omnivore',feet:'Wading',habitat:'Grassland/Savanna'},
  3727:{size:'Large',food:'Omnivore',feet:'Wading',habitat:'Wetland/Water'},
  3832:{size:'Large',food:'Fish',feet:'Wading',habitat:'Wetland/Water'},
  4255:{size:'Large',food:'Omnivore',feet:'Wading',habitat:'Wetland/Water'},
  6912:{size:'Medium',food:'Omnivore',feet:'Webbed',habitat:'Wetland/Water'},
  4203:{size:'Small',food:'Fish',feet:'Webbed',habitat:'Wetland/Water'},
  4262:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  4323:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Wetland/Water'},
  5059:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Wetland/Water'},
  3784:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  4628:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  3806:{size:'Medium',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  4020:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  793435:{size:'Small',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  71326:{size:'Small',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  67526:{size:'Large',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  4312:{size:'Medium',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  4342:{size:'Medium',food:'Fish',feet:'Webbed',habitat:'Coastal/Marine'},
  71367:{size:'Large',food:'Meat/Carrion',feet:'Webbed',habitat:'Coastal/Marine'},
  71309:{size:'Small',food:'Omnivore',feet:'Wading',habitat:'Coastal/Marine'},
  4783:{size:'Small',food:'Insects',feet:'Wading',habitat:'Wetland/Water'},
  3835:{size:'Small',food:'Insects',feet:'Wading',habitat:'Wetland/Water'},
  71361:{size:'Medium',food:'Insects',feet:'Wading',habitat:'Wetland/Water'},
  4574:{size:'Medium',food:'Insects',feet:'Wading',habitat:'Wetland/Water'},
  71325:{size:'Medium',food:'Insects',feet:'Wading',habitat:'Coastal/Marine'},
  4590:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  3995:{size:'Small',food:'Insects',feet:'Wading',habitat:'Wetland/Water'},
  71320:{size:'Medium',food:'Insects',feet:'Wading',habitat:'Coastal/Marine'},
  4917:{size:'Medium',food:'Insects',feet:'Wading',habitat:'Grassland/Savanna'},
  71330:{size:'Small',food:'Insects',feet:'Wading',habitat:'Rocky/Cliff'},
  154:{size:'Medium',food:'Omnivore',feet:'Wading',habitat:'Wetland/Water'},
  23:{size:'Large',food:'Omnivore',feet:'Wading',habitat:'Grassland/Savanna'},
  75:{size:'Large',food:'Omnivore',feet:'Perching',habitat:'Grassland/Savanna'},
  574:{size:'Medium',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  1426:{size:'Large',food:'Omnivore',feet:'Perching',habitat:'Grassland/Savanna'},
  20523:{size:'Large',food:'Omnivore',feet:'Perching',habitat:'Grassland/Savanna'},
  20863:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  2715:{size:'Medium',food:'Seeds/Grain',feet:'Perching',habitat:'Urban/Garden'},
  18875:{size:'Medium',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  18874:{size:'Medium',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  1627:{size:'Medium',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  7194:{size:'Medium',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  19376:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  6544:{size:'Small',food:'Insects',feet:'Perching',habitat:'Urban/Garden'},
  3687:{size:'Small',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  20716:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  2314:{size:'Small',food:'Fish',feet:'Perching',habitat:'Wetland/Water'},
  2183:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  2262:{size:'Medium',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  20967:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  20932:{size:'Small',food:'Insects',feet:'Climbing',habitat:'Forest/Woodland'},
  5438:{size:'Medium',food:'Omnivore',feet:'Perching',habitat:'Grassland/Savanna'},
  17599:{size:'Small',food:'Insects',feet:'Climbing',habitat:'Forest/Woodland'},
  200961:{size:'Small',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  200963:{size:'Small',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  17551:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  200960:{size:'Medium',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  7284:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  11853:{size:'Small',food:'Insects',feet:'Perching',habitat:'Urban/Garden'},
  71339:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  7823:{size:'Medium',food:'Omnivore',feet:'Perching',habitat:'Urban/Garden'},
  71343:{size:'Medium',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71318:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71338:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  13547:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71362:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  7649:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  15050:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  144307:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  200983:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  200984:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  200982:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  144308:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  14556:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Urban/Garden'},
  12704:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  15977:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  68490:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  144306:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71371:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  980192:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  12015:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  71333:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71303:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71374:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  71296:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  17438:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  13273:{size:'Tiny',food:'Nectar',feet:'Perching',habitat:'Forest/Woodland'},
  71357:{size:'Small',food:'Nectar',feet:'Perching',habitat:'Grassland/Savanna'},
  14841:{size:'Small',food:'Omnivore',feet:'Perching',habitat:'Urban/Garden'},
  200987:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  71354:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  71322:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  68491:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  9079:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},
  13685:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Urban/Garden'},
  559249:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  200977:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
}

const SPECIES_OVERRIDES = {
  2328:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},2334:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},2337:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},2346:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},2351:{size:'Small',food:'Fish',feet:'Perching',habitat:'Coastal/Marine'},3012:{size:'Medium',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},3326:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},3327:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},3328:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},3405:{size:'Medium',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},9221:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},9271:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},12803:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},12822:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},12839:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},12873:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},12908:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},13139:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13145:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13147:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13148:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13237:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13262:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13268:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},13687:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},13688:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},13695:{size:'Small',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},13699:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},13701:{size:'Small',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},13704:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},14563:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},14570:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},14688:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},14708:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},14932:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},14969:{size:'Small',food:'Omnivore',feet:'Perching',habitat:'Rocky/Cliff'},15030:{size:'Small',food:'Omnivore',feet:'Perching',habitat:'Forest/Woodland'},15032:{size:'Small',food:'Omnivore',feet:'Perching',habitat:'Grassland/Savanna'},55371:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},72477:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},144298:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},144655:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},144889:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},145028:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},145075:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},204506:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},204545:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},522887:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},522889:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},527434:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},527609:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},558601:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},558609:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},558612:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},558618:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},558631:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},558632:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},603751:{size:'Tiny',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},979671:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},979832:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},979944:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},980202:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},980204:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},980207:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},980209:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},980210:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},1423667:{size:'Medium',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},1423879:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},1585977:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},13246:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},72468:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
}

function getTraits(taxon) {
  if (!taxon) return null
  if (taxon.id && SPECIES_OVERRIDES[taxon.id]) return SPECIES_OVERRIDES[taxon.id]
  if (!taxon.ancestor_ids) return null
  for (const id of taxon.ancestor_ids) {
    const t = FAMILY_ID_TRAITS[id]
    if (t) return t
  }
  return null
}

function dayIndex(dateStr) {
  return Math.floor((new Date(dateStr).getTime() - new Date('2024-01-01').getTime()) / 86400000)
}

function seededShuffle(arr, seed) {
  const out = [...arr]; let s = seed | 0 || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    const j = (s >>> 0) % (i + 1);[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function fetchAllSpecies() {
  let all = []
  for (let page = 1; page <= 10; page++) {
    process.stdout.write(`Fetching page ${page}...\r`)
    const res = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?taxon_id=${TAXON_ID}&place_id=${SA_PLACE_ID}&per_page=200&page=${page}&verifiable=true`)
    const data = await res.json()
    const results = data.results || []
    all = all.concat(results)
    if (results.length < 200) break
    await new Promise(r => setTimeout(r, 400))
  }
  return all
}

const all = await fetchAllSpecies()
const validPool = all.filter(s =>
  s.taxon?.default_photo && s.taxon?.ancestor_ids?.length > 0 && getTraits(s.taxon)
)
const shuffled = seededShuffle(validPool, SEED_OFFSET)
const today = new Date()

console.log(`\nPool: ${validPool.length} valid birds\n`)
console.log('Date        | Bird                          | Size   | Food          | Feet     | Habitat')
console.log('------------|-------------------------------|--------|---------------|----------|-------------------')
for (let i = 0; i < 10; i++) {
  const d = new Date(today); d.setDate(today.getDate() + i)
  const dateStr = d.toISOString().slice(0, 10)
  const bird   = shuffled[dayIndex(dateStr) % shuffled.length]
  const name   = (bird?.taxon?.preferred_common_name || bird?.taxon?.name || '???').padEnd(29)
  const traits = getTraits(bird?.taxon)
  const size   = (traits?.size    || '?').padEnd(6)
  const food   = (traits?.food    || '?').padEnd(13)
  const feet   = (traits?.feet    || '?').padEnd(8)
  const hab    = traits?.habitat  || '?'
  console.log(`${dateStr} | ${name} | ${size} | ${food} | ${feet} | ${hab}`)
}
