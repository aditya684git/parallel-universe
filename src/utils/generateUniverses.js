// Core universe generation logic for the Parallel Universe Simulator.

const GREEK = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota']

// Tree shape: 1 prime root branching into a depth-3 fractal of 9 total universes.
const TREE_PLAN = [
  { depth: 0, parent: null },
  { depth: 1, parent: 0 },
  { depth: 1, parent: 0 },
  { depth: 1, parent: 0 },
  { depth: 2, parent: 1 },
  { depth: 2, parent: 1 },
  { depth: 2, parent: 2 },
  { depth: 2, parent: 3 },
  { depth: 3, parent: 4 },
]

const BASE_ENTROPY_BY_DEPTH = [8, 32, 55, 78]

// How strongly each possible choice answer pushes entropy up (+) or down (-).
const CHOICE_WEIGHT = {
  logic: -8,
  emotion: 8,
  stability: -8,
  exploration: 8,
  intuition: 8,
  data: -8,
}

const THEMES = {
  prime: { name: 'Azure Calm', primary: '#38bdf8', secondary: '#0ea5e9', glow: 'rgba(56,189,248,0.85)' },
  divergent: { name: 'Violet Drift', primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168,85,247,0.85)' },
  chaotic: { name: 'Crimson Storm', primary: '#f87171', secondary: '#dc2626', glow: 'rgba(248,113,113,0.9)' },
  rift: { name: 'Fractured Gold', primary: '#facc15', secondary: '#ea580c', glow: 'rgba(250,204,21,0.95)' },
}

const RIFT_NAMES = ['Rift-Null', 'Rift-Umbra', 'Rift-Static', 'Rift-Echo', 'Rift-Fracture', 'Rift-Void']
export const MAX_UNIVERSES = 24

const CALM_EVENTS = [
  'A quiet decision reaffirms the timeline',
  'Old plans hold steady under gentle skies',
  'A familiar face keeps the path aligned',
  'Routine continues, undisturbed by change',
  'A small choice ripples outward, calmly',
  'The council convenes without incident',
  'Progress is slow but wonderfully certain',
]

const SHIFT_EVENTS = [
  'A sudden fork splits the timeline in two',
  'An unexpected ally reshapes the plan',
  'A forgotten choice resurfaces with consequence',
  'The skyline shifts as new alliances form',
  'A signal arrives from a nearby branch',
  'Old certainties begin to blur and bend',
  'A pivotal vote tips the future sideways',
]

const WILD_EVENTS = [
  'Reality fractures as causality loops back',
  'A city vanishes and reappears inverted',
  'Time folds; yesterday and tomorrow collide',
  'An anomaly rewrites the laws of gravity',
  'Screams of static replace the morning sky',
  'Two versions of the same person meet',
  'The timeline screams and splits into shards',
]

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function buildTimeline(rng, entropy, choices) {
  const pools = entropy < 35 ? [CALM_EVENTS, CALM_EVENTS, SHIFT_EVENTS] : entropy < 65 ? [CALM_EVENTS, SHIFT_EVENTS, SHIFT_EVENTS] : [SHIFT_EVENTS, WILD_EVENTS, WILD_EVENTS]

  return Array.from({ length: 5 }, (_, i) => {
    // Later events lean toward the wilder pool as divergence compounds.
    const poolIndex = clamp(Math.floor((i / 4) * (pools.length - 1)), 0, pools.length - 1)
    const pool = pools[poolIndex]
    return {
      id: i,
      year: `T+${i * 7 + Math.floor(rng() * 5)}y`,
      title: `Event ${i + 1}`,
      description: pick(rng, pool),
    }
  })
}

function choiceInfluence(choices) {
  return choices.reduce((sum, choice) => sum + (CHOICE_WEIGHT[choice] ?? 0), 0)
}

/**
 * Generates the Prime Universe plus 8 branching universes (depth-3 fractal)
 * from 3 user choices.
 */
