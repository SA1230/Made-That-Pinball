import { Vec2 } from "../physics/vector";

export class RampLane {
  center: Vec2;
  radius: number;
  lit = false;
  pulse = 0;

  constructor(center: Vec2, radius: number) {
    this.center = center;
    this.radius = radius;
  }

  light() {
    this.lit = true;
    this.pulse = 1;
  }

  clear() {
    this.lit = false;
  }

  update(dt: number) {
    this.pulse = Math.max(0, this.pulse - dt * 2);
  }
}
