import { Vec2 } from "../physics/vector";

export class Bumper {
  position: Vec2;
  radius: number;
  pulse = 0;
  lit = false;

  constructor(position: Vec2, radius: number) {
    this.position = position;
    this.radius = radius;
  }

  hit() {
    this.pulse = 1;
    this.lit = true;
  }

  update(dt: number) {
    this.pulse = Math.max(0, this.pulse - dt * 2.5);
    if (this.pulse === 0) {
      this.lit = false;
    }
  }
}
