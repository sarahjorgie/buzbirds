// South African provinces with verified iNaturalist place IDs
// Confirmed via: https://api.inaturalist.org/v1/places/autocomplete?q=PROVINCE_NAME
// All provinces use admin_level=10, place_type=103 on iNaturalist

export const SA_PROVINCES = [
  {
    key: 'all',
    name: 'All of South Africa',
    abbr: 'ZA',
    emoji: '🇿🇦',
    placeId: 113055, // confirmed
    searchQuery: null,
    description: null,
  },
  {
    key: 'limpopo',
    name: 'Limpopo',
    abbr: 'LP',
    emoji: '🌿',
    placeId: 9074, // confirmed
    searchQuery: null,
    description: 'Kruger, Waterberg, Limpopo valley',
  },
  {
    key: 'mpumalanga',
    name: 'Mpumalanga',
    abbr: 'MP',
    emoji: '🏔️',
    placeId: 7478, // confirmed
    searchQuery: null,
    description: 'Lowveld, Escarpment, Kruger south',
  },
  {
    key: 'gauteng',
    name: 'Gauteng',
    abbr: 'GP',
    emoji: '🏙️',
    placeId: 9576, // confirmed
    searchQuery: null,
    description: 'Johannesburg, Pretoria, highveld',
  },
  {
    key: 'northwest',
    name: 'North West',
    abbr: 'NW',
    emoji: '🌾',
    placeId: 12513, // confirmed
    searchQuery: null,
    description: 'Pilanesberg, Magaliesberg, Kalahari edge',
  },
  {
    key: 'freestate',
    name: 'Free State',
    abbr: 'FS',
    emoji: '🌻',
    placeId: 50327, // confirmed
    searchQuery: null,
    description: 'Grasslands, Golden Gate, wetlands',
  },
  {
    key: 'kwazulunatal',
    name: 'KwaZulu-Natal',
    abbr: 'KZN',
    emoji: '🌊',
    placeId: 13313, // confirmed
    searchQuery: null,
    description: 'iSimangaliso, Drakensberg, coastal forests',
  },
  {
    key: 'northerncape',
    name: 'Northern Cape',
    abbr: 'NC',
    emoji: '🏜️',
    placeId: 13314, // confirmed
    searchQuery: null,
    description: 'Kalahari, Namaqualand, Richtersveld',
  },
  {
    key: 'easterncape',
    name: 'Eastern Cape',
    abbr: 'EC',
    emoji: '🌿',
    placeId: 8872, // confirmed
    searchQuery: null,
    description: 'Addo, Baviaanskloof, Wild Coast',
  },
  {
    key: 'westerncape',
    name: 'Western Cape',
    abbr: 'WC',
    emoji: '🍇',
    placeId: 6987, // confirmed
    searchQuery: null,
    description: 'Cape Point, Fynbos, Garden Route',
  },
]
