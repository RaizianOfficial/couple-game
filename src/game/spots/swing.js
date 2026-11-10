// Romantic Twin Wooden Swing Set Interactive Spot
import * as THREE from 'three';

export class SwingSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'swing';
    this.position = new THREE.Vector3(-14, 0, 10); // Placed in romantic waterfront park
    this.rotationY = 0; // Facing the open park/water

    this.seat1Uid = null;
    this.seat2Uid = null;
    this.swingPhase = 0;

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Cozy pastel timber materials
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x854d0e }); // Warm cedar
    const topCapMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const ropeMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // Sweet golden rope
    const seatMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Pastel pink wooden seat

    // 1. A-Frame Side Supports (Clean symmetrical wooden posts)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.09, 2.7, 8);
    // Left A-frame
    const legL1 = new THREE.Mesh(legGeo, woodMat);
    legL1.position.set(-1.45, 1.3, 0.55);
    legL1.rotation.x = 0.32;
    legL1.castShadow = true;
    this.group.add(legL1);

    const legL2 = new THREE.Mesh(legGeo, woodMat);
    legL2.position.set(-1.45, 1.3, -0.55);
    legL2.rotation.x = -0.32;
    legL2.castShadow = true;
    this.group.add(legL2);

    // Left A-frame crossbar
    const crossL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.8), woodMat);
    crossL.position.set(-1.45, 0.7, 0);
    crossL.castShadow = true;
    this.group.add(crossL);

    // Right A-frame
    const legR1 = new THREE.Mesh(legGeo, woodMat);
    legR1.position.set(1.45, 1.3, 0.55);
    legR1.rotation.x = 0.32;
    legR1.castShadow = true;
    this.group.add(legR1);

    const legR2 = new THREE.Mesh(legGeo, woodMat);
    legR2.position.set(1.45, 1.3, -0.55);
    legR2.rotation.x = -0.32;
    legR2.castShadow = true;
    this.group.add(legR2);

    // Right A-frame crossbar
    const crossR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.8), woodMat);
    crossR.position.set(1.45, 0.7, 0);
    crossR.castShadow = true;
    this.group.add(crossR);

    // Top Beam
    const beamGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.4, 8);
    const beam = new THREE.Mesh(beamGeo, woodMat);
    beam.position.set(0, 2.5, 0);
    beam.rotation.z = Math.PI / 2;
    beam.castShadow = true;
    this.group.add(beam);

    // Beam end caps
    [-1.7, 1.7].forEach(bx => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), topCapMat);
      cap.position.set(bx, 2.5, 0);
      this.group.add(cap);
    });

    // 2. Swings (Pivots at top beam y=2.45)
    // Swing 1 (Left Seat)
    this.swing1Pivot = new THREE.Group();
    this.swing1Pivot.position.set(-0.62, 2.45, 0);

    const ropeGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.9, 6);
    const rope1L = new THREE.Mesh(ropeGeo, ropeMat);
    rope1L.position.set(-0.24, -0.95, 0);
    this.swing1Pivot.add(rope1L);

    const rope1R = new THREE.Mesh(ropeGeo, ropeMat);
    rope1R.position.set(0.24, -0.95, 0);
    this.swing1Pivot.add(rope1R);

    const seatGeo = new THREE.BoxGeometry(0.56, 0.05, 0.26);
    const seat1 = new THREE.Mesh(seatGeo, seatMat);
    seat1.position.set(0, -1.9, 0);
    seat1.castShadow = true;
    this.swing1Pivot.add(seat1);
    this.group.add(this.swing1Pivot);

    // Swing 2 (Right Seat)
    this.swing2Pivot = new THREE.Group();
    this.swing2Pivot.position.set(0.62, 2.45, 0);

    const rope2L = new THREE.Mesh(ropeGeo, ropeMat);
    rope2L.position.set(-0.24, -0.95, 0);
    this.swing2Pivot.add(rope2L);

    const rope2R = new THREE.Mesh(ropeGeo, ropeMat);
    rope2R.position.set(0.24, -0.95, 0);
    this.swing2Pivot.add(rope2R);

    const seat2 = new THREE.Mesh(seatGeo, seatMat);
    seat2.position.set(0, -1.9, 0);
    seat2.castShadow = true;
    this.swing2Pivot.add(seat2);
    this.group.add(this.swing2Pivot);

    // Decorative fairy bunting above top beam
    const buntingGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const buntColors = [0xf472b6, 0x38bdf8, 0xfde047, 0xa78bfa, 0x4ade80];
    for (let i = 0; i < 9; i++) {
      const bMat = new THREE.MeshBasicMaterial({ color: buntColors[i % buntColors.length] });
      const b = new THREE.Mesh(buntingGeo, bMat);
      const bx = -1.2 + (i / 8) * 2.4;
      const by = 2.5 - Math.sin((i / 8) * Math.PI) * 0.15;
      b.position.set(bx, by, 0.05);
      this.group.add(b);
    }

    this.scene.add(this.group);

    // Colliders for the frame posts only (leaves path clear in front/back)
    if (this.town && this.town.colliders) {
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x - 1.6,
        maxX: this.position.x + 1.6,
        minZ: this.position.z - 0.4,
        maxZ: this.position.z + 0.4
      });
    }
  }

  update(delta) {
    this.swingPhase += delta * 1.8;
    // Gentle relaxing pendulum motion
    const angle1 = Math.sin(this.swingPhase) * 0.22;
    const angle2 = Math.sin(this.swingPhase + 0.7) * 0.22;

    this.swing1Pivot.rotation.x = angle1;
    this.swing2Pivot.rotation.x = angle2;
  }

  // Exact world position for attaching character butt on seat
  getSeat1WorldPos() {
    // Local offset on seat plank
    const localPos = new THREE.Vector3(0, -1.88, 0);
    this.swing1Pivot.localToWorld(localPos);
    return localPos;
  }

  getSeat2WorldPos() {
    const localPos = new THREE.Vector3(0, -1.88, 0);
    this.swing2Pivot.localToWorld(localPos);
    return localPos;
  }

  getSwing1Angle() {
    return this.swing1Pivot.rotation.x;
  }

  getSwing2Angle() {
    return this.swing2Pivot.rotation.x;
  }
}
