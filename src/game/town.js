// Romantic Blossom Island / Valley - Dreamy Pastel World for Couples
import * as THREE from 'three';
import { getGLTFLoader } from './loader.js';

export class Town {
  constructor(scene, engine = null) {
    this.scene = scene;
    this.engine = engine;
    this.colliders = [];
    this.interactiveSpots = {};

    this.initPalette();
    this.buildGroundAndRiver();
    this.buildBoundaryWalls();
    this.buildRoadsAndPaths();
    this.buildBlossomBridges();
    this.buildMainYard();
    this.buildEastPlayPark();
    this.buildSouthStreet();
    this.buildCherryBlossomGroves();
    this.buildPicnicSpotsAndTreehouses();
    this.buildHideAndSeekProps();
    this.buildGLBAssets();
    this.buildStreetlamps();
  }

  initPalette() {
    this.colors = {
      grass: 0xbbf7d0,        // Soft lively pastel mint green
      groundUnder: 0x86efac,
      road: 0xffedd5,         // Warm peach-cream stone path
      water: 0x7dd3fc,        // Crystal sparkling lagoon blue
      waterDeep: 0x38bdf8,
      stone: 0xe2e8f0,
      fountainWater: 0x67e8f9,
      woodDark: 0x78350f,
      woodWarm: 0xb45309,
      wallBoundary: 0xddd6fe, // Soft lavender mountain walls
      wallPink: 0xfce7f3,
      wallLavender: 0xede9fe,
      wallPeach: 0xffedd5,
      sakuraPink: 0xfbcfe8,   // Delicate Cherry Blossom Pink
      sakuraRose: 0xf472b6,   // Rich Cherry Blossom Rose
      sakuraWhite: 0xfff1f2,  // White Blossom
      sakuraPurple: 0xe9d5ff, // Lilac Blossom
      windowGlow: 0xfef08a,
      lampGlow: 0xfffbeb,
      lampPost: 0x475569
    };

    this.materials = {
      grass: new THREE.MeshLambertMaterial({ color: this.colors.grass }),
      road: new THREE.MeshLambertMaterial({ color: this.colors.road }),
      stone: new THREE.MeshLambertMaterial({ color: this.colors.stone }),
      water: new THREE.MeshLambertMaterial({ color: this.colors.water, transparent: true, opacity: 0.85 }),
      wood: new THREE.MeshLambertMaterial({ color: this.colors.woodWarm }),
      woodDark: new THREE.MeshLambertMaterial({ color: this.colors.woodDark }),
      window: new THREE.MeshBasicMaterial({ color: this.colors.windowGlow }),
      lampLight: new THREE.MeshBasicMaterial({ color: this.colors.lampGlow }),
      fountainWater: new THREE.MeshBasicMaterial({ color: this.colors.fountainWater, transparent: true, opacity: 0.85 }),
      sakuraPink: new THREE.MeshLambertMaterial({ color: this.colors.sakuraPink, flatShading: true }),
      sakuraRose: new THREE.MeshLambertMaterial({ color: this.colors.sakuraRose, flatShading: true }),
      sakuraWhite: new THREE.MeshLambertMaterial({ color: this.colors.sakuraWhite, flatShading: true }),
      sakuraPurple: new THREE.MeshLambertMaterial({ color: this.colors.sakuraPurple, flatShading: true })
    };
  }

