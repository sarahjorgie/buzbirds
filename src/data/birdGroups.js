// Bird groups aligned with Roberts Birds of Southern Africa (7th ed.) chapter order
// All iNaturalist taxon IDs verified via /v1/taxa/autocomplete

export const BIRD_GROUPS = [
  { id: 'all',         name: 'All Birds',              category: null,          taxonId: 3,      searchQuery: null, description: 'All species' },

  // ── Waterbirds & seabirds ──────────────────────────────────────────────
  { id: 'penguins',    name: 'Penguins',               category: 'waterbirds',  taxonId: 3806,   searchQuery: null, description: 'African Penguin' },
  { id: 'seabirds',    name: 'Seabirds',               category: 'waterbirds',  taxonId: 67565,  searchQuery: null, description: 'Albatrosses, petrels, shearwaters' },
  { id: 'grebes',      name: 'Grebes',                 category: 'waterbirds',  taxonId: 4203,   searchQuery: null, description: 'Little & Great Crested Grebe' },
  { id: 'flamingos',   name: 'Flamingos',              category: 'waterbirds',  taxonId: 4255,   searchQuery: null, description: 'Greater & Lesser Flamingo' },
  { id: 'pelicans',    name: 'Pelicans',               category: 'waterbirds',  taxonId: 4323,   searchQuery: null, description: 'Great White & Pink-backed Pelican' },
  { id: 'cormorants',  name: 'Cormorants & Darter',    category: 'waterbirds',  taxonId: 4262,   searchQuery: null, description: 'Cormorants & African Darter' },
  { id: 'herons',      name: 'Herons & Egrets',        category: 'waterbirds',  taxonId: 4929,   searchQuery: null, description: 'Herons, egrets, bitterns, night-herons' },
  { id: 'storks',      name: 'Storks',                 category: 'waterbirds',  taxonId: 4730,   searchQuery: null, description: 'Marabou, Saddle-billed, White Stork' },
  { id: 'ibises',      name: 'Ibises & Spoonbills',    category: 'waterbirds',  taxonId: 3727,   searchQuery: null, description: 'Hadeda, Sacred Ibis, African Spoonbill' },
  { id: 'ducks',       name: 'Ducks & Geese',          category: 'waterbirds',  taxonId: 6888,   searchQuery: null, description: 'Ducks, geese, Egyptian Goose' },
  { id: 'waders',      name: 'Waders & Shorebirds',    category: 'waterbirds',  taxonId: 67561,  searchQuery: null, description: 'Plovers, sandpipers, stilts, avocet' },
  { id: 'gulls',       name: 'Gulls & Terns',          category: 'waterbirds',  taxonId: 4342,   searchQuery: null, description: 'Gulls, terns, skimmers' },
  { id: 'rails',       name: 'Rails & Crakes',         category: 'waterbirds',  taxonId: 154,    searchQuery: null, description: 'Rails, crakes, moorhen, coot' },
  { id: 'cranes',      name: 'Cranes',                 category: 'waterbirds',  taxonId: 23,     searchQuery: null, description: 'Grey Crowned, Blue & Wattled Crane' },

  // ── Raptors ───────────────────────────────────────────────────────────
  { id: 'raptors',     name: 'Eagles & Hawks',         category: 'raptors',     taxonId: 5067,   searchQuery: null, description: 'Eagles, hawks, vultures, harriers' },
  { id: 'falcons',     name: 'Falcons & Kestrels',     category: 'raptors',     taxonId: 4637,   searchQuery: null, description: 'Falcons & kestrels' },
  { id: 'owls',        name: 'Owls',                   category: 'raptors',     taxonId: 19350,  searchQuery: null, description: 'Owls & barn owls' },

  // ── Terrestrial non-passerines ────────────────────────────────────────
  { id: 'gamebirds',   name: 'Francolins & Guineafowl',category: 'terrestrial', taxonId: 573,    searchQuery: null, description: 'Francolins, spurfowl, quails, guineafowl' },
  { id: 'bustards',    name: 'Bustards & Korhaans',    category: 'terrestrial', taxonId: 75,     searchQuery: null, description: 'Kori, Ludwig\'s, korhaans' },
  { id: 'sandgrouse',  name: 'Sandgrouse',             category: 'terrestrial', taxonId: 200960, searchQuery: null, description: 'Namaqua, Burchell\'s, Double-banded' },
  { id: 'pigeons',     name: 'Pigeons & Doves',        category: 'terrestrial', taxonId: 2715,   searchQuery: null, description: 'Pigeons, doves, green-pigeons' },
  { id: 'parrots',     name: 'Parrots & Lovebirds',    category: 'terrestrial', taxonId: 18874,  searchQuery: null, description: 'Lovebirds, Cape Parrot' },
  { id: 'cuckoos',     name: 'Cuckoos & Coucals',      category: 'terrestrial', taxonId: 1627,   searchQuery: null, description: 'Cuckoos, coucals, roadrunners' },
  { id: 'nightjars',   name: 'Nightjars',              category: 'terrestrial', taxonId: 19376,  searchQuery: null, description: 'Fierynecked, Rufous-cheeked...' },
  { id: 'swifts',      name: 'Swifts',                 category: 'terrestrial', taxonId: 6544,   searchQuery: null, description: 'Swifts & spinetails' },
  { id: 'mousebirds',  name: 'Mousebirds',             category: 'terrestrial', taxonId: 3687,   searchQuery: null, description: 'Speckled & Red-faced Mousebird' },
  { id: 'trogons',     name: 'Trogons',                category: 'terrestrial', taxonId: 20716,  searchQuery: null, description: 'Narina Trogon' },
  { id: 'kingfishers', name: 'Kingfishers',            category: 'terrestrial', taxonId: 2314,   searchQuery: null, description: 'Giant, Pied, Malachite, Brown-hooded' },
  { id: 'bee-eaters',  name: 'Bee-eaters',             category: 'terrestrial', taxonId: 2183,   searchQuery: null, description: 'Little, Carmine, White-fronted' },
  { id: 'rollers',     name: 'Rollers',                category: 'terrestrial', taxonId: 2262,   searchQuery: null, description: 'Lilac-breasted, European, Racket-tailed' },
  { id: 'hoopoes',     name: 'Hoopoes & Wood-hoopoes', category: 'terrestrial', taxonId: 20967,  searchQuery: null, description: 'African Hoopoe, Green Wood-hoopoe' },
  { id: 'hornbills',   name: 'Hornbills',              category: 'terrestrial', taxonId: 5438,   searchQuery: null, description: 'Ground Hornbill, Yellow-billed, Red-billed' },
  { id: 'woodpeckers', name: 'Woodpeckers',            category: 'terrestrial', taxonId: 17599,  searchQuery: null, description: 'Cardinal, Bearded, Bennett\'s' },
  { id: 'barbets',     name: 'Barbets & Tinkerbirds',  category: 'terrestrial', taxonId: 200961, searchQuery: null, description: 'Crested, Black-collared, Acacia Pied' },
  { id: 'honeyguides', name: 'Honeyguides',            category: 'terrestrial', taxonId: 17551,  searchQuery: null, description: 'Greater, Lesser, Scaly-throated' },

  // ── Passerines ────────────────────────────────────────────────────────
  { id: 'larks',       name: 'Larks',                  category: 'passerines',  taxonId: 7284,   searchQuery: null, description: 'Sabota, Rufous-naped, Monotonous' },
  { id: 'swallows',    name: 'Swallows & Martins',     category: 'passerines',  taxonId: 11853,  searchQuery: null, description: 'Barn Swallow, Greater Striped, Sand Martin' },
  { id: 'wagtails',    name: 'Wagtails & Pipits',      category: 'passerines',  taxonId: 71339,  searchQuery: null, description: 'Cape Wagtail, African Pipit' },
  { id: 'bulbuls',     name: 'Bulbuls',                category: 'passerines',  taxonId: 14556,  searchQuery: null, description: 'Dark-capped, Cape, Terrestrial Bulbul' },
  { id: 'robins',      name: 'Robins, Chats & Flycatchers', category: 'passerines', taxonId: 12704, searchQuery: null, description: 'Cape Robin-chat, Familiar Chat, Paradise Flycatcher' },
  { id: 'shrikes',     name: 'Shrikes & Bush-shrikes', category: 'passerines',  taxonId: 71333,  searchQuery: null, description: 'Fiscal Shrike, Bokmakierie, Tchagra' },
  { id: 'sunbirds',    name: 'Sunbirds',               category: 'passerines',  taxonId: 13273,  searchQuery: null, description: 'Malachite, Amethyst, White-bellied, Orange-breasted' },
  { id: 'weavers',     name: 'Weavers',                category: 'passerines',  taxonId: 71354,  searchQuery: null, description: 'Village, Cape, Masked, Spectacled Weaver' },
  { id: 'waxbills',    name: 'Waxbills & Firefinches', category: 'passerines',  taxonId: 71322,  searchQuery: null, description: 'Common Waxbill, Blue Waxbill, Melba Finch' },
  { id: 'starlings',   name: 'Starlings & Oxpeckers',  category: 'passerines',  taxonId: 14841,  searchQuery: null, description: 'Glossy, Cape, Red-winged, Yellow-billed Oxpecker' },
  { id: 'passerines',  name: 'Other Passerines',       category: 'passerines',  taxonId: 7251,   searchQuery: null, description: 'All remaining perching birds' },
]
