import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const QUESTIONS = [
  {
    question: 'Do you choose logic or emotion?',
    options: [
      { label: 'Logic', value: 'logic' },
      { label: 'Emotion', value: 'emotion' },
    ],
  },
  {
    question: 'Do you prioritize stability or exploration?',
    options: [
      { label: 'Stability', value: 'stability' },
      { label: 'Exploration', value: 'exploration' },
    ],
  },
  {
    question: 'Do you trust intuition or data?',
    options: [
      { label: 'Intuition', value: 'intuition' },
      { label: 'Data', value: 'data' },
    ],
  },
]

/**
 * 3-question modal whose answers seed universe generation.
 */
export default function InputModal({ open, onComplete }) {
  const [answers, setAnswers] = useState([])

  const handleChoice = (value) => {
    const next = [...answers, value]
    setAnswers(next)
    if (next.length === QUESTIONS.length) {
      onComplete(next)
      setAnswers([])
    }
  }

  const step = answers.length

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="w-full max-w-md rounded-2xl border border-fuchsia-500/20 bg-slate-950 p-8 shadow-2xl"
          >
            <p className="mb-1 text-xs uppercase tracking-widest text-fuchsia-400">
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-fuchsia-500"
                animate={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="mb-6 text-xl font-semibold text-white">{QUESTIONS[step].question}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <motion.button
                      key={opt.value}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoice(opt.value)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100 transition-colors hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
