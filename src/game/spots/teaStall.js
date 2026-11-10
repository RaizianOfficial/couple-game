// Cozy Tea Stall Interactive Spot with Shared Cup & Steam Effects
import * as THREE from 'three';

export class TeaStallSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'teaStall';
    this.position = new THREE.Vector3(0, 0, -6.5);
    this.rotationY = 0;

    this.cupHolderUid = null;
    this.teaState = 'idle'; // 'idle' | 'holding' | 'sipping'
    this.steamParticles = [];

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Materials
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const counterMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x059669 }); // Cute green tea canopy
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });   // Pink porcelain cup
    const kettleMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 }); // Stainless steel tea kettle

    // 1. Counter Table
    const tableGeo = new THREE.BoxGeometry(2.4, 0.9, 1.0);
    const table = new THREE.Mesh(tableGeo, counterMat);
    table.position.y = 0.45;
    table.castShadow = true;
    table.receiveShadow = true;
    this.group.add(table);

    // Front wood panel
    const panelGeo = new THREE.BoxGeometry(2.2, 0.7, 0.04);
    const panel = new THREE.Mesh(panelGeo, woodMat);
    panel.position.set(0, 0.45, 0.48);
    this.group.add(panel);

    // 2. Canopy Roof Posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
    [-1.05, 1.05].forEach(px => {
      [-0.4, 0.4].forEach(pz => {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, 1.35, pz);
        post.castShadow = true;
        this.group.add(post);
      });
    });

    // Canopy Roof
    const roofGeo = new THREE.ConeGeometry(1.6, 0.6, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.4;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 0.8, 0.7);
    roof.castShadow = true;
    this.group.add(roof);

    // 3. Cute Tea Kettle on Counter
    const kettleGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.28, 8);
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(-0.6, 1.04, 0);
    kettle.castShadow = true;
    this.group.add(kettle);

    // Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.15, 6), kettleMat);
    spout.position.set(-0.45, 1.1, 0);
    spout.rotation.z = -0.7;
    this.group.add(spout);

    // 4. Single Shared Tea Cup
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.12, 10);
    this.cupMesh = new THREE.Mesh(cupGeo, cupMat);
    this.cupMesh.position.set(0.1, 0.96, 0.1);
    this.cupMesh.castShadow = true;

    // Tea Liquid inside cup
    const liquidGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8);
    const liquidMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Golden black tea
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.05;
    this.cupMesh.add(liquid);

    this.group.add(this.cupMesh);

    // 5. Two Stools in Front of Stall
    const stoolMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    [-0.6, 0.6].forEach((sx, idx) => {
      const stoolGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 8);
      const stool = new THREE.Mesh(stoolGeo, stoolMat);
      stool.position.set(sx, 0.225, 0.9);
      stool.castShadow = true;
      stool.receiveShadow = true;
      this.group.add(stool);
    });

    this.scene.add(this.group);

    // Colliders for the counter table
    this.town.colliders.push({
      type: 'box',
      minX: this.position.x - 1.3,
      maxX: this.position.x + 1.3,
      minZ: this.position.z - 0.6,
      maxZ: this.position.z + 0.6
    });

    // Steam particles pool
    this.initSteam();
  }

  initSteam() {
    this.steamGroup = new THREE.Group();
    this.group.add(this.steamGroup);

    const count = 12;
    this.steamParticles = [];
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const geo = new THREE.SphereGeometry(0.04, 6, 6);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.steamGroup.add(mesh);
      this.steamParticles.push({
        mesh,
        life: 0,
        maxLife: 1.2,
        speedY: 0.25 + Math.random() * 0.2,
        driftX: (Math.random() - 0.5) * 0.06
      });
    }
  }

  update(delta) {
    // Animate steam above the cup
    const cupWorld = new THREE.Vector3();
    this.cupMesh.getWorldPosition(cupWorld);
    const localCup = this.steamGroup.worldToLocal(cupWorld.clone());

    for (let i = 0; i < this.steamParticles.length; i++) {
      const p = this.steamParticles[i];
      p.life += delta;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.mesh.position.set(localCup.x + (Math.random() - 0.5) * 0.06, localCup.y + 0.1, localCup.z + (Math.random() - 0.5) * 0.06);
        p.mesh.scale.setScalar(0.8);
        p.mesh.visible = true;
      }
      p.mesh.position.y += p.speedY * delta;
      p.mesh.position.x += p.driftX * delta;
      const progress = p.life / p.maxLife;
      p.mesh.scale.setScalar(0.8 + progress * 1.5);
      p.mesh.material.opacity = Math.max(0, 0.5 * (1 - progress));
    }
  }

  attachCupToHand(handObject) {
    if (handObject) {
      handObject.add(this.cupMesh);
      this.cupMesh.position.set(0, 0.1, 0.05);
    }
  }

  returnCupToCounter() {
    this.group.add(this.cupMesh);
    this.cupMesh.position.set(0.1, 0.96, 0.1);
  }

  getInteractionPoint() {
    // Position where player stands to interact
    return new THREE.Vector3(this.position.x, 0, this.position.z + 1.2);
  }
}
