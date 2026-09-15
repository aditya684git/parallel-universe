import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import InputModal from './components/InputModal'
import UniverseGraph from './components/UniverseGraph'
import MultiverseLayers from './components/MultiverseLayers'
import UniversePanel from './components/UniversePanel'
import UniverseImmersive from './components/UniverseImmersive'
import { applyRiftMutation, createRiftUniverses, generateUniverses } from './utils/generateUniverses'

const SHOCK_DURATION = 950
const ANOMALY_GLOW_DURATION = 2600

const LEGEND = [
  { label: 'Prime', color: '#38bdf8' },
  { label: 'Divergent', color: '#a855f7' },
  { label: 'Chaotic', color: '#f87171' },
  { label: 'Rift-born', color: '#facc15' },
]

function App() {
  const [universes, setUniverses] = useState([])
  const [modalOpen, setModalOpen] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [immersiveId, setImmersiveId] = useState(null)
  const [timeRift, setTimeRift] = useState(false)
  const [shock, setShock] = useState(false)
  const [anomalyIds, setAnomalyIds] = useState([])
  const [riftLog, setRiftLog] = useState(null)

  const selectedUniverse = useMemo(
    () => universes.find((u) => u.id === selectedId) ?? null,
    [universes, selectedId],
  )
  const immersiveUniverse = useMemo(
    () => universes.find((u) => u.id === immersiveId) ?? null,
    [universes, immersiveId],
  )

  useEffect(() => {
    if (!riftLog) return
    const dismiss = setTimeout(() => setRiftLog(null), 6000)
    return () => clearTimeout(dismiss)
  }, [riftLog])

  const handleGenerate = useCallback((choices) => {
    const generated = generateUniverses(choices)
    setUniverses(generated)
    setSelectedId(generated[0]?.id ?? null)
    setModalOpen(false)
    setAnomalyIds([])
    setTimeRift(false)
    setShock(false)
    setRiftLog(null)
  }, [])

  // Time Rift: a shockwave plays, then the multiverse is permanently reshaped —
  // existing universes destabilize and brand-new Rift-born universes tear in.
  const triggerTimeRift = useCallback(() => {
    if (universes.length === 0 || timeRift) return
    setTimeRift(true)
    setShock(true)

    setTimeout(() => {
      setShock(false)
      setUniverses((prev) => {
        const mutateCount = Math.max(2, Math.floor(prev.length / 3))
        const shuffled = [...prev].sort(() => Math.random() - 0.5)
        const mutateIds = new Set(shuffled.slice(0, mutateCount).map((u) => u.id))
        const mutated = prev.map((u) => (mutateIds.has(u.id) ? applyRiftMutation(u) : u))
        const spawned = createRiftUniverses(mutated, 2)

        setAnomalyIds([...mutateIds, ...spawned.map((u) => u.id)])
        setRiftLog({
          mutated: mutated.filter((u) => mutateIds.has(u.id)).map((u) => u.name),
          spawned: spawned.map((u) => u.name),
        })

        return [...mutated, ...spawned]
      })

      setTimeout(() => {
        setTimeRift(false)
        setAnomalyIds([])
      }, ANOMALY_GLOW_DURATION)
    }, SHOCK_DURATION)
  }, [universes, timeRift])

  const panelUniverse = selectedUniverse
    ? { ...selectedUniverse, anomaly: anomalyIds.includes(selectedUniverse.id) }
    : null

  return (
    <div className="relative min-h-screen text-slate-100">
      <div className="starfield">
        <div className="starfield-far" />
        <div className="starfield-twinkle" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-rose-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl"
          >
            Parallel Universe Simulator
          </motion.h1>
          <p className="max-w-xl text-sm text-slate-400">
            Explore a branching multiverse born from three choices — a causal graph, divergence
            timelines, and a Prime Universe anchor at the center of it all.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20"
            >
              Generate Multiverse
            </motion.button>
            <motion.button
              type="button"
              disabled={universes.length === 0 || timeRift}
              whileHover={{ scale: universes.length ? 1.05 : 1 }}
              whileTap={{ scale: universes.length ? 0.96 : 1 }}
              onClick={triggerTimeRift}
              className="rounded-full border border-rose-400/40 bg-rose-500/10 px-6 py-2 text-sm font-semibold text-rose-300 shadow-lg shadow-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {timeRift ? 'Rift tearing open…' : 'Trigger Time Rift'}
            </motion.button>
          </div>
        </header>

        {universes.length > 0 && (
          <main className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="flex min-h-[420px] flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex flex-wrap gap-3 px-1 text-[11px] text-slate-400">
                {LEGEND.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                <UniverseGraph
                  universes={universes}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  shock={shock}
                  anomalyIds={anomalyIds}
                />
              </div>
            </section>

            <section className="max-h-[70vh] overflow-y-auto pr-1">
              <MultiverseLayers universes={universes} selectedId={selectedId} onSelect={setSelectedId} />
            </section>
          </main>
        )}

        {universes.length === 0 && !modalOpen && (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Click "Generate Multiverse" to begin.
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed left-1/2 top-4 z-50 w-full max-w-sm -translate-x-1/2 px-4">
        <AnimatePresence>
          {riftLog && (
            <motion.div
              key={JSON.stringify(riftLog)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto rounded-xl border border-yellow-400/30 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-2xl"
            >
              <p className="mb-1 font-semibold text-yellow-300">⚡ Time Rift aftermath</p>
              {riftLog.spawned.length > 0 && (
                <p>New universes torn open: {riftLog.spawned.join(', ')}</p>
              )}
              {riftLog.mutated.length > 0 && (
                <p className="mt-1 text-slate-400">Destabilized: {riftLog.mutated.join(', ')}</p>
              )}
              <button
                type="button"
                onClick={() => setRiftLog(null)}
                className="mt-2 text-[10px] uppercase tracking-wide text-slate-500 hover:text-slate-300"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InputModal open={modalOpen} onComplete={handleGenerate} />
      <UniversePanel universe={panelUniverse} onClose={() => setSelectedId(null)} onEnter={setImmersiveId} />
      {immersiveUniverse && <UniverseImmersive universe={immersiveUniverse} onClose={() => setImmersiveId(null)} />}
    </div>
  )
}

export default App
