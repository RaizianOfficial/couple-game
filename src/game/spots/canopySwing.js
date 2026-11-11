// Romantic Park Bench Canopy Swing (Garden Pergola Double Swing for 2 Players)
import * as THREE from 'three';

export class ParkCanopySwingSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'canopySwing';

    // Positioned near riverfront / gazebo scenic park
    this.position = new THREE.Vector3(28, 0, 18);
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
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Rich timber
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Romantic pink fabric roof
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }); // Soft cushion
    const chainMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 }); // Metal chain
    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xfde047 }); // Vines / flowers

    // 1. Stone platform base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.12, 16), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
    base.position.y = 0.06;
    base.receiveShadow = true;
    this.group.add(base);

    // 2. Pergola 4 corner posts
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.7, 8);
    const postCoords = [
      { x: -1.4, z: 0.7 }, { x: 1.4, z: 0.7 },
      { x: -1.4, z: -0.7 }, { x: 1.4, z: -0.7 }
    ];
    postCoords.forEach(p => {
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(p.x, 1.35, p.z);
      post.castShadow = true;
      this.group.add(post);
    });

    // Top cross beams
    const beamF = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 0.12), woodMat);
    beamF.position.set(0, 2.65, 0.7);
    this.group.add(beamF);
    const beamB = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 0.12), woodMat);
    beamB.position.set(0, 2.65, -0.7);
    this.group.add(beamB);

    // Arched Canopy Roof
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.2, 16, 1, false, 0, Math.PI), canopyMat);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 2.7, 0);
    this.group.add(roof);

    // Little flowers on pergola posts
    for (let i = 0; i < 8; i++) {
      const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), flowerMat);
      fl.position.set((i % 2 === 0 ? -1.4 : 1.4), 1.2 + (i * 0.18), (i < 4 ? 0.72 : -0.72));
      this.group.add(fl);
    }

    // 3. Suspended Double Bench (Pivot from overhead central beam)
    this.swingPivot = new THREE.Group();
    this.swingPivot.position.set(0, 2.45, 0);

    // Hanging chains (4 chains)
    const chainGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.65, 6);
    [
      { x: -0.9, z: 0.28 }, { x: 0.9, z: 0.28 },
      { x: -0.9, z: -0.28 }, { x: 0.9, z: -0.28 }
    ].forEach(cp => {
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.position.set(cp.x, -0.82, cp.z);
      this.swingPivot.add(chain);
    });

    // Bench frame
    const seatGroup = new THREE.Group();
    seatGroup.position.set(0, -1.65, 0);

    // Wide wooden bench seat (fits two lovers side by side!)
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.72), cushionMat);
    seatBase.castShadow = true;
    seatGroup.add(seatBase);

    // High comfortable backrest
    const backRest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 0.08), woodMat);
    backRest.position.set(0, 0.35, -0.32);
    seatGroup.add(backRest);

    // Armrests
    [-0.96, 0.96].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.68), woodMat);
      arm.position.set(ax, 0.18, 0);
      seatGroup.add(arm);
    });

    this.swingPivot.add(seatGroup);
    this.group.add(this.swingPivot);

    this.scene.add(this.group);
  }

  getSeat1WorldPos() {
    // Left side of canopy bench
    const local = new THREE.Vector3(-0.46, 0.88, 0);
    this.group.localToWorld(local);
    return local;
  }

  getSeat2WorldPos() {
    // Right side of canopy bench
    const local = new THREE.Vector3(0.46, 0.88, 0);
    this.group.localToWorld(local);
    return local;
  }

  update(delta, hasOccupants = false) {
    if (hasOccupants) {
      this.swingPhase += delta * 2.0;
      this.swingPivot.rotation.x = Math.sin(this.swingPhase) * 0.22;
    } else {
      this.swingPivot.rotation.x *= 0.96;
    }
  }
}

