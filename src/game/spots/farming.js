// Interactive Couple Farming System: Tilling, Seeding, Watering, Growing & Harvesting
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class FarmingSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'farming';

    // Located in the West Cozy Backyard (strictly matching Town Layout Map)
    this.position = new THREE.Vector3(-34, 0, 0);
    this.cropInventory = 0;
    this.plots = [];
    this.sparkles = [];
    this.onPlotChanged = null; // Callback for network sync

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

    // 1. Backyard boundary fence (spanning z: -22 to +22)
    const fenceH = 0.85;
    const westFence = new THREE.Mesh(new THREE.BoxGeometry(0.1, fenceH, 44), fenceMat);
    westFence.position.set(-6.5, fenceH / 2, 0);
    this.group.add(westFence);

    const northFence = new THREE.Mesh(new THREE.BoxGeometry(13, fenceH, 0.1), fenceMat);
    northFence.position.set(0, fenceH / 2, -22);
    this.group.add(northFence);

    const southFence = new THREE.Mesh(new THREE.BoxGeometry(13, fenceH, 0.1), fenceMat);
    southFence.position.set(0, fenceH / 2, 22);
    this.group.add(southFence);

    if (this.town && this.town.colliders) {
      this.town.colliders.push({ type: 'box', minX: this.position.x - 6.8, maxX: this.position.x - 6.2, minZ: -22, maxZ: 22 });
      this.town.colliders.push({ type: 'box', minX: this.position.x - 6.8, maxX: this.position.x + 6.8, minZ: -22.3, maxZ: -21.7 });
      this.town.colliders.push({ type: 'box', minX: this.position.x - 6.8, maxX: this.position.x + 6.8, minZ: 21.7, maxZ: 22.3 });
    }

    // 2. Three Vertical Farm Plots (Farm Plot 1, 2, 3 as depicted on layout map)
    const plotConfigs = [
      { id: 'plot_0', name: 'Farm Plot 1', x: 0, z: -14, crop: 'strawberry' },
      { id: 'plot_1', name: 'Farm Plot 2', x: 0, z: 0, crop: 'wheat' },
      { id: 'plot_2', name: 'Farm Plot 3', x: 0, z: 14, crop: 'carrot' }
    ];

    plotConfigs.forEach((po, idx) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(po.x, 0, po.z);

      // Wooden plot border (7.0m x 5.2m)
      const border = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.25, 5.2), woodBorderMat);
      border.position.y = 0.125;
      border.castShadow = true;
      bedGroup.add(border);

      // Soil patch mesh (6.6m x 4.8m)
      const soil = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.15, 4.8), soilDryMat.clone());
      soil.position.y = 0.2;
      bedGroup.add(soil);

      // Crop models container
      const cropContainer = new THREE.Group();
      cropContainer.position.y = 0.26;
      bedGroup.add(cropContainer);

      this.group.add(bedGroup);

      const worldPos = new THREE.Vector3(this.position.x + po.x, 0, this.position.z + po.z);

      this.plots.push({
        id: po.id,
        name: po.name,
        worldPos,
        cropType: po.crop,
        state: 'ready',
        soilMesh: soil,
        container: cropContainer,
        growTimer: 0,
        growDuration: 8.0
      });

      this.rebuildPlotMesh(this.plots[idx]);
    });

    // 3. Cute Backyard Water Well (Located at world x: -24, z: 14)
    const wellGroup = new THREE.Group();
    wellGroup.position.set(10, 0, 14);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Circular stone well base
    const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.9, 16), stoneMat);
    wellBase.position.y = 0.45;
    wellBase.castShadow = true;
    wellGroup.add(wellBase);

    // Water inside well
    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.1, 16), waterMat);
    wellWater.position.y = 0.65;
    wellGroup.add(wellWater);

    // Well Roof Posts
    [-0.95, 0.95].forEach(px => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.2, 0.16), woodMat);
      post.position.set(px, 1.1, 0);
      wellGroup.add(post);
    });

    // Crossbar & crank
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8), woodMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 1.85, 0);
    wellGroup.add(crossbar);

    // Cute A-frame well roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.0, 4), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    roof.position.set(0, 2.45, 0);
    roof.rotation.y = Math.PI / 4;
    wellGroup.add(roof);

    this.group.add(wellGroup);

    if (this.town && this.town.colliders) {
      this.town.colliders.push({ type: 'circle', x: this.position.x + 10, z: this.position.z + 14, r: 1.6 });
    }

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
      if (this.onPlotChanged) this.onPlotChanged(plot.id, plot.state, plot.cropType, 0);
      return { type: 'tilled', label: 'Tilled Soil 🚜' };
    } else if (plot.state === 'tilled') {
      plot.state = 'seeded';
      soundEngine.playPlantSeed();
      this.rebuildPlotMesh(plot);
      if (this.onPlotChanged) this.onPlotChanged(plot.id, plot.state, plot.cropType, 0);
      return { type: 'seeded', label: 'Planted Seeds 🌱' };
    } else if (plot.state === 'seeded') {
      plot.state = 'growing';
      plot.growTimer = 0;
      soundEngine.playWaterCrop();
      this.rebuildPlotMesh(plot);
      if (this.onPlotChanged) this.onPlotChanged(plot.id, plot.state, plot.cropType, 0);
      return { type: 'watered', label: 'Watered Crops 💧' };
    } else if (plot.state === 'ready') {
      // Harvest!
      plot.state = 'tilled'; // Reset to tilled so player can seed again
      soundEngine.playHarvest();
      this.cropInventory += 1;
      this.spawnHarvestSparkles(plot.worldPos.x, 0.6, plot.worldPos.z);
      this.rebuildPlotMesh(plot);
      if (this.onPlotChanged) this.onPlotChanged(plot.id, plot.state, plot.cropType, 0);
      return { type: 'harvested', label: 'Harvested Crops! ✨' };
    }

    return null;
  }

  // Network sync update from partner
  applySyncState(farmingSyncData) {
    if (!farmingSyncData) return;
    for (const plot of this.plots) {
      if (farmingSyncData[plot.id]) {
        const synced = farmingSyncData[plot.id];
        if (synced.state !== plot.state || (synced.cropType && synced.cropType !== plot.cropType)) {
          plot.state = synced.state;
          if (synced.cropType) plot.cropType = synced.cropType;
          plot.growTimer = synced.growTimer || 0;
          this.rebuildPlotMesh(plot);
          if (synced.state === 'tilled' && synced.updatedBy) {
            // Visual harvest sparkle if partner just harvested
            this.spawnHarvestSparkles(plot.worldPos.x, 0.6, plot.worldPos.z);
          }
        }
      }
    }
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
