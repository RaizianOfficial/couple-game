// Cozy Dreamy Tea & Chai Cafe Spot with Steaming Kettle, Hanging Lanterns & Stools
import * as THREE from 'three';

export class TeaStallSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'teaStall';
    this.position = new THREE.Vector3(-14, 0, 36); // Located at South Promenade Promenade
    this.rotationY = Math.PI;

    this.cupHolderUid = null;
    this.teaState = 'idle'; // 'idle' | 'holding' | 'sipping'
    this.steamParticles = [];

    this.buildMesh();
  }

  buildMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Cozy café palette
    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x5b3419 }); // Rich walnut
    const warmWoodMat = new THREE.MeshLambertMaterial({ color: 0x9a5a2e }); // Cedar plank
    const counterMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 }); // Light cream stone counter
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x059669 }); // Matcha emerald green tiled roof
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm lantern glow
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Vintage brass chai kettle
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }); // Pastel pink ceramic cup
    const stoolCushionMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Pink cushion

    // 1. Counter Base (Planked rustic wooden kiosk)
    const baseGeo = new THREE.BoxGeometry(3.2, 0.95, 1.2);
    const base = new THREE.Mesh(baseGeo, warmWoodMat);
    base.position.y = 0.475;
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);

    // Stone Countertop with overhang
    const topGeo = new THREE.BoxGeometry(3.4, 0.08, 1.4);
    const counterTop = new THREE.Mesh(topGeo, counterMat);
    counterTop.position.set(0, 0.98, 0);
    counterTop.castShadow = true;
    this.group.add(counterTop);

    // Front Decorative Planks
    for (let i = 0; i < 7; i++) {
      const plankGeo = new THREE.BoxGeometry(0.38, 0.8, 0.04);
      const plank = new THREE.Mesh(plankGeo, darkWoodMat);
      plank.position.set(-1.2 + i * 0.4, 0.45, 0.62);
      this.group.add(plank);
    }

    // 2. Corner Pillars supporting Japanese/Boutique Pagoda Canopy
    const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8);
    [-1.5, 1.5].forEach(px => {
      [-0.5, 0.5].forEach(pz => {
        const pillar = new THREE.Mesh(pillarGeo, darkWoodMat);
        pillar.position.set(px, 1.95, pz);
        pillar.castShadow = true;
        this.group.add(pillar);
      });
    });

    // Tiered Overhanging Roof Canopy
    const roofBaseGeo = new THREE.BoxGeometry(3.9, 0.16, 1.8);
    const roofBase = new THREE.Mesh(roofBaseGeo, roofMat);
    roofBase.position.set(0, 2.95, 0);
    roofBase.castShadow = true;
    this.group.add(roofBase);

    const roofUpperGeo = new THREE.BoxGeometry(3.3, 0.28, 1.4);
    const roofUpper = new THREE.Mesh(roofUpperGeo, roofMat);
    roofUpper.position.set(0, 3.12, 0);
    roofUpper.castShadow = true;
    this.group.add(roofUpper);

    // 3. Hanging Warm Paper Lanterns
    [-1.2, 0, 1.2].forEach(lx => {
      // Wire
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35, 6), darkWoodMat);
      wire.position.set(lx, 2.75, 0.65);
      // Oval Lantern
      const lanternGeo = new THREE.SphereGeometry(0.16, 10, 10);
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.scale.set(1, 1.3, 1);
      lantern.position.set(lx, 2.5, 0.65);
      this.group.add(wire, lantern);
    });

    // 4. Blackboard Chalkboard Signboard
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.04), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    signBoard.position.set(0, 2.5, -0.6);
    this.group.add(signBoard);

    // 5. Traditional Steaming Brass Kettle
    const kettleGroup = new THREE.Group();
    kettleGroup.position.set(-0.85, 1.02, 0.15);

    const kettleGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.38, 12);
    const kettle = new THREE.Mesh(kettleGeo, brassMat);
    kettle.position.y = 0.19;
    kettle.castShadow = true;
    kettleGroup.add(kettle);

    // Curved handle
    const handleGeo = new THREE.TorusGeometry(0.18, 0.02, 6, 12, Math.PI);
    const handle = new THREE.Mesh(handleGeo, darkWoodMat);
    handle.position.set(0, 0.38, 0);
    handle.rotation.x = Math.PI / 2;
    kettleGroup.add(handle);

    // Long graceful Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.24, 8), brassMat);
    spout.position.set(0.24, 0.25, 0);
    spout.rotation.z = -0.7;
    kettleGroup.add(spout);

    this.group.add(kettleGroup);

    // 6. Shared Teacup on Saucer
    const saucerGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12);
    const saucer = new THREE.Mesh(saucerGeo, counterMat);
    saucer.position.set(0.1, 1.03, 0.25);
    saucer.castShadow = true;
    this.group.add(saucer);

    const cupGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.14, 12);
    this.cupMesh = new THREE.Mesh(cupGeo, cupMat);
    this.cupMesh.position.set(0.1, 1.11, 0.25);
    this.cupMesh.castShadow = true;

    // Golden tea liquid
    const liquidGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.02, 10);
    const liquidMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Golden aromatic chai
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.06;
    this.cupMesh.add(liquid);

    this.group.add(this.cupMesh);

    // Mini Wooden Tray with Cute Cookies
    const trayGeo = new THREE.BoxGeometry(0.45, 0.03, 0.3);
    const tray = new THREE.Mesh(trayGeo, warmWoodMat);
    tray.position.set(0.7, 1.03, 0.2);
    this.group.add(tray);

    [-0.08, 0.08].forEach(cookieX => {
      const cookie = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 8), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
      cookie.position.set(0.7 + cookieX, 1.05, 0.2);
      this.group.add(cookie);
    });

    // 7. Two Cozy Wooden Bar Stools with Cushions
    this.stools = [];
    [-0.75, 0.75].forEach((sx, idx) => {
      const stoolGroup = new THREE.Group();
      stoolGroup.position.set(sx, 0, 1.15);

      // Stool Legs
      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6);
      [-0.15, 0.15].forEach(lx => {
        [-0.15, 0.15].forEach(lz => {
          const sLeg = new THREE.Mesh(legGeo, darkWoodMat);
          sLeg.position.set(lx, 0.275, lz);
          sLeg.castShadow = true;
          stoolGroup.add(sLeg);
        });
      });

      // Stool Seat Base
      const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 12), warmWoodMat);
      sBase.position.y = 0.55;
      stoolGroup.add(sBase);

      // Cute Pink Plush Cushion
      const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), stoolCushionMat);
      cushion.position.y = 0.61;
      cushion.castShadow = true;
      stoolGroup.add(cushion);

      this.group.add(stoolGroup);
      this.stools.push(stoolGroup);
    });

    this.scene.add(this.group);

    // Colliders for the kiosk
    if (this.town && this.town.colliders) {
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x - 1.8,
        maxX: this.position.x + 1.8,
        minZ: this.position.z - 0.7,
        maxZ: this.position.z + 0.7
      });
    }

    // Steam particles pool
    this.initSteam();
  }

  initSteam() {
    this.steamGroup = new THREE.Group();
    this.group.add(this.steamGroup);

    const count = 16;
    this.steamParticles = [];
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const geo = new THREE.SphereGeometry(0.045, 6, 6);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.steamGroup.add(mesh);
      this.steamParticles.push({
        mesh,
        life: 0,
        maxLife: 1.4,
        speedY: 0.28 + Math.random() * 0.2,
        driftX: (Math.random() - 0.5) * 0.08
      });
    }
  }

  update(delta) {
    // Animate steam swirling gently above the cup
    const cupWorld = new THREE.Vector3();
    this.cupMesh.getWorldPosition(cupWorld);
    const localCup = this.steamGroup.worldToLocal(cupWorld.clone());

    for (let i = 0; i < this.steamParticles.length; i++) {
      const p = this.steamParticles[i];
      p.life += delta;
      if (p.life > p.maxLife) {
        p.life = 0;
        p.mesh.position.set(localCup.x + (Math.random() - 0.5) * 0.06, localCup.y + 0.12, localCup.z + (Math.random() - 0.5) * 0.06);
        p.mesh.scale.setScalar(0.7);
        p.mesh.visible = true;
      }
      p.mesh.position.y += p.speedY * delta;
      p.mesh.position.x += p.driftX * delta;
      const progress = p.life / p.maxLife;
      p.mesh.scale.setScalar(0.7 + progress * 1.8);
      p.mesh.material.opacity = Math.max(0, 0.45 * (1 - progress));
    }
  }

  attachCupToHand(handObject) {
    if (handObject) {
      handObject.add(this.cupMesh);
      // Place cup upright in palm — offset accounts for arm being rotated forward (-1.25 rad)
      this.cupMesh.position.set(0, -0.02, 0.1);
      this.cupMesh.rotation.set(0, 0, 0);
    }
  }

  returnCupToCounter() {
    this.group.add(this.cupMesh);
    this.cupMesh.position.set(0.1, 1.11, 0.25);
    this.cupMesh.rotation.set(0, 0, 0);
  }

  getInteractionPoint() {
    return new THREE.Vector3(this.position.x, 0, this.position.z + 1.4);
  }

  // Stool seat world coordinates for sitting
  getStool1WorldPos() {
    const v = new THREE.Vector3(-0.75, 0.65, 1.15);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }

  getStool2WorldPos() {
    const v = new THREE.Vector3(0.75, 0.65, 1.15);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    return v.add(this.group.position);
  }
}
