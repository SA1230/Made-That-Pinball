import { Vec2, add, scale } from "../physics/vector";

export class Ball {
  position: Vec2;
  velocity: Vec2;
  radius: number;
  active = true;
  rampCooldown = 0;
  inPlungerLane = false;

  constructor(position: Vec2, radius = 10) {
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };
    this.radius = radius;
  }

  update(dt: number, gravity: Vec2, drag: number) {
    if (!this.active) return;
    this.rampCooldown = Math.max(0, this.rampCooldown - dt);
    this.velocity.x += gravity.x * dt;
    this.velocity.y += gravity.y * dt;
    this.velocity.x *= drag;
    this.velocity.y *= drag;
    this.position = add(this.position, scale(this.velocity, dt));
  }
}
