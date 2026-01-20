export class AudioManager {
  private ctx?: AudioContext;
  private muted = false;

  ensure() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume = 0.2) {
    if (this.muted) return;
    this.ensure();
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  bumper() {
    this.playTone(520, 0.15, "sine", 0.3);
  }

  sling() {
    this.playTone(320, 0.08, "square", 0.18);
  }

  target() {
    if (this.muted) return;
    this.ensure();
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554, 659];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.value = 0.2;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2 + idx * 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 0.2 + idx * 0.05);
    });
  }

  ramp() {
    this.playTone(720, 0.2, "sawtooth", 0.22);
  }

  tilt() {
    this.playTone(110, 0.3, "square", 0.3);
  }
}
