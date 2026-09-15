// Lightweight WebAudio synth for UI feedback — no audio assets needed.
// Muted by default; state persisted so the preference sticks across visits.

let ctx = null
let muted = true

if (typeof window !== 'undefined') {
  muted = window.localStorage.getItem('pu-audio-muted') !== '0'
}

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq = 440, duration = 0.15, type = 'sine', gain = 0.05, sweepTo }) {
  if (muted || typeof window === 'undefined') return
  try {
    const audioCtx = getContext()
    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, now + duration)
    g.gain.setValueAtTime(gain, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(g)
    g.connect(audioCtx.destination)
    osc.start(now)
    osc.stop(now + duration)
  } catch {
    // Autoplay/permission restrictions — fail silently.
  }
}

export const audio = {
  isMuted: () => muted,
  setMuted(value) {
    muted = value
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pu-audio-muted', value ? '1' : '0')
    }
  },
  select() {
    tone({ freq: 520, duration: 0.1, type: 'sine', gain: 0.05 })
  },
  generate() {
    tone({ freq: 220, duration: 0.5, type: 'triangle', gain: 0.05, sweepTo: 660 })
  },
  riftShock() {
    tone({ freq: 90, duration: 0.9, type: 'sawtooth', gain: 0.07, sweepTo: 40 })
  },
  riftSettle() {
    tone({ freq: 660, duration: 0.4, type: 'square', gain: 0.03, sweepTo: 880 })
  },
  enter() {
    tone({ freq: 330, duration: 0.6, type: 'sine', gain: 0.04, sweepTo: 220 })
  },
}
