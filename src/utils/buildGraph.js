// Converts a flat list of universes into force-graph nodes/links.

export function buildGraph(universes, anomalyIds = []) {
  const anomalySet = new Set(anomalyIds)

  const nodes = universes.map((u) => ({
    id: u.id,
    name: u.name,
    type: u.type,
    entropy: u.entropy,
    stability: u.stability,
    depth: u.depth,
    color: u.theme.primary,
    glow: u.theme.glow,
    glowIntensity: u.theme.glowIntensity,
    anomaly: anomalySet.has(u.id),
    val: 10 + (3 - u.depth) * 3,
  }))

  const links = universes
    .filter((u) => u.parentId !== null)
    .map((u) => ({ source: u.parentId, target: u.id }))

  return { nodes, links }
}