export function generateUniverses(choices = []) {
  const seed = choices.join('-').split('').reduce((acc, c) => acc + c.charCodeAt(0), 1) + Date.now() % 1000
  const rng = mulberry32(seed)
  const influence = choiceInfluence(choices)

  const universes = TREE_PLAN.map((plan, index) => {
    const branchVariance = (index % 3) * 4 - 4
    const depthFactor = plan.depth / 3
    const randomness = (rng() - 0.5) * 16
    const entropy = clamp(
      BASE_ENTROPY_BY_DEPTH[plan.depth] + influence * (0.4 + depthFactor) + branchVariance + randomness,
      2,
      98,
    )
    const stability = clamp(100 - entropy * 0.75 - plan.depth * 3 + (rng() - 0.5) * 10, 2, 98)
    const divergenceLevel = plan.depth
    const type = plan.depth === 0 ? 'prime' : entropy >= 60 ? 'chaotic' : 'divergent'
    const theme = { ...THEMES[type], glowIntensity: clamp(entropy / 100, 0.15, 1) }
    const name = plan.depth === 0 ? 'Prime Universe' : `${GREEK[index % GREEK.length]}-${index} Universe`

    return {
      id: `u${index}`,
      index,
      parentId: plan.parent === null ? null : `u${plan.parent}`,
      depth: plan.depth,
      type,
      name,
      description:
        type === 'prime'
          ? 'The baseline timeline all others diverge from. Stable, calm, and low entropy.'
          : type === 'chaotic'
            ? 'A high-entropy branch where causality frays and anomalies bloom.'
            : 'A branching timeline exploring an alternate path, moderately diverged from Prime.',
      entropy: Math.round(entropy),
      stability: Math.round(stability),
      divergenceLevel,
      theme,
      timeline: buildTimeline(rng, entropy, choices),
      anomaly: false,
    }
  })

  return universes
}

/**
 * Time Rift: tears open brand-new "Rift-born" universes attached to random
 * existing ones. Permanent additions to the multiverse, capped at MAX_UNIVERSES.
 */
export function createRiftUniverses(existingUniverses, count = 2) {
  const rng = mulberry32(Date.now() % 2147483647)
  const room = Math.max(0, MAX_UNIVERSES - existingUniverses.length)
  const spawnCount = Math.min(count, room)
  const namePool = [...RIFT_NAMES].sort(() => rng() - 0.5)

  return Array.from({ length: spawnCount }, (_, i) => {
    const parent = pick(rng, existingUniverses)
    const entropy = clamp(84 + rng() * 16, 0, 100)
    const stability = clamp(4 + rng() * 18, 0, 100)
    const depth = clamp((parent?.depth ?? 0) + 1, 0, 3)
    const theme = { ...THEMES.rift, glowIntensity: 1 }
    const timeline = buildTimeline(rng, 95, [])
    timeline[0] = { ...timeline[0], year: 'T+0y', description: 'Torn open where causality gave way' }

    return {
      id: `rift-${Date.now()}-${i}-${Math.floor(rng() * 1000)}`,
      index: existingUniverses.length + i,
      parentId: parent?.id ?? null,
      depth,
      type: 'chaotic',
      name: `${namePool[i % namePool.length]} Universe`,
      description: 'Torn open by a Time Rift — unstable, anomalous, and barely tethered to causality.',
      entropy: Math.round(entropy),
      stability: Math.round(stability),
      divergenceLevel: 3,
      theme,
      timeline,
      anomaly: true,
      riftBorn: true,
    }
  })
}

/**
 * Time Rift: permanently nudges an existing universe's entropy/stability and
 * rewrites its final timeline event to reflect the disturbance.
 */
export function applyRiftMutation(universe) {
  const rng = mulberry32((Date.now() + universe.index * 97) % 2147483647)
  const swing = 14 + rng() * 22
  const entropy = clamp(universe.entropy + swing, 2, 99)
  const stability = clamp(universe.stability - swing * 0.7, 2, 99)
  const timeline = [...universe.timeline]
  const lastIndex = timeline.length - 1
  timeline[lastIndex] = { ...timeline[lastIndex], description: pick(rng, WILD_EVENTS) }

  return {
    ...universe,
    entropy: Math.round(entropy),
    stability: Math.round(stability),
    timeline,
  }
}
