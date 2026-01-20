import { AudioManager } from "./engine/audio";
import { InputManager } from "./engine/input";
import { Ball } from "./entities/ball";
import { Bumper } from "./entities/bumper";
import { Flipper } from "./entities/flipper";
import { RampLane } from "./entities/rampLane";
import { SlingShot } from "./entities/slingshot";
import { Target } from "./entities/target";
import { Wall } from "./entities/wall";
import { resolveCircleCircle, resolveCircleLine } from "./physics/collision";
import { Vec2, add, clamp, distance, normalize, scale, sub } from "./physics/vector";

const TABLE_WIDTH = 600;
const TABLE_HEIGHT = 900;
export const PLUNGER_X = 550;
export const PLUNGER_MIN_Y = 780;
export const PLUNGER_MAX_Y = 860;

export class GameState {
  width = TABLE_WIDTH;
  height = TABLE_HEIGHT;
  gravity: Vec2 = { x: 0, y: 680 };
  drag = 0.993;
  balls: Ball[] = [];
  walls: Wall[] = [];
  bumpers: Bumper[] = [];
  targets: Target[] = [];
  slings: SlingShot[] = [];
  flippers: Flipper[] = [];
  ramp: RampLane;
  score = 0;
  multiplier = 1;
  ballsRemaining = 2;
  mission = "Complete rollovers to LIGHT RAMP";
  rampShots = 0;
  rampGoal = 3;
  paused = false;
  showHelp = true;
  debug = false;
  menuOpen = true;
  tiltTimer = 0;
  tiltMeter: number[] = [];
  plungerCharge = 0;
  maxPlungerCharge = 900;
  gameOver = false;
  lastMessage = "";
  messageTimer = 0;

  constructor() {
    this.ramp = new RampLane({ x: 450, y: 170 }, 36);
    this.reset();
  }

  reset() {
    this.score = 0;
    this.multiplier = 1;
    this.ballsRemaining = 2;
    this.rampShots = 0;
    this.rampGoal = 3;
    this.mission = "Complete rollovers to LIGHT RAMP";
    this.paused = false;
    this.menuOpen = false;
    this.tiltTimer = 0;
    this.tiltMeter = [];
    this.plungerCharge = 0;
    this.gameOver = false;
    this.lastMessage = "";
    this.messageTimer = 0;
    this.setupTable();
    this.spawnBall();
  }

  setupTable() {
    this.walls = [
      new Wall({ x: 80, y: 80 }, { x: 520, y: 80 }),
      new Wall({ x: 80, y: 80 }, { x: 80, y: 860 }),
      new Wall({ x: 520, y: 80 }, { x: 520, y: 700 }),
      new Wall({ x: 520, y: 80 }, { x: 570, y: 860 }),
      new Wall({ x: 80, y: 860 }, { x: 230, y: 760 }),
      new Wall({ x: 230, y: 760 }, { x: 300, y: 860 }),
      new Wall({ x: 300, y: 860 }, { x: 370, y: 760 }),
      new Wall({ x: 370, y: 760 }, { x: 520, y: 860 }),
      new Wall({ x: 170, y: 620 }, { x: 120, y: 710 }),
      new Wall({ x: 430, y: 620 }, { x: 480, y: 710 }),
      new Wall({ x: 240, y: 140 }, { x: 360, y: 140 }),
      new Wall({ x: 240, y: 140 }, { x: 200, y: 220 }),
      new Wall({ x: 360, y: 140 }, { x: 400, y: 220 })
    ];

    this.bumpers = [
      new Bumper({ x: 200, y: 260 }, 32),
      new Bumper({ x: 300, y: 230 }, 34),
      new Bumper({ x: 400, y: 260 }, 32)
    ];

    this.targets = [
      new Target({ x: 160, y: 150 }, 14),
      new Target({ x: 220, y: 120 }, 14),
      new Target({ x: 300, y: 110 }, 14),
      new Target({ x: 380, y: 120 }, 14),
      new Target({ x: 440, y: 150 }, 14)
    ];

    this.slings = [
      new SlingShot({ x: 170, y: 620 }, { x: 260, y: 580 }),
      new SlingShot({ x: 430, y: 620 }, { x: 340, y: 580 })
    ];

    this.flippers = [
      new Flipper({ x: 240, y: 760 }, 90, "left"),
      new Flipper({ x: 360, y: 760 }, 90, "right")
    ];

    this.ramp.clear();
  }

