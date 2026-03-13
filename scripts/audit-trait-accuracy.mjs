/**
 * Flag birds whose family-level traits are likely wrong for that specific species.
 * Run: node scripts/audit-trait-accuracy.mjs
 */

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

// Species-level overrides: taxon_id → corrected traits
// These are birds whose family-level traits are clearly wrong for that specific species
const KNOWN_PROBLEMS = {
  // Alcedinidae → "Fish / Wetland" but these kingfishers eat insects & live in woodland/savanna
  'Woodland Kingfisher':       { expected: 'Insects / Grassland/Savanna' },
  'Brown-hooded Kingfisher':   { expected: 'Insects / Forest/Woodland'   },
  'Striped Kingfisher':        { expected: 'Insects / Grassland/Savanna' },
  // Muscicapidae → "Forest/Woodland" but chats/stonechats are grassland/rocky
  'Familiar Chat':             { expected: 'Insects / Rocky/Cliff'       },
  'Mountain Chat':             { expected: 'Insects / Rocky/Cliff'       },
  'Mocking Cliff-Chat':        { expected: 'Insects / Rocky/Cliff'       },
  'African Stonechat':         { expected: 'Insects / Grassland/Savanna' },
  'Sickle-winged Chat':        { expected: 'Insects / Grassland/Savanna' },
  'Southern Anteater-Chat':    { expected: 'Insects / Grassland/Savanna' },
  'Capped Wheatear':           { expected: 'Insects / Grassland/Savanna' },
  'Buff-streaked Chat':        { expected: 'Insects / Rocky/Cliff'       },
  'Karoo Chat':                { expected: 'Insects / Rocky/Cliff'       },
  // Motacillidae → "Grassland" but wagtails live near water
  'Cape Wagtail':              { expected: 'Insects / Wetland/Water'     },
  'African Pied Wagtail':      { expected: 'Insects / Wetland/Water'     },
  'Mountain Wagtail':          { expected: 'Insects / Wetland/Water'     },
  // Columbidae → "Seeds / Urban" but green-pigeons eat fruit & live in forest
  'African Green-Pigeon':      { expected: 'Fruit / Forest/Woodland'     },
  'Rameron Pigeon':            { expected: 'Fruit / Forest/Woodland'     },
  // Sturnidae → "Omnivore / Urban" but some starlings are grassland or forest
  'Wattled Starling':          { expected: 'Omnivore / Grassland/Savanna'},
  'Pale-winged Starling':      { expected: 'Omnivore / Rocky/Cliff'      },
  'Violet-backed Starling':    { expected: 'Omnivore / Forest/Woodland'  },
  // Pycnonotidae → "Fruit / Urban" but greenbuls are forest
  'Yellow-bellied Greenbul':   { expected: 'Fruit / Forest/Woodland'     },
  'Sombre Greenbul':           { expected: 'Fruit / Forest/Woodland'     },
  // Fringillidae → "Seeds / Forest" but many canaries/buntings are grassland
  'Yellow Canary':             { expected: 'Seeds/Grain / Grassland/Savanna' },
  'Cape Canary':               { expected: 'Seeds/Grain / Grassland/Savanna' },
  'Lark-like Bunting':         { expected: 'Seeds/Grain / Grassland/Savanna' },
  'Cape Bunting':              { expected: 'Seeds/Grain / Rocky/Cliff'    },
}

