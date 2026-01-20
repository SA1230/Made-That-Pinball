"use client";

import { useEffect, useRef, useState } from "react";
import { FixedLoop } from "../game/engine/loop";
import { InputManager } from "../game/engine/input";
import { AudioManager } from "../game/engine/audio";
import { GameState } from "../game/state";
import { renderGame } from "../game/render/draw";

const BASE_WIDTH = 600;
const BASE_HEIGHT = 900;

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const input = new InputManager();
    input.attach();
    const audio = new AudioManager();
    const state = new GameState();
    const loop = new FixedLoop();

    const resize = () => {
      const ratio = BASE_WIDTH / BASE_HEIGHT;
      const width = window.innerWidth - 40;
      const height = window.innerHeight - 140;
      let canvasWidth = width;
      let canvasHeight = width / ratio;
      if (canvasHeight > height) {
        canvasHeight = height;
        canvasWidth = height * ratio;
      }
      canvas.width = Math.max(320, Math.floor(canvasWidth));
      canvas.height = Math.max(480, Math.floor(canvasHeight));
    };

    const onPointer = () => {
      audio.ensure();
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointer);

    let lastDt = 1 / 60;
    loop.start({
      update: (dt) => {
        lastDt = dt;
        state.update(dt, input, audio);
        if (audio.isMuted() !== mutedRef.current) {
          mutedRef.current = audio.isMuted();
          setMuted(audio.isMuted());
        }
        input.clearFrame();
      },
      render: () => {
        const scale = Math.min(canvas.width / BASE_WIDTH, canvas.height / BASE_HEIGHT);
        renderGame(ctx, state, {
          width: canvas.width,
          height: canvas.height,
          scale,
          shake: 0,
          fps: loop.getFps(),
          dt: lastDt
        });
      }
    });

    return () => {
      loop.stop();
      input.detach();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <main>
      <div className="canvas-shell">
        <canvas ref={canvasRef} aria-label="Nebula Cadet Pinball"></canvas>
      </div>
      <div className="hud">
        <strong>Nebula Cadet Pinball</strong> — Desktop only. Click the table once to enable sound.
        {muted ? " (Muted)" : ""}
      </div>
    </main>
  );
}
