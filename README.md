# Nebula Cadet Pinball

A classic-inspired, original sci-fi pinball table built with **Next.js (App Router)** and HTML5 Canvas. The table uses lightweight 2D physics and faux-3D shading for a retro arcade feel.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a desktop browser.

## Controls

- **Left flipper:** `ShiftLeft` or `Z`
- **Right flipper:** `ShiftRight` or `/`
- **Plunger:** Hold `Space` to charge, release to launch
- **Nudge:** Arrow keys
- **Start/Restart:** `Enter`
- **Pause:** `P`
- **Menu overlay:** `Escape`
- **Help overlay:** `H`
- **Debug overlay:** `D`
- **Mute:** `M`

## Goals

- Hit all 5 rollovers to light the ramp.
- Shoot the ramp for bonus points and to build toward multiball.
- Keep your multiplier alive and avoid tilt (nudging too often disables flippers temporarily).

## Notes

All visuals and sounds are original, and audio is generated procedurally with WebAudio.
