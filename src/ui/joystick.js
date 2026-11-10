// Virtual Analog Touch Joystick with Dynamic Camera Angle Compensation & Keyboard Support

export class VirtualJoystick {
  constructor(containerEl) {
    this.container = containerEl;
    this.isActive = false;
    this.touchId = null;

    // Raw inputs between -1 and 1
    this.inputX = 0; // -1 (left) to +1 (right)
    this.inputY = 0; // -1 (down) to +1 (up/forward)

    this.deadZone = 0.15;
    this.radius = 48;

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
    this.base.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.isActive = true;
      this.touchId = e.pointerId;
      this.base.setPointerCapture(e.pointerId);
      this.handlePointer(e);
    });

    this.base.addEventListener('pointermove', (e) => {
      if (!this.isActive || e.pointerId !== this.touchId) return;
      e.stopPropagation();
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

    // Desktop Keyboard controls (WASD / Arrows)
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
      this.inputY = -Math.sin(angle) * scaledDist; // UP is positive
    }
  }

  resetStick() {
    this.thumb.style.transform = 'translate(0px, 0px)';
    if (!this.hasActiveKey()) {
      this.inputX = 0;
      this.inputY = 0;
    }
  }

  hasActiveKey() {
    return this.keys.up || this.keys.down || this.keys.left || this.keys.right;
  }

  updateKeyboardInput() {
    if (this.isActive) return;

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
  }

  // Calculate world movement relative to current camera yaw angle
  getMovement(cameraYaw = 0) {
    const isMoving = Math.abs(this.inputX) > 0.05 || Math.abs(this.inputY) > 0.05;

    if (!isMoving) {
      return { x: 0, z: 0, rawX: 0, rawY: 0, isMoving: false };
    }

    // Camera forward vector along ground plane (Y=0)
    const sinYaw = Math.sin(cameraYaw);
    const cosYaw = Math.cos(cameraYaw);

    const forwardX = sinYaw;
    const forwardZ = cosYaw;

    const rightX = cosYaw;
    const rightZ = -sinYaw;

    const moveX = (forwardX * this.inputY) + (rightX * this.inputX);
    const moveZ = (forwardZ * this.inputY) + (rightZ * this.inputX);

    return {
      x: moveX,
      z: moveZ,
      rawX: this.inputX,
      rawY: this.inputY,
      isMoving: true
    };
  }
}
