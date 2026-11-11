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
    this.isNight = false;

    // 360° Orbit Camera properties (Third-Person / Chase Camera)
    this.cameraTarget = new THREE.Vector3(0, 1.2, 0);
    this.currentCameraTarget = new THREE.Vector3(0, 1.2, 0);
    this.cameraYaw = 0;
    this.cameraPitch = 0.32;
    this.targetYaw = 0;
    this.targetPitch = 0.32;
    this.cameraDistance = 5.2;
    this.targetDistance = 5.2;

    this.raycaster = new THREE.Raycaster(); // For wall collision

    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initSkyDome();
    this.initLights();
    this.initParticles();
    this.initListeners();

    // Fallback resize triggers for blank screen bug
    setTimeout(() => this.resize(), 100);
    setTimeout(() => this.resize(), 500);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfde2d1);
    this.scene.fog = new THREE.FogExp2(0xfde2d1, 0.018);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  initCamera() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(56, w / h, 0.1, 350);
    this.updateCameraPosition();
  }

  initSkyDome() {
    const skyGeo = new THREE.SphereGeometry(140, 24, 24);
    skyGeo.scale(-1, 1, 1);
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 16;
    skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#c4b5fd');
    grad.addColorStop(0.4, '#fbcfe8');
    grad.addColorStop(0.7, '#fed7aa');
    grad.addColorStop(0.95, '#fde68a');
    grad.addColorStop(1, '#a7f3d0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
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

  // Toggle Day / Night with Romantic Starlit Sky & Moon Light
  setDayNight(isNight) {
    this.isNight = isNight;
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 16;
    skyCanvas.height = 256;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);

    if (isNight) {
      // Midnight romantic deep navy & purple starry palette
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.35, '#0f172a');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(0.95, '#312e81');
      grad.addColorStop(1, '#1e293b');

      this.scene.background.setHex(0x0f172a);
      this.scene.fog.color.setHex(0x0f172a);
      this.ambientLight.color.setHex(0x6366f1);
      this.ambientLight.intensity = 0.35;
      this.hemiLight.color.setHex(0x38bdf8);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.hemiLight.intensity = 0.4;
      this.sunLight.color.setHex(0x93c5fd); // Cool silvery Moon Light
      this.sunLight.intensity = 0.75;
    } else {
      // Sweet Pastel Sunset
      grad.addColorStop(0, '#c4b5fd');
      grad.addColorStop(0.4, '#fbcfe8');
      grad.addColorStop(0.7, '#fed7aa');
      grad.addColorStop(0.95, '#fde68a');
      grad.addColorStop(1, '#a7f3d0');

      this.scene.background.setHex(0xfde2d1);
      this.scene.fog.color.setHex(0xfde2d1);
      this.ambientLight.color.setHex(0xfff3ea);
      this.ambientLight.intensity = 0.9;
      this.hemiLight.color.setHex(0xfce7f3);
      this.hemiLight.groundColor.setHex(0xdcfce7);
      this.hemiLight.intensity = 0.65;
      this.sunLight.color.setHex(0xfef08a);
      this.sunLight.intensity = 1.15;
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);
    if (this.skyDome && this.skyDome.material.map) {
      this.skyDome.material.map.dispose();
      this.skyDome.material.map = new THREE.CanvasTexture(skyCanvas);
      this.skyDome.material.needsUpdate = true;
    }
  }

  initParticles() {
    const count = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.particleData = [];
    const palette = [new THREE.Color(0xfbcfe8), new THREE.Color(0xfde047), new THREE.Color(0xf472b6), new THREE.Color(0xffffff)];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = Math.random() * 8 + 0.5;
      const z = (Math.random() - 0.5) * 35;
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
      this.particleData.push({ origY: y, speedX: -0.005 - Math.random() * 0.008, speedY: -0.004 - Math.random() * 0.006, speedZ: 0.003 + Math.random() * 0.005, wobble: Math.random() * Math.PI * 2 });
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(16, 16, 15, 0, Math.PI * 2); ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({ size: 0.35, map: texture, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false });
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
        y = 7.5 + Math.random() * 2; x = (Math.random() - 0.5) * 35; z = (Math.random() - 0.5) * 35;
      }
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  rotateCamera(deltaX, deltaY) {
    this.targetYaw -= deltaX * 0.012;
    this.targetPitch += deltaY * 0.007;
    this.targetPitch = Math.max(0.05, Math.min(1.26, this.targetPitch));
  }

  zoomCamera(deltaDist) {
    this.targetDistance = Math.max(2.5, Math.min(10.0, this.targetDistance + deltaDist));
  }

  resetCameraBehindCharacter() {
    if (this._characterFacing !== undefined) this.targetYaw = this._characterFacing + Math.PI;
    this.targetPitch = 0.32;
    this.targetDistance = 5.2;
  }

  setCharacterFacing(rotY) { this._characterFacing = rotY; }

  getCameraVectors() {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0; right.normalize();
    return { forward, right };
  }

  updateCameraPosition() {
    this.cameraYaw += (this.targetYaw - this.cameraYaw) * 0.22;
    this.cameraPitch += (this.targetPitch - this.cameraPitch) * 0.22;
    this.cameraDistance += (this.targetDistance - this.cameraDistance) * 0.18;
    this.currentCameraTarget.lerp(this.cameraTarget, 0.16);

    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    const idealEyeX = this.currentCameraTarget.x - (sinYaw * cosPitch * this.cameraDistance);
    const idealEyeY = this.currentCameraTarget.y + (sinPitch * this.cameraDistance);
    const idealEyeZ = this.currentCameraTarget.z - (cosYaw * cosPitch * this.cameraDistance);
    const idealEye = new THREE.Vector3(idealEyeX, Math.max(0.5, idealEyeY), idealEyeZ);

    // 🚀 NEW: Wall Collision Glitch Fix
    const dir = new THREE.Vector3().subVectors(idealEye, this.currentCameraTarget).normalize();
    const dist = this.currentCameraTarget.distanceTo(idealEye);

    // Provide camera to raycaster so Sprite objects don't throw warnings/errors
    this.raycaster.camera = this.camera;
    this.raycaster.set(this.currentCameraTarget, dir);

    // Check collision against non-transparent meshes (walls, buildings)
    let finalDistance = dist;
    try {
      const candidates = [];
      this.scene.traverse((obj) => {
        if (obj.isMesh && obj !== this.skyDome && obj !== this.particles) {
          if (!obj.material || !obj.material.transparent) {
            // Exclude character meshes
            let p = obj;
            let isChar = false;
            while (p) {
              if (p.name === 'character') { isChar = true; break; }
              p = p.parent;
            }
            if (!isChar) candidates.push(obj);
          }
        }
      });

      const intersects = this.raycaster.intersectObjects(candidates, false);
      if (intersects.length > 0 && intersects[0].distance < dist) {
        finalDistance = Math.max(0.8, intersects[0].distance - 0.2);
      }
    } catch (_) {}

    const finalEyeX = this.currentCameraTarget.x + dir.x * finalDistance;
    const finalEyeY = this.currentCameraTarget.y + dir.y * finalDistance;
    const finalEyeZ = this.currentCameraTarget.z + dir.z * finalDistance;

    this.camera.position.set(finalEyeX, Math.max(0.5, finalEyeY), finalEyeZ);
    this.camera.lookAt(this.currentCameraTarget.x, this.currentCameraTarget.y + 0.25, this.currentCameraTarget.z);

    if (this.sunLight) this.sunLight.target.position.copy(this.currentCameraTarget);
    if (this.skyDome) this.skyDome.position.copy(this.currentCameraTarget);
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
        if (avgFps < 28) this.setQuality('low');
      }
    }
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
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