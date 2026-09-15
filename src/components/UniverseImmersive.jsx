import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function Gauge({ label, value, color }) {
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="-mt-16 text-center">
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
      <p className="mt-8 text-[11px] uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

/**
 * Full-screen "step inside" experience for a single universe: ambient theme
 * background, live particles, stat gauges, and a click-through event stepper.
 */
export default function UniverseImmersive({ universe, onClose }) {
  const [eventIndex, setEventIndex] = useState(0)

  useEffect(() => setEventIndex(0), [universe?.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!universe) return null
  const { theme, timeline } = universe
  const event = timeline[eventIndex]
  const isChaotic = universe.type === 'chaotic'

  return (
    <AnimatePresence>
      <motion.div
        key={universe.id}
        initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
        exit={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 overflow-hidden bg-[#030014]"
      >
        {/* Opaque backdrop with an ambient theme-colored tint on top */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${theme.primary}33 0%, transparent 65%)` }}
        />

        {/* Ambient drifting particles tinted to the universe theme */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 29) % 100}%`,
                top: `${(i * 53) % 100}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: theme.primary,
                boxShadow: `0 0 8px ${theme.glow}`,
              }}
              animate={
                isChaotic
                  ? { y: [0, -30, 10, 0], x: [0, 15, -10, 0], opacity: [0.2, 1, 0.4, 0.2] }
                  : { y: [0, -18, 0], opacity: [0.15, 0.8, 0.15] }
              }
              transition={{ duration: 5 + (i % 6), repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute left-6 top-6 z-20 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur transition-colors hover:border-white/40 hover:text-white"
        >
          ← Return to Multiverse
        </button>

        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: theme.primary }}>
              You are inside
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{universe.name}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">{universe.description}</p>
          </div>

          <div className="flex gap-10">
            <Gauge label="Entropy" value={universe.entropy} color={theme.primary} />
            <Gauge label="Stability" value={universe.stability} color={theme.secondary} />
          </div>

          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
              <span>Memory {eventIndex + 1} / {timeline.length}</span>
              <span>{event.year}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={event.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="min-h-[3rem] text-lg font-medium text-slate-100"
              >
                {event.description}
              </motion.p>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEventIndex((i) => Math.max(0, i - 1))}
                disabled={eventIndex === 0}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-slate-300 disabled:opacity-30"
              >
                ← Prev
              </button>
              <div className="flex gap-1.5">
                {timeline.map((e, i) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEventIndex(i)}
                    className="h-2 w-2 rounded-full transition-all"
                    style={{
                      background: i === eventIndex ? theme.primary : 'rgba(255,255,255,0.2)',
                      boxShadow: i === eventIndex ? `0 0 6px ${theme.glow}` : 'none',
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEventIndex((i) => Math.min(timeline.length - 1, i + 1))}
                disabled={eventIndex === timeline.length - 1}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-slate-300 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
