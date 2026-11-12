// Cute Couple Retro Beach Buggy / Offroad Jeep Spot with 2 Seats (Driver + Passenger)
import * as THREE from 'three';

export class BuggySpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'buggy';
    this.driverUid = null;
    this.passengerUid = null;

    // Placed at South Main Street Scooter & Buggy Parking
    this.position = new THREE.Vector3(2, 0, 42);
    this.rotationY = 0;
    this.speed = 0;
    this.wheelRotation = 0;
    this.steerAngle = 0;

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Sweet Buggy Palette
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b }); // Vibrant Warm Gold
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Rubber tires / chassis
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const seatMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Cute couple pink seats
    const rollbarMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White roll cage
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0.7 });
    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Headlights

    // 1. Chunky Chassis & Body
    const bodyBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 2.6), yellowMat);
    bodyBase.position.set(0, 0.45, 0);
    bodyBase.castShadow = true;
    this.group.add(bodyBase);

    // Front Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 1.0), yellowMat);
    hood.position.set(0, 0.65, 0.75);
    hood.castShadow = true;
    this.group.add(hood);

    // Windshield
    const ws = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 0.06), glassMat);
    ws.position.set(0, 1.05, 0.25);
    ws.rotation.x = -0.22;
    this.group.add(ws);

    // Cute Headlights
    [-0.52, 0.52].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), lightGlowMat);
      hl.rotation.x = Math.PI / 2;
      hl.position.set(hx, 0.65, 1.28);
      this.group.add(hl);
    });

    // 2. Interior Couple Seats
    [-0.35, 0.35].forEach((sx) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.48), seatMat);
      seat.position.set(sx, 0.45, -0.25);
      this.group.add(seat);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.08), seatMat);
      seatBack.position.set(sx, 0.72, -0.48);
      this.group.add(seatBack);
    });

    // Steering wheel (Left side driver)
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), chromeMat);
    sw.position.set(-0.35, 0.88, 0.1);
    sw.rotation.x = -Math.PI / 3;
    this.group.add(sw);

    // 3. Tubular Roll Cage (Safari / Buggy top)
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
    [
      { x: -0.65, z: 0.15 }, { x: 0.65, z: 0.15 },
      { x: -0.65, z: -0.85 }, { x: 0.65, z: -0.85 }
    ].forEach(bp => {
      const bar = new THREE.Mesh(barGeo, rollbarMat);
      bar.position.set(bp.x, 1.15, bp.z);
      this.group.add(bar);
    });

    // Top bars
    const topBarL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), rollbarMat);
    topBarL.position.set(-0.65, 1.7, -0.35);
    this.group.add(topBarL);
    const topBarR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), rollbarMat);
    topBarR.position.set(0.65, 1.7, -0.35);
    this.group.add(topBarR);
    const topCross = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 0.08), rollbarMat);
    topCross.position.set(0, 1.7, -0.35);
    this.group.add(topCross);

    // 4. Chunky Offroad Wheels
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.29, 12);

    this.wheels = [];
    const wheelPositions = [
      { x: -0.85, y: 0.38, z: 0.85, isFront: true },
      { x: 0.85, y: 0.38, z: 0.85, isFront: true },
      { x: -0.85, y: 0.38, z: -0.75, isFront: false },
      { x: 0.85, y: 0.38, z: -0.75, isFront: false }
    ];

    wheelPositions.forEach(wp => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wp.x, wp.y, wp.z);

      const tire = new THREE.Mesh(tireGeo, blackMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      tire.add(rim);

      wGroup.add(tire);
      this.group.add(wGroup);

      this.wheels.push({ group: wGroup, tire, isFront: wp.isFront });
    });

    this.scene.add(this.group);
  }

  getDriverSeatWorldPos() {
    const local = new THREE.Vector3(-0.35, 0.45, -0.25);
    this.group.localToWorld(local);
    return local;
  }

  getPassengerSeatWorldPos() {
    const local = new THREE.Vector3(0.35, 0.45, -0.25);
    this.group.localToWorld(local);
    return local;
  }

  updateMovement(moveX, moveZ, delta) {
    const isMoving = Math.hypot(moveX, moveZ) > 0.1;
    const targetSpeed = isMoving ? 22.0 : 0;
    this.speed += (targetSpeed - this.speed) * Math.min(1, delta * 7.5);

    if (this.speed > 0.05) {
      const targetAngle = Math.atan2(moveX, moveZ);
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      this.steerAngle = Math.max(-0.45, Math.min(0.45, diff * 1.5));
      this.group.rotation.y += diff * Math.min(1, delta * 5.0);

      const fwdX = Math.sin(this.group.rotation.y);
      const fwdZ = Math.cos(this.group.rotation.y);

      const nextX = this.group.position.x + fwdX * this.speed * delta;
      const nextZ = this.group.position.z + fwdZ * this.speed * delta;

      if (!this.town.checkCollision(nextX, nextZ, 0.85)) {
        this.group.position.x = nextX;
        this.group.position.z = nextZ;
      }

      this.wheelRotation += this.speed * delta * 2.8;
      this.wheels.forEach(w => {
        w.tire.rotation.x = this.wheelRotation;
        if (w.isFront) {
          w.group.rotation.y = this.steerAngle;
        }
      });
    } else {
      this.steerAngle *= 0.85;
      this.wheels.forEach(w => {
        if (w.isFront) w.group.rotation.y = this.steerAngle;
      });
    }
  }

  setTransform(x, z, rotY) {
    this.group.position.x = x;
    this.group.position.z = z;
    this.group.rotation.y = rotY;
  }
}

