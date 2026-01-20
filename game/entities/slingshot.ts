import { Line, makeLine } from "../physics/collision";
import { Vec2 } from "../physics/vector";

export class SlingShot {
  line: Line;
  pulse = 0;

  constructor(a: Vec2, b: Vec2) {
    this.line = makeLine(a, b);
  }

  hit() {
    this.pulse = 1;
  }

  update(dt: number) {
    this.pulse = Math.max(0, this.pulse - dt * 3.5);
  }
}
