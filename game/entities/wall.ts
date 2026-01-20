import { Line, makeLine } from "../physics/collision";
import { Vec2 } from "../physics/vector";

export class Wall {
  line: Line;

  constructor(a: Vec2, b: Vec2) {
    this.line = makeLine(a, b);
  }
}
