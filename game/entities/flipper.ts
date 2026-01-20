import { Vec2, add, scale } from "../physics/vector";

export class Flipper {
  pivot: Vec2;
  length: number;
  angle: number;
  minAngle: number;
  maxAngle: number;
  angularVelocity = 0;
  flipSpeed = 18;
  returnSpeed = 12;
  side: "left" | "right";

  constructor(pivot: Vec2, length: number, side: "left" | "right") {
    this.pivot = pivot;
    this.length = length;
    this.side = side;
    const base = side === "left" ? -0.5 : Math.PI + 0.5;
    this.minAngle = base - 0.6;
    this.maxAngle = base + 0.6;
    this.angle = base;
  }

  update(dt: number, engaged: boolean) {
    const targetSpeed = engaged ? this.flipSpeed : -this.returnSpeed;
    this.angularVelocity = targetSpeed;
    this.angle += this.angularVelocity * dt * (this.side === "left" ? 1 : -1);
    if (this.side === "left") {
      this.angle = Math.max(this.minAngle, Math.min(this.maxAngle, this.angle));
    } else {
      this.angle = Math.min(this.minAngle, Math.max(this.maxAngle, this.angle));
    }
  }

  getEndPoint(): Vec2 {
    return add(this.pivot, scale({ x: Math.cos(this.angle), y: Math.sin(this.angle) }, this.length));
  }

  getSegment() {
    return { a: this.pivot, b: this.getEndPoint() };
  }
}
