let audioCtx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playStokeKilnSound(): void {
  const ctx = ensureCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Low roaring hearth whoosh + sharp wood ember snap
  const dur = 0.55;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = Math.sin((i / data.length) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * env * 0.4;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(280, now);
  filter.frequency.exponentialRampToValueAtTime(760, now + 0.25);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.24, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);

  // Subtle brass bell chime overtone
  const chime = ctx.createOscillator();
  const cg = ctx.createGain();
  chime.type = 'sine';
  chime.frequency.setValueAtTime(440, now + 0.05);
  chime.frequency.exponentialRampToValueAtTime(660, now + 0.3);
  cg.gain.setValueAtTime(0.06, now + 0.05);
  cg.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  chime.connect(cg);
  cg.connect(ctx.destination);
  chime.start(now + 0.05);
  chime.stop(now + 0.36);
}

export function playFootstepSound(): void {
  const ctx = ensureCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(115 + Math.random() * 25, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.045);
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.055);
}
