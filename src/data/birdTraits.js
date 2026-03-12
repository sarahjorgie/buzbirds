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
  penguins:    { size: 'Medium', food: 'Fish',          feet: 'Webbed',   habitat: 'Coastal/Marine'    },
  seabirds:    { size: 'Large',  food: 'Fish',          feet: 'Webbed',   habitat: 'Coastal/Marine'    },
  grebes:      { size: 'Small',  food: 'Fish',          feet: 'Webbed',   habitat: 'Wetland/Water'     },
  flamingos:   { size: 'Large',  food: 'Omnivore',      feet: 'Wading',   habitat: 'Wetland/Water'     },
  pelicans:    { size: 'Large',  food: 'Fish',          feet: 'Webbed',   habitat: 'Wetland/Water'     },
  cormorants:  { size: 'Medium', food: 'Fish',          feet: 'Webbed',   habitat: 'Wetland/Water'     },
  herons:      { size: 'Large',  food: 'Fish',          feet: 'Wading',   habitat: 'Wetland/Water'     },
  storks:      { size: 'Large',  food: 'Omnivore',      feet: 'Wading',   habitat: 'Grassland/Savanna' },
  ibises:      { size: 'Medium', food: 'Omnivore',      feet: 'Wading',   habitat: 'Wetland/Water'     },
  ducks:       { size: 'Medium', food: 'Omnivore',      feet: 'Webbed',   habitat: 'Wetland/Water'     },
  waders:      { size: 'Small',  food: 'Insects',       feet: 'Wading',   habitat: 'Wetland/Water'     },
  gulls:       { size: 'Medium', food: 'Fish',          feet: 'Webbed',   habitat: 'Coastal/Marine'    },
  rails:       { size: 'Small',  food: 'Omnivore',      feet: 'Wading',   habitat: 'Wetland/Water'     },
  cranes:      { size: 'Large',  food: 'Omnivore',      feet: 'Wading',   habitat: 'Grassland/Savanna' },
  raptors:     { size: 'Large',  food: 'Meat/Carrion',  feet: 'Talons',   habitat: 'Grassland/Savanna' },
  falcons:     { size: 'Small',  food: 'Meat/Carrion',  feet: 'Talons',   habitat: 'Grassland/Savanna' },
  owls:        { size: 'Medium', food: 'Meat/Carrion',  feet: 'Talons',   habitat: 'Forest/Woodland'   },
  gamebirds:   { size: 'Medium', food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Grassland/Savanna' },
  bustards:    { size: 'Large',  food: 'Omnivore',      feet: 'Perching', habitat: 'Grassland/Savanna' },
  sandgrouse:  { size: 'Small',  food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Grassland/Savanna' },
  pigeons:     { size: 'Small',  food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Urban/Garden'      },
  parrots:     { size: 'Small',  food: 'Seeds/Grain',   feet: 'Climbing', habitat: 'Forest/Woodland'   },
  cuckoos:     { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
  nightjars:   { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Grassland/Savanna' },
  swifts:      { size: 'Tiny',   food: 'Insects',       feet: 'Perching', habitat: 'Urban/Garden'      },
  mousebirds:  { size: 'Tiny',   food: 'Fruit',         feet: 'Climbing', habitat: 'Forest/Woodland'   },
  trogons:     { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
  kingfishers: { size: 'Small',  food: 'Fish',          feet: 'Perching', habitat: 'Wetland/Water'     },
  'bee-eaters':{ size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Grassland/Savanna' },
  rollers:     { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Grassland/Savanna' },
  hoopoes:     { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
  hornbills:   { size: 'Medium', food: 'Omnivore',      feet: 'Perching', habitat: 'Grassland/Savanna' },
  woodpeckers: { size: 'Small',  food: 'Insects',       feet: 'Climbing', habitat: 'Forest/Woodland'   },
  barbets:     { size: 'Tiny',   food: 'Fruit',         feet: 'Climbing', habitat: 'Forest/Woodland'   },
  honeyguides: { size: 'Tiny',   food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
  larks:       { size: 'Tiny',   food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Grassland/Savanna' },
  swallows:    { size: 'Tiny',   food: 'Insects',       feet: 'Perching', habitat: 'Urban/Garden'      },
  wagtails:    { size: 'Tiny',   food: 'Insects',       feet: 'Perching', habitat: 'Wetland/Water'     },
  bulbuls:     { size: 'Small',  food: 'Fruit',         feet: 'Perching', habitat: 'Forest/Woodland'   },
  robins:      { size: 'Tiny',   food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
  shrikes:     { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Grassland/Savanna' },
  sunbirds:    { size: 'Tiny',   food: 'Nectar',        feet: 'Perching', habitat: 'Urban/Garden'      },
  weavers:     { size: 'Small',  food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Grassland/Savanna' },
  waxbills:    { size: 'Tiny',   food: 'Seeds/Grain',   feet: 'Perching', habitat: 'Grassland/Savanna' },
  starlings:   { size: 'Small',  food: 'Omnivore',      feet: 'Perching', habitat: 'Urban/Garden'      },
  passerines:  { size: 'Small',  food: 'Insects',       feet: 'Perching', habitat: 'Forest/Woodland'   },
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
