// Apple Orchard Trees & Girl's Harvest Basket System
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class AppleHarvestSystem {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'appleHarvest';

    this.appleInventory = 0;
    this.isCarryingBasket = false;

    // Basket resting location near the orchard gate (x: 8.5, z: -10)
    this.basketGroundPos = new THREE.Vector3(8.5, 0, -10);

    this.trees = [];
    this.apples = [];

    this.buildGroundBasket();
    this.buildAppleTrees();
  }

  buildGroundBasket() {
    this.basketGroup = new THREE.Group();
    this.basketGroup.position.copy(this.basketGroundPos);

    const wickerMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const appleMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });

    // Woven Wicker Basket Tub
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.32, 12), wickerMat);
    tub.position.y = 0.16;
    tub.castShadow = true;
    this.basketGroup.add(tub);

    // Cute pink gingham cloth liner
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.48), clothMat);
    cloth.position.y = 0.28;
    this.basketGroup.add(cloth);

    // Basket Arch Handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 16, Math.PI), wickerMat);
    handle.rotation.z = Math.PI;
    handle.position.y = 0.32;
    this.basketGroup.add(handle);

    // 2 Starter Apples inside basket
    [-0.1, 0.1].forEach((ax, i) => {
      const ap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), appleMat);
      ap.position.set(ax, 0.34, i === 0 ? -0.05 : 0.05);
      this.basketGroup.add(ap);
    });

    this.scene.add(this.basketGroup);
  }

  buildAppleTrees() {
    const treeConfigs = [
      { x: 12, z: -16 },
      { x: 17, z: -18 },
      { x: 22, z: -15 },
      { x: 14, z: -22 },
      { x: 20, z: -23 }
    ];

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true });
    const appleMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const leafMatTiny = new THREE.MeshBasicMaterial({ color: 0x15803d });

    treeConfigs.forEach((tc, treeIdx) => {
      const treeGrp = new THREE.Group();
      treeGrp.position.set(tc.x, 0, tc.z);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 2.2, 8), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      treeGrp.add(trunk);

      // Leafy Apple Tree Crown
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), leafMat);
      crown.position.y = 2.6;
      crown.castShadow = true;
      treeGrp.add(crown);

      // Upper canopy clump
      const topCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), leafMat);
      topCrown.position.set(0, 3.4, 0);
      treeGrp.add(topCrown);

      // Hanging Ripe Red Apples (4 apples per tree)
      const treeApples = [];
      const appleOffsets = [
        { x: -0.9, y: 2.3, z: 0.6 },
        { x: 0.9, y: 2.2, z: 0.5 },
        { x: 0.2, y: 2.0, z: 1.1 },
        { x: -0.4, y: 2.5, z: -0.9 }
      ];

      appleOffsets.forEach((ao, appleIdx) => {
        const appleGrp = new THREE.Group();
        appleGrp.position.set(ao.x, ao.y, ao.z);

        const appleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), appleMat);
        appleMesh.castShadow = true;
        appleGrp.add(appleMesh);

        // Little green stem/leaf
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 4), leafMatTiny);
        stem.position.y = 0.12;
        appleGrp.add(stem);

        treeGrp.add(appleGrp);

        const appleData = {
          mesh: appleGrp,
          treeIdx,
          appleIdx,
          isRipe: true,
          respawnTimer: 0
        };
        treeApples.push(appleData);
        this.apples.push(appleData);
      });

      this.scene.add(treeGrp);

      if (this.town && this.town.colliders) {
        this.town.colliders.push({ type: 'circle', x: tc.x, z: tc.z, r: 0.65 });
      }

      this.trees.push({
        position: new THREE.Vector3(tc.x, 0, tc.z),
        apples: treeApples
      });
    });
  }

  getNearestTree(myPos, radius = 2.6) {
    if (!myPos) return null;
    for (let i = 0; i < this.trees.length; i++) {
      const t = this.trees[i];
      if (Math.hypot(myPos.x - t.position.x, myPos.z - t.position.z) < radius) {
        const ripeApples = t.apples.filter(a => a.isRipe);
        if (ripeApples.length > 0) return { tree: t, apple: ripeApples[0] };
      }
    }
    return null;
  }

  isNearGroundBasket(myPos, radius = 2.2) {
    if (!myPos) return false;
    return Math.hypot(myPos.x - this.basketGroundPos.x, myPos.z - this.basketGroundPos.z) < radius;
  }

  pickUpBasket() {
    this.isCarryingBasket = true;
    if (this.basketGroup) this.basketGroup.visible = false;
    soundEngine.playPop();
  }

  putDownBasket(atPos) {
    this.isCarryingBasket = false;
    if (atPos) this.basketGroundPos.set(atPos.x, 0, atPos.z);
    if (this.basketGroup) {
      this.basketGroup.position.copy(this.basketGroundPos);
      this.basketGroup.visible = true;
    }
    soundEngine.playPop();
  }

  pickApple(appleData) {
    if (!appleData || !appleData.isRipe) return false;
    appleData.isRipe = false;
    appleData.mesh.visible = false;
    appleData.respawnTimer = 18.0; // Regrows in 18s
    this.appleInventory++;
    soundEngine.playHarvest();
    return true;
  }

  update(delta) {
    // Respawn picked apples after timer
    for (let i = 0; i < this.apples.length; i++) {
      const a = this.apples[i];
      if (!a.isRipe) {
        a.respawnTimer -= delta;
        if (a.respawnTimer <= 0) {
          a.isRipe = true;
          a.mesh.visible = true;
        }
      }
    }
  }
}

