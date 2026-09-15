import { motion, AnimatePresence } from 'framer-motion'

const LAYERS = [
  { type: 'prime', label: 'Prime Layer', hint: 'Baseline timeline' },
  { type: 'divergent', label: 'Divergent Layer', hint: 'Branching paths' },
  { type: 'chaotic', label: 'Chaotic Layer', hint: 'High entropy anomalies' },
]

/**
 * Three stacked layers (Prime / Divergent / Chaotic) showing which universes
 * live in each. Clicking a universe chip highlights it in the causal graph.
 */
export default function MultiverseLayers({ universes, selectedId, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      {LAYERS.map((layer, layerIndex) => {
        const items = universes.filter((u) => u.type === layer.type)
        if (items.length === 0) return null
        return (
          <motion.div
            key={layer.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: layerIndex * 0.15, duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-100">{layer.label}</h3>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">{layer.hint}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {items.map((u) => (
                  <motion.button
                    key={u.id}
                    type="button"
                    onClick={() => onSelect(u.id)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="rounded-full border px-3 py-1 text-xs font-medium transition-shadow"
                    style={{
                      borderColor: u.id === selectedId ? u.theme.primary : 'rgba(255,255,255,0.15)',
                      color: u.theme.primary,
                      boxShadow: u.id === selectedId ? `0 0 14px ${u.theme.glow}` : 'none',
                      background: u.id === selectedId ? `${u.theme.primary}1a` : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {u.name}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