  spawnBall() {
    const ball = new Ball({ x: PLUNGER_X, y: PLUNGER_MAX_Y }, 11);
    ball.inPlungerLane = true;
    this.balls.push(ball);
  }

  update(dt: number, input: InputManager, audio: AudioManager) {
    if (input.wasPressed("KeyH")) {
      this.showHelp = !this.showHelp;
    }
    if (input.wasPressed("KeyD")) {
      this.debug = !this.debug;
    }
    if (input.wasPressed("KeyM")) {
      audio.toggleMute();
    }
    if (input.wasPressed("Escape")) {
      this.menuOpen = !this.menuOpen;
    }
    if (input.wasPressed("KeyP")) {
      this.paused = !this.paused;
    }
    if (input.wasPressed("Enter")) {
      if (this.gameOver || this.menuOpen) {
        this.reset();
      }
    }

    if (this.menuOpen || this.paused || this.gameOver) {
      this.updateTimers(dt);
      return;
    }

    this.updateTilt(dt);

    const tiltActive = this.tiltTimer > 0;

    const leftEngaged = !tiltActive && (input.isDown("ShiftLeft") || input.isDown("KeyZ"));
    const rightEngaged = !tiltActive && (input.isDown("ShiftRight") || input.isDown("Slash"));

    this.flippers[0].update(dt, leftEngaged);
    this.flippers[1].update(dt, rightEngaged);

    this.updatePlunger(dt, input);

    this.handleNudge(input);

    for (const ball of this.balls) {
      ball.update(dt, this.gravity, this.drag);
      if (ball.inPlungerLane) {
        ball.position.x = PLUNGER_X;
        ball.position.y = clamp(ball.position.y, PLUNGER_MIN_Y, PLUNGER_MAX_Y);
        ball.velocity.x = 0;
      }

      for (const wall of this.walls) {
        const result = resolveCircleLine(ball.position, ball.radius, ball.velocity, wall.line, 0.7);
        if (result.hit) {
          ball.position = result.pos;
          ball.velocity = result.velocity;
        }
      }

      for (const sling of this.slings) {
        const result = resolveCircleLine(ball.position, ball.radius, ball.velocity, sling.line, 0.8);
        if (result.hit && result.normal) {
          ball.position = result.pos;
          ball.velocity = add(result.velocity, scale(result.normal, 260));
          sling.hit();
          if (!tiltActive) {
            this.score += 120 * this.multiplier;
          }
          audio.sling();
        }
      }

      for (const bumper of this.bumpers) {
        const result = resolveCircleCircle(
          ball.position,
          ball.radius,
          ball.velocity,
          bumper.position,
          bumper.radius,
          1.1
        );
        if (result.hit && result.normal) {
          ball.position = result.pos;
          ball.velocity = add(result.velocity, scale(result.normal, 280));
          bumper.hit();
          if (!tiltActive) {
            this.score += 220 * this.multiplier;
          }
          audio.bumper();
        }
      }

      for (const target of this.targets) {
        if (distance(ball.position, target.position) <= ball.radius + target.radius) {
          if (!target.lit) {
            target.hit();
            if (!tiltActive) {
              this.score += 300 * this.multiplier;
            }
            audio.target();
            this.checkTargets();
          }
        }
      }

      for (const flipper of this.flippers) {
        const segment = flipper.getSegment();
        const result = resolveCircleLine(ball.position, ball.radius, ball.velocity, {
          a: segment.a,
          b: segment.b,
          normal: { x: 0, y: 0 }
        }, 0.2);
        if (result.hit) {
          ball.position = result.pos;
          const tangent = normalize(sub(segment.b, segment.a));
          const kick = flipper.angularVelocity * 25;
          const direction = flipper.side === "left" ? 1 : -1;
          ball.velocity = add(result.velocity, scale(tangent, kick * direction));
        }
      }

      if (distance(ball.position, this.ramp.center) <= this.ramp.radius + ball.radius) {
        if (this.ramp.lit && ball.rampCooldown <= 0) {
          ball.rampCooldown = 0.6;
          this.handleRampShot(audio);
        }
      }

      if (ball.position.y > TABLE_HEIGHT + 80) {
        ball.active = false;
      }
    }

    this.balls = this.balls.filter((ball) => ball.active);
    if (this.balls.length === 0) {
      if (this.ballsRemaining > 0) {
        this.ballsRemaining -= 1;
        this.spawnBall();
        this.setMessage("BALL SAVED");
      } else {
        this.gameOver = true;
        this.menuOpen = true;
      }
    }

    this.updateTimers(dt);
  }

