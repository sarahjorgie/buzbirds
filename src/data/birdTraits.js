/**
 * Trait derivation for flashcard display (birdGroups ancestor_ids approach).
 * For BuzBirdle, use fetchPoolTraits() which hits /v1/taxa to get the real
 * iNaturalist family name, then looks up in familyTraits.js for accuracy.
 */
import { BIRD_GROUPS } from './birdGroups'
import FAMILY_TRAITS from './familyTraits'

// ── Birdle: fetch accurate family-based traits for a pool of species ──────────
const _familyCache = new Map() // taxonId → trait object

export async function fetchPoolTraits(birdPool) {
  if (!birdPool?.length) return {}

  // Only fetch IDs we don't have yet
  const needed = birdPool.map(s => s.taxon?.id).filter(id => id && !_familyCache.has(id))

  // Batch in chunks of 30 (iNat API limit per request)
  for (let i = 0; i < needed.length; i += 30) {
    const chunk = needed.slice(i, i + 30)
    try {
      const res  = await fetch(`https://api.inaturalist.org/v1/taxa?id=${chunk.join(',')}`)
      if (!res.ok) continue
      const data = await res.json()
      for (const taxon of data.results || []) {
        const family = taxon.ancestors?.find(a => a.rank === 'family')?.name
        const traits = family ? FAMILY_TRAITS[family] : null
        _familyCache.set(taxon.id, traits ? { ...traits, family } : null)
      }
    } catch {}
  }

  // Build result map — include all pool birds (null if lookup failed)
  return Object.fromEntries(
    birdPool.map(s => [s.taxon?.id, _familyCache.get(s.taxon?.id) ?? null])
  )
}

// Traits keyed by birdGroups id
const TRAITS_BY_GROUP = {
  penguins:    { size: 'Medium', food: 'Fish',     feet: 'Webbed',   habitat: 'Coastal'   },
  seabirds:    { size: 'Large',  food: 'Fish',     feet: 'Webbed',   habitat: 'Coastal'   },
  grebes:      { size: 'Small',  food: 'Fish',     feet: 'Webbed',   habitat: 'Wetland'   },
  flamingos:   { size: 'Large',  food: 'Omnivore', feet: 'Wading',   habitat: 'Wetland'   },
  pelicans:    { size: 'Large',  food: 'Fish',     feet: 'Webbed',   habitat: 'Wetland'   },
  cormorants:  { size: 'Medium', food: 'Fish',     feet: 'Webbed',   habitat: 'Wetland'   },
  herons:      { size: 'Large',  food: 'Fish',     feet: 'Wading',   habitat: 'Wetland'   },
  storks:      { size: 'Large',  food: 'Omnivore', feet: 'Wading',   habitat: 'Grassland' },
  ibises:      { size: 'Medium', food: 'Omnivore', feet: 'Wading',   habitat: 'Wetland'   },
  ducks:       { size: 'Medium', food: 'Omnivore', feet: 'Webbed',   habitat: 'Wetland'   },
  waders:      { size: 'Small',  food: 'Insects',  feet: 'Wading',   habitat: 'Wetland'   },
  gulls:       { size: 'Medium', food: 'Fish',     feet: 'Webbed',   habitat: 'Coastal'   },
  rails:       { size: 'Small',  food: 'Omnivore', feet: 'Wading',   habitat: 'Wetland'   },
  cranes:      { size: 'Large',  food: 'Omnivore', feet: 'Wading',   habitat: 'Grassland' },
  raptors:     { size: 'Large',  food: 'Meat',     feet: 'Talons',   habitat: 'Savanna'   },
  falcons:     { size: 'Small',  food: 'Meat',     feet: 'Talons',   habitat: 'Grassland' },
  owls:        { size: 'Medium', food: 'Meat',     feet: 'Talons',   habitat: 'Woodland'  },
  gamebirds:   { size: 'Medium', food: 'Seeds',    feet: 'Perching', habitat: 'Grassland' },
  bustards:    { size: 'Large',  food: 'Omnivore', feet: 'Perching', habitat: 'Grassland' },
  sandgrouse:  { size: 'Small',  food: 'Seeds',    feet: 'Perching', habitat: 'Grassland' },
  pigeons:     { size: 'Small',  food: 'Seeds',    feet: 'Perching', habitat: 'Urban'     },
  parrots:     { size: 'Small',  food: 'Seeds',    feet: 'Climbing', habitat: 'Forest'    },
  cuckoos:     { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Woodland'  },
  nightjars:   { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Grassland' },
  swifts:      { size: 'Tiny',   food: 'Insects',  feet: 'Perching', habitat: 'Urban'     },
  mousebirds:  { size: 'Tiny',   food: 'Fruit',    feet: 'Climbing', habitat: 'Woodland'  },
  trogons:     { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Forest'    },
  kingfishers: { size: 'Small',  food: 'Fish',     feet: 'Perching', habitat: 'Wetland'   },
  'bee-eaters':{ size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Savanna'   },
  rollers:     { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Savanna'   },
  hoopoes:     { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Woodland'  },
  hornbills:   { size: 'Medium', food: 'Omnivore', feet: 'Perching', habitat: 'Savanna'   },
  woodpeckers: { size: 'Small',  food: 'Insects',  feet: 'Climbing', habitat: 'Woodland'  },
  barbets:     { size: 'Tiny',   food: 'Fruit',    feet: 'Climbing', habitat: 'Woodland'  },
  honeyguides: { size: 'Tiny',   food: 'Insects',  feet: 'Perching', habitat: 'Woodland'  },
  larks:       { size: 'Tiny',   food: 'Seeds',    feet: 'Perching', habitat: 'Grassland' },
  swallows:    { size: 'Tiny',   food: 'Insects',  feet: 'Perching', habitat: 'Urban'     },
  wagtails:    { size: 'Tiny',   food: 'Insects',  feet: 'Perching', habitat: 'Wetland'   },
  bulbuls:     { size: 'Small',  food: 'Fruit',    feet: 'Perching', habitat: 'Woodland'  },
  robins:      { size: 'Tiny',   food: 'Insects',  feet: 'Perching', habitat: 'Woodland'  },
  shrikes:     { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Savanna'   },
  sunbirds:    { size: 'Tiny',   food: 'Nectar',   feet: 'Perching', habitat: 'Garden'    },
  weavers:     { size: 'Small',  food: 'Seeds',    feet: 'Perching', habitat: 'Grassland' },
  waxbills:    { size: 'Tiny',   food: 'Seeds',    feet: 'Perching', habitat: 'Grassland' },
  starlings:   { size: 'Small',  food: 'Omnivore', feet: 'Perching', habitat: 'Urban'     },
  passerines:  { size: 'Small',  food: 'Insects',  feet: 'Perching', habitat: 'Woodland'  },
}

// Find which birdGroups entry a taxon belongs to (most specific match first)
export function getBirdGroupEntry(taxon) {
  if (!taxon?.ancestor_ids) return null
  const ids = new Set(taxon.ancestor_ids)
  for (const group of BIRD_GROUPS) {
    if (group.id !== 'all' && ids.has(group.taxonId)) return group
  }
  return null
}

// Returns { size, food, feet, habitat, group, groupId } or null
export function getTraits(taxon) {
  const group = getBirdGroupEntry(taxon)
  if (!group) return null
  const t = TRAITS_BY_GROUP[group.id]
  if (!t) return null
  return { ...t, group: group.name, groupId: group.id }
}
