import { motion } from 'framer-motion'

function MiniStatBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function UniverseColumn({ universe }) {
  const { theme } = universe
  return (
    <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: theme.primary }}>
        {universe.type} universe
      </p>
      <h3 className="mt-1 text-lg font-bold text-white">{universe.name}</h3>
      <p className="mt-1 text-xs text-slate-400">{universe.description}</p>

      <div className="mt-4 space-y-3">
        <MiniStatBar label="Entropy" value={universe.entropy} color={theme.primary} />
        <MiniStatBar label="Stability" value={universe.stability} color={theme.secondary} />
      </div>

      <p className="mt-3 text-[11px] text-slate-500">Divergence level {universe.divergenceLevel}</p>

      <ul className="mt-3 space-y-1.5">
        {universe.timeline.map((event) => (
          <li key={event.id} className="rounded-md border border-white/5 bg-white/5 px-2 py-1.5 text-[11px] text-slate-300">
            <span className="mr-1.5 font-mono text-[10px] text-slate-500">{event.year}</span>
            {event.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Side-by-side comparison of two universes: stats, and a per-event timeline
 * diff highlighting where their histories agree or diverge.
 */
export default function CompareUniverses({ universeA, universeB, onClose }) {
  if (!universeA || !universeB) return null

  const similarity = Math.round(
    100 - (Math.abs(universeA.entropy - universeB.entropy) + Math.abs(universeA.stability - universeB.stability)) / 2,
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Causal Comparison</h2>
            <p className="text-xs text-slate-400">Causal similarity: {similarity}%</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <UniverseColumn universe={universeA} />
          <UniverseColumn universe={universeB} />
        </div>

        <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-100">Event-by-Event Divergence</h3>
        <div className="space-y-2">
          {universeA.timeline.map((eventA, i) => {
            const eventB = universeB.timeline[i]
            const diverges = eventA.description !== eventB?.description
            return (
              <div
                key={eventA.id}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px]"
              >
                <p className="text-slate-300">{eventA.description}</p>
                <span className={diverges ? 'text-yellow-400' : 'text-emerald-400'}>{diverges ? '⚡' : '≈'}</span>
                <p className="text-right text-slate-300">{eventB?.description}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
