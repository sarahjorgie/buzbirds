// Bird groups with verified iNaturalist taxon IDs
// Confirmed via: https://api.inaturalist.org/v1/taxa/autocomplete?q=TAXON_NAME

export const BIRD_GROUPS = [
  {
    id: 'all',
    name: 'All Birds',
    icon: '🐦',
    taxonId: 3, // Aves — confirmed
    searchQuery: null,
    description: 'All species',
  },
  {
    id: 'raptors',
    name: 'Eagles & Hawks',
    icon: '🦅',
    taxonId: 5067, // Accipitridae — confirmed
    searchQuery: null,
    description: 'Eagles, hawks, harriers, vultures',
  },
  {
    id: 'falcons',
    name: 'Falcons',
    icon: '🐦',
    taxonId: 4637, // Falconidae — confirmed
    searchQuery: null,
    description: 'Falcons & kestrels',
  },
  {
    id: 'owls',
    name: 'Owls',
    icon: '🦉',
    taxonId: 19350, // Strigiformes — confirmed
    searchQuery: null,
    description: 'Owls & barn owls',
  },
  {
    id: 'herons',
    name: 'Herons & Egrets',
    icon: '🦢',
    taxonId: 4929, // Ardeidae — confirmed
    searchQuery: null,
    description: 'Herons, egrets, bitterns',
  },
  {
    id: 'ducks',
    name: 'Ducks & Geese',
    icon: '🦆',
    taxonId: 6888, // Anseriformes — confirmed
    searchQuery: null,
    description: 'Ducks, geese, swans',
  },
  {
    id: 'waders',
    name: 'Waders & Gulls',
    icon: '🐦',
    taxonId: 67561, // Charadriiformes — confirmed
    searchQuery: null,
    description: 'Plovers, sandpipers, gulls, terns',
  },
  {
    id: 'passerines',
    name: 'Passerines',
    icon: '🐤',
    taxonId: 7251, // Passeriformes — confirmed
    searchQuery: null,
    description: 'Weavers, sunbirds, starlings, robins…',
  },
  {
    id: 'pigeons',
    name: 'Pigeons & Doves',
    icon: '🕊️',
    taxonId: 2715, // Columbidae — confirmed
    searchQuery: null,
    description: 'Pigeons & doves',
  },
  {
    id: 'parrots',
    name: 'Parrots',
    icon: '🦜',
    taxonId: 18874, // Psittaciformes — confirmed
    searchQuery: null,
    description: 'Parrots, lovebirds',
  },
  {
    id: 'kingfishers',
    name: 'Kingfishers & Allies',
    icon: '✨',
    taxonId: 2114, // Coraciiformes — confirmed (kingfishers, bee-eaters, rollers)
    searchQuery: null,
    description: 'Kingfishers, bee-eaters, rollers, hoopoes',
  },
  {
    id: 'hornbills',
    name: 'Hornbills',
    icon: '🦜',
    taxonId: 5438, // Bucerotidae — confirmed
    searchQuery: null,
    description: 'Hornbills',
  },
  {
    id: 'seabirds',
    name: 'Seabirds',
    icon: '🐧',
    taxonId: 67565, // Procellariiformes — confirmed
    searchQuery: null,
    description: 'Albatrosses, petrels, shearwaters',
  },
  {
    id: 'gamebirds',
    name: 'Gamebirds',
    icon: '🦃',
    taxonId: 573, // Galliformes — confirmed
    searchQuery: null,
    description: 'Francolins, quails, guineafowl',
  },
  {
    id: 'storks',
    name: 'Storks & Ibises',
    icon: '🦩',
    taxonId: 3726, // Ciconiiformes — confirmed
    searchQuery: null,
    description: 'Storks, ibises, spoonbills',
  },
  {
    id: 'swifts',
    name: 'Swifts',
    icon: '💨',
    taxonId: 1583761, // Apodiformes — confirmed
    searchQuery: null,
    description: 'Swifts & spinetails',
  },
]
