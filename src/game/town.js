// Procedural Low-Poly Dreamy Pastel Expanded Town (strictly matching Town Layout Map)
import * as THREE from 'three';
import { getGLTFLoader } from './loader.js';

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
      if (this.engine) this.engine.registerWallObstacle(w);
      this.colliders.push({ type: 'box', minX: -75, maxX: 75, minZ: z - thickness / 2, maxZ: z + thickness / 2 });
    });

    // East & West
    [-half, half].forEach(x => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, 150 + thickness), wallMat);
      w.position.set(x, height / 2, 0);
      w.castShadow = true;
      w.receiveShadow = true;
      this.scene.add(w);
      if (this.engine) this.engine.registerWallObstacle(w);
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

  addHouseWallColliders(x, z, width, depth, rotY = 0, doorWidth = 1.6) {
    // Solid perimeter walls with front entrance left open for Hide & Seek gameplay!
    const halfW = width / 2;
    const halfD = depth / 2;
    const wallThick = 0.35;

    // Normalize rotation angle
    let normRot = rotY % (Math.PI * 2);
    if (normRot < 0) normRot += Math.PI * 2;

    if (Math.abs(normRot - Math.PI / 2) < 0.2) {
      // Facing East (+X): Doorway opens on +X front
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z - halfW - wallThick, maxZ: z - halfW }); // North wall
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z + halfW, maxZ: z + halfW + wallThick }); // South wall
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z - halfW, maxZ: z + halfW }); // Back West wall
      // Front East wall pillars
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z - halfW, maxZ: z - doorWidth / 2 });
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z + doorWidth / 2, maxZ: z + halfW });
    } else if (Math.abs(normRot - 3 * Math.PI / 2) < 0.2) {
      // Facing West (-X): Doorway opens on -X front
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z - halfW - wallThick, maxZ: z - halfW });
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z + halfW, maxZ: z + halfW + wallThick });
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z - halfW, maxZ: z + halfW });
      // Front West wall pillars
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z - halfW, maxZ: z - doorWidth / 2 });
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z + doorWidth / 2, maxZ: z + halfW });
    } else if (Math.abs(normRot - Math.PI) < 0.2) {
      // Facing South (+Z): Doorway opens on +Z front
      this.colliders.push({ type: 'box', minX: x - halfW - wallThick, maxX: x - halfW, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x + halfW, maxX: x + halfW + wallThick, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x + halfW, minZ: z - halfD - wallThick, maxZ: z - halfD });
      // Front South wall pillars
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x - doorWidth / 2, minZ: z + halfD, maxZ: z + halfD + wallThick });
      this.colliders.push({ type: 'box', minX: x + doorWidth / 2, maxX: x + halfW, minZ: z + halfD, maxZ: z + halfD + wallThick });
    } else {
      // Facing North (-Z): Doorway opens on -Z front
      this.colliders.push({ type: 'box', minX: x - halfW - wallThick, maxX: x - halfW, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x + halfW, maxX: x + halfW + wallThick, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x + halfW, minZ: z + halfD, maxZ: z + halfD + wallThick });
      // Front North wall pillars
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x - doorWidth / 2, minZ: z - halfD - wallThick, maxZ: z - halfD });
      this.colliders.push({ type: 'box', minX: x + doorWidth / 2, maxX: x + halfW, minZ: z - halfD - wallThick, maxZ: z - halfD });
    }
  }

  buildGLBAssets() {
    const loader = getGLTFLoader();
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    // 1. Modular 3D Roads & Corner turns using user's GLB pieces
    loader.load(`${cleanBase}GLBs/assets/road-straight-accessible-01.glb`, (straightGltf) => {
      loader.load(`${cleanBase}GLBs/assets/road-corner-accessible-01.glb`, (cornerGltf) => {
        const roadGroup = new THREE.Group();

        const straightBase = straightGltf.scene;
        straightBase.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = false;
            c.receiveShadow = true;
          }
        });

        const cornerBase = cornerGltf.scene;
        cornerBase.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = false;
            c.receiveShadow = true;
          }
        });

        // A. Horizontal South Main Street (z = 42, step = 4m from x = -28 to +28)
        for (let x = -28; x <= 28; x += 4) {
          const tile = straightBase.clone();
          tile.position.set(x, 0, 42);
          tile.rotation.y = Math.PI / 2;
          roadGroup.add(tile);
        }

        // B. Corner Turns at East and West ends of Main Street
        // West Corner (x = -32, z = 42) turning North
        const westCorner = cornerBase.clone();
        westCorner.position.set(-32, 0, 42);
        westCorner.rotation.y = Math.PI / 2;
        roadGroup.add(westCorner);

        // East Corner (x = 32, z = 42) turning North
        const eastCorner = cornerBase.clone();
        eastCorner.position.set(32, 0, 42);
        eastCorner.rotation.y = 0;
        roadGroup.add(eastCorner);

        // C. Northward road extensions from corners
        for (let z = 38; z >= 26; z -= 4) {
          const westTurnTile = straightBase.clone();
          westTurnTile.position.set(-32, 0, z);
          roadGroup.add(westTurnTile);

          const eastTurnTile = straightBase.clone();
          eastTurnTile.position.set(32, 0, z);
          roadGroup.add(eastTurnTile);
        }

        // D. Central Avenue connecting South Main Street to Couple House (x = 0, z = 38 down to 10)
        for (let z = 38; z >= 10; z -= 4) {
          const centerTile = straightBase.clone();
          centerTile.position.set(0, 0, z);
          roadGroup.add(centerTile);
        }

        this.scene.add(roadGroup);
      }, undefined, (err) => console.error('[Town] Road corner GLB failed:', err));
    }, undefined, (err) => console.error('[Town] Road straight GLB failed:', err));

    // 2. Hide & Seek Town Houses (Apartment Blocks & Cozy Cottages)
    // A. Multi-Story Apartment Blocks (South-East, South-West, and West Boundary)
    loader.load(`${cleanBase}GLBs/assets/apartment-block-01.glb`, (gltf) => {
      const apartmentConfigs = [
        { x: 38, z: 44, rotY: 0, w: 7.6, d: 6.8 },
        { x: -38, z: 44, rotY: 0, w: 7.6, d: 6.8 },
        { x: -44, z: 18, rotY: Math.PI / 2, w: 7.6, d: 6.8 }
      ];

      apartmentConfigs.forEach((cfg) => {
        const apt = gltf.scene.clone();
        apt.position.set(cfg.x, 0, cfg.z);
        apt.rotation.y = cfg.rotY;
        apt.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (this.engine) this.engine.registerWallObstacle(child);
          }
        });
        this.scene.add(apt);
        // Wall colliders only: entrance remains walkable for hide and seek!
        this.addHouseWallColliders(cfg.x, cfg.z, cfg.w, cfg.d, cfg.rotY, 2.0);
      });
    }, undefined, (err) => console.error('[Town] Apartment block GLB failed:', err));

    // B. Cozy Cottages & Hideout Houses for Hide & Seek (General Store model)
    loader.load(`${cleanBase}GLBs/assets/bld-general-store-01.glb`, (gltf) => {
      const houseConfigs = [
        // Backyard Shed & Pantry
        { x: -24, z: -14, rotY: Math.PI / 2, w: 3.4, d: 3.8 },
        // Parkside Tea Cottage
        { x: 24, z: -22, rotY: -Math.PI / 2, w: 3.4, d: 3.8 },
        // South Street Cafe
        { x: 20, z: 32, rotY: Math.PI, w: 3.4, d: 3.8 },
        // South Street Flower Boutique
        { x: -20, z: 32, rotY: Math.PI, w: 3.4, d: 3.8 },
        // Secret Forest Hideout Cabin (Deep in North Forest for Hide & Seek!)
        { x: 0, z: -58, rotY: 0, w: 3.4, d: 3.8 }
      ];

      houseConfigs.forEach((cfg) => {
        const house = gltf.scene.clone();
        house.position.set(cfg.x, 0, cfg.z);
        house.rotation.y = cfg.rotY;
        house.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (this.engine) this.engine.registerWallObstacle(child);
          }
        });
        this.scene.add(house);
        // Wall colliders only: front doorway open so partners can hide inside!
        this.addHouseWallColliders(cfg.x, cfg.z, cfg.w, cfg.d, cfg.rotY, 1.4);
      });
    }, undefined, (err) => console.error('[Town] General store GLB failed:', err));

    // 3. Stepping Stones at scenic creek crossing in Pets Zone (-28, 0, -32)
    loader.load(`${cleanBase}GLBs/assets/creek-stepping-stones.glb`, (gltf) => {
      const stones = gltf.scene;
      stones.position.set(-28, 0, -32);
      stones.scale.setScalar(1.0);
      stones.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });
      this.scene.add(stones);
    }, undefined, (err) => console.error('[Town] Stepping stones GLB failed:', err));
  }

  buildTrees() {
    // Choppable trees organized in North Forest Zone by TreeChoppingSystem
  }

  buildStreetlamps() {
    this.streetLamps = [];
    const lampCoords = [
      { x: -8, z: -10 }, { x: 8, z: -10 },
      { x: -8, z: 10 }, { x: 8, z: 10 },
      { x: -20, z: 42 }, { x: 20, z: 42 },
      { x: 0, z: 24 }, { x: 0, z: -24 }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm glow with 0 GPU light cost

    lampCoords.forEach((lc) => {
      const lampGrp = new THREE.Group();
      lampGrp.position.set(lc.x, 0, lc.z);

      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.35, 8), poleMat);
      base.position.y = 0.175;
      lampGrp.add(base);

      // Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8), poleMat);
      pole.position.y = 1.65;
      lampGrp.add(pole);

      // Curved lantern arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), poleMat);
      arm.position.set(0.18, 3.15, 0);
      lampGrp.add(arm);

      // Glowing Lantern head (emissive basic material)
      const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), glassMat);
      lantern.position.set(0.38, 3.05, 0);
      lampGrp.add(lantern);

      this.scene.add(lampGrp);
      this.colliders.push({ type: 'circle', x: lc.x, z: lc.z, r: 0.35 });

      this.streetLamps.push({ group: lampGrp, lantern });
    });
  }

  setStreetLampsNight(isNight) {
    if (!this.streetLamps) return;
    this.streetLamps.forEach(lamp => {
      if (lamp.lantern) {
        lamp.lantern.material.color.setHex(isNight ? 0xfff08a : 0x94a3b8);
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