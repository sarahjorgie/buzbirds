/**
 * Audit which iNat families in the first 350 SA birds are missing from familyTraits.js
 * Run: node scripts/audit-families.mjs
 */

// Families already in familyTraits.js
const KNOWN_FAMILIES = new Set([
  'Accipitridae','Falconidae','Pandionidae','Sagittariidae','Cathartidae',
  'Strigidae','Tytonidae',
  'Ardeidae','Ciconiidae','Threskiornithidae','Scopidae','Phoenicopteridae',
  'Anatidae','Podicipedidae','Phalacrocoracidae','Pelecanidae','Anhingidae',
  'Sulidae','Fregatidae','Spheniscidae','Procellariidae','Laridae','Stercorariidae','Rhynchopidae',
  'Charadriidae','Scolopacidae','Recurvirostridae','Jacanidae','Haematopodidae','Glareolidae','Rostratulidae',
  'Rallidae','Gruidae','Otididae',
  'Columbidae','Psittacidae','Cuculidae',
  'Caprimulgidae','Apodidae','Coliidae',
  'Alcedinidae','Cerylidae','Halcyonidae','Meropidae','Coraciidae','Upupidae','Phoeniculidae',
  'Bucerotidae','Bucorvidae',
  'Picidae','Lybiidae','Capitonidae','Indicatoridae',
  'Alaudidae','Hirundinidae','Motacillidae',
  'Corvidae','Oriolidae','Dicruridae','Monarchidae',
  'Paridae','Remizidae',
  'Cisticolidae','Sylviidae','Macrosphenidae','Acrocephalidae','Locustellidae',
  'Pycnonotidae',
  'Muscicapidae','Turdidae','Platysteiridae',
  'Timaliidae','Leiothrichidae',
  'Laniidae','Malaconotidae','Campephagidae',
  'Zosteropidae','Nectariniidae','Promeropidae',
  'Sturnidae','Buphagidae',
  'Ploceidae','Estrildidae','Viduidae','Fringillidae','Passeridae',
  'Phylloscopidae','Cettiidae',
  'Chaetopidae','Musophagidae','Pteroclidae','Numididae','Phasianidae',
])

async function fetchPage(page) {
  const url = `https://api.inaturalist.org/v1/observations/species_counts?taxon_id=3&place_id=113055&per_page=200&page=${page}&verifiable=true`
  const res = await fetch(url)
  return (await res.json()).results || []
}

// Fetch first 2 pages (~400 birds, we'll cap at 350)
console.log('Fetching species pages...')
const [p1, p2] = await Promise.all([fetchPage(1), fetchPage(2)])
const allSpecies = [...p1, ...p2].slice(0, 350)
console.log(`Got ${allSpecies.length} species. Fetching family names via /v1/taxa...`)

// Batch fetch taxon data to get real family names
const taxonIds = allSpecies.map(s => s.taxon?.id).filter(Boolean)
const familyMap = new Map() // taxonId → familyName

for (let i = 0; i < taxonIds.length; i += 30) {
  const chunk = taxonIds.slice(i, i + 30)
  const res = await fetch(`https://api.inaturalist.org/v1/taxa?id=${chunk.join(',')}`)
  const data = await res.json()
  for (const taxon of data.results || []) {
    const family = taxon.ancestors?.find(a => a.rank === 'family')?.name
    familyMap.set(taxon.id, family || null)
  }
  process.stdout.write(`  batch ${Math.floor(i/30)+1}/${Math.ceil(taxonIds.length/30)}\r`)
  await new Promise(r => setTimeout(r, 300))
}

// Collate results
const missing = new Map()   // family → [bird names]
const covered = new Map()   // family → count
let noFamily = []

for (const s of allSpecies) {
  const id   = s.taxon?.id
  const name = s.taxon?.preferred_common_name || s.taxon?.name
  const fam  = familyMap.get(id)
  if (!fam) { noFamily.push(name); continue }
  if (KNOWN_FAMILIES.has(fam)) {
    covered.set(fam, (covered.get(fam) || 0) + 1)
  } else {
    if (!missing.has(fam)) missing.set(fam, [])
    missing.get(fam).push(name)
  }
}

console.log(`\n✅ Families already in familyTraits.js: ${covered.size}`)
console.log(`❌ Missing families: ${missing.size}`)
console.log(`⚠️  Birds with no family found: ${noFamily.length}`)

if (missing.size > 0) {
  console.log('\n── Missing families (add these to familyTraits.js) ─────────────')
  for (const [fam, birds] of [...missing.entries()].sort()) {
    console.log(`  ${fam.padEnd(22)} — ${birds.slice(0,3).join(', ')}${birds.length > 3 ? ` (+${birds.length-3} more)` : ''}`)
  }
}

if (noFamily.length > 0) {
  console.log('\n── Birds with no family resolved ───────────────────────────────')
  noFamily.forEach(n => console.log(`  ${n}`))
}
