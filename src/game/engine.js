// Three.js 2.5D Isometric Engine with Dreamy Pastel Aesthetics & Particle System
import * as THREE from 'three';

export class GameEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.quality = 'high'; // 'high' | 'low'
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.isTabActive = true;
    this.particles = null;
    this.cameraTarget = new THREE.Vector3(0, 0, 0);

    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.initParticles();
    this.initListeners();
  }

  initScene() {
    this.scene = new THREE.Scene();
    // Warm pastel sunset atmosphere
    this.scene.background = new THREE.Color(0xfde2d1);
    this.scene.fog = new THREE.FogExp2(0xfde2d1, 0.022);
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
    this.frustumSize = 13.5;

    this.camera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      250
    );

    // Isometric setup: 45 degree rotation, ~35 degree elevation
    this.isoDistance = 35;
    const rad45 = THREE.MathUtils.degToRad(45);
    const rad35 = THREE.MathUtils.degToRad(35.26);

    this.cameraOffset = new THREE.Vector3(
      this.isoDistance * Math.cos(rad45),
      this.isoDistance * Math.tan(rad35),
      this.isoDistance * Math.sin(rad45)
    );

    this.updateCameraPosition();
  }

  initLights() {
    // Gentle pastel ambient light
    this.ambientLight = new THREE.AmbientLight(0xfff3ea, 0.85);
    this.scene.add(this.ambientLight);

    // Warm pastel hemisphere light: pinkish sky, soft mint ground
    this.hemiLight = new THREE.HemisphereLight(0xfce7f3, 0xdcfce7, 0.6);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    // Warm sunset directional light with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfef08a, 1.1);
    this.sunLight.position.set(20, 32, 14);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 70;
    
    const d = 18;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.001;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  initParticles() {
    // Floating cherry blossom petals & gentle sparkles
    const count = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count * 3);
    this.particleData = [];

    const palette = [
      new THREE.Color(0xfbcfe8), // Soft pink
      new THREE.Color(0xfde047), // Soft gold sparkle
      new THREE.Color(0xf472b6), // Peach/blossom
      new THREE.Color(0xffffff)  // Sparkle white
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

    // Custom circular soft particle texture created with canvas
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
      size: 0.32,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending
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
      // Auto-downgrade if FPS is consistently low (< 28) and quality is high
      if (this.quality === 'high') {
        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        if (avgFps < 28) {
          console.warn('[Performance] FPS lower than 28, auto-switching quality to Low');
          this.setQuality('low');
          if (this.onQualityAutoChanged) this.onQualityAutoChanged('low');
        }
      }
    }
  }

  updateCameraPosition() {
    this.camera.position.copy(this.cameraTarget).add(this.cameraOffset);
    this.camera.lookAt(this.cameraTarget);
    if (this.sunLight) {
      this.sunLight.target.position.copy(this.cameraTarget);
    }
  }

  setCameraTarget(targetPos, lerpFactor = 0.08) {
    this.cameraTarget.lerp(targetPos, lerpFactor);
    this.updateCameraPosition();
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    const aspect = width / height;
    this.camera.left = (-this.frustumSize * aspect) / 2;
    this.camera.right = (this.frustumSize * aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = -this.frustumSize / 2;
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

      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }
}
