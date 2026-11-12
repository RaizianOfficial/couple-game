// Procedural Low-Poly Dreamy Pastel Expanded Town (strictly matching Town Layout Map)
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Town {
  constructor(scene, engine = null) {
    this.scene = scene;
    this.engine = engine;
    this.colliders = [];
    this.interactiveSpots = {};

    this.initPalette();
    this.buildGround();
    this.buildBoundaryWalls();
    this.buildRoadsAndPaths();
    this.buildMainYard();
    this.buildEastPlayPark();
    this.buildSouthStreet();
    this.buildGLBAssets();
    this.buildStreetlamps();
  }

  initPalette() {
    this.colors = {
      grass: 0xc7f9cc,
      groundUnder: 0x86efac,
      road: 0xfef3c7,
      water: 0x93c5fd,
      stone: 0xe2e8f0,
      fountainWater: 0x67e8f9,
      woodDark: 0x78350f,
      woodWarm: 0xb45309,
      wallBoundary: 0xc4b5fd, // Pastel purple boundary walls
      wallPink: 0xfce7f3,
      wallLavender: 0xede9fe,
      wallPeach: 0xffedd5,
      wallMint: 0xccfbf1,
      wallSky: 0xe0f2fe,
      wallYellow: 0xfef9c3,
      roofPink: 0xf472b6,
      roofPurple: 0xa78bfa,
      roofOrange: 0xfb923c,
      roofTeal: 0x2dd4bf,
      roofSky: 0x38bdf8,
      roofRose: 0xf43f5e,
      windowGlow: 0xfef08a,
      lampGlow: 0xfffbeb,
      lampPost: 0x475569
    };

    this.materials = {
      grass: new THREE.MeshLambertMaterial({ color: this.colors.grass }),
      road: new THREE.MeshLambertMaterial({ color: this.colors.road }),
      stone: new THREE.MeshLambertMaterial({ color: this.colors.stone }),
      water: new THREE.MeshLambertMaterial({ color: this.colors.water, transparent: true, opacity: 0.88 }),
      wood: new THREE.MeshLambertMaterial({ color: this.colors.woodWarm }),
      woodDark: new THREE.MeshLambertMaterial({ color: this.colors.woodDark }),
      window: new THREE.MeshBasicMaterial({ color: this.colors.windowGlow }),
      lampLight: new THREE.MeshBasicMaterial({ color: this.colors.lampGlow }),
      fountainWater: new THREE.MeshBasicMaterial({ color: this.colors.fountainWater, transparent: true, opacity: 0.8 }),
      foliagePink: new THREE.MeshLambertMaterial({ color: 0xfbcfe8, flatShading: true }),
      foliagePeach: new THREE.MeshLambertMaterial({ color: 0xfed7aa, flatShading: true }),
      foliageMint: new THREE.MeshLambertMaterial({ color: 0xa7f3d0, flatShading: true }),
      foliageLavender: new THREE.MeshLambertMaterial({ color: 0xddd6fe, flatShading: true })
    };
  }

  buildGround() {
    const groundGeo = new THREE.BoxGeometry(150, 1.4, 150);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.position.y = -0.7;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const underGeo = new THREE.BoxGeometry(151.2, 0.6, 151.2);
    const under = new THREE.Mesh(underGeo, new THREE.MeshLambertMaterial({ color: this.colors.groundUnder }));
    under.position.y = -1.2;
    this.scene.add(under);
  }

  buildBoundaryWalls() {
    const wallMat = new THREE.MeshLambertMaterial({ color: this.colors.wallBoundary, flatShading: true });
    const thickness = 4;
    const height = 24;
    const half = 75;

    // North & South
    [-half, half].forEach(z => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(150 + thickness, height, thickness), wallMat);
      w.position.set(0, height / 2, z);
      w.castShadow = true;
      w.receiveShadow = true;
      this.scene.add(w);
      this.colliders.push({ type: 'box', minX: -75, maxX: 75, minZ: z - thickness / 2, maxZ: z + thickness / 2 });
    });

    // East & West
    [-half, half].forEach(x => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, 150 + thickness), wallMat);
      w.position.set(x, height / 2, 0);
      w.castShadow = true;
      w.receiveShadow = true;
      this.scene.add(w);
      this.colliders.push({ type: 'box', minX: x - thickness / 2, maxX: x + thickness / 2, minZ: -75, maxZ: 75 });
    });
  }

  buildRoadsAndPaths() {
    // 1. Central Cross Paths connecting Couple House to all 4 quadrants
    this.createRoadSegment(0, -18, 3.6, 24); // North path to Forest Zone
    this.createRoadSegment(0, 18, 3.6, 24);  // South path to The Main Street
    this.createRoadSegment(18, 0, 24, 3.6);  // East path to Play Park
    this.createRoadSegment(-18, 0, 24, 3.6); // West path to Cozy Backyard

    // 2. North Forest Walking Aisles
    this.createRoadSegment(0, -46, 2.6, 32);  // North center aisle
    this.createRoadSegment(0, -46, 52, 2.6);  // Forest cross aisle

    // 3. Play Park Walkways
    this.createRoadSegment(40, -4, 2.8, 28);
    this.createRoadSegment(40, 10, 24, 2.8);
  }

  createRoadSegment(x, z, width, length) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length), this.materials.road);
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildMainYard() {
    // Attached to East of Couple House (x: 6 to 10, z: -4 to 4)
    const yardGeo = new THREE.BoxGeometry(7.2, 0.06, 8.4);
    const yardMesh = new THREE.Mesh(yardGeo, this.materials.stone);
    yardMesh.position.set(8.2, 0.03, 0);
    yardMesh.receiveShadow = true;
    this.scene.add(yardMesh);

    // Decorative perimeter fence for Main Yard
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const fenceTop = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.8, 0.08), fenceMat);
    fenceTop.position.set(8.2, 0.4, -4.2);
    this.scene.add(fenceTop);

    const fenceRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 8.4), fenceMat);
    fenceRight.position.set(11.8, 0.4, 0);
    this.scene.add(fenceRight);

    // Patio Table & Couple Chairs in Main Yard
    const tableMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 16), tableMat);
    table.position.set(8.2, 0.38, -1.2);
    table.castShadow = true;
    this.scene.add(table);
    this.colliders.push({ type: 'circle', x: 8.2, z: -1.2, r: 1.0 });

    [-1.2, 1.2].forEach(cz => {
      const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.45, 12), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
      chair.position.set(8.2, 0.25, -1.2 + cz);
      this.scene.add(chair);
    });
  }

  buildEastPlayPark() {
    // East Play Park turf area (x: 28 to 52, z: -18 to 22)
    const parkTurf = new THREE.Mesh(new THREE.BoxGeometry(24, 0.02, 40), new THREE.MeshLambertMaterial({ color: 0xbbf7d0 }));
    parkTurf.position.set(40, 0.015, 2);
    parkTurf.receiveShadow = true;
    this.scene.add(parkTurf);

    // Play park decorative perimeter border
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
    const bTop = new THREE.Mesh(new THREE.BoxGeometry(24.4, 0.25, 0.3), borderMat);
    bTop.position.set(40, 0.12, -18);
    this.scene.add(bTop);

    const bBottom = new THREE.Mesh(new THREE.BoxGeometry(24.4, 0.25, 0.3), borderMat);
    bBottom.position.set(40, 0.12, 22);
    this.scene.add(bBottom);

    const bRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 40), borderMat);
    bRight.position.set(52, 0.12, 2);
    this.scene.add(bRight);

    this.colliders.push({ type: 'box', minX: 27.8, maxX: 52.2, minZ: -18.2, maxZ: -17.8 });
    this.colliders.push({ type: 'box', minX: 27.8, maxX: 52.2, minZ: 21.8, maxZ: 22.2 });
    this.colliders.push({ type: 'box', minX: 51.8, maxX: 52.2, minZ: -18, maxZ: 22 });

    // Colorful Park Flowers
    const flowerGeo = new THREE.DodecahedronGeometry(0.14, 0);
    const flowerColors = [0xf472b6, 0xfb7185, 0xfde047, 0xa78bfa, 0x38bdf8];
    for (let i = 0; i < 40; i++) {
      const fl = new THREE.Mesh(flowerGeo, new THREE.MeshBasicMaterial({ color: flowerColors[i % 5] }));
      fl.position.set(30 + (i % 8) * 2.8, 0.12, -16 + Math.floor(i / 8) * 8.5 + (Math.sin(i) * 1.5));
      this.scene.add(fl);
    }
  }

  buildSouthStreet() {
    // The Main Street asphalt roadway (looping along South z: 34 to 48)
    const asphaltMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const roadMain = new THREE.Mesh(new THREE.BoxGeometry(82, 0.05, 8.4), asphaltMat);
    roadMain.position.set(0, 0.025, 42);
    roadMain.receiveShadow = true;
    this.scene.add(roadMain);

    // Yellow dashed center road markings
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let x = -36; x <= 36; x += 4.5) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.22), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.052, 42);
      this.scene.add(stripe);
    }

    // Curbs & Sidewalks along south side
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(84, 0.14, 4.2), sidewalkMat);
    sidewalk.position.set(0, 0.07, 48.3);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    // Scooter & Buggy Parking Bay at (2, 0, 42)
    const parkingBay = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.06, 5.4), new THREE.MeshLambertMaterial({ color: 0x475569 }));
    parkingBay.position.set(2, 0.03, 42);
    this.scene.add(parkingBay);

    // White parking lot lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-4.2, -1.4, 1.4, 4.2].forEach(lx => {
      const pLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4.8), lineMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(2 + lx, 0.065, 42);
      this.scene.add(pLine);
    });
  }

  buildGLBAssets() {
    const loader = new GLTFLoader();

    // 1. Apartment Block on South Main Street (38, 0, 44)
    loader.load('./GLBs/assets/apartment-block-01.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(38, 0, 44);
      model.rotation.y = 0;
      model.scale.setScalar(1.0);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (this.engine) this.engine.registerWallObstacle(child);
        }
      });
      this.scene.add(model);
      this.colliders.push({ type: 'box', minX: 32.5, maxX: 43.5, minZ: 40.0, maxZ: 48.0 });
    });

    // 2. Cozy General Store / Shed in West Backyard (-24, 0, -14)
    loader.load('./GLBs/assets/bld-general-store-01.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(-24, 0, -14);
      model.rotation.y = Math.PI / 2;
      model.scale.setScalar(1.0);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (this.engine) this.engine.registerWallObstacle(child);
        }
      });
      this.scene.add(model);
      this.colliders.push({ type: 'box', minX: -27.5, maxX: -20.5, minZ: -17.5, maxZ: -10.5 });
    });

    // 3. Stepping Stones at scenic creek crossing in Pets Zone (-28, 0, -32)
    loader.load('./GLBs/assets/creek-stepping-stones.glb', (gltf) => {
      const stones = gltf.scene;
      stones.position.set(-28, 0, -32);
      stones.scale.setScalar(1.0);
      stones.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });
      this.scene.add(stones);
    });
  }

  buildTrees() {
    // Choppable trees organized in North Forest Zone by TreeChoppingSystem
  }

  createTree(x, z, type, scale) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 8), this.materials.woodDark);
    trunk.position.y = 1 * scale;
    grp.add(trunk);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 * scale, 1), this.materials[type]);
    crown.position.y = 2.8 * scale;
    grp.add(crown);
    this.scene.add(grp);
    this.colliders.push({ type: 'circle', x, z, r: 0.5 * scale });
  }

  buildStreetlamps() {
    this.streetLamps = [];
    // Placement along major plaza perimeter, riverfront & park paths
    const lampCoords = [
      { x: -10, z: -10 }, { x: 10, z: -10 },
      { x: -10, z: 10 }, { x: 10, z: 10 },
      { x: -24, z: 0 }, { x: 24, z: 0 },
      { x: 0, z: 22 }, { x: 0, z: -22 },
      { x: -35, z: 18 }, { x: -35, z: -18 },
      { x: 35, z: 18 }, { x: 35, z: -18 }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm golden glow

    lampCoords.forEach((lc, idx) => {
      const lampGrp = new THREE.Group();
      lampGrp.position.set(lc.x, 0, lc.z);

      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.35, 8), poleMat);
      base.position.y = 0.175;
      lampGrp.add(base);

      // Pole (height 3.2m)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8), poleMat);
      pole.position.y = 1.65;
      pole.castShadow = true;
      lampGrp.add(pole);

      // Curved lantern arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), poleMat);
      arm.position.set(0.18, 3.15, 0);
      lampGrp.add(arm);

      // Glowing Lantern head
      const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), glassMat);
      lantern.position.set(0.38, 3.05, 0);
      lampGrp.add(lantern);

      // Optional PointLight for night ambiance on alternating lamps to maintain 60 FPS
      let light = null;
      if (idx % 2 === 0) {
        light = new THREE.PointLight(0xfef08a, 0, 14, 1.8);
        light.position.set(0.38, 3.0, 0);
        lampGrp.add(light);
      }

      this.scene.add(lampGrp);
      this.colliders.push({ type: 'circle', x: lc.x, z: lc.z, r: 0.35 });

      this.streetLamps.push({ group: lampGrp, lantern, light });
    });
  }

  setStreetLampsNight(isNight) {
    if (!this.streetLamps) return;
    this.streetLamps.forEach(lamp => {
      if (lamp.lantern) {
        lamp.lantern.material.color.setHex(isNight ? 0xfff08a : 0xe2e8f0);
      }
      if (lamp.light) {
        lamp.light.intensity = isNight ? 1.6 : 0;
      }
    });
  }

  checkCollision(x, z, radius = 0.35) {
    if (x < -74 || x > 74 || z < -74 || z > 74) return true;
    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      if (col.type === 'circle') {
        if (Math.hypot(x - col.x, z - col.z) < col.r + radius) return true;
      } else if (col.type === 'box') {
        if (x + radius > col.minX && x - radius < col.maxX && z + radius > col.minZ && z - radius < col.maxZ) return true;
      }
    }
    return false;
  }
}