// Tandem / Couple Bike interactive spot
import * as THREE from 'three';

export class BikeSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'bike';
    this.driverUid = null;
    this.passengerUid = null;

    this.position = new THREE.Vector3(5.5, 0, 1.5);
    this.rotationY = Math.PI / 4;
    this.speed = 0;
    this.pedalAngle = 0;

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Dreamy turquoise & peach bicycle frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    // 1. Two Wheels (Torus)
    const wheelGeo = new THREE.TorusGeometry(0.32, 0.05, 8, 16);
    // Front wheel
    this.frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    this.frontWheel.position.set(0, 0.32, 0.95);
    this.frontWheel.rotation.y = Math.PI / 2;
    this.frontWheel.castShadow = true;
    this.group.add(this.frontWheel);

    // Back wheel
    this.backWheel = new THREE.Mesh(wheelGeo, tireMat);
    this.backWheel.position.set(0, 0.32, -0.95);
    this.backWheel.rotation.y = Math.PI / 2;
    this.backWheel.castShadow = true;
    this.group.add(this.backWheel);

    // 2. Tandem Extended Main Frame Tubes
    const tubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8);
    const mainBar = new THREE.Mesh(tubeGeo, frameMat);
    mainBar.position.set(0, 0.45, 0);
    mainBar.rotation.x = Math.PI / 2;
    mainBar.castShadow = true;
    this.group.add(mainBar);

    // 3. Driver Seat & Handlebars (Front)
    const seatGeo = new THREE.BoxGeometry(0.24, 0.06, 0.28);
    const driverSeat = new THREE.Mesh(seatGeo, seatMat);
    driverSeat.position.set(0, 0.62, 0.1);
    driverSeat.castShadow = true;
    this.group.add(driverSeat);

    const handlePost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), metalMat);
    handlePost.position.set(0, 0.72, 0.85);
    this.group.add(handlePost);

    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), metalMat);
    handlebar.position.set(0, 0.92, 0.85);
    handlebar.rotation.z = Math.PI / 2;
    this.group.add(handlebar);

    // Cute basket on handlebars with flowers
    const basketGeo = new THREE.BoxGeometry(0.3, 0.2, 0.22);
    const basketMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.set(0, 0.85, 1.05);
    basket.castShadow = true;
    this.group.add(basket);

    const flower1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    flower1.position.set(-0.06, 0.96, 1.05);
    const flower2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    flower2.position.set(0.06, 0.96, 1.05);
    this.group.add(flower1, flower2);

    // 4. Passenger Back Seat (Rear)
    const passengerSeat = new THREE.Mesh(seatGeo, seatMat);
    passengerSeat.position.set(0, 0.6, -0.65);
    passengerSeat.castShadow = true;
    this.group.add(passengerSeat);

    // Passenger hand rest
    const pHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), metalMat);
    pHandle.position.set(0, 0.75, -0.25);
    pHandle.rotation.z = Math.PI / 2;
    this.group.add(pHandle);

    this.scene.add(this.group);
  }

  // Get seat world positions for attaching characters
  getDriverSeatWorldPos() {
    const v = new THREE.Vector3(0, 0.45, 0.1);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }

  getPassengerSeatWorldPos() {
    const v = new THREE.Vector3(0, 0.45, -0.65);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }

  updateMovement(driveInputX, driveInputZ, delta) {
    if (Math.abs(driveInputX) > 0.05 || Math.abs(driveInputZ) > 0.05) {
      const targetAngle = Math.atan2(driveInputX, driveInputZ);
      
      // Smooth rotation
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * delta * 7;

      // Move forward along bike direction (speed capped for cute relaxing ride)
      const bikeSpeed = 3.8;
      const forwardX = Math.sin(this.group.rotation.y) * bikeSpeed * delta;
      const forwardZ = Math.cos(this.group.rotation.y) * bikeSpeed * delta;

      const newX = this.group.position.x + forwardX;
      const newZ = this.group.position.z + forwardZ;

      if (!this.town.checkCollision(newX, newZ, 0.6)) {
        this.group.position.x = newX;
        this.group.position.z = newZ;
      }

      // Spin wheels
      this.frontWheel.rotation.x += delta * 12;
      this.backWheel.rotation.x += delta * 12;
      return true;
    }
    return false;
  }

  setTransform(x, z, rotY) {
    this.group.position.set(x, 0, z);
    this.group.rotation.y = rotY;
  }
}
