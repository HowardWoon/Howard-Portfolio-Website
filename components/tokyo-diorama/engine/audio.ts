/**
 * Every sound is synthesised with WebAudio (no files, nothing to license). The context is created only after the
 * visitor presses the sound button (browser autoplay rules), and it is suspended whenever the diorama is off-screen.
 */
type Ctx = AudioContext;

export class Soundscape {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private trainGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = false;

  private get ready() {
    return this.ctx && this.master && this.noise;
  }

  async enable(on: boolean) {
    this.enabled = on;
    if (on && !this.ctx) this.init();
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.25);
    if (on && this.ctx.state === 'suspended') await this.ctx.resume().catch(() => undefined);
  }

  suspend(paused: boolean) {
    if (!this.ctx) return;
    if (paused) void this.ctx.suspend().catch(() => undefined);
    else if (this.enabled) void this.ctx.resume().catch(() => undefined);
  }

  private init() {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;
    // 2 s of pink-ish noise, looped
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
    this.noise = buf;
    const loop = (filterType: BiquadFilterType, freq: number, q: number, gain: number) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.playbackRate.value = 0.9 + Math.random() * 0.2;
      const f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(f).connect(g).connect(master);
      src.start();
      return g;
    };
    this.rainGain = loop('bandpass', 2400, 0.4, 0.55);
    this.humGain = loop('lowpass', 160, 0.7, 0.35);
    this.trainGain = loop('lowpass', 110, 1.2, 0);
  }

  update(rain: number, trainNear: number) {
    if (!this.ctx || !this.rainGain || !this.trainGain) return;
    const t = this.ctx.currentTime;
    this.rainGain.gain.setTargetAtTime(0.55 * rain + 0.02, t, 0.3);
    this.trainGain.gain.setTargetAtTime(Math.min(1.6, trainNear * 1.6), t, 0.15);
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slide?: number) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private burst(dur: number, freq: number, vol: number, when = 0, type: BiquadFilterType = 'bandpass') {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 1 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  /** 踏切 bell: a bright struck tone with a metallic partial. vol follows distance. */
  bell(vol: number) {
    if (vol < 0.02) return;
    this.tone(760, 0.32, 'triangle', 0.22 * vol);
    this.tone(1520 * 1.02, 0.18, 'sine', 0.08 * vol);
  }
  horn(vol: number) {
    this.tone(330, 0.9, 'sawtooth', 0.06 * vol);
    this.tone(415, 0.9, 'sawtooth', 0.05 * vol);
  }
  chime() {
    this.tone(988, 0.5, 'sine', 0.12);
    this.tone(784, 0.7, 'sine', 0.12, 0.28);
  }
  clunk() {
    this.tone(120, 0.25, 'sine', 0.35, 0, 60);
    this.burst(0.12, 900, 0.35);
    this.tone(210, 0.18, 'triangle', 0.2, 0.32, 90);
  }
  step(wet: number) {
    this.burst(0.07, 1800 + Math.random() * 800, 0.08 + wet * 0.1, 0, 'highpass');
  }
  land() {
    this.burst(0.14, 700, 0.22);
  }
  meow() {
    this.tone(720, 0.35, 'sine', 0.06, 0, 520);
  }
  /** R73: thunder: a long low rumble with a crack on top */
  thunder() {
    this.burst(0.35, 1400, 0.25);
    this.burst(2.6, 90, 0.7, 0.05, 'lowpass');
    this.burst(1.8, 160, 0.4, 0.5, 'lowpass');
  }
  /** R73: a gust through the street */
  wind() {
    this.burst(2.2, 420, 0.18);
    this.burst(1.6, 700, 0.1, 0.4);
  }
  click() {
    this.tone(1200, 0.05, 'square', 0.03);
  }

  dispose() {
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }
}
