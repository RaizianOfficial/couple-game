// Romantic Twin Swing Set Interactive Spot
import * as THREE from 'three';

export class SwingSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'swing';
    this.position = new THREE.Vector3(-5.5, 0, 4.5);
    this.rotationY = -Math.PI / 4;

    this.seat1Uid = null;
    this.seat2Uid = null;
    this.swingPhase = 0;

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Materials
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Chestnut wood frame
    const chainMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const seatMat = new THREE.MeshLambertMaterial({ color: 0xfb923c });

    // 1. A-Frame Side Supports
    const legGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8);
    // Left A-frame
    const legL1 = new THREE.Mesh(legGeo, woodMat);
    legL1.position.set(-1.8, 1.5, 0.6);
    legL1.rotation.x = 0.35;
    legL1.castShadow = true;
    this.group.add(legL1);

    const legL2 = new THREE.Mesh(legGeo, woodMat);
    legL2.position.set(-1.8, 1.5, -0.6);
    legL2.rotation.x = -0.35;
    legL2.castShadow = true;
    this.group.add(legL2);

    // Right A-frame
    const legR1 = new THREE.Mesh(legGeo, woodMat);
    legR1.position.set(1.8, 1.5, 0.6);
    legR1.rotation.x = 0.35;
    legR1.castShadow = true;
    this.group.add(legR1);

    const legR2 = new THREE.Mesh(legGeo, woodMat);
    legR2.position.set(1.8, 1.5, -0.6);
    legR2.rotation.x = -0.35;
    legR2.castShadow = true;
    this.group.add(legR2);

    // Top Crossbeam
    const beamGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.0, 8);
    const beam = new THREE.Mesh(beamGeo, woodMat);
    beam.position.set(0, 2.9, 0);
    beam.rotation.z = Math.PI / 2;
    beam.castShadow = true;
    this.group.add(beam);

    // 2. Swings (Pivots at top beam y=2.9)
    // Swing 1 (Left Seat)
    this.swing1Pivot = new THREE.Group();
    this.swing1Pivot.position.set(-0.75, 2.85, 0);

    const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.1, 6);
    const chain1L = new THREE.Mesh(chainGeo, chainMat);
    chain1L.position.set(-0.25, -1.05, 0);
    this.swing1Pivot.add(chain1L);
    const chain1R = new THREE.Mesh(chainGeo, chainMat);
    chain1R.position.set(0.25, -1.05, 0);
    this.swing1Pivot.add(chain1R);

    const seatGeo = new THREE.BoxGeometry(0.65, 0.06, 0.3);
    const seat1 = new THREE.Mesh(seatGeo, seatMat);
    seat1.position.set(0, -2.1, 0);
    seat1.castShadow = true;
    this.swing1Pivot.add(seat1);
    this.group.add(this.swing1Pivot);

    // Swing 2 (Right Seat)
    this.swing2Pivot = new THREE.Group();
    this.swing2Pivot.position.set(0.75, 2.85, 0);

    const chain2L = new THREE.Mesh(chainGeo, chainMat);
    chain2L.position.set(-0.25, -1.05, 0);
    this.swing2Pivot.add(chain2L);
    const chain2R = new THREE.Mesh(chainGeo, chainMat);
    chain2R.position.set(0.25, -1.05, 0);
    this.swing2Pivot.add(chain2R);

    const seat2 = new THREE.Mesh(seatGeo, seatMat);
    seat2.position.set(0, -2.1, 0);
    seat2.castShadow = true;
    this.swing2Pivot.add(seat2);
    this.group.add(this.swing2Pivot);

    this.scene.add(this.group);

    // Collider for the frame
    this.town.colliders.push({
      type: 'box',
      minX: this.position.x - 1.6,
      maxX: this.position.x + 1.6,
      minZ: this.position.z - 0.8,
      maxZ: this.position.z + 0.8
    });
  }

  update(delta) {
    this.swingPhase += delta * 2.2;
    // Gentle natural pendulum swing
    const angle1 = Math.sin(this.swingPhase) * 0.28;
    const angle2 = Math.sin(this.swingPhase + 0.4) * 0.28;

    this.swing1Pivot.rotation.x = angle1;
    this.swing2Pivot.rotation.x = angle2;
  }

  getSeat1WorldPos() {
    const v = new THREE.Vector3(0, -2.0, 0);
    this.swing1Pivot.localToWorld(v);
    return v;
  }

  getSeat2WorldPos() {
    const v = new THREE.Vector3(0, -2.0, 0);
    this.swing2Pivot.localToWorld(v);
    return v;
  }
}
