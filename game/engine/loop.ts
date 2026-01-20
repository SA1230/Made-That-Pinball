export type LoopCallbacks = {
  update: (dt: number) => void;
  render: (alpha: number) => void;
};

export class FixedLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly step = 1 / 120;
  private frameHandle = 0;
  private fps = 0;
  private frameCount = 0;
  private frameTimer = 0;

  start(callbacks: LoopCallbacks) {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const tick = (time: number) => {
      if (!this.running) return;
      const delta = Math.min(0.05, (time - this.lastTime) / 1000);
      this.lastTime = time;
      this.accumulator += delta;
      while (this.accumulator >= this.step) {
        callbacks.update(this.step);
        this.accumulator -= this.step;
      }
      const alpha = this.accumulator / this.step;
      callbacks.render(alpha);
      this.trackFps(delta);
      this.frameHandle = requestAnimationFrame(tick);
    };
    this.frameHandle = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameHandle);
  }

  getFps() {
    return this.fps;
  }

  private trackFps(delta: number) {
    this.frameTimer += delta;
    this.frameCount += 1;
    if (this.frameTimer >= 0.5) {
      this.fps = Math.round(this.frameCount / this.frameTimer);
      this.frameCount = 0;
      this.frameTimer = 0;
    }
  }
}
