import { motion } from 'framer-motion'

/**
 * Horizontal timeline of 5 divergence events for a universe.
 * Chaotic universes get a subtle jittering "temporal distortion" animation.
 */
export default function UniverseTimeline({ universe }) {
  if (!universe) return null
  const { timeline, theme, type } = universe
  const isChaotic = type === 'chaotic'

  return (
    <div className="relative py-6">
      <div
        className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }}
      />
      <div className="relative flex justify-between gap-2">
        {timeline.map((event, i) => (
          <motion.div
            key={event.id}
            className="flex w-1/5 flex-col items-center text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={
              isChaotic
                ? { opacity: 1, y: [0, -3, 0, 2, 0], x: [0, 2, -2, 1, 0] }
                : { opacity: 1, y: 0 }
            }
            transition={
              isChaotic
                ? { delay: i * 0.12, duration: 2.4, repeat: Infinity, repeatType: 'loop' }
                : { delay: i * 0.12, duration: 0.4 }
            }
          >
            <motion.span
              className="mb-2 h-3 w-3 rounded-full ring-4"
              style={{ background: theme.primary, boxShadow: `0 0 12px ${theme.glow}`, '--tw-ring-color': `${theme.primary}33` }}
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ delay: i * 0.15, duration: 1.8, repeat: Infinity }}
            />
            <span className="text-[10px] uppercase tracking-wide text-slate-400">{event.year}</span>
            <p className="mt-1 text-xs leading-snug text-slate-200">{event.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
