import { Vec2, add, dot, len, normalize, scale, sub } from "./vector";

export type Line = { a: Vec2; b: Vec2; normal: Vec2 };

export const makeLine = (a: Vec2, b: Vec2): Line => {
  const edge = sub(b, a);
  const normal = normalize({ x: edge.y, y: -edge.x });
  return { a, b, normal };
};

export const closestPointOnSegment = (p: Vec2, a: Vec2, b: Vec2): Vec2 => {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab)));
  return add(a, scale(ab, t));
};

export const resolveCircleLine = (
  pos: Vec2,
  radius: number,
  velocity: Vec2,
  line: Line,
  restitution = 0.6
) => {
  const closest = closestPointOnSegment(pos, line.a, line.b);
  const toCenter = sub(pos, closest);
  const dist = len(toCenter);
  if (dist >= radius || dist === 0) {
    return { pos, velocity, hit: false };
  }
  const normal = normalize(toCenter);
  const penetration = radius - dist;
  const newPos = add(pos, scale(normal, penetration + 0.1));
  const vn = dot(velocity, normal);
  const newVel = vn < 0 ? sub(velocity, scale(normal, (1 + restitution) * vn)) : velocity;
  return { pos: newPos, velocity: newVel, hit: true, normal };
};

export const resolveCircleCircle = (
  pos: Vec2,
  radius: number,
  velocity: Vec2,
  center: Vec2,
  targetRadius: number,
  restitution = 0.9
) => {
  const diff = sub(pos, center);
  const dist = len(diff);
  const minDist = radius + targetRadius;
  if (dist >= minDist || dist === 0) {
    return { pos, velocity, hit: false };
  }
  const normal = normalize(diff);
  const newPos = add(center, scale(normal, minDist + 0.1));
  const vn = dot(velocity, normal);
  const newVel = vn < 0 ? sub(velocity, scale(normal, (1 + restitution) * vn)) : velocity;
  return { pos: newPos, velocity: newVel, hit: true, normal };
};
