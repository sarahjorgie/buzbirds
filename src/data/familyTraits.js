/**
 * Trait lookup keyed by iNaturalist family name.
 * Used by BuzBirdle — fetched via /v1/taxa?id=... which returns ancestors[].rank === 'family'.
 *
 * size:    "Tiny" | "Small" | "Medium" | "Large"
 * food:    "Insects" | "Fish" | "Seeds/Grain" | "Meat/Carrion" | "Nectar" | "Fruit" | "Omnivore"
 * feet:    "Perching" | "Talons" | "Webbed" | "Wading" | "Climbing"
 * habitat: "Grassland/Savanna" | "Forest/Woodland" | "Wetland/Water" | "Coastal/Marine" | "Urban/Garden" | "Rocky/Cliff"
 */
const FAMILY_TRAITS = {
  // ── Raptors ────────────────────────────────────────────────────────────────
  Accipitridae:      { size: 'Large',  food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // eagles, hawks, kites
  Falconidae:        { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // falcons, kestrels
  Pandionidae:       { size: 'Large',  food: 'Fish',         feet: 'Talons',   habitat: 'Wetland/Water'     }, // osprey
  Sagittariidae:     { size: 'Large',  food: 'Meat/Carrion', feet: 'Wading',   habitat: 'Grassland/Savanna' }, // secretary bird
  Cathartidae:       { size: 'Large',  food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // new world vultures (vagrant)

  // ── Owls ──────────────────────────────────────────────────────────────────
  Strigidae:         { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Forest/Woodland'   }, // wood owls, eagle-owls, scops
  Tytonidae:         { size: 'Medium', food: 'Meat/Carrion', feet: 'Talons',   habitat: 'Grassland/Savanna' }, // barn owl, grass owl

  // ── Waterbirds ────────────────────────────────────────────────────────────
  Ardeidae:          { size: 'Large',  food: 'Fish',         feet: 'Wading',   habitat: 'Wetland/Water'     }, // herons, egrets, night-herons
  Ciconiidae:        { size: 'Large',  food: 'Fish',         feet: 'Wading',   habitat: 'Wetland/Water'     }, // storks
  Threskiornithidae: { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // ibises, spoonbills
  Scopidae:          { size: 'Large',  food: 'Fish',         feet: 'Wading',   habitat: 'Wetland/Water'     }, // hamerkop
  Phoenicopteridae:  { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // flamingos
  Anatidae:          { size: 'Medium', food: 'Omnivore',     feet: 'Webbed',   habitat: 'Wetland/Water'     }, // ducks, geese, swans
  Podicipedidae:     { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // grebes
  Phalacrocoracidae: { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // cormorants
  Pelecanidae:       { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // pelicans
  Anhingidae:        { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // darter/snakebird
  Sulidae:           { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // gannets, boobies
  Fregatidae:        { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // frigatebirds
  Spheniscidae:      { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // penguins
  Procellariidae:    { size: 'Large',  food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // petrels, shearwaters, albatrosses
  Laridae:           { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // gulls, terns
  Stercorariidae:    { size: 'Large',  food: 'Meat/Carrion', feet: 'Webbed',   habitat: 'Coastal/Marine'    }, // skuas
  Rhynchopidae:      { size: 'Medium', food: 'Fish',         feet: 'Webbed',   habitat: 'Wetland/Water'     }, // African skimmer

  // ── Shorebirds & waders ───────────────────────────────────────────────────
  Charadriidae:      { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // plovers, lapwings
  Scolopacidae:      { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // sandpipers, snipes, godwits
  Recurvirostridae:  { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // stilts, avocets
  Jacanidae:         { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // African jacana
  Haematopodidae:    { size: 'Medium', food: 'Insects',      feet: 'Wading',   habitat: 'Coastal/Marine'    }, // oystercatchers
  Glareolidae:       { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // pratincoles, coursers
  Rostratulidae:     { size: 'Small',  food: 'Insects',      feet: 'Wading',   habitat: 'Wetland/Water'     }, // painted-snipes

  // ── Rails & cranes ────────────────────────────────────────────────────────
  Rallidae:          { size: 'Medium', food: 'Omnivore',     feet: 'Wading',   habitat: 'Wetland/Water'     }, // rails, moorhens, coots, crakes
  Gruidae:           { size: 'Large',  food: 'Omnivore',     feet: 'Wading',   habitat: 'Grassland/Savanna' }, // cranes (blue, wattled, crowned)
  Otididae:          { size: 'Large',  food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // bustards (kori, black-bellied, korhaans)

  // ── Pigeons & doves ───────────────────────────────────────────────────────
  Columbidae:        { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Urban/Garden'      }, // doves, pigeons

  // ── Parrots ───────────────────────────────────────────────────────────────
  Psittacidae:       { size: 'Medium', food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // parrots, lovebirds

  // ── Cuckoos ───────────────────────────────────────────────────────────────
  Cuculidae:         { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // cuckoos, coucals

  // ── Nightjars & swifts ────────────────────────────────────────────────────
  Caprimulgidae:     { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // nightjars (aerial insect-hunters)
  Apodidae:          { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Urban/Garden'      }, // swifts

  // ── Mousebirds ────────────────────────────────────────────────────────────
  Coliidae:          { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // speckled, red-faced, white-backed mousebird

  // ── Kingfishers & allies ──────────────────────────────────────────────────
  Alcedinidae:       { size: 'Small',  food: 'Fish',         feet: 'Perching', habitat: 'Wetland/Water'     }, // malachite, half-collared, pygmy kingfisher
  Cerylidae:         { size: 'Medium', food: 'Fish',         feet: 'Perching', habitat: 'Wetland/Water'     }, // pied kingfisher, giant kingfisher
  Halcyonidae:       { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // woodland, brown-hooded, striped kingfisher
  Meropidae:         { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // bee-eaters (European, little, carmine, swallow-tailed)
  Coraciidae:        { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // rollers (lilac-breasted, European, racket-tailed)
  Upupidae:          { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // hoopoe
  Phoeniculidae:     { size: 'Small',  food: 'Insects',      feet: 'Climbing', habitat: 'Forest/Woodland'   }, // wood-hoopoes, scimitarbills

  // ── Hornbills ─────────────────────────────────────────────────────────────
  Bucerotidae:       { size: 'Medium', food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // red-billed, yellow-billed, crowned, grey
  Bucorvidae:        { size: 'Large',  food: 'Meat/Carrion', feet: 'Perching', habitat: 'Grassland/Savanna' }, // Southern Ground-Hornbill

  // ── Woodpeckers & barbets ─────────────────────────────────────────────────
  Picidae:           { size: 'Small',  food: 'Insects',      feet: 'Climbing', habitat: 'Forest/Woodland'   }, // woodpeckers (cardinal, knysna, bennett's)
  Lybiidae:          { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // African barbets (acacia, crested, black-collared, tinkerbirds)
  Capitonidae:       { size: 'Small',  food: 'Fruit',        feet: 'Climbing', habitat: 'Forest/Woodland'   }, // barbets (older classification, some iNat records)
  Indicatoridae:     { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // honeyguides (greater, lesser, scaly-throated)

  // ── Larks, swallows & pipits ──────────────────────────────────────────────
  Alaudidae:         { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // larks (sabota, rufous-naped, flappet, monotonous)
  Hirundinidae:      { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Urban/Garden'      }, // swallows, martins
  Motacillidae:      { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // wagtails; longclaws/pipits are grassland but family is broad

  // ── Crows & orioles ───────────────────────────────────────────────────────
  Corvidae:          { size: 'Medium', food: 'Omnivore',     feet: 'Perching', habitat: 'Urban/Garden'      }, // pied crow, white-necked raven
  Oriolidae:         { size: 'Medium', food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // black-headed, African golden oriole

  // ── Drongos, monarchs & paradise flycatchers ─────────────────────────────
  Dicruridae:        { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // fork-tailed drongo
  Monarchidae:       { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // African paradise flycatcher, African crested flycatcher

  // ── Tits & remiz ─────────────────────────────────────────────────────────
  Paridae:           { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // grey tit, southern black tit, carp's tit
  Remizidae:         { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // Cape penduline-tit

  // ── Larks & cisticolas (old world warblers) ───────────────────────────────
  Cisticolidae:      { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // cisticolas, prinias, warblers, camaroptera
  Sylviidae:         { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // garden warbler, whitethroat (Palearctic visitors)
  Macrosphenidae:    { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // crombecs, longbills
  Acrocephalidae:    { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // reed warblers, marsh warblers
  Locustellidae:     { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // grassbird, broad-tailed warbler

  // ── Bulbuls ───────────────────────────────────────────────────────────────
  Pycnonotidae:      { size: 'Small',  food: 'Fruit',        feet: 'Perching', habitat: 'Urban/Garden'      }, // dark-capped bulbul, cape bulbul, sombre greenbul

  // ── Flycatchers, robins & chats ───────────────────────────────────────────
  Muscicapidae:      { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // flycatchers, robins, chats, stonechats
  Turdidae:          { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // thrushes (olive, kurrichane, groundscraper)
  Platysteiridae:    { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // batises, wattle-eyes

  // ── Babblers ─────────────────────────────────────────────────────────────
  Timaliidae:        { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // arrow-marked babbler, hartlaub's babbler
  Leiothrichidae:    { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // southern pied babbler, etc.

  // ── Shrikes & allies ──────────────────────────────────────────────────────
  Laniidae:          { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // fiscal, red-backed, lesser grey shrike
  Malaconotidae:     { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // boubous, bushshrikes, gonoleks, tchagra, puffback
  Campephagidae:     { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // cuckoo-shrikes, minivets (black, grey)

  // ── White-eyes, sunbirds & sugarbirds ────────────────────────────────────
  Zosteropidae:      { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // cape white-eye, African yellow white-eye
  Nectariniidae:     { size: 'Tiny',   food: 'Nectar',       feet: 'Perching', habitat: 'Forest/Woodland'   }, // sunbirds (malachite, amethyst, collared, white-bellied)
  Promeropidae:      { size: 'Small',  food: 'Nectar',       feet: 'Perching', habitat: 'Grassland/Savanna' }, // Cape sugarbird, Gurney's sugarbird (fynbos/proteas)

  // ── Starlings & oxpeckers ─────────────────────────────────────────────────
  Sturnidae:         { size: 'Small',  food: 'Omnivore',     feet: 'Perching', habitat: 'Urban/Garden'      }, // Cape/common starling, glossy starlings, mynas
  Buphagidae:        { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Grassland/Savanna' }, // red-billed oxpecker, yellow-billed oxpecker

  // ── Sparrows, weavers, widowbirds ─────────────────────────────────────────
  Ploceidae:         { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // weavers (village, southern masked, cape, spectacled, grosbeak)
  Estrildidae:       { size: 'Tiny',   food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // waxbills, firefinches, mannikins, cordonbleus, melba finch
  Viduidae:          { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // indigobirds, whydahs, shaft-tailed whydah
  Fringillidae:      { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Forest/Woodland'   }, // canaries, siskins, buntings (Cape, forest, white-throated)
  Passeridae:        { size: 'Small',  food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Urban/Garden'      }, // house sparrow, Cape sparrow, great sparrow

  // ── Warblers & grassbirds (Sylvioidea) ───────────────────────────────────
  Phylloscopidae:    { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Forest/Woodland'   }, // willow/wood warblers (Palearctic migrants)
  Cettiidae:         { size: 'Tiny',   food: 'Insects',      feet: 'Perching', habitat: 'Wetland/Water'     }, // Cetti's warbler (rare vagrant)

  // ── Rock-jumpers ──────────────────────────────────────────────────────────
  Chaetopidae:       { size: 'Small',  food: 'Insects',      feet: 'Perching', habitat: 'Rocky/Cliff'       }, // Cape rock-jumper, Drakensberg rock-jumper

  // ── Turacos ───────────────────────────────────────────────────────────────
  Musophagidae:      { size: 'Medium', food: 'Fruit',        feet: 'Perching', habitat: 'Forest/Woodland'   }, // Knysna, purple-crested, Livingstone's turaco; grey go-away-bird

  // ── Sandgrouse ────────────────────────────────────────────────────────────
  Pteroclidae:       { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // Namaqua, Burchell's, double-banded sandgrouse

  // ── Guineafowl ────────────────────────────────────────────────────────────
  Numididae:         { size: 'Large',  food: 'Omnivore',     feet: 'Perching', habitat: 'Grassland/Savanna' }, // helmeted guineafowl, crested guineafowl
  Phasianidae:       { size: 'Medium', food: 'Seeds/Grain',  feet: 'Perching', habitat: 'Grassland/Savanna' }, // francolins, spurfowl, quails
}

export default FAMILY_TRAITS
