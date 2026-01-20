type KeyState = {
  down: boolean;
  pressed: boolean;
  released: boolean;
};

export class InputManager {
  private keys: Map<string, KeyState> = new Map();
  private boundDown: (event: KeyboardEvent) => void;
  private boundUp: (event: KeyboardEvent) => void;
  private preventKeys = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Space"
  ]);

  constructor() {
    this.boundDown = (event) => {
      if (this.preventKeys.has(event.code)) {
        event.preventDefault();
      }
      const state = this.keys.get(event.code) ?? { down: false, pressed: false, released: false };
      if (!state.down) {
        state.pressed = true;
      }
      state.down = true;
      this.keys.set(event.code, state);
    };

    this.boundUp = (event) => {
      if (this.preventKeys.has(event.code)) {
        event.preventDefault();
      }
      const state = this.keys.get(event.code) ?? { down: false, pressed: false, released: false };
      state.down = false;
      state.released = true;
      this.keys.set(event.code, state);
    };
  }

  attach() {
    window.addEventListener("keydown", this.boundDown);
    window.addEventListener("keyup", this.boundUp);
  }

  detach() {
    window.removeEventListener("keydown", this.boundDown);
    window.removeEventListener("keyup", this.boundUp);
  }

  isDown(code: string) {
    return this.keys.get(code)?.down ?? false;
  }

  wasPressed(code: string) {
    return this.keys.get(code)?.pressed ?? false;
  }

  wasReleased(code: string) {
    return this.keys.get(code)?.released ?? false;
  }

  clearFrame() {
    for (const state of this.keys.values()) {
      state.pressed = false;
      state.released = false;
    }
  }
}
