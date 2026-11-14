// Interactive Tree Cutting System with Axe Chopping, Falling Physics, Wood Drops & Regrowth
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class TreeChoppingSystem {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.woodInventory = 0;
    this.trees = [];
    this.chips = [];

    this.initChips();
    this.buildChoppableTrees();
  }

  initChips() {
    this.chipGroup = new THREE.Group();
    const count = 18;
    const chipGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const chipMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Wood chip

    for (let i = 0; i < count; i++) {
      const chip = new THREE.Mesh(chipGeo, chipMat.clone());
      chip.visible = false;
      this.chipGroup.add(chip);
      this.chips.push({
        mesh: chip,
        life: 0,
        maxLife: 0.8,
        vel: new THREE.Vector3()
      });
    }
    this.scene.add(this.chipGroup);
  }

  buildChoppableTrees() {
    // North Forest Grove within compact 110x110 bounds (z = -46 to -36, x = -20 to -6 and 6 to 20)
    const treeCoords = [];
    const zRows = [-46, -40, -36];
    const xWest = [-18, -14, -10, -6];
    const xEast = [6, 10, 14, 18];

    zRows.forEach(z => {
      xWest.forEach(x => treeCoords.push({ x, z }));
      xEast.forEach(x => treeCoords.push({ x, z }));
    });

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Rich cedar trunk
    const stumpMat = new THREE.MeshLambertMaterial({ color: 0xa16207 }); // Annual rings top
    const foliageMats = [
      new THREE.MeshLambertMaterial({ color: 0xa7f3d0, flatShading: true }), // Pastel mint
      new THREE.MeshLambertMaterial({ color: 0xfbcfe8, flatShading: true }), // Pastel pink
      new THREE.MeshLambertMaterial({ color: 0xfed7aa, flatShading: true }), // Soft peach
      new THREE.MeshLambertMaterial({ color: 0xddd6fe, flatShading: true })  // Lavender
    ];

    treeCoords.forEach((coord, idx) => {
      const foliageMat = foliageMats[idx % foliageMats.length];
      const group = new THREE.Group();
      group.position.set(coord.x, 0, coord.z);

      // 1. Permanent Stump (revealed when felled)
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.45, 8), trunkMat);
      stump.position.y = 0.225;
      stump.castShadow = true;
      group.add(stump);

      const stumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.02, 8), stumpMat);
      stumpTop.position.y = 0.455;
      group.add(stumpTop);

      // 2. Felling Tree Trunk & Crown (pivots from stump top y = 0.45)
      const treePivot = new THREE.Group();
      treePivot.position.y = 0.45;

      const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.8, 8), trunkMat);
      trunkUpper.position.y = 0.9;
      trunkUpper.castShadow = true;
      treePivot.add(trunkUpper);

      // Fluffy foliage crowns
      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), foliageMat);
      crown1.position.y = 2.4;
      crown1.castShadow = true;
      treePivot.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), foliageMat);
      crown2.position.set(0.4, 3.0, 0.3);
      crown2.castShadow = true;
      treePivot.add(crown2);

      const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), foliageMat);
      crown3.position.set(-0.35, 2.9, -0.3);
      crown3.castShadow = true;
      treePivot.add(crown3);

      group.add(treePivot);
      this.scene.add(group);

      if (this.town && this.town.colliders) {
        this.town.colliders.push({ type: 'circle', x: coord.x, z: coord.z, r: 0.4 });
      }

      this.trees.push({
        id: `tree_${idx}`,
        x: coord.x,
        z: coord.z,
        group,
        treePivot,
        health: 3,
        isFelled: false,
        fallAngle: 0,
        fallDirection: Math.random() * Math.PI * 2,
        respawnTimer: 0,
        shakeTimer: 0
      });
    });
  }

  // Find nearest choppable tree
  getNearestTree(myPos, maxDist = 2.4) {
    if (!myPos) return null;
    let closest = null;
    let closestDist = maxDist;

    for (const tree of this.trees) {
      if (tree.isFelled) continue;
      const d = Math.hypot(myPos.x - tree.x, myPos.z - tree.z);
      if (d < closestDist) {
        closestDist = d;
        closest = tree;
      }
    }
    return closest;
  }

  // Chop tree
  chop(tree) {
    if (!tree || tree.isFelled) return false;

    tree.health -= 1;
    tree.shakeTimer = 0.35;
    soundEngine.playAxeChop();
    this.spawnChips(tree.x, 1.0, tree.z);

    if (tree.health <= 0) {
      // Tree felled!
      tree.isFelled = true;
      soundEngine.playTreeFall();
      soundEngine.playCheer();
      this.woodInventory += 3;
      tree.respawnTimer = 35; // 35 seconds to regrow
      return 'felled';
    }

    return 'chopped';
  }

  spawnChips(x, y, z) {
    for (let i = 0; i < 6; i++) {
      const chip = this.chips.find(c => !c.mesh.visible);
      if (!chip) break;
      chip.mesh.position.set(x, y + (Math.random() - 0.5) * 0.4, z);
      chip.vel.set(
        (Math.random() - 0.5) * 2.5,
        1.5 + Math.random() * 2.0,
        (Math.random() - 0.5) * 2.5
      );
      chip.life = 0;
      chip.mesh.visible = true;
    }
  }

  update(delta) {
    // 1. Update chip particles
    for (const c of this.chips) {
      if (!c.mesh.visible) continue;
      c.life += delta;
      if (c.life >= c.maxLife) {
        c.mesh.visible = false;
        continue;
      }
      c.vel.y -= 9.8 * delta;
      c.mesh.position.addScaledVector(c.vel, delta);
      c.mesh.rotation.x += delta * 8;
      c.mesh.rotation.y += delta * 8;
    }

    // 2. Update trees
    for (const tree of this.trees) {
      // Shake wobble when struck
      if (tree.shakeTimer > 0) {
        tree.shakeTimer -= delta;
        const wobble = Math.sin(tree.shakeTimer * 30) * 0.08;
        tree.treePivot.rotation.z = wobble;
      } else if (!tree.isFelled) {
        tree.treePivot.rotation.z = 0;
      }

      // Felled fall animation
      if (tree.isFelled) {
        if (tree.fallAngle < Math.PI / 2) {
          tree.fallAngle += delta * 2.8;
          tree.treePivot.rotation.x = Math.sin(tree.fallDirection) * tree.fallAngle;
          tree.treePivot.rotation.z = Math.cos(tree.fallDirection) * tree.fallAngle;
        } else {
          // Tree vanished, left as stump
          tree.treePivot.visible = false;
        }

        // Regrowth countdown
        tree.respawnTimer -= delta;
        if (tree.respawnTimer <= 0) {
          // Regrow tree!
          tree.isFelled = false;
          tree.health = 3;
          tree.fallAngle = 0;
          tree.treePivot.rotation.x = 0;
          tree.treePivot.rotation.z = 0;
          tree.treePivot.visible = true;
          tree.treePivot.scale.setScalar(0.2); // sprout animation
        }
      } else if (tree.treePivot.scale.x < 1.0) {
        // Smoothly grow back to full size
        const nextScale = Math.min(1.0, tree.treePivot.scale.x + delta * 0.4);
        tree.treePivot.scale.setScalar(nextScale);
      }
    }
  }
}
