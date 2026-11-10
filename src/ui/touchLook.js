// 360° Touch Drag, Pinch-Zoom & Mouse Look Controller for FPS-style Third-Person Camera

export class TouchLookController {
  constructor(containerEl, engine) {
    this.container = containerEl;
    this.engine = engine;

    // Single-finger drag (look / orbit)
    this.lookPointerId = null;
    this.lastX = 0;
    this.lastY = 0;

    // Two-finger pinch (zoom)
    this.pinchPointerId = null;
    this.pinchLastDist = 0;

    // Velocity for inertia
    this.velX = 0;
    this.velY = 0;
    this.inertiaDamping = 0.88;
    this._hintDismissed = false;

    this.initEvents();
    this.applyInertia();
  }

  _isUITarget(el) {
    return !!(
      el.closest('button') ||
      el.closest('input') ||
      el.closest('.joystick-base') ||
      el.closest('.modal-card') ||
      el.closest('.games-menu-card') ||
      el.closest('.emoji-tray') ||
      el.closest('.screen:not(.hidden)') ||
      el.closest('.pwa-banner:not(.hidden)')
    );
  }

  _dismissHint() {
    if (this._hintDismissed) return;
    this._hintDismissed = true;
    const hint = document.getElementById('camera-hint');
    if (hint) {
      hint.style.opacity = '0';
      setTimeout(() => hint.classList.add('hidden'), 500);
    }
  }

  initEvents() {
    // ---- POINTER DOWN ----
    window.addEventListener('pointerdown', (e) => {
      if (this._isUITarget(e.target)) return;

      // First free pointer → look drag
      if (this.lookPointerId === null) {
        this.lookPointerId = e.pointerId;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velX = 0;
        this.velY = 0;
        this._dismissHint();
      } else if (this.pinchPointerId === null) {
        // Second pointer → start pinch zoom
        this.pinchPointerId = e.pointerId;
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.pinchLastDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    // ---- POINTER MOVE ----
    window.addEventListener('pointermove', (e) => {
      // Two-finger pinch zoom
      if (this.pinchPointerId !== null) {
        if (e.pointerId === this.pinchPointerId || e.pointerId === this.lookPointerId) {
          // Recalculate pinch distance using stored positions
          if (e.pointerId === this.pinchPointerId) {
            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;
            const dist = Math.hypot(dx, dy);
            const delta = this.pinchLastDist - dist;
            this.engine.zoomCamera(delta * 0.018);
            this.pinchLastDist = dist;
          }
          return;
        }
      }

      // Single-finger look
      if (e.pointerId !== this.lookPointerId) return;

      const dX = e.clientX - this.lastX;
      const dY = e.clientY - this.lastY;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      // Accumulate velocity for inertia
      this.velX = dX;
      this.velY = dY;

      // Higher sensitivity for FPS feel (0.0045 horizontal, 0.003 vertical)
      this.engine.rotateCamera(dX, dY);
    }, { passive: true });

    // ---- POINTER UP / CANCEL ----
    const endPointer = (e) => {
      if (e.pointerId === this.lookPointerId) {
        this.lookPointerId = null;
        // Keep velX/velY for inertia coast
      }
      if (e.pointerId === this.pinchPointerId) {
        this.pinchPointerId = null;
      }
    };
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);

    // ---- MOUSE WHEEL ZOOM (desktop) ----
    window.addEventListener('wheel', (e) => {
      this.engine.zoomCamera(e.deltaY * 0.006);
    }, { passive: true });

    // ---- DOUBLE TAP → reset camera behind character ----
    let lastTap = 0;
    window.addEventListener('touchend', (e) => {
      if (this._isUITarget(e.target)) return;
      const now = Date.now();
      if (now - lastTap < 280 && e.changedTouches.length === 1) {
        this.engine.resetCameraBehindCharacter();
      }
      lastTap = now;
    }, { passive: true });
  }

  // Smooth inertia coast after finger lift
  applyInertia() {
    const tick = () => {
      if (this.lookPointerId === null && (Math.abs(this.velX) > 0.3 || Math.abs(this.velY) > 0.3)) {
        this.engine.rotateCamera(this.velX * 0.4, this.velY * 0.4);
        this.velX *= this.inertiaDamping;
        this.velY *= this.inertiaDamping;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
