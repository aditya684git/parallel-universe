import { AnimatePresence, motion } from 'framer-motion'
import UniverseTimeline from './UniverseTimeline'

function StatBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/**
 * Slide-in panel (from the right) with full detail for the selected universe.
 */
export default function UniversePanel({ universe, onClose, onEnter }) {
  return (
    <AnimatePresence>
      {universe && (
        <motion.aside
          key={universe.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="fixed right-0 top-0 z-30 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur"
        >
          {/* Particle effect background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{ background: universe.theme.primary, left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -14, 0] }}
                transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <p
              className="mb-1 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: universe.theme.primary }}
            >
              {universe.type} universe
            </p>
            <h2 className="text-2xl font-bold text-white">{universe.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{universe.description}</p>

            <button
              type="button"
              onClick={() => onEnter?.(universe.id)}
              className="mt-4 w-full rounded-xl border px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.02]"
              style={{ borderColor: `${universe.theme.primary}55`, color: universe.theme.primary, background: `${universe.theme.primary}14` }}
            >
              Step Inside Universe →
            </button>

            <div className="mt-6 space-y-4">
              <StatBar label="Entropy" value={universe.entropy} color={universe.theme.primary} />
              <StatBar label="Stability" value={universe.stability} color={universe.theme.secondary} />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs text-slate-400">Divergence level</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((lvl) => (
                  <span
                    key={lvl}
                    className="h-2 w-5 rounded-full"
                    style={{
                      background: lvl <= universe.divergenceLevel ? universe.theme.primary : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <h3 className="mb-1 mt-6 text-sm font-semibold text-slate-100">Divergence Timeline</h3>
            <UniverseTimeline universe={universe} />

            <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-100">Key Events</h3>
            <ul className="space-y-2">
              {universe.timeline.map((event) => (
                <li key={event.id} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <span className="mr-2 font-mono text-[10px] text-slate-500">{event.year}</span>
                  {event.description}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-100">Theme</h3>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full" style={{ background: universe.theme.primary }} />
              <span className="h-6 w-6 rounded-full" style={{ background: universe.theme.secondary }} />
              <span className="text-xs text-slate-400">{universe.theme.name}</span>
            </div>

            {universe.anomaly && (
              <p className="mt-4 rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-300">
                ⚠ Temporal anomaly detected in this universe
              </p>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
