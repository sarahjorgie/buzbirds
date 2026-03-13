/**
 * Fetch taxon IDs for species that need overrides, so we can key overrides by ID not name.
 * Run: node scripts/fetch-override-ids.mjs
 */

// species name → corrected traits
const OVERRIDES = {
  // Alcedinidae: dry-country/woodland kingfishers don't eat fish
  'Brown-hooded Kingfisher':  { size:'Small', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   },
  'Woodland Kingfisher':      { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Striped Kingfisher':       { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Gray-headed Kingfisher':   { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'African Pygmy Kingfisher': { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   },
  'Mangrove Kingfisher':      { size:'Small', food:'Fish',    feet:'Perching', habitat:'Coastal/Marine'    },

  // Muscicapidae: chats/wheatears/stonechats → not forest birds
  'Familiar Chat':            { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Mountain Chat':            { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Mocking Cliff-Chat':       { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Karoo Chat':               { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Buff-streaked Chat':       { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Sentinel Rock-Thrush':     { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Short-toed Rock-Thrush':   { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Miombo Rock-Thrush':       { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Cape Rock-Thrush':         { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'African Stonechat':        { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Whinchat':                 { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Capped Wheatear':          { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Northern Wheatear':        { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Southern Anteater-Chat':   { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Sickle-winged Chat':       { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Tractrac Chat':            { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Arnot\'s Chat':            { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Herero Chat':              { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Angola Cave-Chat':         { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
  'Chat Flycatcher':          { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Marico Flycatcher':        { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Pale Flycatcher':          { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },

  // Muscicapidae scrub-robins: savanna not forest
  'Kalahari Scrub-Robin':     { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Karoo Scrub-Robin':        { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },

  // Motacillidae: wagtails are wetland birds; family is mostly correct for pipits/longclaws
  'Cape Wagtail':             { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'African Pied Wagtail':     { size:'Small', food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'Mountain Wagtail':         { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'Grey Wagtail':             { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'White Wagtail':            { size:'Small', food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'Western Yellow Wagtail':   { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },
  'Citrine Wagtail':          { size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     },

  // Columbidae: green-pigeons eat fruit and live in forest
  'African Green-Pigeon':     { size:'Medium',food:'Fruit',   feet:'Climbing', habitat:'Forest/Woodland'   },
  'Rameron Pigeon':           { size:'Medium',food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Lemon Dove':               { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Tambourine Dove':          { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' },
  'Blue-spotted Wood-Dove':   { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' },
  'Emerald-spotted Wood-Dove':{ size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' },

  // Pycnonotidae: greenbuls/brownbuls are forest, not urban
  'Sombre Greenbul':          { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Yellow-bellied Greenbul':  { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Terrestrial Brownbul':     { size:'Small', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   },
  'Yellow-streaked Greenbul': { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Stripe-cheeked Greenbul':  { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Tiny Greenbul':            { size:'Tiny',  food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },

  // Sturnidae: not all are urban
  'Wattled Starling':         { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Pale-winged Starling':     { size:'Small', food:'Omnivore',feet:'Perching', habitat:'Rocky/Cliff'       },
  'Violet-backed Starling':   { size:'Small', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   },
  'Black-bellied Starling':   { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },
  'Sharp-tailed Starling':    { size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   },

  // Fringillidae: most SA canaries are open country not forest
  'Yellow Canary':            { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Cape Canary':              { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Yellow-fronted Canary':    { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Streaky-headed Seedeater': { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Brimstone Canary':         { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'White-throated Canary':    { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Black-throated Canary':    { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Black-headed Canary':      { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Lemon-breasted Seedeater': { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Cape Bunting':             { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'      },
  'Lark-like Bunting':        { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'},
  'Cape Siskin':              { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'      },
  'Drakensberg Siskin':       { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'      },

  // Turdidae: groundscraper thrush is grassland
  'Groundscraper Thrush':     { size:'Medium',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' },
  'Boulder Chat':             { size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       },
}

// Fetch taxon IDs by searching iNat
const results = {}
const failed  = []
const names   = Object.keys(OVERRIDES)

for (let i = 0; i < names.length; i++) {
  const name = names[i]
  try {
    const res  = await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(name)}&rank=species`)
    const data = await res.json()
    const match = data.results?.find(t =>
      t.preferred_common_name?.toLowerCase() === name.toLowerCase() ||
      t.name?.toLowerCase() === name.toLowerCase()
    )
    if (match) {
      results[match.id] = OVERRIDES[name]
    } else {
      failed.push(name)
    }
  } catch { failed.push(name) }
  process.stdout.write(`  ${i+1}/${names.length}\r`)
  await new Promise(r => setTimeout(r, 120))
}

console.log('\n\n// Paste into birdTraits.js as SPECIES_OVERRIDES:')
console.log('const SPECIES_OVERRIDES = {')
for (const [id, t] of Object.entries(results).sort((a,b) => Number(a)-Number(b))) {
  console.log(`  ${id}: { size:'${t.size}', food:'${t.food}', feet:'${t.feet}', habitat:'${t.habitat}' },`)
}
console.log('}')

if (failed.length) console.log(`\n// Failed to resolve: ${failed.join(', ')}`)
console.log(`\n// Total: ${Object.keys(results).length} species overrides`)