  buildGroundAndRiver() {
    // 1. Base Island Meadow
    const groundGeo = new THREE.BoxGeometry(150, 1.4, 150);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.position.y = -0.7;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const underGeo = new THREE.BoxGeometry(151.2, 0.6, 151.2);
    const under = new THREE.Mesh(underGeo, new THREE.MeshLambertMaterial({ color: this.colors.groundUnder }));
    under.position.y = -1.2;
    this.scene.add(under);

    // 2. Romantic Scenic River (meandering through the West-North of the Island)
    // River Bed & Crystal Water (x = -32, flowing z = -72 to z = 22)
    const riverGeo = new THREE.BoxGeometry(7.5, 0.2, 94);
    const riverWater = new THREE.Mesh(riverGeo, this.materials.water);
    riverWater.position.set(-32, -0.05, -25);
    riverWater.receiveShadow = true;
    this.scene.add(riverWater);

    // River stone riverbanks (natural rounded stepping stones)
    const bankMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, flatShading: true });
    for (let z = -70; z <= 20; z += 5) {
      const rockL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 + Math.sin(z) * 0.2, 0), bankMat);
      rockL.position.set(-36.2 + Math.cos(z * 0.4) * 0.3, 0.15, z);
      rockL.castShadow = true;
      this.scene.add(rockL);

      const rockR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 + Math.cos(z) * 0.2, 0), bankMat);
      rockR.position.set(-27.8 + Math.sin(z * 0.4) * 0.3, 0.15, z);
      rockR.castShadow = true;
      this.scene.add(rockR);
    }
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
    // Warm Peach-Cream Stone Pathways connecting the Villa, River, Park & Groves
    this.createRoadSegment(0, -18, 3.6, 24); // North path to Blossom Groves
    this.createRoadSegment(0, 18, 3.6, 24);  // South path to The Promenade
    this.createRoadSegment(18, 0, 24, 3.6);  // East path to Play Park
    this.createRoadSegment(-18, 0, 28, 3.6); // West path to River Wooden Bridge

    // North Forest Walking Aisles
    this.createRoadSegment(0, -46, 2.6, 32);
    this.createRoadSegment(0, -46, 52, 2.6);

    // Play Park Walkways
    this.createRoadSegment(40, -4, 2.8, 28);
    this.createRoadSegment(40, 10, 24, 2.8);
  }

  createRoadSegment(x, z, width, length) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length), this.materials.road);
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildBlossomBridges() {
    // Romantic Arched Wooden Bridges over River (crossing at z = 0 and z = -32)
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x9a3412 });
    const ropeMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });

    const bridgeCoords = [
      { x: -32, z: 0 },
      { x: -32, z: -32 }
    ];

    bridgeCoords.forEach(bc => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(bc.x, 0, bc.z);

      // Deck planks
      const deck = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.22, 3.6), woodMat);
      deck.position.y = 0.25;
      deck.receiveShadow = true;
      bridgeGroup.add(deck);

      // Japanese Red Torii / Railings on bridge
      [-1.65, 1.65].forEach(rz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.14, 0.14), redMat);
        rail.position.set(0, 1.1, rz);
        bridgeGroup.add(rail);

        const subRail = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.08, 0.08), woodMat);
        subRail.position.set(0, 0.65, rz);
        bridgeGroup.add(subRail);

        [-4.2, -2.1, 0, 2.1, 4.2].forEach(px => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 8), redMat);
          post.position.set(px, 0.65, rz);
          post.castShadow = true;
          bridgeGroup.add(post);
        });
      });

      this.scene.add(bridgeGroup);
    });
  }

  buildCherryBlossomGroves() {
    // 🌸 Breathtaking Cherry Blossom Trees across the Island!
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c2b14 }); // Dark rich wood
    const sakuraPalette = [
      this.materials.sakuraPink,
      this.materials.sakuraRose,
      this.materials.sakuraWhite,
      this.materials.sakuraPurple
    ];

    const treeLocations = [
      // Flanking Couple Villa
      { x: -7, z: 2, scale: 1.1 },
      { x: -7, z: -3, scale: 1.0 },
      { x: 7, z: 6, scale: 1.15 },
      // River Promenade
      { x: -26, z: 12, scale: 1.2 },
      { x: -26, z: -12, scale: 1.25 },
      { x: -26, z: -24, scale: 1.1 },
      { x: -26, z: -44, scale: 1.3 },
      { x: -38, z: -10, scale: 1.2 },
      { x: -38, z: -25, scale: 1.15 },
      // Central Avenue Romantic Aisle
      { x: -4.5, z: 18, scale: 1.0 },
      { x: 4.5, z: 18, scale: 1.0 },
      { x: -4.5, z: 28, scale: 1.1 },
      { x: 4.5, z: 28, scale: 1.1 },
      // North Romantic Blossom Valley
      { x: -14, z: -28, scale: 1.3 },
      { x: 14, z: -28, scale: 1.3 },
      { x: -22, z: -52, scale: 1.4 },
      { x: 22, z: -52, scale: 1.4 },
      { x: -10, z: -60, scale: 1.35 },
      { x: 10, z: -60, scale: 1.35 },
      // East Play Park Edges
      { x: 28, z: -14, scale: 1.1 },
      { x: 50, z: -14, scale: 1.2 },
      { x: 50, z: 14, scale: 1.15 }
    ];

    treeLocations.forEach((loc, idx) => {
      const treeGrp = new THREE.Group();
      treeGrp.position.set(loc.x, 0, loc.z);
      treeGrp.scale.setScalar(loc.scale);

      // Curved Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.2, 8), trunkMat);
      trunk.position.y = 1.6;
      trunk.rotation.z = (Math.sin(idx) * 0.08);
      trunk.castShadow = true;
      treeGrp.add(trunk);

      // Branches
      const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6), trunkMat);
      branchL.position.set(-0.4, 2.6, 0);
      branchL.rotation.z = 0.55;
      treeGrp.add(branchL);

      const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6), trunkMat);
      branchR.position.set(0.4, 2.7, 0);
      branchR.rotation.z = -0.55;
      treeGrp.add(branchR);

      // Fluffy Sakura Flower Clouds (Multi-layer foliage)
      const mat = sakuraPalette[idx % sakuraPalette.length];
      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), mat);
      crown1.position.set(0, 3.6, 0);
      crown1.castShadow = true;
      treeGrp.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), mat);
      crown2.position.set(-0.8, 3.3, 0.4);
      crown2.castShadow = true;
      treeGrp.add(crown2);

      const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), mat);
      crown3.position.set(0.8, 3.4, -0.3);
      crown3.castShadow = true;
      treeGrp.add(crown3);

      const crownTop = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), mat);
      crownTop.position.set(0, 4.4, 0.2);
      crownTop.castShadow = true;
      treeGrp.add(crownTop);

      this.scene.add(treeGrp);
      this.colliders.push({ type: 'circle', x: loc.x, z: loc.z, r: 0.5 });
    });
  }

  buildPicnicSpotsAndTreehouses() {
    // 1. Romantic Couple Picnic Spot under Sakura Tree (x = -14, z = 14)
    const picnicMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e }); // Red-white checkered picnic blanket
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 2.8), picnicMat);
    blanket.position.set(-14, 0.03, 14);
    blanket.receiveShadow = true;
    this.scene.add(blanket);

    // Cute Wicker Picnic Basket + Fruits
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.5), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
    basket.position.set(-14, 0.25, 14);
    basket.castShadow = true;
    this.scene.add(basket);

    // Couple Pillows
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }));
    pillow1.position.set(-14.8, 0.1, 14);
    this.scene.add(pillow1);

    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.6), new THREE.MeshLambertMaterial({ color: 0x93c5fd }));
    pillow2.position.set(-13.2, 0.1, 14);
    this.scene.add(pillow2);

    // 2. Secret Romantic Hideout Treehouse for Hide & Seek (x = -42, z = -32)
    const thGrp = new THREE.Group();
    thGrp.position.set(-42, 0, -32);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0xfde68a });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xf472b6, flatShading: true });

    // 4 Tall Stilt Support Pillars
    [-1.4, 1.4].forEach(px => {
      [-1.4, 1.4].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.2), woodMat);
        post.position.set(px, 1.6, pz);
        post.castShadow = true;
        thGrp.add(post);
      });
    });

    // Elevated Lookout Deck
    const thFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 3.6), woodMat);
    thFloor.position.set(0, 3.2, 0);
    thGrp.add(thFloor);

    // Cute Cabin Walls (Doorway open so partners can hide inside!)
    const thLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 3.2), cabinMat);
    thLeft.position.set(-1.5, 4.3, 0);
    thGrp.add(thLeft);

    const thRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 3.2), cabinMat);
    thRight.position.set(1.5, 4.3, 0);
    thGrp.add(thRight);

    const thBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.18), cabinMat);
    thBack.position.set(0, 4.3, -1.5);
    thGrp.add(thBack);

    // Cute Peaked Shingle Roof
    const thRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.5, 4), roofMat);
    thRoof.position.set(0, 5.9, 0);
    thRoof.rotation.y = Math.PI / 4;
    thRoof.castShadow = true;
    thGrp.add(thRoof);

    // Wooden Ladder
    for (let r = 0.4; r <= 3.0; r += 0.45) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.08), woodMat);
      rung.position.set(0, r, 1.8);
      thGrp.add(rung);
    }

    this.scene.add(thGrp);
    this.colliders.push({ type: 'box', minX: -44, maxX: -40, minZ: -34, maxZ: -30 });
  }

  buildMainYard() {
    const yardGeo = new THREE.BoxGeometry(7.2, 0.06, 8.4);
    const yardMesh = new THREE.Mesh(yardGeo, this.materials.stone);
    yardMesh.position.set(8.2, 0.03, 0);
    yardMesh.receiveShadow = true;
    this.scene.add(yardMesh);

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
    const parkTurf = new THREE.Mesh(new THREE.BoxGeometry(24, 0.02, 40), new THREE.MeshLambertMaterial({ color: 0xbbf7d0 }));
    parkTurf.position.set(40, 0.015, 2);
    parkTurf.receiveShadow = true;
    this.scene.add(parkTurf);

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
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(84, 0.14, 4.2), sidewalkMat);
    sidewalk.position.set(0, 0.07, 48.3);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    const parkingBay = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.06, 5.4), new THREE.MeshLambertMaterial({ color: 0x475569 }));
    parkingBay.position.set(2, 0.03, 42);
    this.scene.add(parkingBay);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-4.2, -1.4, 1.4, 4.2].forEach(lx => {
      const pLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4.8), lineMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(2 + lx, 0.065, 42);
      this.scene.add(pLine);
    });
  }

  buildGLBAssets() {
    const loader = getGLTFLoader();
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    // 1. Modular 3D Roads & Corner Turns using user's GLB pieces
    let straightBase = null;
    let cornerBase = null;

    const tryBuildRoads = () => {
      if (!straightBase || !cornerBase) return;
      const roadGroup = new THREE.Group();
      const roadY = 0.08;

      // Horizontal South Main Street
      for (let x = -28; x <= 28; x += 4) {
        const tile = straightBase.clone();
        tile.position.set(x, roadY, 42);
        tile.rotation.y = Math.PI / 2;
        roadGroup.add(tile);
      }

      // Corners
      const westCorner = cornerBase.clone();
      westCorner.position.set(-32, roadY, 42);
      westCorner.rotation.y = Math.PI / 2;
      roadGroup.add(westCorner);

      const eastCorner = cornerBase.clone();
      eastCorner.position.set(32, roadY, 42);
      eastCorner.rotation.y = 0;
      roadGroup.add(eastCorner);

      // Extensions from corners
      for (let z = 38; z >= 22; z -= 4) {
        const westTurnTile = straightBase.clone();
        westTurnTile.position.set(-32, roadY, z);
        roadGroup.add(westTurnTile);

        const eastTurnTile = straightBase.clone();
        eastTurnTile.position.set(32, roadY, z);
        roadGroup.add(eastTurnTile);
      }

      // Central Avenue
      for (let z = 38; z >= 8; z -= 4) {
        const centerTile = straightBase.clone();
        centerTile.position.set(0, roadY, z);
        roadGroup.add(centerTile);
      }

      this.scene.add(roadGroup);
    };

    loader.load(`${cleanBase}GLBs/assets/road-straight-accessible-01.glb`, (gltf) => {
      straightBase = gltf.scene;
      straightBase.traverse((c) => {
        if (c.isMesh) { c.castShadow = false; c.receiveShadow = true; }
      });
      tryBuildRoads();
    }, undefined, (err) => console.error('[Town] Road straight GLB error:', err));

    loader.load(`${cleanBase}GLBs/assets/road-corner-accessible-01.glb`, (gltf) => {
      cornerBase = gltf.scene;
      cornerBase.traverse((c) => {
        if (c.isMesh) { c.castShadow = false; c.receiveShadow = true; }
      });
      tryBuildRoads();
    }, undefined, (err) => console.error('[Town] Road corner GLB error:', err));

    // 2. Base Flagstone Paving Tiles
    loader.load(`${cleanBase}GLBs/assets/agora-flagstone-tile.glb`, (gltf) => {
      const tileGroup = new THREE.Group();
      const baseTile = gltf.scene;
      baseTile.traverse((c) => {
        if (c.isMesh) { c.castShadow = false; c.receiveShadow = true; }
      });

      const tileY = 0.05;

      for (let z = -10; z >= -34; z -= 4) {
        const t = baseTile.clone();
        t.position.set(0, tileY, z);
        tileGroup.add(t);
      }
      for (let x = 10; x <= 30; x += 4) {
        const t = baseTile.clone();
        t.position.set(x, tileY, 0);
        tileGroup.add(t);
      }
      for (let x = -10; x >= -30; x -= 4) {
        const t = baseTile.clone();
        t.position.set(x, tileY, 0);
        tileGroup.add(t);
      }

      this.scene.add(tileGroup);
    }, undefined, (err) => console.error('[Town] Agora flagstone tile GLB error:', err));

    // 3. Cute Hideout Cottages for Hide & Seek (Only 4 cozy cottages)
    loader.load(`${cleanBase}GLBs/assets/bld-general-store-01.glb`, (gltf) => {
      const baseScene = gltf.scene;
      baseScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(baseScene);
      const offsetY = -box.min.y;
      const offsetX = -(box.min.x + box.max.x) / 2;
      const offsetZ = -(box.min.z + box.max.z) / 2;

      const cuteCottages = [
        { x: -24, z: -14, rotY: Math.PI / 2, w: 3.4, d: 3.8 },
        { x: 24, z: -22, rotY: -Math.PI / 2, w: 3.4, d: 3.8 },
        { x: -18, z: 34, rotY: Math.PI, w: 3.4, d: 3.8 },
        { x: 18, z: 34, rotY: Math.PI, w: 3.4, d: 3.8 },
        { x: 0, z: -58, rotY: 0, w: 3.4, d: 3.8 }
      ];

      cuteCottages.forEach((cfg) => {
        const wrapper = new THREE.Group();
        wrapper.position.set(cfg.x, 0, cfg.z);
        wrapper.rotation.y = cfg.rotY;

        const house = baseScene.clone();
        house.position.set(offsetX, offsetY, offsetZ);
        wrapper.add(house);

        this.scene.add(wrapper);
        this.addHouseWallColliders(cfg.x, cfg.z, cfg.w, cfg.d, cfg.rotY, 1.4);
      });
    }, undefined, (err) => console.error('[Town] Cute store GLB error:', err));

    // 4. Stepping Stones at scenic creek crossing
    loader.load(`${cleanBase}GLBs/assets/creek-stepping-stones.glb`, (gltf) => {
      const stones = gltf.scene;
      stones.position.set(-28, 0, -32);
      stones.scale.setScalar(1.0);
      stones.traverse((child) => {
        if (child.isMesh) { child.receiveShadow = true; }
      });
      this.scene.add(stones);
    }, undefined, (err) => console.error('[Town] Stepping stones GLB error:', err));
  }

  addHouseWallColliders(x, z, width, depth, rotY = 0, doorWidth = 1.6) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const wallThick = 0.35;

    let normRot = rotY % (Math.PI * 2);
    if (normRot < 0) normRot += Math.PI * 2;

    if (Math.abs(normRot - Math.PI / 2) < 0.2) {
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z - halfW - wallThick, maxZ: z - halfW });
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z + halfW, maxZ: z + halfW + wallThick });
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z - halfW, maxZ: z + halfW });
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z - halfW, maxZ: z - doorWidth / 2 });
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z + doorWidth / 2, maxZ: z + halfW });
    } else if (Math.abs(normRot - 3 * Math.PI / 2) < 0.2) {
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z - halfW - wallThick, maxZ: z - halfW });
      this.colliders.push({ type: 'box', minX: x - halfD, maxX: x + halfD, minZ: z + halfW, maxZ: z + halfW + wallThick });
      this.colliders.push({ type: 'box', minX: x + halfD, maxX: x + halfD + wallThick, minZ: z - halfW, maxZ: z + halfW });
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z - halfW, maxZ: z - doorWidth / 2 });
      this.colliders.push({ type: 'box', minX: x - halfD - wallThick, maxX: x - halfD, minZ: z + doorWidth / 2, maxZ: z + halfW });
    } else if (Math.abs(normRot - Math.PI) < 0.2) {
      this.colliders.push({ type: 'box', minX: x - halfW - wallThick, maxX: x - halfW, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x + halfW, maxX: x + halfW + wallThick, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x + halfW, minZ: z - halfD - wallThick, maxZ: z - halfD });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x - doorWidth / 2, minZ: z + halfD, maxZ: z + halfD + wallThick });
      this.colliders.push({ type: 'box', minX: x + doorWidth / 2, maxX: x + halfW, minZ: z + halfD, maxZ: z + halfD + wallThick });
    } else {
      this.colliders.push({ type: 'box', minX: x - halfW - wallThick, maxX: x - halfW, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x + halfW, maxX: x + halfW + wallThick, minZ: z - halfD, maxZ: z + halfD });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x + halfW, minZ: z + halfD, maxZ: z + halfD + wallThick });
      this.colliders.push({ type: 'box', minX: x - halfW, maxX: x - doorWidth / 2, minZ: z - halfD - wallThick, maxZ: z - halfD });
      this.colliders.push({ type: 'box', minX: x + doorWidth / 2, maxX: x + halfW, minZ: z - halfD - wallThick, maxZ: z - halfD });
    }
  }

  buildHideAndSeekProps() {
    // 1. Central Plaza Romantic Fountain at (0, 0, 22)
    const fountainGrp = new THREE.Group();
    fountainGrp.position.set(0, 0, 22);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const goldHayMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
    const crateMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x16a34a, flatShading: true });
    const flowerPinkMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });

    const poolRing = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.5, 16), stoneMat);
    poolRing.position.y = 0.25;
    poolRing.receiveShadow = true;
    fountainGrp.add(poolRing);

    const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.45, 16), this.materials.fountainWater);
    poolWater.position.y = 0.28;
    fountainGrp.add(poolWater);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.4, 12), stoneMat);
    pedestal.position.y = 0.9;
    fountainGrp.add(pedestal);

    const upperBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.4, 0.35, 12), stoneMat);
    upperBasin.position.y = 1.6;
    fountainGrp.add(upperBasin);

    const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 12), this.materials.fountainWater);
    upperWater.position.y = 1.7;
    fountainGrp.add(upperWater);

    const spout = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), this.materials.fountainWater);
    spout.position.y = 1.95;
    fountainGrp.add(spout);

    // 4 Plaza Stone Benches surrounding fountain
    [
      { x: -3.8, z: 0, rotY: Math.PI / 2 },
      { x: 3.8, z: 0, rotY: -Math.PI / 2 },
      { x: 0, z: -3.8, rotY: 0 },
      { x: 0, z: 3.8, rotY: Math.PI }
    ].forEach(b => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.38, 0.55), stoneMat);
      bench.position.set(b.x, 0.2, b.z);
      bench.rotation.y = b.rotY;
      bench.castShadow = true;
      fountainGrp.add(bench);
    });

    this.scene.add(fountainGrp);
    this.colliders.push({ type: 'circle', x: 0, z: 22, r: 2.6 });

    // 2. Romantic Wooden Gazebo with Seating at (x: 18, z: 8)
    const gazeboGrp = new THREE.Group();
    gazeboGrp.position.set(18, 0, 8);

    const gazBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 0.25, 8), woodMat);
    gazBase.position.y = 0.125;
    gazBase.receiveShadow = true;
    gazeboGrp.add(gazBase);

    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3;
      const px = Math.cos(angle) * 2.0;
      const pz = Math.sin(angle) * 2.0;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), woodMat);
      post.position.set(px, 1.4, pz);
      post.castShadow = true;
      gazeboGrp.add(post);
    }

    const gazRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true }));
    gazRoof.position.y = 3.5;
    gazRoof.castShadow = true;
    gazeboGrp.add(gazRoof);

    const gazBench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.36, 0.5), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    gazBench.position.set(0, 0.3, -0.6);
    gazeboGrp.add(gazBench);

    this.scene.add(gazeboGrp);
    this.colliders.push({ type: 'circle', x: 18, z: 8, r: 2.4 });

    // 3. Hay Bale Stacks for Tactical Cover
    const hayBaleConfigs = [
      { x: -26, z: 6, rotY: 0.2 },
      { x: -27.2, z: 6.8, rotY: -0.4 },
      { x: -26.5, z: 6.3, rotY: 0, y: 0.65 },
      { x: 10, z: 28, rotY: -0.2 },
      { x: 11.2, z: 27.4, rotY: 0.3 },
      { x: 10.6, z: 27.7, rotY: 0, y: 0.65 },
      { x: -8, z: -32, rotY: 0.4 },
      { x: -9.2, z: -32.6, rotY: -0.1 },
      { x: -8.6, z: -32.2, rotY: 0, y: 0.65 },
      { x: 26, z: 32, rotY: 0.1 },
      { x: 27.3, z: 32.5, rotY: -0.3 }
    ];

    hayBaleConfigs.forEach(hb => {
      const bale = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.65, 0.85), goldHayMat);
      bale.position.set(hb.x, (hb.y || 0) + 0.325, hb.z);
      bale.rotation.y = hb.rotY;
      bale.castShadow = true;
      bale.receiveShadow = true;
      this.scene.add(bale);
    });

    this.colliders.push({ type: 'box', minX: -28, maxX: -25, minZ: 5.2, maxZ: 7.8 });
    this.colliders.push({ type: 'box', minX: 9.2, maxX: 12.2, minZ: 26.5, maxZ: 29.0 });
    this.colliders.push({ type: 'box', minX: -10.2, maxX: -7.2, minZ: -33.5, maxZ: -31.0 });
    this.colliders.push({ type: 'box', minX: 25.2, maxX: 28.2, minZ: 31.0, maxZ: 33.5 });

    // 4. Wooden Cargo Crates & Vintage Barrels
    const crateBarrelSpots = [
      { cx: -8, cz: 32, r: 1.4 },
      { cx: 8, cz: 32, r: 1.4 },
      { cx: -34, cz: -8, r: 1.5 },
      { cx: -18, cz: 18, r: 1.5 }
    ];

    crateBarrelSpots.forEach(s => {
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), crateMat);
      c1.position.set(s.cx, 0.425, s.cz);
      c1.castShadow = true;
      this.scene.add(c1);

      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), crateMat);
      c2.position.set(s.cx + 0.1, 1.225, s.cz - 0.05);
      c2.rotation.y = 0.25;
      c2.castShadow = true;
      this.scene.add(c2);

      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.9, 12), barrelMat);
      b1.position.set(s.cx + 0.9, 0.45, s.cz + 0.2);
      b1.castShadow = true;
      this.scene.add(b1);

      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.85, 12), barrelMat);
      b2.position.set(s.cx - 0.75, 0.425, s.cz - 0.2);
      b2.castShadow = true;
      this.scene.add(b2);

      this.colliders.push({ type: 'circle', x: s.cx, z: s.cz, r: s.r });
    });

    // 5. Lush Manicured Flower Hedges (Full Visual Cover for Hide-and-Seek)
    const hedgeConfigs = [
      { x: -5.5, z: 14, w: 0.8, d: 5.6 },
      { x: -5.5, z: 28, w: 0.8, d: 5.6 },
      { x: 5.5, z: 14, w: 0.8, d: 5.6 },
      { x: 5.5, z: 28, w: 0.8, d: 5.6 },
      { x: 26, z: 2, w: 0.8, d: 7.2 },
      { x: 26, z: 16, w: 0.8, d: 7.2 },
      { x: -24, z: -2, w: 0.8, d: 6.4 },
      { x: -24, z: 26, w: 0.8, d: 6.4 }
    ];

    hedgeConfigs.forEach(h => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(h.w, 1.25, h.d), hedgeMat);
      hedge.position.set(h.x, 0.625, h.z);
      hedge.castShadow = true;
      hedge.receiveShadow = true;
      this.scene.add(hedge);

      for (let f = -h.d / 2 + 0.6; f < h.d / 2; f += 1.4) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerPinkMat);
        blossom.position.set(h.x, 1.3, h.z + f);
        this.scene.add(blossom);
      }

      this.colliders.push({
        type: 'box',
        minX: h.x - h.w / 2,
        maxX: h.x + h.w / 2,
        minZ: h.z - h.d / 2,
        maxZ: h.z + h.d / 2
      });
    });

    // 6. Charming Street Flower & Pastry Market Stalls with Striped Pastel Awnings
    [
      { x: -14, z: 22, rotY: 0, colorA: 0xfbcfe8, title: 'Flowers' },
      { x: 14, z: 22, rotY: 0, colorA: 0xfed7aa, title: 'Bakery' }
    ].forEach(st => {
      const stallGrp = new THREE.Group();
      stallGrp.position.set(st.x, 0, st.z);
      stallGrp.rotation.y = st.rotY;

      const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.1), woodMat);
      table.position.set(0, 0.425, 0);
      table.castShadow = true;
      stallGrp.add(table);

      [-0.95, 0.95].forEach(cx => {
        [-0.45, 0.45].forEach(cz => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 6), woodMat);
          post.position.set(cx, 1.05, cz);
          stallGrp.add(post);
        });
      });

      const awning = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.4), new THREE.MeshLambertMaterial({ color: st.colorA }));
      awning.position.set(0, 2.15, 0);
      awning.rotation.x = -0.15;
      awning.castShadow = true;
      stallGrp.add(awning);

      this.scene.add(stallGrp);
      this.colliders.push({ type: 'box', minX: st.x - 1.2, maxX: st.x + 1.2, minZ: st.z - 0.7, maxZ: st.z + 0.7 });
    });
  }

  buildTrees() {
    // Handled by CherryBlossomGroves & TreeChoppingSystem
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
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    lampCoords.forEach((lc) => {
      const lampGrp = new THREE.Group();
      lampGrp.position.set(lc.x, 0, lc.z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.35, 8), poleMat);
      base.position.y = 0.175;
      lampGrp.add(base);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8), poleMat);
      pole.position.y = 1.65;
      lampGrp.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), poleMat);
      arm.position.set(0.18, 3.15, 0);
      lampGrp.add(arm);

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
