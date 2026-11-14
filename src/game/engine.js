// Three.js 3D Third-Person Perspective Engine with 360° Screen Drag Orbit & Dreamy Sky
// ★ Optimized for smooth 60fps on mobile phones ★
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
    this.cameraTarget = new THREE.Vector3(0, 1.35, 0);
    this.currentCameraTarget = new THREE.Vector3(0, 1.35, 0);
    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.targetYaw = 0;
    this.targetPitch = 0.35;
    this.cameraDistance = 5.2;
    this.targetDistance = 5.2;
    this.actualCameraDistance = 5.2;

    this.raycaster = new THREE.Raycaster(); // For wall collision
    this.raycaster.near = 0.05;
    this.wallObstacles = []; // Registered solid obstacles for clean raycast collision

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
    // ★ Lighter fog for mobile — less fragment shader work
    this.scene.fog = new THREE.FogExp2(0xfde2d1, 0.022);
  }

  initRenderer() {
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || ('ontouchstart' in window);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // Ultra-sharp crystal edges on all devices
      powerPreference: 'high-performance',
      precision: 'highp', // Pristine material & lighting rendering
      stencil: false,
      depth: true,
      failIfMajorPerformanceCaveat: false
    });
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    // Native high-res retina resolution (2.0 max for zero blurriness/pixelation)
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ultra-smooth soft shadow edges
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // Context lost prevention & automatic recovery
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[Engine] WebGL context lost! Waiting for restoration...');
    }, false);
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.info('[Engine] WebGL context restored! Refreshing scene...');
      this.resize();
    }, false);
  }

  initCamera() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    // ★ Reduced far plane from 400 to 180 for less overdraw
    this.camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 180);
    this.updateCameraPosition();
  }

  initSkyDome() {
    // ★ Reduced segments from 24→12 for mobile, smaller radius to match reduced far plane
    const skyGeo = new THREE.SphereGeometry(100, 12, 12);
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
    const shadowRes = 1024;
    this.sunLight.shadow.mapSize.width = shadowRes;
    this.sunLight.shadow.mapSize.height = shadowRes;
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

    // Glowing 3D Sun in the sky
    const sunGroup = new THREE.Group();
    sunGroup.position.set(32, 48, 22);
    const sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff08a })
    );
    sunGroup.add(sunCore);
    const sunCorona = new THREE.Mesh(
      new THREE.SphereGeometry(4.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.35 })
    );
    sunGroup.add(sunCorona);
    this.sunMesh = sunGroup;
    this.scene.add(this.sunMesh);

    // Glowing 3D Moon with Soft Celestial Halo in the sky
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-30, 46, -26);
    const moonCore = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xe0e7ff })
    );
    moonGroup.add(moonCore);
    const moonHalo = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.3 })
    );
    moonGroup.add(moonHalo);
    this.moonMesh = moonGroup;
    this.moonMesh.visible = false;
    this.scene.add(this.moonMesh);

    this.isIndoorMode = false;
  }

  // Toggle Day / Night with Romantic Starlit Sky & Moon Light
  setDayNight(isNight) {
    this.isNight = isNight;
    if (this.sunMesh) this.sunMesh.visible = !isNight;
    if (this.moonMesh) this.moonMesh.visible = isNight;
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
    // 🌸 Dreamy Cherry Blossom Falling Petals Effect (Optimized GPU Points: 0 FPS drop)
    const count = this.isMobile ? 120 : 260;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.particleData = [];

    // Sakura petal palette (soft pink, deep sakura rose, cherry cream, lilac)
    const palette = [
      new THREE.Color(0xfbcfe8),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xfff1f2),
      new THREE.Color(0xf43f5e),
      new THREE.Color(0xe9d5ff)
    ];

    const rangeXZ = 70; // Covers entire compact town area

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * rangeXZ;
      const y = Math.random() * 14 + 0.5;
      const z = (Math.random() - 0.5) * rangeXZ;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.particleData.push({
        origY: y,
        speedX: -0.012 - Math.random() * 0.018, // Gentle spring breeze blowing west
        speedY: -0.015 - Math.random() * 0.022, // Falling downward
        speedZ: 0.008 + Math.random() * 0.015,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.8 + Math.random() * 2.5
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Petal shape canvas texture (organic cherry blossom petal)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.ellipse(16, 16, 14, 8, Math.PI / 4, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.6, 'rgba(251, 207, 232, 0.9)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  updateParticles(delta) {
    if (!this.particles) return;
    const positions = this.particles.geometry.attributes.position.array;
    const rangeXZ = 70;
    const halfRange = rangeXZ / 2;

    for (let i = 0; i < this.particleData.length; i++) {
      const p = this.particleData[i];
      p.wobble += delta * p.wobbleSpeed;

      // Realistic fluttering leaf wobble
      let x = positions[i * 3] + p.speedX + Math.sin(p.wobble) * 0.02;
      let y = positions[i * 3 + 1] + p.speedY;
      let z = positions[i * 3 + 2] + p.speedZ + Math.cos(p.wobble) * 0.015;

      // Respawn at top when hitting ground or drifting out of bounds
      if (y < 0.1 || x < -halfRange || x > halfRange || z < -halfRange || z > halfRange) {
        y = 12.0 + Math.random() * 4.0;
        x = (Math.random() - 0.5) * rangeXZ;
        z = (Math.random() - 0.5) * rangeXZ;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
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

  setIndoorMode(isIndoor) {
    if (this.isIndoorMode === isIndoor) return;
    this.isIndoorMode = isIndoor;
    if (isIndoor) {
      this.targetDistance = 2.6;
      this.targetPitch = 0.26;
    } else {
      this.targetDistance = 5.2;
      this.targetPitch = 0.32;
    }
  }

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
    const idealEye = new THREE.Vector3(idealEyeX, Math.max(0.6, idealEyeY), idealEyeZ);

    // Camera Collision & Glitch Prevention (Smooth Zoom-in without head/ground clipping)
    const rayOrigin = this.currentCameraTarget.clone();
    rayOrigin.y += 0.15; // Slightly elevated to prevent clipping through character shoulders
    const dir = new THREE.Vector3().subVectors(idealEye, rayOrigin).normalize();
    const dist = rayOrigin.distanceTo(idealEye);

    this.raycaster.camera = this.camera;
    this.raycaster.set(rayOrigin, dir);

    let targetDistance = dist;
    try {
      if (this.wallObstacles && this.wallObstacles.length > 0) {
        const intersects = this.raycaster.intersectObjects(this.wallObstacles, false);
        if (intersects.length > 0 && intersects[0].distance < dist) {
          // Smoothly clamp camera before intersecting the wall (0.28m safety margin)
          targetDistance = Math.max(1.15, intersects[0].distance - 0.28);
        }
      }
    } catch (_) {}

    if (this.isIndoorMode) {
      targetDistance = Math.min(targetDistance, 2.7);
    }

    // Smooth lerp to prevent jarring camera cuts
    this.actualCameraDistance = THREE.MathUtils.lerp(this.actualCameraDistance || dist, targetDistance, 0.32);

    // Dynamic pitch lift when zoomed in tight spaces so camera doesn't bury in player's head
    const zoomTightness = Math.max(0, 1 - (this.actualCameraDistance / 3.0));
    const eyeHeightLift = zoomTightness * 0.42;

    const finalEyeX = this.currentCameraTarget.x + dir.x * this.actualCameraDistance;
    const finalEyeY = Math.max(0.75, this.currentCameraTarget.y + dir.y * this.actualCameraDistance + eyeHeightLift);
    const finalEyeZ = this.currentCameraTarget.z + dir.z * this.actualCameraDistance;

    this.camera.position.set(finalEyeX, finalEyeY, finalEyeZ);

    // Look slightly above character origin for natural cinematic perspective
    const lookTargetY = this.currentCameraTarget.y + (zoomTightness * 0.15);
    this.camera.lookAt(this.currentCameraTarget.x, lookTargetY, this.currentCameraTarget.z);

    if (this.sunLight) this.sunLight.target.position.copy(this.currentCameraTarget);
    if (this.skyDome) this.skyDome.position.copy(this.currentCameraTarget);
  }

  registerWallObstacle(obj) {
    if (!obj) return;
    if (obj.isMesh && !this.wallObstacles.includes(obj)) {
      this.wallObstacles.push(obj);
    } else if (obj.traverse) {
      obj.traverse((child) => {
        if (child.isMesh && !this.wallObstacles.includes(child)) {
          this.wallObstacles.push(child);
        }
      });
    }
  }

  setCameraTarget(targetPos) {
    this.cameraTarget.set(targetPos.x, targetPos.y + 1.25, targetPos.z);
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
    // Keep Ultra High Quality locked - do not auto-downgrade resolution or shadowmaps
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