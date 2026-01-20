import { Vec2 } from "../physics/vector";

export class Target {
  position: Vec2;
  radius: number;
  lit = false;
  pulse = 0;

  constructor(position: Vec2, radius: number) {
    this.position = position;
    this.radius = radius;
  }

  hit() {
    this.lit = true;
    this.pulse = 1;
  }

  reset() {
    this.lit = false;
    this.pulse = 0;
  }

  update(dt: number) {
    this.pulse = Math.max(0, this.pulse - dt * 3);
  }
}