  private updatePlunger(dt: number, input: InputManager) {
    const holding = input.isDown("Space");
    if (holding) {
      this.plungerCharge = clamp(this.plungerCharge + dt * 1200, 0, this.maxPlungerCharge);
    }
    if (!holding && this.plungerCharge > 0) {
      const plungerBall = this.balls.find((ball) => ball.inPlungerLane);
      if (plungerBall) {
        const launchPower = this.plungerCharge;
        const lateralKick = clamp(launchPower * 0.12, 60, 160);
        plungerBall.velocity.y -= launchPower;
        plungerBall.velocity.x = -lateralKick;
        plungerBall.position.x = PLUNGER_X - 8;
        plungerBall.inPlungerLane = false;
      }
      this.plungerCharge = 0;
    }
  }

  private handleNudge(input: InputManager) {
    const nudgeLeft = input.wasPressed("ArrowLeft");
    const nudgeRight = input.wasPressed("ArrowRight");
    const nudgeUp = input.wasPressed("ArrowUp");
    const nudgeDown = input.wasPressed("ArrowDown");
    if (!(nudgeLeft || nudgeRight || nudgeUp || nudgeDown)) return;
    const impulse: Vec2 = { x: 0, y: 0 };
    if (nudgeLeft) impulse.x -= 80;
    if (nudgeRight) impulse.x += 80;
    if (nudgeUp) impulse.y -= 120;
    if (nudgeDown) impulse.y += 120;

    for (const ball of this.balls) {
      ball.velocity = add(ball.velocity, impulse);
    }

    const now = performance.now() / 1000;
    this.tiltMeter.push(now);
    this.tiltMeter = this.tiltMeter.filter((time) => now - time < 2);
    if (this.tiltMeter.length >= 3 && this.tiltTimer <= 0) {
      this.tiltTimer = 3;
    }
  }

  private updateTilt(dt: number) {
    if (this.tiltTimer > 0) {
      this.tiltTimer = Math.max(0, this.tiltTimer - dt);
    }
  }

  private checkTargets() {
    const allLit = this.targets.every((target) => target.lit);
    if (allLit) {
      this.multiplier = Math.min(5, this.multiplier + 1);
      this.targets.forEach((target) => target.reset());
      this.ramp.light();
      this.mission = "Ramp lit! Shoot the ramp for BONUS";
    }
  }

  private handleRampShot(audio: AudioManager) {
    this.rampShots += 1;
    this.score += 1500 * this.multiplier;
    this.ramp.pulse = 1;
    audio.ramp();
    if (this.rampShots >= this.rampGoal) {
      this.rampShots = 0;
      this.rampGoal = Math.min(5, this.rampGoal + 1);
      this.spawnBall();
      this.setMessage("MULTIBALL READY!");
    }
  }

  private updateTimers(dt: number) {
    for (const bumper of this.bumpers) {
      bumper.update(dt);
    }
    for (const target of this.targets) {
      target.update(dt);
    }
    for (const sling of this.slings) {
      sling.update(dt);
    }
    this.ramp.update(dt);
    if (this.messageTimer > 0) {
      this.messageTimer = Math.max(0, this.messageTimer - dt);
      if (this.messageTimer === 0) {
        this.lastMessage = "";
      }
    }
  }

  private setMessage(text: string) {
    this.lastMessage = text;
    this.messageTimer = 1.8;
  }

  getBallsRemainingDisplay() {
    return this.ballsRemaining + this.balls.length;
  }

  isTilted() {
    return this.tiltTimer > 0;
  }
}
