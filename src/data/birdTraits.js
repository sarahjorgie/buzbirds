/**
 * Trait lookup for BuzBirdle.
 *
 * getTraits(taxon) scans taxon.ancestor_ids for known iNaturalist FAMILY taxon IDs,
 * giving family-level accuracy with zero extra API calls at runtime.
 * Falls back to order/group-level IDs for any family not yet in the map.
 *
 * size:    "Tiny" | "Small" | "Medium" | "Large"
 * food:    "Insects" | "Fish" | "Seeds/Grain" | "Meat/Carrion" | "Nectar" | "Fruit" | "Omnivore"
 * feet:    "Perching" | "Talons" | "Webbed" | "Wading" | "Climbing"
 * habitat: "Grassland/Savanna" | "Forest/Woodland" | "Wetland/Water" | "Coastal/Marine" | "Urban/Garden" | "Rocky/Cliff"
 */

// iNaturalist family taxon IDs → traits (fetched via /v1/taxa?q=<name>&rank=family)
// Ordered so more specific families appear before broad catch-alls
const FAMILY_ID_TRAITS = {
  // ── Raptors ────────────────────────────────────────────────────────────────
  5067:   { size: 'Large',  food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // Accipitridae — eagles, hawks, kites, vultures
  4637:   { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // Falconidae — falcons, kestrels
  200958: { size: 'Large',  food: 'Fish',         feet: 'Talons',   habitat: 'Wetland/Water'     }, // Pandionidae — osprey
  200957: { size: 'Large',  food: 'Meat/Carrion', feet: 'Wading',   habitat: 'Grassland/Savanna' }, // Sagittariidae — secretary bird
  71306:  { size: 'Large',  food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // Cathartidae — New World vultures

  // ── Owls ──────────────────────────────────────────────────────────────────
  19728:  { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Forest/Woodland'   }, // Strigidae — wood owls, eagle-owls, scops, barred
  20413:  { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // Tytonidae — barn owl, grass owl

  // ── Waterbirds ────────────────────────────────────────────────────────────
  4929:   { size: 'Large',  food: 'Fish',         feet: 'Wading',   habitat: 'Wetland/Water'     }, // Ardeidae — herons, egrets, night-herons
  4730:   { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Grassland/Savanna' }, // Ciconiidae — storks
  3727:   { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // Threskiornithidae — ibises, spoonbills
  3832:   { size: 'Large',  food: 'Fish',         feet: 'Wading',   habitat: 'Wetland/Water'     }, // Scopidae — hamerkop
  4255:   { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // Phoenicopteridae — flamingos
  6912:   { size: 'Medium', food: 'Omnivore',     feet: 'Webbed',   habitat: 'Wetland/Water'     }, // Anatidae — ducks, geese, swans
  4203:   { size: 'Small',  food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // Podicipedidae — grebes
  4262:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Phalacrocoracidae — cormorants
  4323:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // Pelecanidae — pelicans
  5059:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // Anhingidae — darter/snakebird
  3784:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Sulidae — gannets, boobies
  4628:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Fregatidae — frigatebirds
  3806:   { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Spheniscidae — penguins
  4020:   { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Procellariidae — petrels, shearwaters
  793435: { size: 'Small',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Oceanitidae — storm-petrels
  71326:  { size: 'Small',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Hydrobatidae — storm-petrels
  67526:  { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Diomedeidae — albatrosses
  4312:   { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Phaethontidae — tropicbirds
  4342:   { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Laridae — gulls, terns, skimmers
  71367:  { size: 'Large',  food: 'Meat/Carrion', feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Stercorariidae — skuas, jaegers
  71309:  { size: 'Small',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Coastal/Marine'    }, // Chionidae — sheathbills

  // ── Shorebirds & waders ───────────────────────────────────────────────────
  4783:   { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // Charadriidae — plovers, lapwings
  3835:   { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // Scolopacidae — sandpipers, snipes, godwits
  71361:  { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // Recurvirostridae — stilts, avocets
  4574:   { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // Jacanidae — African jacana
  71325:  { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Coastal/Marine'    }, // Haematopodidae — oystercatchers
  4590:   { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Glareolidae — pratincoles, coursers
  3995:   { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // Rostratulidae — painted-snipes
  71320:  { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Coastal/Marine'    }, // Dromadidae — crab-plover
  4917:   { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Grassland/Savanna' }, // Burhinidae — thick-knees
  71330:  { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Rocky/Cliff'       }, // Ibidorhynchidae — ibisbill

  // ── Rails & cranes ────────────────────────────────────────────────────────
  154:    { size: 'Medium', food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // Rallidae — rails, moorhens, coots, crakes
  23:     { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Grassland/Savanna' }, // Gruidae — cranes
  75:     { size: 'Large',  food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // Otididae — bustards, korhaans

  // ── Gamebirds ─────────────────────────────────────────────────────────────
  574:    { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Phasianidae — francolins, spurfowl, quails
  1426:   { size: 'Large',  food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // Numididae — guineafowl
  20523:  { size: 'Large',  food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // Struthionidae — ostrich
  20863:  { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Turnicidae — buttonquails

  // ── Pigeons & doves ───────────────────────────────────────────────────────
  2715:   { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Urban/Garden'      }, // Columbidae — doves, pigeons

  // ── Parrots ───────────────────────────────────────────────────────────────
  18875:  { size: 'Medium', food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Psittacidae — parrots, lovebirds
  18874:  { size: 'Medium', food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Psittacidae (alt ID)

  // ── Cuckoos ───────────────────────────────────────────────────────────────
  1627:   { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Cuculidae — cuckoos, coucals

  // ── Turacos ───────────────────────────────────────────────────────────────
  7194:   { size: 'Medium', food: 'Fruit',        feet: 'Perching', habitat: 'Forest/Woodland'   }, // Musophagidae — turacos, go-away-birds

  // ── Nightjars, swifts & allies ────────────────────────────────────────────
  19376:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Caprimulgidae — nightjars
  6544:   { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Urban/Garden'      }, // Apodidae — swifts

  // ── Mousebirds ────────────────────────────────────────────────────────────
  3687:   { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Coliidae — mousebirds

  // ── Trogons ───────────────────────────────────────────────────────────────
  20716:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Trogonidae — Narina trogon

  // ── Kingfishers & allies ──────────────────────────────────────────────────
  2314:   { size: 'Small',  food: 'Fish',         feet: 'Perching', habitat: 'Wetland/Water'     }, // Alcedinidae — all kingfishers (iNat merges Cerylidae/Halcyonidae here)
  2183:   { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Meropidae — bee-eaters
  2262:   { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Coraciidae — rollers
  20967:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Upupidae — hoopoe
  20932:  { size: 'Small',  food: 'Insects',      feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Phoeniculidae — wood-hoopoes, scimitarbills

  // ── Hornbills ─────────────────────────────────────────────────────────────
  5438:   { size: 'Medium', food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // Bucerotidae — hornbills incl. ground hornbill

  // ── Woodpeckers & barbets ─────────────────────────────────────────────────
  17599:  { size: 'Small',  food: 'Insects',      feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Picidae — woodpeckers
  200961: { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Lybiidae — African barbets
  200963: { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // Capitonidae — barbets (older classification)
  17551:  { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Indicatoridae — honeyguides

  // ── Sandgrouse ────────────────────────────────────────────────────────────
  200960: { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Pteroclidae — sandgrouse

  // ── Larks ─────────────────────────────────────────────────────────────────
  7284:   { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Alaudidae — larks

  // ── Swallows & martins ────────────────────────────────────────────────────
  11853:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Urban/Garden'      }, // Hirundinidae — swallows, martins

  // ── Wagtails, pipits & longclaws ─────────────────────────────────────────
  71339:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Motacillidae — wagtails, pipits, longclaws

  // ── Crows & allies ────────────────────────────────────────────────────────
  7823:   { size: 'Medium', food: 'Omnivore',     feet: 'Perching', habitat: 'Urban/Garden'      }, // Corvidae — pied crow, white-necked raven
  71343:  { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Oriolidae — orioles
  71318:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Dicruridae — fork-tailed drongo
  71338:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Monarchidae — paradise flycatcher, crested flycatcher

  // ── Tits ──────────────────────────────────────────────────────────────────
  13547:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Paridae — tits
  71362:  { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // Remizidae — Cape penduline-tit

  // ── Old World warblers ────────────────────────────────────────────────────
  7649:   { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Cisticolidae — cisticolas, prinias, apalises, camaroptera
  15050:  { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Sylviidae — garden warbler, whitethroat
  144307: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Macrosphenidae — crombecs, longbills
  200983: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // Acrocephalidae — reed warblers
  200984: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Locustellidae — grassbird, broad-tailed warbler
  200982: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Phylloscopidae — willow/wood warblers
  144308: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // Cettiidae — Cetti's warbler

  // ── Bulbuls ───────────────────────────────────────────────────────────────
  14556:  { size: 'Small',  food: 'Fruit',        feet: 'Perching', habitat: 'Urban/Garden'      }, // Pycnonotidae — bulbuls, greenbuls

  // ── Flycatchers, robins & chats ───────────────────────────────────────────
  12704:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Muscicapidae — flycatchers, robins, chats
  15977:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Turdidae — thrushes
  68490:  { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Platysteiridae — batises, wattle-eyes
  144306: { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Stenostiridae — fairy flycatchers

  // ── Babblers ──────────────────────────────────────────────────────────────
  71371:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Timaliidae — arrow-marked babbler
  980192: { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Leiothrichidae — pied babbler, etc.

  // ── Shrikes & allies ──────────────────────────────────────────────────────
  12015:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Laniidae — fiscal, red-backed, lesser grey shrike
  71333:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Malaconotidae — boubous, bushshrikes, tchagra, puffback
  71303:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Campephagidae — cuckoo-shrikes
  71374:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Vangidae — helmetshrike
  71296:  { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Artamidae — woodswallows

  // ── Sunbirds & white-eyes ─────────────────────────────────────────────────
  17438:  { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // Zosteropidae — white-eyes
  13273:  { size: 'Tiny',   food: 'Nectar',       feet: 'Perching', habitat: 'Forest/Woodland'   }, // Nectariniidae — sunbirds
  71357:  { size: 'Small',  food: 'Nectar',       feet: 'Perching', habitat: 'Grassland/Savanna' }, // Promeropidae — sugarbirds (fynbos)

  // ── Starlings & oxpeckers ─────────────────────────────────────────────────
  14841:  { size: 'Small',  food: 'Omnivore',     feet: 'Perching', habitat: 'Urban/Garden'      }, // Sturnidae — Cape/glossy starlings, mynas
  200987: { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // Buphagidae — oxpeckers

  // ── Sparrows, weavers & finches ───────────────────────────────────────────
  71354:  { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Ploceidae — weavers, widowbirds, bishops, sparrow-weavers
  71322:  { size: 'Tiny',   food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Estrildidae — waxbills, firefinches, cordonbleus, mannikins
  68491:  { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Viduidae — indigobirds, whydahs
  9079:   { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Forest/Woodland'   }, // Fringillidae — canaries, siskins, buntings
  13685:  { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Urban/Garden'      }, // Passeridae — house sparrow, Cape sparrow
  559249: { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Emberizidae — buntings

  // ── Rock-jumpers ──────────────────────────────────────────────────────────
  200977: { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Rocky/Cliff'       }, // Chaetopidae — Drakensberg & Cape rock-jumper

  // ── Rare / vagrant families ───────────────────────────────────────────────
  71295:  { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // Alcidae — auks
  71325:  { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Coastal/Marine'    }, // Haematopodidae — oystercatchers (dup key resolved above)
  11989:  { size: 'Small',  food: 'Omnivore',     feet: 'Perching', habitat: 'Urban/Garden'      }, // Icteridae — blackbirds/cowbirds
}

// Species-level overrides keyed by iNaturalist taxon ID.
// Used for birds whose family-level traits are inaccurate for that specific species
// (e.g. woodland kingfishers, grassland chats, wagtails, forest greenbuls).
const SPECIES_OVERRIDES = {
  2328: { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Gray-headed Kingfisher
  2334: { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Woodland Kingfisher
  2337: { size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Striped Kingfisher
  2346: { size:'Small', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   }, // Brown-hooded Kingfisher
  2351: { size:'Small', food:'Fish',    feet:'Perching', habitat:'Coastal/Marine'    }, // Mangrove Kingfisher
  3012: { size:'Medium',food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Rameron Pigeon
  3326: { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' }, // Tambourine Dove
  3327: { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' }, // Blue-spotted Wood-Dove
  3328: { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Forest/Woodland' }, // Emerald-spotted Wood-Dove
  3405: { size:'Medium',food:'Fruit',   feet:'Climbing', habitat:'Forest/Woodland'   }, // African Green-Pigeon
  9221: { size:'Small', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Lark-like Bunting
  9271: { size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Cape Bunting (Rocky/Cliff subspecies vary)
  12803:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Sickle-winged Chat
  12822:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Marico Flycatcher
  12839:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Pale Flycatcher
  12873:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Chat Flycatcher
  12908:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // African Stonechat
  13139:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Familiar Chat
  13145:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Karoo Chat
  13147:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Mountain Chat
  13148:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Mocking Cliff-Chat
  13237:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Capped Wheatear
  13262:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Cape Rock-Thrush
  13268:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Sentinel Rock-Thrush
  13687:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // Cape Wagtail
  13688:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // African Pied Wagtail
  13695:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // Mountain Wagtail
  13699:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // Grey Wagtail
  13701:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // White Wagtail
  13704:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // Citrine Wagtail
  14563:{ size:'Small', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   }, // Terrestrial Brownbul
  14570:{ size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Sombre Greenbul
  14688:{ size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Yellow-bellied Greenbul
  14708:{ size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Stripe-cheeked Greenbul
  14932:{ size:'Small', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Yellow-streaked Greenbul
  14969:{ size:'Small', food:'Omnivore',feet:'Perching', habitat:'Rocky/Cliff'       }, // Pale-winged Starling
  15030:{ size:'Small', food:'Omnivore', feet:'Perching', habitat:'Forest/Woodland'   }, // Violet-backed Starling
  15032:{ size:'Small', food:'Omnivore', feet:'Perching', habitat:'Grassland/Savanna' }, // Wattled Starling
  55371:{ size:'Tiny',  food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Whinchat
  72477:{ size:'Tiny',  food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Yellow Canary
  144298:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Buff-streaked Chat
  144655:{ size:'Tiny', food:'Insects', feet:'Perching', habitat:'Forest/Woodland'   }, // Tiny Greenbul
  144889:{ size:'Small',food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Black-bellied Starling
  145028:{ size:'Tiny', food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Kalahari Scrub-Robin
  145075:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Karoo Scrub-Robin
  204506:{ size:'Small',food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'     }, // Cape Siskin
  204545:{ size:'Tiny', food:'Insects', feet:'Perching', habitat:'Wetland/Water'     }, // Western Yellow Wagtail
  522887:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Southern Anteater-Chat
  522889:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Tractrac Chat
  527434:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Black-throated Canary
  527609:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // White-throated Canary
  558601:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Yellow-fronted Canary
  558609:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Streaky-headed Seedeater
  558612:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Brimstone Canary
  558618:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Black-headed Canary
  558631:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'     }, // Drakensberg Siskin
  558632:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Rocky/Cliff'     }, // Cape Siskin (alt ID)
  603751:{ size:'Tiny', food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Lemon Dove
  979671:{ size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Lemon-breasted Seedeater
  979832:{ size:'Small',food:'Fruit',   feet:'Perching', habitat:'Forest/Woodland'   }, // Sharp-tailed Starling
  979944:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Short-toed Rock-Thrush
  980202:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Miombo Rock-Thrush
  980204:{ size:'Tiny', food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Angola Cave-Chat
  980207:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Arnot's Chat
  980209:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Grassland/Savanna' }, // Herero Chat
  980210:{ size:'Small',food:'Insects', feet:'Perching', habitat:'Rocky/Cliff'       }, // Sickle-winged Chat (alt)
  1423667:{ size:'Medium',food:'Insects',feet:'Perching',habitat:'Grassland/Savanna' }, // Groundscraper Thrush
  1423879:{ size:'Small',food:'Fruit',  feet:'Perching', habitat:'Forest/Woodland'   }, // Orange Ground-Thrush
  1585977:{ size:'Tiny', food:'Insects',feet:'Perching', habitat:'Grassland/Savanna' }, // African Pygmy Kingfisher (forest edges)
  // Additional
  13246:  { size:'Small',food:'Insects',feet:'Perching', habitat:'Rocky/Cliff'       }, // Boulder Chat (Turdidae)
  14564:  { size:'Small',food:'Insects',feet:'Perching', habitat:'Forest/Woodland'   }, // Yellow-streaked Greenbul (alt)
  72468:  { size:'Tiny', food:'Seeds/Grain',feet:'Perching',habitat:'Grassland/Savanna'}, // Cape Canary
  13706:  { size:'Tiny', food:'Insects',feet:'Perching', habitat:'Wetland/Water'     }, // Yellow Wagtail ssp
}

// Returns { size, food, feet, habitat } or null
export function getTraits(taxon) {
  if (!taxon) return null
  // 1. Species-level override — most accurate
  if (taxon.id && SPECIES_OVERRIDES[taxon.id]) return SPECIES_OVERRIDES[taxon.id]
  // 2. Family-level from ancestor_ids
  if (!taxon.ancestor_ids) return null
  for (const id of taxon.ancestor_ids) {
    const t = FAMILY_ID_TRAITS[id]
    if (t) return t
  }
  return null
}
