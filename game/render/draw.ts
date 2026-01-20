import { GameState } from "../state";
import { lerp } from "../physics/vector";

export type RenderInfo = {
  width: number;
  height: number;
  scale: number;
  shake: number;
  fps: number;
  dt: number;
};

export const renderGame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  info: RenderInfo
) => {
  const { width, height, scale } = info;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate((width - state.width * scale) / 2, (height - state.height * scale) / 2);
  ctx.scale(scale, scale);

  drawTable(ctx, state);
  drawRamp(ctx, state);
  drawWalls(ctx, state);
  drawSlings(ctx, state);
  drawTargets(ctx, state);
  drawBumpers(ctx, state);
  drawFlippers(ctx, state);
  drawBalls(ctx, state);
  drawHUD(ctx, state);
  if (state.debug) {
    drawDebug(ctx, state, info);
  }

  ctx.restore();
};

const drawTable = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#0d2c5a");
  gradient.addColorStop(0.45, "#12244d");
  gradient.addColorStop(1, "#08152f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = "rgba(120, 190, 255, 0.35)";
  ctx.lineWidth = 8;
  ctx.strokeRect(60, 60, state.width - 120, state.height - 120);

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#1e3b70";
  ctx.fillRect(520, 80, 50, 780);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(80, 80, state.width - 160, 14);
};

const drawWalls = (ctx: CanvasRenderingContext2D, state: GameState) => {
  ctx.strokeStyle = "rgba(200, 230, 255, 0.6)";
  ctx.lineWidth = 6;
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8;
  for (const wall of state.walls) {
    ctx.beginPath();
    ctx.moveTo(wall.line.a.x, wall.line.a.y);
    ctx.lineTo(wall.line.b.x, wall.line.b.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drawBumpers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const bumper of state.bumpers) {
    const pulse = bumper.pulse;
    const base = lerp(0.5, 1, pulse);
    const glow = `rgba(120,220,255,${0.4 + pulse * 0.4})`;
    ctx.fillStyle = "#d8f2ff";
    ctx.beginPath();
    ctx.arc(bumper.position.x, bumper.position.y, bumper.radius * base, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = glow;
    ctx.lineWidth = 6;
    ctx.stroke();
  }
};

const drawTargets = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const target of state.targets) {
    ctx.fillStyle = target.lit ? "#8affff" : "#2f5a90";
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

const drawSlings = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const sling of state.slings) {
    ctx.strokeStyle = sling.pulse > 0 ? "#7af5ff" : "#3c7bb6";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sling.line.a.x, sling.line.a.y);
    ctx.lineTo(sling.line.b.x, sling.line.b.y);
    ctx.stroke();
  }
};

const drawFlippers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const flipper of state.flippers) {
    const end = flipper.getEndPoint();
    ctx.strokeStyle = "#d8f2ff";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(flipper.pivot.x, flipper.pivot.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.fillStyle = "#72b7ff";
    ctx.beginPath();
    ctx.arc(flipper.pivot.x, flipper.pivot.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawBalls = (ctx: CanvasRenderingContext2D, state: GameState) => {
  for (const ball of state.balls) {
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(120,200,255,0.6)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};

const drawRamp = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const ramp = state.ramp;
  ctx.strokeStyle = ramp.lit ? "rgba(255, 220, 120, 0.9)" : "rgba(255,255,255,0.2)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(ramp.center.x, ramp.center.y, ramp.radius + 18, -Math.PI * 0.2, Math.PI * 1.2);
  ctx.stroke();
  ctx.fillStyle = ramp.lit ? "rgba(255, 215, 120, 0.3)" : "rgba(90,120,200,0.2)";
  ctx.beginPath();
  ctx.arc(ramp.center.x, ramp.center.y, ramp.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ramp.lit ? "#ffe4aa" : "#8fb4ff";
  ctx.font = "16px sans-serif";
  ctx.fillText("RAMP LOOP", ramp.center.x - 42, ramp.center.y + 5);
};

const drawHUD = (ctx: CanvasRenderingContext2D, state: GameState) => {
  ctx.fillStyle = "rgba(10,20,40,0.75)";
  ctx.fillRect(10, 10, 200, 90);
  ctx.fillStyle = "#e8f4ff";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Score: ${state.score}`, 20, 35);
  ctx.fillText(`Balls: ${state.getBallsRemainingDisplay()}`, 20, 55);
  ctx.fillText(`Mult: x${state.multiplier}`, 20, 75);
  ctx.fillText(state.mission, 20, 95);

  if (state.isTilted()) {
    ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
    ctx.font = "32px sans-serif";
    ctx.fillText("TILT", 250, 120);
  }

  if (state.lastMessage) {
    ctx.fillStyle = "#fff0b3";
    ctx.font = "22px sans-serif";
    ctx.fillText(state.lastMessage, 220, 80);
  }

  if (state.showHelp) {
    ctx.fillStyle = "rgba(10, 20, 40, 0.6)";
    ctx.fillRect(20, state.height - 120, state.width - 40, 100);
    ctx.fillStyle = "#b7d5ff";
    ctx.font = "14px sans-serif";
    ctx.fillText("Controls: Z/ShiftLeft = Left Flipper | / or ShiftRight = Right Flipper | Space = Plunger", 40, state.height - 90);
    ctx.fillText("Arrows = Nudge | Enter = Start/Restart | P = Pause | Esc = Menu | H = Help", 40, state.height - 70);
    ctx.fillText("D = Debug | M = Mute", 40, state.height - 50);
  }

  if (state.menuOpen) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "32px sans-serif";
    ctx.fillText("NEBULA CADET PINBALL", 120, 380);
    ctx.font = "20px sans-serif";
    ctx.fillText("Press Enter to Launch", 200, 420);
    if (state.gameOver) {
      ctx.fillText(`Final Score: ${state.score}`, 210, 460);
    }
  }
};

const drawDebug = (ctx: CanvasRenderingContext2D, state: GameState, info: RenderInfo) => {
  ctx.strokeStyle = "rgba(255,0,0,0.5)";
  ctx.lineWidth = 2;
  for (const wall of state.walls) {
    ctx.beginPath();
    ctx.moveTo(wall.line.a.x, wall.line.a.y);
    ctx.lineTo(wall.line.b.x, wall.line.b.y);
    ctx.stroke();
  }
  for (const bumper of state.bumpers) {
    ctx.beginPath();
    ctx.arc(bumper.position.x, bumper.position.y, bumper.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const target of state.targets) {
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(state.width - 160, 10, 150, 70);
  ctx.fillStyle = "#00ffcc";
  ctx.font = "12px monospace";
  ctx.fillText(`FPS: ${info.fps}`, state.width - 150, 30);
  ctx.fillText(`Balls: ${state.balls.length}`, state.width - 150, 45);
  ctx.fillText(`dt: ${(info.dt * 1000).toFixed(1)}ms`, state.width - 150, 60);
};
