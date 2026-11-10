// Analog Virtual Touch Joystick with Dead Zone & Keyboard Support (WASD / Arrows)
// Translates 2D screen input relative to the 45-degree isometric camera

export class VirtualJoystick {
  constructor(containerEl) {
    this.container = containerEl;
    this.isActive = false;
    this.touchId = null;

    // Joystick values between -1 and 1
    this.inputX = 0; // -1 (left) to +1 (right)
    this.inputY = 0; // -1 (down) to +1 (up/forward)

    // Camera relative output
    this.worldMoveX = 0;
    this.worldMoveZ = 0;

    this.deadZone = 0.15;
    this.radius = 48; // Joystick base radius

    // Keyboard state
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.buildDOM();
    this.initEvents();
  }

  buildDOM() {
    this.base = document.createElement('div');
    this.base.className = 'joystick-base';

    this.thumb = document.createElement('div');
    this.thumb.className = 'joystick-thumb';

    this.base.appendChild(this.thumb);
    this.container.appendChild(this.base);
  }

  initEvents() {
    // Touch & Pointer events for virtual joystick
    this.base.addEventListener('pointerdown', (e) => {
      this.isActive = true;
      this.touchId = e.pointerId;
      this.base.setPointerCapture(e.pointerId);
      this.handlePointer(e);
    });

    this.base.addEventListener('pointermove', (e) => {
      if (!this.isActive || e.pointerId !== this.touchId) return;
      this.handlePointer(e);
    });

    const endPointer = (e) => {
      if (e.pointerId === this.touchId) {
        this.isActive = false;
        this.touchId = null;
        this.resetStick();
      }
    };

    this.base.addEventListener('pointerup', endPointer);
    this.base.addEventListener('pointercancel', endPointer);

    // Keyboard controls for desktop
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      this.updateKeyboardInput();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      this.updateKeyboardInput();
    });
  }

  handlePointer(e) {
    const rect = this.base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, this.radius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    this.thumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

    const normDist = clampedDist / this.radius;
    if (normDist < this.deadZone) {
      this.inputX = 0;
      this.inputY = 0;
    } else {
      const scaledDist = (normDist - this.deadZone) / (1 - this.deadZone);
      this.inputX = Math.cos(angle) * scaledDist;
      this.inputY = -Math.sin(angle) * scaledDist; // Invert so UP is positive
    }

    this.calculateWorldVector();
  }

  resetStick() {
    this.thumb.style.transform = 'translate(0px, 0px)';
    if (!this.hasActiveKey()) {
      this.inputX = 0;
      this.inputY = 0;
      this.worldMoveX = 0;
      this.worldMoveZ = 0;
    }
  }

  hasActiveKey() {
    return this.keys.up || this.keys.down || this.keys.left || this.keys.right;
  }

  updateKeyboardInput() {
    if (this.isActive) return; // Touch takes priority if actively used

    let kx = 0;
    let ky = 0;
    if (this.keys.right) kx += 1;
    if (this.keys.left) kx -= 1;
    if (this.keys.up) ky += 1;
    if (this.keys.down) ky -= 1;

    const len = Math.hypot(kx, ky);
    if (len > 0) {
      this.inputX = kx / len;
      this.inputY = ky / len;
    } else {
      this.inputX = 0;
      this.inputY = 0;
    }

    this.calculateWorldVector();
  }

  calculateWorldVector() {
    // 45 degree isometric camera projection
    // Camera is placed at (+X, +Y, +Z) looking at (0, 0, 0)
    // Up on screen -> (-X, -Z)
    // Down on screen -> (+X, +Z)
    // Right on screen -> (+X, -Z)
    // Left on screen -> (-X, +Z)
    const cos45 = 0.707106;
    const sin45 = 0.707106;

    const screenRight = this.inputX;
    const screenForward = this.inputY;

    this.worldMoveX = (screenRight - screenForward) * cos45;
    this.worldMoveZ = (-screenRight - screenForward) * sin45;
  }

  getMovement() {
    return {
      x: this.worldMoveX,
      z: this.worldMoveZ,
      rawX: this.inputX,
      rawY: this.inputY,
      isMoving: Math.abs(this.inputX) > 0.05 || Math.abs(this.inputY) > 0.05
    };
  }
}
