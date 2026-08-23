// Áudio e confete do quiz — 100% procedural (sem assets, sem libs, funciona offline).
// Tudo OFF por padrão; preferências ficam no localStorage. Só toca após gesto do usuário.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// ── Efeitos sonoros ────────────────────────────────────────────────────────────
function blip(
  freqs: number[],
  opts: { dur?: number; type?: OscillatorType; gain?: number; stagger?: number } = {},
) {
  const c = ac();
  if (!c || !master) return;
  const { dur = 0.12, type = "sine", gain = 0.1, stagger = 0.06 } = opts;
  const t0 = c.currentTime;
  freqs.forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0 + i * stagger);
    g.gain.setValueAtTime(0, t0 + i * stagger);
    g.gain.linearRampToValueAtTime(gain, t0 + i * stagger + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * stagger + dur);
    o.connect(g);
    g.connect(master!);
    o.start(t0 + i * stagger);
    o.stop(t0 + i * stagger + dur + 0.03);
  });
}

const FX_KEY = "fiveone_quiz_fx";
const MUSIC_KEY = "fiveone_quiz_music";
const ls = () => (typeof localStorage === "undefined" ? null : localStorage);

export function fxEnabled(): boolean {
  return ls()?.getItem(FX_KEY) === "1";
}
export function setFxEnabled(v: boolean) {
  ls()?.setItem(FX_KEY, v ? "1" : "0");
}
export function musicPref(): boolean {
  return ls()?.getItem(MUSIC_KEY) === "1";
}
export function setMusicPref(v: boolean) {
  ls()?.setItem(MUSIC_KEY, v ? "1" : "0");
}

export const sfx = {
  tick: () => fxEnabled() && blip([520], { dur: 0.07, type: "triangle", gain: 0.07 }),
  advance: () => fxEnabled() && blip([440, 660], { dur: 0.1, type: "sine", gain: 0.08, stagger: 0.05 }),
  milestone: () => fxEnabled() && blip([523.25, 659.25, 783.99], { dur: 0.22, type: "sine", gain: 0.1, stagger: 0.08 }),
  finish: () =>
    fxEnabled() && blip([523.25, 659.25, 783.99, 1046.5], { dur: 0.28, type: "triangle", gain: 0.11, stagger: 0.09 }),
  // toca uma amostra mesmo com fx desligado (feedback ao ligar o som)
  sample: () => blip([659.25, 880], { dur: 0.12, type: "sine", gain: 0.08, stagger: 0.05 }),
};

// ── Trilha ambiente generativa (pad calmo e evolutivo) ──────────────────────────
let ambient: { stop: () => void } | null = null;

export function startAmbient() {
  const c = ac();
  if (!c || !master || ambient) return;
  const out = c.createGain();
  out.gain.value = 0;
  out.connect(master);
  out.gain.linearRampToValueAtTime(0.05, c.currentTime + 2.5);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 620;
  lp.Q.value = 0.5;
  lp.connect(out);

  // acorde suave (Lá menor add9): A2, E3, A3, B3, C4
  const freqs = [110, 164.81, 220, 246.94, 261.63];
  const parts = freqs.map((f, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.value = 0.09 / (i + 1);
    // LFO lento no detune → movimento vivo
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.04 + i * 0.017;
    const lfoG = c.createGain();
    lfoG.gain.value = 2.2;
    lfo.connect(lfoG);
    lfoG.connect(o.detune);
    o.connect(g);
    g.connect(lp);
    o.start();
    lfo.start();
    return { o, lfo };
  });

  ambient = {
    stop: () => {
      const c2 = ac();
      if (c2) out.gain.linearRampToValueAtTime(0, c2.currentTime + 1.2);
      setTimeout(() => {
        parts.forEach(({ o, lfo }) => {
          try {
            o.stop();
            lfo.stop();
          } catch {
            /* noop */
          }
        });
      }, 1300);
    },
  };
}

export function stopAmbient() {
  ambient?.stop();
  ambient = null;
}

// ── Confete (canvas temporário, brand-neutral: menta/dourado/branco/verde) ───────
export function confettiBurst() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const cx = canvas.getContext("2d");
  if (!cx) {
    canvas.remove();
    return;
  }
  cx.scale(dpr, dpr);
  const W = window.innerWidth;
  const H = window.innerHeight;
  const colors = ["#64ffda", "#d8b45a", "#f4f8fb", "#4bbf6b"];
  const N = 110;
  const parts = Array.from({ length: N }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H * 0.32,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -11 - 3,
    g: 0.28 + Math.random() * 0.22,
    r: 3 + Math.random() * 5,
    color: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.35,
  }));
  const t0 = performance.now();
  const DUR = 1900;
  let raf = 0;
  const tick = (t: number) => {
    const el = t - t0;
    cx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += p.g;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.globalAlpha = Math.max(0, 1 - el / DUR);
      cx.fillStyle = p.color;
      cx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.62);
      cx.restore();
    }
    if (el < DUR) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}
