import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { motion, AnimatePresence } from 'framer-motion'
import { buildGraph } from '../utils/buildGraph'

/**
 * Force-directed causal graph of universes. Nodes glow according to entropy,
 * edges animate with directional particles, and Time Rift mode scrambles
 * node positions + inverts colors for a few seconds.
 */
export default function UniverseGraph({ universes, selectedId, onSelect, shock, anomalyIds }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)
  const [size, setSize] = useState({ width: 600, height: 500 })
  const [hoverNode, setHoverNode] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [shockKey, setShockKey] = useState(0)

  const graphData = useMemo(() => buildGraph(universes, anomalyIds), [universes, anomalyIds])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Fly the camera to the selected universe.
  useEffect(() => {
    if (!fgRef.current || !selectedId) return
    const node = graphData.nodes.find((n) => n.id === selectedId)
    if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    fgRef.current.centerAt(node.x, node.y, 700)
    fgRef.current.zoom(3.2, 700)
  }, [selectedId, graphData.nodes])

  // Scramble node positions when Time Rift triggers, then let them re-settle.
  useEffect(() => {
    if (!shock || !fgRef.current) return
    setShockKey((k) => k + 1)
    graphData.nodes.forEach((node) => {
      node.fx = node.x + (Math.random() - 0.5) * 260
      node.fy = node.y + (Math.random() - 0.5) * 260
    })
    fgRef.current.d3ReheatSimulation()
    const release = setTimeout(() => {
      graphData.nodes.forEach((node) => {
        node.fx = undefined
        node.fy = undefined
      })
      fgRef.current?.d3ReheatSimulation()
    }, 900)
    return () => clearTimeout(release)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shock])

  const paintNode = (node, ctx, globalScale) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    const radius = 4 + node.val / 3
    const isSelected = node.id === selectedId
    const isHovered = node.id === hoverNode?.id

    // Outer glow, breathing gently so the graph feels alive
    const pulse = 0.85 + Math.sin(Date.now() / 480 + node.index) * 0.15
    const glowRadius = radius * (isSelected || isHovered ? 3.2 : 2.4) * (0.6 + node.glowIntensity) * pulse
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius)
    gradient.addColorStop(0, node.glow)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Core node
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = node.color
    ctx.fill()
    if (isSelected) {
      ctx.lineWidth = 2 / globalScale
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
    }

    // Anomaly ring
    if (node.anomaly) {
      ctx.beginPath()
      ctx.setLineDash([3, 2])
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI)
      ctx.strokeStyle = '#facc15'
      ctx.lineWidth = 1.5 / globalScale
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Label
    const fontSize = Math.max(10 / globalScale, 2.2)
    ctx.font = `${fontSize}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(226,232,240,0.9)'
    ctx.fillText(node.name, node.x, node.y + radius + 3)
  }

  const paintPointerArea = (node, color, ctx) => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    const radius = 4 + node.val / 3
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI)
    ctx.fill()
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={(e) => {
        const rect = containerRef.current.getBoundingClientRect()
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-black/20"
      animate={
        shock
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0], filter: ['invert(0) hue-rotate(0deg)', 'invert(1) hue-rotate(180deg)'] }
          : { x: 0, filter: 'invert(0) hue-rotate(0deg)' }
      }
      transition={shock ? { duration: 0.9, repeat: 2 } : { duration: 0.6 }}
    >
      <ForceGraph2D
        ref={fgRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={4}
        linkColor={() => 'rgba(168,85,247,0.45)'}
        linkWidth={1.2}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#e879f9'}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintPointerArea}
        onNodeClick={(node) => onSelect?.(node.id)}
        onNodeHover={(node) => setHoverNode(node)}
        cooldownTicks={100}
      />

      <AnimatePresence>
        {shock && (
          <motion.div
            key={shockKey}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <motion.span
              className="absolute rounded-full border-2 border-yellow-300/80"
              initial={{ width: 10, height: 10, opacity: 1 }}
              animate={{ width: 900, height: 900, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hoverNode && (
        <div
          className="pointer-events-none absolute z-10 max-w-[180px] rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-xs text-slate-100 shadow-xl"
          style={{ left: mouse.x + 14, top: mouse.y + 14 }}
        >
          <p className="font-semibold" style={{ color: hoverNode.color }}>
            {hoverNode.name}
          </p>
          <p className="mt-1 text-slate-300">Entropy {hoverNode.entropy} · Stability {hoverNode.stability}</p>
        </div>
      )}
    </motion.div>
  )
}
