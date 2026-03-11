// Bird groups aligned with Roberts Birds of Southern Africa (7th ed.) chapter order
// All iNaturalist taxon IDs verified via /v1/taxa/autocomplete

export const BIRD_GROUPS = [
  { id: 'all',         name: 'All Birds',              icon: '🐦', taxonId: 3,      searchQuery: null, description: 'All species' },

  // ── Waterbirds & seabirds ──────────────────────────────────────────────
  { id: 'penguins',    name: 'Penguins',               icon: '🐧', taxonId: 3806,   searchQuery: null, description: 'African Penguin' },
  { id: 'seabirds',    name: 'Seabirds',               icon: '🌊', taxonId: 67565,  searchQuery: null, description: 'Albatrosses, petrels, shearwaters' },
  { id: 'grebes',      name: 'Grebes',                 icon: '🐦', taxonId: 4203,   searchQuery: null, description: 'Little & Great Crested Grebe' },
  { id: 'flamingos',   name: 'Flamingos',              icon: '🦩', taxonId: 4255,   searchQuery: null, description: 'Greater & Lesser Flamingo' },
  { id: 'pelicans',    name: 'Pelicans',               icon: '🐦', taxonId: 4323,   searchQuery: null, description: 'Great White & Pink-backed Pelican' },
  { id: 'cormorants',  name: 'Cormorants & Darter',    icon: '🐦', taxonId: 4262,   searchQuery: null, description: 'Cormorants & African Darter' },
  { id: 'herons',      name: 'Herons & Egrets',        icon: '🦢', taxonId: 4929,   searchQuery: null, description: 'Herons, egrets, bitterns, night-herons' },
  { id: 'storks',      name: 'Storks',                 icon: '🦢', taxonId: 4730,   searchQuery: null, description: 'Marabou, Saddle-billed, White Stork' },
  { id: 'ibises',      name: 'Ibises & Spoonbills',    icon: '🦩', taxonId: 3727,   searchQuery: null, description: 'Hadeda, Sacred Ibis, African Spoonbill' },
  { id: 'ducks',       name: 'Ducks & Geese',          icon: '🦆', taxonId: 6888,   searchQuery: null, description: 'Ducks, geese, Egyptian Goose' },
  { id: 'waders',      name: 'Waders & Shorebirds',    icon: '🐦', taxonId: 67561,  searchQuery: null, description: 'Plovers, sandpipers, stilts, avocet' },
  { id: 'gulls',       name: 'Gulls & Terns',          icon: '🐦', taxonId: 4342,   searchQuery: null, description: 'Gulls, terns, skimmers' },
  { id: 'rails',       name: 'Rails & Crakes',         icon: '🐦', taxonId: 154,    searchQuery: null, description: 'Rails, crakes, moorhen, coot' },
  { id: 'cranes',      name: 'Cranes',                 icon: '🦢', taxonId: 23,     searchQuery: null, description: 'Grey Crowned, Blue & Wattled Crane' },

  // ── Raptors ───────────────────────────────────────────────────────────
  { id: 'raptors',     name: 'Eagles & Hawks',         icon: '🦅', taxonId: 5067,   searchQuery: null, description: 'Eagles, hawks, vultures, harriers' },
  { id: 'falcons',     name: 'Falcons & Kestrels',     icon: '🦅', taxonId: 4637,   searchQuery: null, description: 'Falcons & kestrels' },
  { id: 'owls',        name: 'Owls',                   icon: '🦉', taxonId: 19350,  searchQuery: null, description: 'Owls & barn owls' },

  // ── Terrestrial non-passerines ────────────────────────────────────────
  { id: 'gamebirds',   name: 'Francolins & Guineafowl',icon: '🦃', taxonId: 573,    searchQuery: null, description: 'Francolins, spurfowl, quails, guineafowl' },
  { id: 'bustards',    name: 'Bustards & Korhaans',    icon: '🐦', taxonId: 75,     searchQuery: null, description: 'Kori, Ludwig\'s, korhaans' },
  { id: 'sandgrouse',  name: 'Sandgrouse',             icon: '🐦', taxonId: 200960, searchQuery: null, description: 'Namaqua, Burchell\'s, Double-banded' },
  { id: 'pigeons',     name: 'Pigeons & Doves',        icon: '🕊️', taxonId: 2715,   searchQuery: null, description: 'Pigeons, doves, green-pigeons' },
  { id: 'parrots',     name: 'Parrots & Lovebirds',    icon: '🦜', taxonId: 18874,  searchQuery: null, description: 'Lovebirds, Cape Parrot' },
  { id: 'cuckoos',     name: 'Cuckoos & Coucals',      icon: '🐦', taxonId: 1627,   searchQuery: null, description: 'Cuckoos, coucals, roadrunners' },
  { id: 'nightjars',   name: 'Nightjars',              icon: '🐦', taxonId: 19376,  searchQuery: null, description: 'Fierynecked, Rufous-cheeked...' },
  { id: 'swifts',      name: 'Swifts',                 icon: '💨', taxonId: 6544,   searchQuery: null, description: 'Swifts & spinetails' },
  { id: 'mousebirds',  name: 'Mousebirds',             icon: '🐦', taxonId: 3687,   searchQuery: null, description: 'Speckled & Red-faced Mousebird' },
  { id: 'trogons',     name: 'Trogons',                icon: '✨', taxonId: 20716,  searchQuery: null, description: 'Narina Trogon' },
  { id: 'kingfishers', name: 'Kingfishers',            icon: '✨', taxonId: 2314,   searchQuery: null, description: 'Giant, Pied, Malachite, Brown-hooded' },
  { id: 'bee-eaters',  name: 'Bee-eaters',             icon: '✨', taxonId: 2183,   searchQuery: null, description: 'Little, Carmine, White-fronted' },
  { id: 'rollers',     name: 'Rollers',                icon: '✨', taxonId: 2262,   searchQuery: null, description: 'Lilac-breasted, European, Racket-tailed' },
  { id: 'hoopoes',     name: 'Hoopoes & Wood-hoopoes', icon: '🐦', taxonId: 20967,  searchQuery: null, description: 'African Hoopoe, Green Wood-hoopoe' },
  { id: 'hornbills',   name: 'Hornbills',              icon: '🦜', taxonId: 5438,   searchQuery: null, description: 'Ground Hornbill, Yellow-billed, Red-billed' },
  { id: 'woodpeckers', name: 'Woodpeckers',            icon: '🐦', taxonId: 17599,  searchQuery: null, description: 'Cardinal, Bearded, Bennett\'s' },
  { id: 'barbets',     name: 'Barbets & Tinkerbirds',  icon: '🐦', taxonId: 200961, searchQuery: null, description: 'Crested, Black-collared, Acacia Pied' },
  { id: 'honeyguides', name: 'Honeyguides',            icon: '🐦', taxonId: 17551,  searchQuery: null, description: 'Greater, Lesser, Scaly-throated' },

  // ── Passerines ────────────────────────────────────────────────────────
  { id: 'larks',       name: 'Larks',                  icon: '🐤', taxonId: 7284,   searchQuery: null, description: 'Sabota, Rufous-naped, Monotonous' },
  { id: 'swallows',    name: 'Swallows & Martins',     icon: '💨', taxonId: 11853,  searchQuery: null, description: 'Barn Swallow, Greater Striped, Sand Martin' },
  { id: 'wagtails',    name: 'Wagtails & Pipits',      icon: '🐤', taxonId: 71339,  searchQuery: null, description: 'Cape Wagtail, African Pipit' },
  { id: 'bulbuls',     name: 'Bulbuls',                icon: '🐤', taxonId: 14556,  searchQuery: null, description: 'Dark-capped, Cape, Terrestrial Bulbul' },
  { id: 'robins',      name: 'Robins, Chats & Flycatchers', icon: '🐤', taxonId: 12704, searchQuery: null, description: 'Cape Robin-chat, Familiar Chat, Paradise Flycatcher' },
  { id: 'shrikes',     name: 'Shrikes & Bush-shrikes', icon: '🐤', taxonId: 71333,  searchQuery: null, description: 'Fiscal Shrike, Bokmakierie, Tchagra' },
  { id: 'sunbirds',    name: 'Sunbirds',               icon: '✨', taxonId: 13273,  searchQuery: null, description: 'Malachite, Amethyst, White-bellied, Orange-breasted' },
  { id: 'weavers',     name: 'Weavers',                icon: '🐤', taxonId: 71354,  searchQuery: null, description: 'Village, Cape, Masked, Spectacled Weaver' },
  { id: 'waxbills',    name: 'Waxbills & Firefinches', icon: '🐤', taxonId: 71322,  searchQuery: null, description: 'Common Waxbill, Blue Waxbill, Melba Finch' },
  { id: 'starlings',   name: 'Starlings & Oxpeckers',  icon: '🐤', taxonId: 14841,  searchQuery: null, description: 'Glossy, Cape, Red-winged, Yellow-billed Oxpecker' },
  { id: 'passerines',  name: 'Other Passerines',       icon: '🐤', taxonId: 7251,   searchQuery: null, description: 'All remaining perching birds' },
]
