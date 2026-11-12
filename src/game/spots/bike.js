// Cute Couple Retro Motorbike / Vespa Scooter Interactive Spot
import * as THREE from 'three';

export class BikeSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'bike';
    this.driverUid = null;
    this.passengerUid = null;

    this.position = new THREE.Vector3(8, 0, 6);
    this.rotationY = 0;
    this.speed = 0;
    this.wheelRotation = 0;
    this.tiltAngle = 0;

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Stylish pastel palette
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 }); // Dreamy sky turquoise
    const creamMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 }); // Vintage cream panel
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }); // Shiny chrome
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Rubber / tires
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x7c2d12 }); // Vintage brown leather
    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm headlight
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Tail light

    // 1. Wheels (Chunky retro scooter tires with chrome hubs)
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 16);
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.165, 12);

    // Front Wheel Assembly (steerable)
    this.frontFork = new THREE.Group();
    this.frontFork.position.set(0, 0.32, 0.85);

    this.frontWheel = new THREE.Mesh(tireGeo, darkMat);
    this.frontWheel.rotation.z = Math.PI / 2;
    this.frontWheel.castShadow = true;
    const frontRim = new THREE.Mesh(rimGeo, chromeMat);
    this.frontWheel.add(frontRim);
    this.frontFork.add(this.frontWheel);

    // Front Mudguard / Fender
    const fenderGeo = new THREE.SphereGeometry(0.35, 12, 10, 0, Math.PI, 0, Math.PI * 0.55);
    const frontFender = new THREE.Mesh(fenderGeo, bodyMat);
    frontFender.position.set(0, 0.04, 0);
    frontFender.rotation.x = -Math.PI / 2;
    this.frontFork.add(frontFender);

    this.group.add(this.frontFork);

    // Rear Wheel
    this.rearWheel = new THREE.Mesh(tireGeo, darkMat);
    this.rearWheel.position.set(0, 0.32, -0.85);
    this.rearWheel.rotation.z = Math.PI / 2;
    this.rearWheel.castShadow = true;
    const rearRim = new THREE.Mesh(rimGeo, chromeMat);
    this.rearWheel.add(rearRim);
    this.group.add(this.rearWheel);

    // 2. Main Scooter Chassis / Floorboard
    // Lower floorboard
    const floorGeo = new THREE.BoxGeometry(0.52, 0.1, 1.3);
    const floorboard = new THREE.Mesh(floorGeo, darkMat);
    floorboard.position.set(0, 0.22, 0);
    floorboard.receiveShadow = true;
    this.group.add(floorboard);

    // Front curved apron / leg shield
    const apronGeo = new THREE.BoxGeometry(0.64, 0.65, 0.08);
    const apron = new THREE.Mesh(apronGeo, bodyMat);
    apron.position.set(0, 0.62, 0.45);
    apron.rotation.x = -0.15;
    apron.castShadow = true;
    this.group.add(apron);

    // Cream center decorative trim on apron
    const trimGeo = new THREE.BoxGeometry(0.18, 0.58, 0.09);
    const trim = new THREE.Mesh(trimGeo, creamMat);
    trim.position.set(0, 0.62, 0.45);
    trim.rotation.x = -0.15;
    this.group.add(trim);

    // 3. Rear Body Shell (Bulbous retro Vespa style)
    const rearShellGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.95, 14);
    const rearShell = new THREE.Mesh(rearShellGeo, bodyMat);
    rearShell.position.set(0, 0.48, -0.45);
    rearShell.rotation.x = Math.PI / 2;
    rearShell.scale.set(0.85, 1, 0.6);
    rearShell.castShadow = true;
    this.group.add(rearShell);

    // Side Cream Cowls
    [-0.26, 0.26].forEach(cx => {
      const cowlGeo = new THREE.SphereGeometry(0.24, 10, 10);
      const cowl = new THREE.Mesh(cowlGeo, creamMat);
      cowl.position.set(cx, 0.46, -0.45);
      cowl.scale.set(0.4, 0.7, 1.2);
      cowl.castShadow = true;
      this.group.add(cowl);
    });

    // 4. Double Contoured Seat (Driver front, passenger slightly stepped up behind)
    const seatBaseGeo = new THREE.BoxGeometry(0.38, 0.12, 1.05);
    const doubleSeat = new THREE.Mesh(seatBaseGeo, seatMat);
    doubleSeat.position.set(0, 0.68, -0.32);
    doubleSeat.castShadow = true;
    this.group.add(doubleSeat);

    // Passenger Backrest
    const backrestGeo = new THREE.BoxGeometry(0.26, 0.18, 0.08);
    const backrest = new THREE.Mesh(backrestGeo, seatMat);
    backrest.position.set(0, 0.88, -0.82);
    backrest.castShadow = true;
    this.group.add(backrest);

    // Chrome Grab Rail / Luggage Rack behind seat
    const rackGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.38, 6);
    const rack = new THREE.Mesh(rackGeo, chromeMat);
    rack.position.set(0, 0.76, -0.84);
    rack.rotation.z = Math.PI / 2;
    this.group.add(rack);

    // 5. Handlebars & Headlight Assembly
    const steeringStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), chromeMat);
    steeringStem.position.set(0, 0.85, 0.52);
    steeringStem.rotation.x = -0.15;
    this.group.add(steeringStem);

    // Handlebar T-Bar
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.68, 8);
    const handlebar = new THREE.Mesh(barGeo, chromeMat);
    handlebar.position.set(0, 1.08, 0.48);
    handlebar.rotation.z = Math.PI / 2;
    this.group.add(handlebar);

    // Handlebar Grips
    [-0.32, 0.32].forEach(gx => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), darkMat);
      grip.position.set(gx, 1.08, 0.48);
      grip.rotation.z = Math.PI / 2;
      this.group.add(grip);
    });

    // Dual Round Chrome Side Mirrors
    [-0.3, 0.3].forEach(mx => {
      const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), chromeMat);
      mirrorStem.position.set(mx, 1.18, 0.48);
      const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), chromeMat);
      mirror.position.set(mx, 1.28, 0.46);
      mirror.rotation.x = Math.PI / 2;
      this.group.add(mirrorStem, mirror);
    });

    // Big Classic Round Headlight
    const lightHousing = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), chromeMat);
    lightHousing.position.set(0, 1.06, 0.58);
    const lightLens = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), lightGlowMat);
    lightLens.position.set(0, 1.06, 0.64);
    this.group.add(lightHousing, lightLens);

    // Red Tail Light
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), redLightMat);
    tailLight.position.set(0, 0.62, -0.92);
    this.group.add(tailLight);

    // Cute License Plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.02), creamMat);
    plate.position.set(0, 0.48, -0.93);
    this.group.add(plate);

    // Chrome Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.65, 8), chromeMat);
    exhaust.position.set(0.24, 0.26, -0.65);
    exhaust.rotation.x = Math.PI / 2;
    this.group.add(exhaust);

    this.scene.add(this.group);
  }

  // Exact driver seat world coordinates (character sits with hands on handlebars)
  getDriverSeatWorldPos() {
    const v = new THREE.Vector3(0, 0.72, 0.05);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }

  // Exact passenger seat world coordinates (sits directly behind driver holding on)
  getPassengerSeatWorldPos() {
    const v = new THREE.Vector3(0, 0.74, -0.52);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }

  updateMovement(driveInputX, driveInputZ, delta) {
    const isAccelerating = Math.abs(driveInputX) > 0.05 || Math.abs(driveInputZ) > 0.05;

    if (isAccelerating) {
      const targetAngle = Math.atan2(driveInputX, driveInputZ);

      // Smooth turning with banking tilt
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      this.group.rotation.y += diff * delta * 6;

      // Front fork steering angle
      this.frontFork.rotation.y = Math.max(-0.4, Math.min(0.4, diff * 0.8));

      // Scooter banking tilt
      const targetTilt = -diff * 0.35;
      this.tiltAngle += (targetTilt - this.tiltAngle) * 0.15;
      this.group.rotation.z = Math.max(-0.25, Math.min(0.25, this.tiltAngle));

      // Fast, exciting motorbike speed for driving around town
      const bikeSpeed = 17.5;
      const forwardX = Math.sin(this.group.rotation.y) * bikeSpeed * delta;
      const forwardZ = Math.cos(this.group.rotation.y) * bikeSpeed * delta;

      const newX = this.group.position.x + forwardX;
      const newZ = this.group.position.z + forwardZ;

      if (!this.town.checkCollision(newX, newZ, 0.7)) {
        this.group.position.x = newX;
        this.group.position.z = newZ;
      }

      // Spin wheels
      this.frontWheel.rotation.x += delta * 18;
      this.rearWheel.rotation.x += delta * 18;
      return true;
    } else {
      // Ease tilt back upright
      this.tiltAngle *= 0.85;
      this.group.rotation.z = this.tiltAngle;
      this.frontFork.rotation.y *= 0.85;
      return false;
    }
  }

  setTransform(x, z, rotY) {
    this.group.position.set(x, 0, z);
    this.group.rotation.y = rotY;
  }
}
