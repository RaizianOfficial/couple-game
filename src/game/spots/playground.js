// Playground with Interactive Slide and Seesaw for Couple Fun
import * as THREE from 'three';

export class PlaygroundSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'playground';

    // Positioned deeply in the newly expanded park area
    this.position = new THREE.Vector3(-52, 0, 52);
    this.rotationY = 0;

    this.seesawAngle = 0;
    this.seesawSpeed = 0;
    this.slideProgress = null;

    this.buildPlayground();
  }

  buildPlayground() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x854d0e });
    const slideChuteMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    const slideRailingMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const purpleMat = new THREE.MeshLambertMaterial({ color: 0xa855f7 });

    const sandPit = new THREE.Mesh(new THREE.BoxGeometry(16, 0.04, 12), sandMat);
    sandPit.position.set(0, 0.02, 0);
    this.group.add(sandPit);

    const bN = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.12, 0.2), woodMat);
    bN.position.set(0, 0.06, 6.0);
    this.group.add(bN);
    const bS = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.12, 0.2), woodMat);
    bS.position.set(0, 0.06, -6.0);
    this.group.add(bS);

    // 1. BIG PLAYGROUND SLIDE
    this.slideGroup = new THREE.Group();
    this.slideGroup.position.set(-4.0, 0, 0);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), woodMat);
    platform.position.set(0, 2.2, -2.2);
    this.slideGroup.add(platform);

    [[-0.7, -2.9], [0.7, -2.9], [-0.7, -1.5], [0.7, -1.5]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), woodMat);
      leg.position.set(lx, 1.1, lz);
      this.slideGroup.add(leg);
    });

    for (let i = 0; i < 7; i++) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), metalMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, 0.3 + i * 0.3, -3.0);
      this.slideGroup.add(rung);
    }
    [-0.55, 0.55].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), metalMat);
      rail.position.set(rx, 1.2, -3.0);
      this.slideGroup.add(rail);
    });

    const chuteLen = 4.6;
    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, chuteLen), slideChuteMat);
    chute.position.set(0, 1.18, 0.6);
    chute.rotation.x = 0.46;
    this.slideGroup.add(chute);

    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.7), slideChuteMat);
    lip.position.set(0, 0.2, 2.9);
    this.slideGroup.add(lip);

    this.group.add(this.slideGroup);

    // 2. PLAYGROUND SEESAW
    this.seesawGroup = new THREE.Group();
    this.seesawGroup.position.set(4.0, 0, 0);

    const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.65, 4), blueMat);
    fulcrum.position.y = 0.32;
    fulcrum.rotation.y = Math.PI / 4;
    this.seesawGroup.add(fulcrum);

    this.seesawPlankPivot = new THREE.Group();
    this.seesawPlankPivot.position.set(0, 0.65, 0);

    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 3.8), new THREE.MeshLambertMaterial({ color: 0xec4899 }));
    this.seesawPlankPivot.add(plank);

    [-1.6, 1.6].forEach(sz => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.4), purpleMat);
      seat.position.set(0, 0.06, sz);
      this.seesawPlankPivot.add(seat);
    });

    this.seesawGroup.add(this.seesawPlankPivot);
    this.group.add(this.seesawGroup);
    this.scene.add(this.group);

    if (this.town && this.town.colliders) {
      this.town.colliders.push({ type: 'box', minX: this.position.x - 4.9, maxX: this.position.x - 3.1, minZ: this.position.z - 3.2, maxZ: this.position.z - 1.4 });
    }
  }

  getSlideWorldPos(progress) {
    const topLocal = new THREE.Vector3(-4.0, 2.2, -1.4);
    const bottomLocal = new THREE.Vector3(-4.0, 0.25, 3.0);
    const currentLocal = new THREE.Vector3().lerpVectors(topLocal, bottomLocal, progress);
    this.group.localToWorld(currentLocal);
    return currentLocal;
  }

  getSlideBottomPos() {
    const bottom = new THREE.Vector3(-4.0, 0, 3.6);
    this.group.localToWorld(bottom);
    return bottom;
  }

  update(delta) {
    this.seesawSpeed += delta * 1.5;
    this.seesawAngle = Math.sin(this.seesawSpeed) * 0.18;
    this.seesawPlankPivot.rotation.x = this.seesawAngle;
  }
}