const SPECIES_OVERRIDES = {
  2328:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  2334:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  2337:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  2346:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  2351:{size:'Small',food:'Fish',feet:'Perching',habitat:'Coastal/Marine'},
  3012:{size:'Medium',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  3326:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},
  3327:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},
  3328:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland'},
  3405:{size:'Medium',food:'Fruit',feet:'Climbing',habitat:'Forest/Woodland'},
  9221:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  9271:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  12803:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  12822:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  12839:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  12873:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  12908:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  13139:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13145:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13147:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13148:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13237:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  13262:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13268:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  13687:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  13688:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  13695:{size:'Small',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  13699:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  13701:{size:'Small',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  13704:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  14563:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  14570:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  14688:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  14708:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  14932:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  14969:{size:'Small',food:'Omnivore',feet:'Perching',habitat:'Rocky/Cliff'},
  15030:{size:'Small',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  15032:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  55371:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  72477:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  144298:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  144655:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Forest/Woodland'},
  144889:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  145028:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  145075:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  204506:{size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},
  204545:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Wetland/Water'},
  522887:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  522889:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  527434:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  527609:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  558601:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  558609:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  558612:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  558618:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  558631:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},
  558632:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'},
  603751:{size:'Tiny',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  979671:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  979832:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  979944:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  980202:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  980204:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  980207:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  980209:{size:'Small',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  980210:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  1423667:{size:'Medium',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  1423879:{size:'Small',food:'Fruit',feet:'Perching',habitat:'Forest/Woodland'},
  1585977:{size:'Tiny',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna'},
  13246:{size:'Small',food:'Insects',feet:'Perching',habitat:'Rocky/Cliff'},
  72468:{size:'Tiny',food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
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

function getFamilyId(taxon) {
  if (!taxon?.ancestor_ids) return null
  for (const id of taxon.ancestor_ids) {
    if (FAMILY_ID_TRAITS[id]) return id
  }
  return null
}

async function fetchAllSpecies() {
  let all = []
  for (let page = 1; page <= 10; page++) {
    process.stdout.write(`Fetching page ${page}...\r`)
    const res = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?taxon_id=3&place_id=113055&per_page=200&page=${page}&verifiable=true`)
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

console.log(`\nPool: ${validPool.length} birds\n`)

// Group birds by family ID and show all birds per family
const byFamily = new Map()
for (const s of validPool) {
  const fid = getFamilyId(s.taxon)
  if (!fid) continue
  if (!byFamily.has(fid)) byFamily.set(fid, [])
  byFamily.get(fid).push(s.taxon?.preferred_common_name || s.taxon?.name)
}

// Flag known-problematic families
const PROBLEM_FAMILIES = {
  2314:  'Alcedinidae: All assigned "Fish/Wetland" — woodland/dry-country kingfishers wrong',
  12704: 'Muscicapidae: All assigned "Forest" — chats/stonechats live in grassland/rocky',
  71339: 'Motacillidae: All assigned "Grassland" — wagtails live near water',
  2715:  'Columbidae: All assigned "Seeds/Urban" — green-pigeons eat fruit & live in forest',
  14841: 'Sturnidae: All assigned "Urban" — wattled/violet-backed/pale-winged are grassland/forest/rocky',
  14556: 'Pycnonotidae: All assigned "Urban" — greenbuls are forest birds',
  9079:  'Fringillidae: All assigned "Forest" — most SA canaries/buntings are grassland',
  15977: 'Turdidae: All assigned "Forest" — Groundscraper Thrush is grassland',
}

console.log('── Potentially inaccurate family assignments ──────────────────────')
for (const [fid, note] of Object.entries(PROBLEM_FAMILIES)) {
  const birds = byFamily.get(Number(fid)) || []
  if (birds.length === 0) continue
  const traits = FAMILY_ID_TRAITS[fid]
  console.log(`\n⚠️  ${note}`)
  console.log(`   Traits assigned: ${traits.size} | ${traits.food} | ${traits.feet} | ${traits.habitat}`)
  console.log(`   ${birds.length} birds: ${birds.join(', ')}`)
}

// Check known problems against what's in pool
console.log('\n── Known problem birds in pool ─────────────────────────────────────')
for (const s of validPool) {
  const name = s.taxon?.preferred_common_name || s.taxon?.name
  if (KNOWN_PROBLEMS[name]) {
    const t = getTraits(s.taxon)
    console.log(`  ${name.padEnd(30)} assigned: ${t.food} / ${t.habitat}  →  should be: ${KNOWN_PROBLEMS[name].expected}`)
  }
}
