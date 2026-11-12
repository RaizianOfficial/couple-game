// Interactive Chairs & Park Benches System for Couples
import * as THREE from 'three';
import { getGLTFLoader } from '../loader.js';

export class ChairSpotSystem {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.benches = [];

    this.buildInteractiveBenches();
    this.loadBenchGLB();
  }

  loadBenchGLB() {
    const loader = getGLTFLoader();
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const benchUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}GLBs/assets/bench-01.glb`;
    loader.load(benchUrl, (gltf) => {
      this.benches.forEach(b => {
        while (b.group.children.length > 0) {
          b.group.remove(b.group.children[0]);
        }
        const model = gltf.scene.clone();
        model.traverse(c => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        b.group.add(model);
      });
    });
  }

  buildInteractiveBenches() {
    // Couple benches positioned strictly matching the Town Layout Map
    const benchLocations = [
      { id: 'bench_park_1', x: 36.0, z: 16.0, rot: 0 },
      { id: 'bench_park_2', x: 44.0, z: 16.0, rot: 0 },
      { id: 'bench_street', x: 18.0, z: 42.0, rot: Math.PI },
      { id: 'bench_yard', x: 10.5, z: -1.2, rot: -Math.PI / 2 },
      { id: 'bench_forest_view', x: 0.0, z: -28.0, rot: 0 }
    ];

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

    benchLocations.forEach(b => {
      const group = new THREE.Group();
      group.position.set(b.x, 0, b.z);
      group.rotation.y = b.rot;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.48), woodMat);
      seat.position.y = 0.42;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.06), woodMat);
      back.position.set(0, 0.72, -0.22);
      group.add(back);

      [-0.75, 0.75].forEach(lx => {
        const legF = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), ironMat);
        legF.position.set(lx, 0.21, 0.2);
        group.add(legF);

        const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), ironMat);
        legB.position.set(lx, 0.45, -0.22);
        group.add(legB);
      });

      this.scene.add(group);

      this.benches.push({
        id: b.id,
        group,
        position: new THREE.Vector3(b.x, 0, b.z),
        rotationY: b.rot,
        seatLeftOccupant: null,
        seatRightOccupant: null
      });

      if (this.town && this.town.colliders) {
        this.town.colliders.push({ type: 'circle', x: b.x, z: b.z, r: 0.55 });
      }
    });
  }

  getNearestBench(myPos, maxDist = 2.4) {
    if (!myPos) return null;
    let closest = null;
    let closestDist = maxDist;
    for (const b of this.benches) {
      const d = Math.hypot(myPos.x - b.position.x, myPos.z - b.position.z);
      if (d < closestDist) {
        closestDist = d;
        closest = b;
      }
    }
    return closest;
  }

  getBenchById(id) {
    return this.benches.find(b => b.id === id) || null;
  }

  getSeatWorldPos(bench, isLeft = true) {
    const localX = isLeft ? -0.42 : 0.42;
    const local = new THREE.Vector3(localX, 0.42, 0.05);
    bench.group.localToWorld(local);
    return local;
  }

  getDismountWorldPos(bench) {
    const local = new THREE.Vector3(0, 0, 0.95);
    bench.group.localToWorld(local);
    return local;
  }
}