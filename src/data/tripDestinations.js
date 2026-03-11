// Curated SA birding destinations with verified iNaturalist place IDs
// Verified via api.inaturalist.org/v1/places/autocomplete

export const TRIP_CATEGORIES = [
  { id: 'parks',    label: 'National Parks' },
  { id: 'reserves', label: 'Game Reserves' },
  { id: 'hotspots', label: 'Birding Hotspots' },
]

export const TRIP_DESTINATIONS = [
  // ── National Parks ───────────────────────────────────────────────────────
  {
    key: 'kruger',
    name: 'Kruger National Park',
    placeId: 69020,
    category: 'parks',
    province: 'LP / MP',
    description: "Africa's most famous park — 500+ species",
  },
  {
    key: 'kgalagadi',
    name: 'Kgalagadi Transfrontier Park',
    placeId: 69021,
    category: 'parks',
    province: 'NC',
    description: 'Arid Kalahari — raptors, larks, sandgrouse',
  },
  {
    key: 'tablemountain',
    name: 'Table Mountain NP',
    placeId: 71668,
    category: 'parks',
    province: 'WC',
    description: 'Cape Point, fynbos endemics, seabirds',
  },
  {
    key: 'westcoast',
    name: 'West Coast NP',
    placeId: 153850,
    category: 'parks',
    province: 'WC',
    description: 'Langebaan Lagoon — waders & waterbirds',
  },
  {
    key: 'addo',
    name: 'Addo Elephant NP',
    placeId: 69022,
    category: 'parks',
    province: 'EC',
    description: 'Eastern Cape bushveld and thicket',
  },
  {
    key: 'gardenroute',
    name: 'Garden Route NP',
    placeId: 146690,
    category: 'parks',
    province: 'WC / EC',
    description: 'Knysna, Wilderness — forest & coastal birds',
  },
  {
    key: 'isimangaliso',
    name: 'iSimangaliso Wetland Park',
    placeId: 174402,
    category: 'parks',
    province: 'KZN',
    description: 'World Heritage Site — 526 species',
  },
  {
    key: 'drakensberg',
    name: 'uKhahlamba-Drakensberg',
    placeId: 131528,
    category: 'parks',
    province: 'KZN',
    description: 'Montane species, raptors, Bearded Vulture',
  },
  {
    key: 'mapungubwe',
    name: 'Mapungubwe NP',
    placeId: 55127,
    category: 'parks',
    province: 'LP',
    description: 'Limpopo valley — arid bushveld birds',
  },

  // ── Game Reserves ────────────────────────────────────────────────────────
  {
    key: 'ndumo',
    name: 'Ndumo Game Reserve',
    placeId: 71278,
    category: 'reserves',
    province: 'KZN',
    description: "SA's top birding spot — 420+ species",
  },
  {
    key: 'hluhluwe',
    name: 'Hluhluwe-iMfolozi Park',
    placeId: 71275,
    category: 'reserves',
    province: 'KZN',
    description: 'KZN bushveld, thicket, waterways',
  },
  {
    key: 'pilanesberg',
    name: 'Pilanesberg NP',
    placeId: 65580,
    category: 'reserves',
    province: 'NW',
    description: 'Bushveld near Joburg — 360+ species',
  },

  // ── Birding Hotspots ─────────────────────────────────────────────────────
  {
    key: 'nylsvlei',
    name: 'Nylsvlei Nature Reserve',
    placeId: 129465,
    category: 'hotspots',
    province: 'LP',
    description: 'Ramsar floodplain — outstanding waterbirds',
  },
  {
    key: 'barberspan',
    name: 'Barberspan Nature Reserve',
    placeId: 185205,
    category: 'hotspots',
    province: 'NW',
    description: 'Ramsar site — ducks, waders, flamingos',
  },
  {
    key: 'marievale',
    name: 'Marievale Bird Sanctuary',
    placeId: 9675,
    category: 'hotspots',
    province: 'GP',
    description: "Gauteng's best wetland birding",
  },
  {
    key: 'dehoop',
    name: 'De Hoop Nature Reserve',
    placeId: 69351,
    category: 'hotspots',
    province: 'WC',
    description: 'Fynbos, vlei, coastal — superb endemics',
  },
  {
    key: 'boulders',
    name: 'Boulders Beach',
    placeId: 194973,
    category: 'hotspots',
    province: 'WC',
    description: "African Penguin colony — Simon's Town",
  },
]
