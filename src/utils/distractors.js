import { BIRD_GROUPS } from '../data/birdGroups'

// Find which bird group a taxon belongs to by checking ancestor_ids
function getBirdGroupId(taxon) {
  if (!taxon?.ancestor_ids) return null
  const ids = new Set(taxon.ancestor_ids)
  for (const group of BIRD_GROUPS) {
    if (group.id !== 'all' && ids.has(group.taxonId)) return group.id
  }
  return null
}

/**
 * Pick `count` distractors for `correct` from `pool`.
 * Prefers birds from the same family/group to make the quiz harder.
 * Falls back to other birds if not enough same-group candidates.
 * `shuffleFn` is injected so callers can use seeded or random shuffle.
 */
export function pickDistractors(correct, pool, count = 3, shuffleFn) {
  const correctGroupId = getBirdGroupId(correct.taxon)
  const candidates = pool.filter(
    s => s.taxon?.id !== correct.taxon?.id && s.taxon?.default_photo
  )

  const sameGroup = shuffleFn(
    correctGroupId
      ? candidates.filter(s => getBirdGroupId(s.taxon) === correctGroupId)
      : []
  )

  // Fill remaining slots with birds outside the group
  const otherGroup = shuffleFn(
    candidates.filter(s => getBirdGroupId(s.taxon) !== correctGroupId)
  )

  return [...sameGroup, ...otherGroup].slice(0, count)
}
