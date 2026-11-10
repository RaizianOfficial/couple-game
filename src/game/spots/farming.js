// Interactive Couple Farming System: Tilling, Seeding, Watering, Growing & Harvesting
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class FarmingSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'farming';

    // Located in the South-West garden plot
    this.position = new THREE.Vector3(-32, 0, -32);
    this.cropInventory = 0;
    this.plots = [];
    this.sparkles = [];

    this.initSparkles();
    this.buildFarmGarden();
  }

  initSparkles() {
    this.sparkleGroup = new THREE.Group();
    const count = 16;
    const sGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const sMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 });

    for (let i = 0; i < count; i++) {
      const s = new THREE.Mesh(sGeo, sMat.clone());
      s.visible = false;
      this.sparkleGroup.add(s);
      this.sparkles.push({
        mesh: s,
        life: 0,
        maxLife: 0.8,
        vel: new THREE.Vector3()
      });
    }
    this.scene.add(this.sparkleGroup);
  }

  buildFarmGarden() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Materials
    const soilDryMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });    // Tilled brown loam
    const soilWetMat = new THREE.MeshLambertMaterial({ color: 0x713f12 });    // Rich moist soil
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });      // Cute white picket fence
    const postMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const woodBorderMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

    // 1. Garden plot fence (12m x 9m with front entrance)
    const fenceH = 0.85;
    // Back fence
    const backFence = new THREE.Mesh(new THREE.BoxGeometry(12, fenceH, 0.08), fenceMat);
    backFence.position.set(0, fenceH / 2, -4.5);
    this.group.add(backFence);
    // Left fence
    const leftFence = new THREE.Mesh(new THREE.BoxGeometry(0.08, fenceH, 9), fenceMat);
    leftFence.position.set(-6, fenceH / 2, 0);
    this.group.add(leftFence);
    // Right fence
    const rightFence = new THREE.Mesh(new THREE.BoxGeometry(0.08, fenceH, 9), fenceMat);
    rightFence.position.set(6, fenceH / 2, 0);
    this.group.add(rightFence);

    // Front fence with open walkway gate in middle
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(4.6, fenceH, 0.08), fenceMat);
    frontL.position.set(-3.7, fenceH / 2, 4.5);
    this.group.add(frontL);
    const frontR = new THREE.Mesh(new THREE.BoxGeometry(4.6, fenceH, 0.08), fenceMat);
    frontR.position.set(3.7, fenceH / 2, 4.5);
    this.group.add(frontR);

    // Cute Flower Arch at Garden Entrance
    const archMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
    const archTop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), archMat);
    archTop.rotation.z = Math.PI / 2;
    archTop.position.set(0, 2.4, 4.5);
    this.group.add(archTop);

    // Roses decorating the arch
    const roseColors = [0xf43f5e, 0xf472b6, 0xfb7185];
    for (let i = 0; i < 7; i++) {
      const rose = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), new THREE.MeshLambertMaterial({ color: roseColors[i % 3] }));
      rose.position.set(-1.1 + (i / 6) * 2.2, 2.45, 4.5);
      this.group.add(rose);
    }

    // 2. Six Raised Crop Beds (2 rows of 3)
    const plotOffsets = [
      { x: -3.6, z: -2.0, crop: 'wheat' },
      { x: 0, z: -2.0, crop: 'strawberry' },
      { x: 3.6, z: -2.0, crop: 'carrot' },
      { x: -3.6, z: 1.8, crop: 'strawberry' },
      { x: 0, z: 1.8, crop: 'carrot' },
      { x: 3.6, z: 1.8, crop: 'wheat' }
    ];

    plotOffsets.forEach((po, idx) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(po.x, 0, po.z);

      // Wooden garden bed border (2.6m x 1.8m)
      const border = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.8), woodBorderMat);
      border.position.y = 0.11;
      border.castShadow = true;
      bedGroup.add(border);

      // Soil patch mesh
      const soil = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.6), soilDryMat.clone());
      soil.position.y = 0.18;
      bedGroup.add(soil);

      // Crop models container (sprouts, growing foliage, ripe fruits)
      const cropContainer = new THREE.Group();
      cropContainer.position.y = 0.24;
      bedGroup.add(cropContainer);

      this.group.add(bedGroup);

      const worldPos = new THREE.Vector3(this.position.x + po.x, 0, this.position.z + po.z);

      this.plots.push({
        id: `plot_${idx}`,
        worldPos,
        cropType: po.crop,
        state: 'ready', // Start initial plots as ready to harvest or seeded for instant joy!
        soilMesh: soil,
        container: cropContainer,
        growTimer: 0,
        growDuration: 8.0 // seconds to fully grow
      });

      // Build initial visual crop
      this.rebuildPlotMesh(this.plots[idx]);
    });

    this.scene.add(this.group);
  }

  // Visual meshes for crop growth stages
  rebuildPlotMesh(plot) {
    // Clear old visual children
    while (plot.container.children.length > 0) {
      plot.container.remove(plot.container.children[0]);
    }

    if (plot.state === 'untilled') {
      plot.soilMesh.material.color.set(0xa16207); // dry sandy loam
    } else if (plot.state === 'tilled') {
      plot.soilMesh.material.color.set(0x78350f); // dark fresh earth
    } else if (plot.state === 'seeded') {
      plot.soilMesh.material.color.set(0x78350f);
      // Small seeds dots
      const seedMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      for (let i = 0; i < 6; i++) {
        const seed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), seedMat);
        seed.position.set((Math.random() - 0.5) * 1.8, 0.02, (Math.random() - 0.5) * 1.2);
        plot.container.add(seed);
      }
    } else if (plot.state === 'watered' || plot.state === 'growing') {
      plot.soilMesh.material.color.set(0x451a03); // very dark moist soil
      // Green sprouts
      const sproutMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
      for (let i = 0; i < 8; i++) {
        const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 5), sproutMat);
        sprout.position.set(-0.7 + (i % 4) * 0.48, 0.14, (i < 4 ? -0.35 : 0.35));
        plot.container.add(sprout);
      }
    } else if (plot.state === 'ready') {
      plot.soilMesh.material.color.set(0x451a03);
      // Fully ripe lush crops!
      if (plot.cropType === 'wheat') {
        const wheatMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
        for (let i = 0; i < 10; i++) {
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 5), wheatMat);
          stalk.position.set(-0.8 + (i % 5) * 0.4, 0.32, (i < 5 ? -0.35 : 0.35));
          plot.container.add(stalk);
        }
      } else if (plot.cropType === 'strawberry') {
        const leafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
        const berryMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
        for (let i = 0; i < 6; i++) {
          const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), leafMat);
          bush.position.set(-0.7 + (i % 3) * 0.7, 0.2, (i < 3 ? -0.35 : 0.35));
          plot.container.add(bush);

          const berry = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), berryMat);
          berry.position.set(-0.7 + (i % 3) * 0.7, 0.3, (i < 3 ? -0.35 : 0.35) + 0.14);
          plot.container.add(berry);
        }
      } else if (plot.cropType === 'carrot') {
        const topMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
        const carrotMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
        for (let i = 0; i < 8; i++) {
          const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), carrotMat);
          carrot.rotation.x = Math.PI;
          carrot.position.set(-0.7 + (i % 4) * 0.48, 0.16, (i < 4 ? -0.35 : 0.35));
          plot.container.add(carrot);

          const top = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), topMat);
          top.position.set(-0.7 + (i % 4) * 0.48, 0.32, (i < 4 ? -0.35 : 0.35));
          plot.container.add(top);
        }
      }
    }
  }

  // Find nearest crop plot
  getNearestPlot(myPos, maxDist = 2.2) {
    if (!myPos) return null;
    let closest = null;
    let closestDist = maxDist;

    for (const plot of this.plots) {
      const d = Math.hypot(myPos.x - plot.worldPos.x, myPos.z - plot.worldPos.z);
      if (d < closestDist) {
        closestDist = d;
        closest = plot;
      }
    }
    return closest;
  }

  // Handle player farming action on plot
  interact(plot) {
    if (!plot) return null;

    if (plot.state === 'untilled') {
      plot.state = 'tilled';
      soundEngine.playPop();
      this.rebuildPlotMesh(plot);
      return { type: 'tilled', label: 'Tilled Soil 🚜' };
    } else if (plot.state === 'tilled') {
      plot.state = 'seeded';
      soundEngine.playPlantSeed();
      this.rebuildPlotMesh(plot);
      return { type: 'seeded', label: 'Planted Seeds 🌱' };
    } else if (plot.state === 'seeded') {
      plot.state = 'growing';
      plot.growTimer = 0;
      soundEngine.playWaterCrop();
      this.rebuildPlotMesh(plot);
      return { type: 'watered', label: 'Watered Crops 💧' };
    } else if (plot.state === 'ready') {
      // Harvest!
      plot.state = 'tilled'; // Reset to tilled so player can seed again
      soundEngine.playHarvest();
      this.cropInventory += 1;
      this.spawnHarvestSparkles(plot.worldPos.x, 0.6, plot.worldPos.z);
      this.rebuildPlotMesh(plot);
      return { type: 'harvested', label: 'Harvested Crops! ✨' };
    }

    return null;
  }

  spawnHarvestSparkles(x, y, z) {
    for (let i = 0; i < 8; i++) {
      const s = this.sparkles.find(sp => !sp.mesh.visible);
      if (!s) break;
      s.mesh.position.set(x, y, z);
      s.vel.set(
        (Math.random() - 0.5) * 2.2,
        1.5 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.2
      );
      s.life = 0;
      s.mesh.visible = true;
    }
  }

  update(delta) {
    // 1. Update sparkle particles
    for (const s of this.sparkles) {
      if (!s.mesh.visible) continue;
      s.life += delta;
      if (s.life >= s.maxLife) {
        s.mesh.visible = false;
        continue;
      }
      s.vel.y -= 5.0 * delta;
      s.mesh.position.addScaledVector(s.vel, delta);
      const prog = s.life / s.maxLife;
      s.mesh.material.opacity = Math.max(0, 1 - prog);
      s.mesh.scale.setScalar(0.7 + prog * 0.8);
    }

    // 2. Update crop growth timers
    for (const plot of this.plots) {
      if (plot.state === 'growing') {
        plot.growTimer += delta;
        if (plot.growTimer >= plot.growDuration) {
          plot.state = 'ready';
          this.rebuildPlotMesh(plot);
        }
      }
    }
  }
}
