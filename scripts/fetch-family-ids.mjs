/**
 * Fetch iNaturalist taxon IDs for all bird families in familyTraits.js
 * so we can do accurate family-level lookup via ancestor_ids (no extra API calls at runtime)
 * Run: node scripts/fetch-family-ids.mjs
 */

const FAMILIES = [
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
  // Additional families that might appear in SA birds
  'Struthionidae',  // ostrich
  'Turnicidae',     // buttonquails
  'Burhinidae',     // thick-knees
  'Dromadidae',     // crab-plover
  'Ibidorhynchidae','Chionidae',  // sheathbills
  'Alcidae',        // auks (vagrants)
  'Pterodromidae',  // petrels
  'Oceanitidae',    // storm-petrels
  'Diomedeidae',    // albatrosses
  'Hydrobatidae',   // storm-petrels
  'Phaethontidae',  // tropicbirds
  'Nyctibiidae',    // potoos
  'Trogonidae',     // trogons
  'Brachypteraciidae', // ground-rollers
  'Dacelonidae',    // tree kingfishers (some classifications)
  'Megalaimidae',   // Asian barbets (some iNat records)
  'Stenostiridae',  // fairy flycatchers
  'Pellorneidae',   // ground babblers
  'Vangidae',       // vangas/helmetshrikes
  'Prionopidae',    // helmetshrikes
  'Artamidae',      // woodswallows
  'Certhiidae',     // treecreepers
  'Sittidae',       // nuthatches
  'Regulidae',      // kinglets
  'Aegithalidae',   // long-tailed tits
  'Fringillidae',   // finches
  'Emberizidae',    // buntings (older classification)
  'Thraupidae',     // tanagers
  'Icteridae',      // blackbirds (vagrants)
]

const results = {}
const failed  = []

// Batch by 30 — use name= param to search by scientific name at family rank
for (let i = 0; i < FAMILIES.length; i += 30) {
  const chunk = FAMILIES.slice(i, i + 30)
  // Fetch each individually since name search is more reliable
  for (const fam of chunk) {
    try {
      const res  = await fetch(`https://api.inaturalist.org/v1/taxa?q=${fam}&rank=family&is_active=true`)
      const data = await res.json()
      const match = data.results?.find(t => t.name === fam && t.rank === 'family')
      if (match) {
        results[fam] = match.id
      } else {
        failed.push(fam)
      }
    } catch { failed.push(fam) }
    await new Promise(r => setTimeout(r, 150))
  }
  process.stdout.write(`  ${i + Math.min(30, FAMILIES.length - i)}/${FAMILIES.length} done\r`)
}

console.log('\n\n── Family name → iNat taxon ID ─────────────────────────────────')
// Output as JS object ready to paste
const lines = Object.entries(results).sort((a,b) => a[0].localeCompare(b[0]))
for (const [fam, id] of lines) {
  console.log(`  ${fam.padEnd(22)}: ${id},`)
}

if (failed.length) {
  console.log(`\nFailed to resolve: ${failed.join(', ')}`)
}
console.log(`\nTotal: ${lines.length} families resolved`)
