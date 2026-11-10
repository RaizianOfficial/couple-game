// Three.js 3D Third-Person Perspective Engine with 360° Screen Drag Orbit & Dreamy Sky
import * as THREE from 'three';

export class GameEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.quality = 'high';
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.isTabActive = true;
    this.particles = null;

    // 360° Orbit Camera properties (Third-Person / Chase Camera)
    this.cameraTarget = new THREE.Vector3(0, 1.2, 0);
    this.currentCameraTarget = new THREE.Vector3(0, 1.2, 0);
    this.cameraYaw = 0; // Horizontal orbit angle (radians)
    this.cameraPitch = 0.32; // Vertical elevation angle (radians)
    this.targetYaw = 0;
    this.targetPitch = 0.32;
    this.cameraDistance = 5.2; // Chase distance behind character
    this.targetDistance = 5.2;

    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initSkyDome();
    this.initLights();
    this.initParticles();
    this.initListeners();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfde2d1);
    this.scene.fog = new THREE.FogExp2(0xfde2d1, 0.018);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  initCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    // Perspective Camera for true 3D third-person view with 360° orbit
    this.camera = new THREE.PerspectiveCamera(56, aspect, 0.1, 350);
    this.updateCameraPosition();
  }

  initSkyDome() {
    // Dreamy 360° pastel sunset sky sphere
    const skyGeo = new THREE.SphereGeometry(140, 24, 24);
    // Invert geometry so inside of sphere is visible
    skyGeo.scale(-1, 1, 1);

    // Canvas gradient texture for pastel sunset
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 16;
    skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#c4b5fd');   // Soft lavender zenith
    grad.addColorStop(0.4, '#fbcfe8'); // Sweet pink upper sky
    grad.addColorStop(0.7, '#fed7aa'); // Warm sunset peach
    grad.addColorStop(0.95, '#fde68a'); // Golden glow near horizon
    grad.addColorStop(1, '#a7f3d0');   // Soft mint ground blend
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    // Low-poly cute distant decorative hills/clouds on horizon
    const hillMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8, flatShading: true });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = 42 + (Math.sin(i * 3) * 6);
      const hillGeo = new THREE.DodecahedronGeometry(8 + (i % 3) * 3, 1);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(Math.cos(angle) * r, -2 + (i % 2) * 2, Math.sin(angle) * r);
      this.scene.add(hill);
    }
  }

  initLights() {
    this.ambientLight = new THREE.AmbientLight(0xfff3ea, 0.9);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfce7f3, 0xdcfce7, 0.65);
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfef08a, 1.15);
    this.sunLight.position.set(24, 38, 18);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 90;
    
    const d = 22;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.001;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  initParticles() {
    const count = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.particleData = [];

    const palette = [
      new THREE.Color(0xfbcfe8),
      new THREE.Color(0xfde047),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = Math.random() * 8 + 0.5;
      const z = (Math.random() - 0.5) * 35;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.particleData.push({
        origY: y,
        speedX: -0.005 - Math.random() * 0.008,
        speedY: -0.004 - Math.random() * 0.006,
        speedZ: 0.003 + Math.random() * 0.005,
        wobble: Math.random() * Math.PI * 2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  updateParticles(delta) {
    if (!this.particles || this.quality === 'low') return;
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < this.particleData.length; i++) {
      const p = this.particleData[i];
      p.wobble += delta * 2;

      let x = positions[i * 3] + p.speedX + Math.sin(p.wobble) * 0.005;
      let y = positions[i * 3 + 1] + p.speedY;
      let z = positions[i * 3 + 2] + p.speedZ + Math.cos(p.wobble) * 0.005;

      if (y < 0.1 || x < -18 || z > 18) {
        y = 7.5 + Math.random() * 2;
        x = (Math.random() - 0.5) * 35;
        z = (Math.random() - 0.5) * 35;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  // 360° Drag & Touch Orbit Rotation API — FPS-style feel
  rotateCamera(deltaX, deltaY) {
    // Horizontal yaw — higher sensitivity (0.012) for snappy FPS feel
    this.targetYaw -= deltaX * 0.012;

    // Vertical pitch — natural elevation control
    this.targetPitch += deltaY * 0.007;
    // Clamp: 3° min (can't look straight up/under map), 72° max (over-shoulder)
    this.targetPitch = Math.max(0.05, Math.min(1.26, this.targetPitch));
  }

  zoomCamera(deltaDist) {
    this.targetDistance = Math.max(2.5, Math.min(10.0, this.targetDistance + deltaDist));
  }

  // Double-tap: snap camera behind character (like re-center in mobile games)
  resetCameraBehindCharacter() {
    if (this._characterFacing !== undefined) {
      // Snap yaw to character facing + π (behind)
      this.targetYaw = this._characterFacing + Math.PI;
    }
    this.targetPitch = 0.32;
    this.targetDistance = 5.2;
  }

  // Called by main.js to let engine know character facing direction
  setCharacterFacing(rotY) {
    this._characterFacing = rotY;
  }

  updateCameraPosition() {
    // Faster dampening for snappier FPS-like feel
    this.cameraYaw += (this.targetYaw - this.cameraYaw) * 0.22;
    this.cameraPitch += (this.targetPitch - this.cameraPitch) * 0.22;
    this.cameraDistance += (this.targetDistance - this.cameraDistance) * 0.18;

    // Camera target smoothly chases character (tighter follow than before)
    this.currentCameraTarget.lerp(this.cameraTarget, 0.16);

    // Calculate third-person camera eye position in spherical orbit
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    const eyeX = this.currentCameraTarget.x - (sinYaw * cosPitch * this.cameraDistance);
    const eyeY = this.currentCameraTarget.y + (sinPitch * this.cameraDistance);
    const eyeZ = this.currentCameraTarget.z - (cosYaw * cosPitch * this.cameraDistance);

    this.camera.position.set(eyeX, Math.max(0.5, eyeY), eyeZ);
    // Look slightly above target center so character head is in frame
    this.camera.lookAt(
      this.currentCameraTarget.x,
      this.currentCameraTarget.y + 0.25,
      this.currentCameraTarget.z
    );

    if (this.sunLight) {
      this.sunLight.target.position.copy(this.currentCameraTarget);
    }
    if (this.skyDome) {
      this.skyDome.position.copy(this.currentCameraTarget);
    }
  }

  setCameraTarget(targetPos) {
    this.cameraTarget.set(targetPos.x, targetPos.y + 0.9, targetPos.z);
    this.updateCameraPosition();
  }

  setQuality(mode) {
    this.quality = mode;
    if (mode === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
      if (this.particles) this.particles.visible = false;
      if (this.sunLight) this.sunLight.castShadow = false;
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (this.particles) this.particles.visible = true;
      if (this.sunLight) this.sunLight.castShadow = true;
    }
  }

  trackFps(frameDuration) {
    const currentFps = 1000 / Math.max(frameDuration, 1);
    this.fpsHistory.push(currentFps);
    if (this.fpsHistory.length > 120) {
      this.fpsHistory.shift();
      if (this.quality === 'high') {
        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        if (avgFps < 28) {
          this.setQuality('low');
        }
      }
    }
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  initListeners() {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.isTabActive = document.visibilityState !== 'hidden';
      this.lastFrameTime = performance.now();
    });
  }

  render(onTick) {
    const loop = (currentTime) => {
      requestAnimationFrame(loop);
      if (!this.isTabActive) return;

      const deltaMs = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      const deltaSec = Math.min(deltaMs / 1000, 0.1);

      this.trackFps(deltaMs);
      this.updateParticles(deltaSec);

      if (onTick) onTick(deltaSec);

      this.updateCameraPosition();
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }
}
