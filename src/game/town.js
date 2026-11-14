// Romantic Blossom Island / Valley - Clean Layout without any overlapping components
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
      grass: 0xbbf7d0,        // Soft pastel spring lawn
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
    // 1. Base Island Meadow: Compact 110x110m (cozy, filled & zero empty voids)
    const groundGeo = new THREE.BoxGeometry(110, 1.4, 110);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.position.y = -0.7;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const underGeo = new THREE.BoxGeometry(111.2, 0.6, 111.2);
    const under = new THREE.Mesh(underGeo, new THREE.MeshLambertMaterial({ color: this.colors.groundUnder }));
    under.position.y = -1.2;
    this.scene.add(under);

    // 2. Romantic Scenic River: Positioned cleanly at West (x = -24, running z = -50 to z = 24)
    // Does NOT intersect Farm (-40, 0, 0) or House (0, 0, 0)
    const riverGeo = new THREE.BoxGeometry(6.5, 0.2, 74);
    const riverWater = new THREE.Mesh(riverGeo, this.materials.water);
    riverWater.position.set(-24, -0.05, -13);
    riverWater.receiveShadow = true;
    this.scene.add(riverWater);

    // River stone natural riverbanks
    const bankMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1, flatShading: true });
    for (let z = -48; z <= 22; z += 5) {
      const rockL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), bankMat);
      rockL.position.set(-27.6 + Math.cos(z * 0.4) * 0.25, 0.15, z);
      rockL.castShadow = true;
      this.scene.add(rockL);

      const rockR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), bankMat);
      rockR.position.set(-20.4 + Math.sin(z * 0.4) * 0.25, 0.15, z);
      rockR.castShadow = true;
      this.scene.add(rockR);
    }
  }

  buildBoundaryWalls() {
    // Low, open natural lavender garden borders (no tall claustrophobic walls)
    const wallMat = new THREE.MeshLambertMaterial({ color: this.colors.wallBoundary, flatShading: true });
    const thickness = 2.5;
    const height = 4.5;
    const half = 54;

    // North & South
    [-half, half].forEach(z => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(108 + thickness, height, thickness), wallMat);
      w.position.set(0, height / 2, z);
      w.castShadow = true;
      w.receiveShadow = true;
      this.scene.add(w);
      if (this.engine) this.engine.registerWallObstacle(w);
      this.colliders.push({ type: 'box', minX: -54, maxX: 54, minZ: z - thickness / 2, maxZ: z + thickness / 2 });
    });

    // East & West
    [-half, half].forEach(x => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, 108 + thickness), wallMat);
      w.position.set(x, height / 2, 0);
      w.castShadow = true;
      w.receiveShadow = true;
      this.scene.add(w);
      if (this.engine) this.engine.registerWallObstacle(w);
      this.colliders.push({ type: 'box', minX: x - thickness / 2, maxX: x + thickness / 2, minZ: -54, maxZ: 54 });
    });
  }

  buildRoadsAndPaths() {
    // Interconnected thoroughfares passing cleanly between all game zones:
    // A. North Path to Forest & Helipad
    this.createRoadSegment(0, -18, 3.6, 22);
    // B. South Promenade to Fountain & Vehicle Parking
    this.createRoadSegment(0, 18, 3.6, 22);
    // C. East Avenue to Play Park & Swings
    this.createRoadSegment(18, 0, 24, 3.6);
    // D. West Path connecting directly to the Blossom River Bridge
    this.createRoadSegment(-14, 0, 16, 3.6);
    // E. Beyond River Path to Farmstead
    this.createRoadSegment(-32, 0, 12, 3.6);

    // F. Cross Promenade linking Forest, Treehouse and Helipad (z = -32)
    this.createRoadSegment(0, -32, 56, 2.6);

    // G. Park Perimeter walking paths
    this.createRoadSegment(38, -6, 2.8, 22);
  }

  createRoadSegment(x, z, width, length) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length), this.materials.road);
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildBlossomBridges() {
    // Beautiful Red Torii Wooden Arched Bridge crossing the River at (x = -24, z = 0)
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x9a3412 });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });

    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-24, 0, 0);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 3.6), woodMat);
    deck.position.y = 0.22;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    [-1.65, 1.65].forEach(rz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.14, 0.14), redMat);
      rail.position.set(0, 1.05, rz);
      bridgeGroup.add(rail);

      const subRail = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.08, 0.08), woodMat);
      subRail.position.set(0, 0.6, rz);
      bridgeGroup.add(subRail);

      [-3.6, -1.8, 0, 1.8, 3.6].forEach(px => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.05, 8), redMat);
        post.position.set(px, 0.6, rz);
        post.castShadow = true;
        bridgeGroup.add(post);
      });
    });

    this.scene.add(bridgeGroup);
  }

  buildCherryBlossomGroves() {
    // Placed in open, non-overlapping coords flanking paths
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c2b14 });
    const sakuraPalette = [
      this.materials.sakuraPink,
      this.materials.sakuraRose,
      this.materials.sakuraWhite,
      this.materials.sakuraPurple
    ];

    const treeLocations = [
      // Flanking Couple Villa
      { x: -7, z: 3, scale: 1.0 },
      { x: -7, z: -3, scale: 0.95 },
      { x: 7, z: 6, scale: 1.1 },
      // Along Blossom Promenade
      { x: -16, z: 12, scale: 1.15 },
      { x: -16, z: -12, scale: 1.2 },
      { x: -16, z: -24, scale: 1.1 },
      // Central Avenue Flanking
      { x: -5.0, z: 16, scale: 1.0 },
      { x: 5.0, z: 16, scale: 1.0 },
      { x: -5.0, z: 26, scale: 1.1 },
      { x: 5.0, z: 26, scale: 1.1 },
      // North Blossom Vista
      { x: -12, z: -38, scale: 1.25 },
      { x: 12, z: -38, scale: 1.25 },
      { x: 0, z: -44, scale: 1.3 },
      // East Park Perimeters
      { x: 26, z: -14, scale: 1.05 },
      { x: 48, z: -14, scale: 1.15 },
      { x: 48, z: 14, scale: 1.1 }
    ];

    treeLocations.forEach((loc, idx) => {
      const treeGrp = new THREE.Group();
      treeGrp.position.set(loc.x, 0, loc.z);
      treeGrp.scale.setScalar(loc.scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3.0, 8), trunkMat);
      trunk.position.y = 1.5;
      trunk.castShadow = true;
      treeGrp.add(trunk);

      const mat = sakuraPalette[idx % sakuraPalette.length];
      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), mat);
      crown1.position.set(0, 3.4, 0);
      crown1.castShadow = true;
      treeGrp.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), mat);
      crown2.position.set(-0.7, 3.1, 0.3);
      crown2.castShadow = true;
      treeGrp.add(crown2);

      const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), mat);
      crown3.position.set(0.7, 3.2, -0.3);
      crown3.castShadow = true;
      treeGrp.add(crown3);

      this.scene.add(treeGrp);
      this.colliders.push({ type: 'circle', x: loc.x, z: loc.z, r: 0.45 });
    });
  }

  buildPicnicSpotsAndTreehouses() {
    // 1. Romantic Couple Picnic Spot under Sakura Tree: Clean open area at (x: -12, z: 14)
    const picnicMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 2.6), picnicMat);
    blanket.position.set(-12, 0.03, 14);
    blanket.receiveShadow = true;
    this.scene.add(blanket);

    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.45), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
    basket.position.set(-12, 0.22, 14);
    basket.castShadow = true;
    this.scene.add(basket);

    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }));
    pillow1.position.set(-12.7, 0.08, 14);
    this.scene.add(pillow1);

    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), new THREE.MeshLambertMaterial({ color: 0x93c5fd }));
    pillow2.position.set(-11.3, 0.08, 14);
    this.scene.add(pillow2);

    // 2. Secret Romantic Hideout Treehouse for Hide & Seek at North-West (x: -36, z: -28)
    const thGrp = new THREE.Group();
    thGrp.position.set(-36, 0, -28);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0xfde68a });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xf472b6, flatShading: true });

    [-1.3, 1.3].forEach(px => {
      [-1.3, 1.3].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.0, 0.18), woodMat);
        post.position.set(px, 1.5, pz);
        post.castShadow = true;
        thGrp.add(post);
      });
    });

    const thFloor = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 3.4), woodMat);
    thFloor.position.set(0, 3.0, 0);
    thGrp.add(thFloor);

    // Doorway open on front (+Z) so players can climb & hide inside
    const thLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.0, 3.0), cabinMat);
    thLeft.position.set(-1.4, 4.0, 0);
    thGrp.add(thLeft);

    const thRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.0, 3.0), cabinMat);
    thRight.position.set(1.4, 4.0, 0);
    thGrp.add(thRight);

    const thBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 0.18), cabinMat);
    thBack.position.set(0, 4.0, -1.4);
    thGrp.add(thBack);

    // Front safety railings on left and right, leaving center doorway open
    [-1.05, 1.05].forEach(gx => {
      const railFront = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.1), woodMat);
      railFront.position.set(gx, 3.5, 1.6);
      thGrp.add(railFront);
    });

    const thRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.4, 4), roofMat);
    thRoof.position.set(0, 5.5, 0);
    thRoof.rotation.y = Math.PI / 4;
    thRoof.castShadow = true;
    thGrp.add(thRoof);

    // Cozy interior rug and cuddle pillows for romantic hide & seek
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.04, 16), new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }));
    rug.position.set(0, 3.11, -0.2);
    thGrp.add(rug);

    const pillowPink = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    pillowPink.position.set(-0.55, 3.16, -0.6);
    pillowPink.rotation.y = 0.25;
    thGrp.add(pillowPink);

    const pillowBlue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), new THREE.MeshLambertMaterial({ color: 0x93c5fd }));
    pillowBlue.position.set(0.55, 3.16, -0.6);
    pillowBlue.rotation.y = -0.25;
    thGrp.add(pillowBlue);

    // Warm hanging fairy lantern inside treehouse
    const fairyLantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    fairyLantern.position.set(0, 4.6, 0);
    thGrp.add(fairyLantern);

    // Climbing Ladder: Side rails + rungs
    [-0.3, 0.3].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.1, 8), woodMat);
      rail.position.set(rx, 1.5, 1.6);
      rail.castShadow = true;
      thGrp.add(rail);
    });

    for (let r = 0.4; r <= 2.8; r += 0.4) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), woodMat);
      rung.position.set(0, r, 1.6);
      thGrp.add(rung);
    }

    this.scene.add(thGrp);

    // 4 Corner Stilts ground colliders (open passage in front of ladder at z = -26.4)
    [-1.3, 1.3].forEach(px => {
      [-1.3, 1.3].forEach(pz => {
        this.colliders.push({ type: 'circle', x: -36 + px, z: -28 + pz, r: 0.28, groundOnly: true });
      });
    });
  }

  buildMainYard() {
    // East yard of house (x: 6 to 10, z: -4 to 4)
    const yardGeo = new THREE.BoxGeometry(6.8, 0.06, 7.8);
    const yardMesh = new THREE.Mesh(yardGeo, this.materials.stone);
    yardMesh.position.set(8.0, 0.03, 0);
    yardMesh.receiveShadow = true;
    this.scene.add(yardMesh);

    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const fenceTop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.8, 0.08), fenceMat);
    fenceTop.position.set(8.0, 0.4, -3.9);
    this.scene.add(fenceTop);

    const fenceRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 7.8), fenceMat);
    fenceRight.position.set(11.4, 0.4, 0);
    this.scene.add(fenceRight);

    const tableMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.65, 16), tableMat);
    table.position.set(8.0, 0.35, -1.2);
    table.castShadow = true;
    this.scene.add(table);
    this.colliders.push({ type: 'circle', x: 8.0, z: -1.2, r: 0.95 });

    [-1.1, 1.1].forEach(cz => {
      const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.42, 12), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
      chair.position.set(8.0, 0.23, -1.2 + cz);
      this.scene.add(chair);
    });
  }

  buildEastPlayPark() {
    // Park area (x: 28 to 48, z: -16 to 18)
    const parkTurf = new THREE.Mesh(new THREE.BoxGeometry(20, 0.02, 34), new THREE.MeshLambertMaterial({ color: 0xbbf7d0 }));
    parkTurf.position.set(38, 0.015, 1);
    parkTurf.receiveShadow = true;
    this.scene.add(parkTurf);

    const flowerGeo = new THREE.DodecahedronGeometry(0.14, 0);
    const flowerColors = [0xf472b6, 0xfb7185, 0xfde047, 0xa78bfa, 0x38bdf8];
    for (let i = 0; i < 28; i++) {
      const fl = new THREE.Mesh(flowerGeo, new THREE.MeshBasicMaterial({ color: flowerColors[i % 5] }));
      fl.position.set(29 + (i % 7) * 2.8, 0.12, -14 + Math.floor(i / 7) * 8.0 + (Math.sin(i) * 1.2));
      this.scene.add(fl);
    }
  }

  buildSouthStreet() {
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(70, 0.14, 4.2), sidewalkMat);
    sidewalk.position.set(0, 0.07, 44);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    // Vehicle Parking Bay at (x: 2, z: 38)
    const parkingBay = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.06, 5.4), new THREE.MeshLambertMaterial({ color: 0x475569 }));
    parkingBay.position.set(2, 0.03, 38);
    this.scene.add(parkingBay);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-4.2, -1.4, 1.4, 4.2].forEach(lx => {
      const pLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4.8), lineMat);
      pLine.rotation.x = -Math.PI / 2;
      pLine.position.set(2 + lx, 0.065, 38);
      this.scene.add(pLine);
    });
  }

  buildGLBAssets() {
    const loader = getGLTFLoader();
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    // 1. Modular 3D Roads & Corner Turns
    let straightBase = null;
    let cornerBase = null;

    const tryBuildRoads = () => {
      if (!straightBase || !cornerBase) return;
      const roadGroup = new THREE.Group();
      const roadY = 0.08;

      // Horizontal South Main Street: x = -24 to +24 at z = 38
      for (let x = -24; x <= 24; x += 4) {
        const tile = straightBase.clone();
        tile.position.set(x, roadY, 38);
        tile.rotation.y = Math.PI / 2;
        roadGroup.add(tile);
      }

      // Corners at ends turning North
      const westCorner = cornerBase.clone();
      westCorner.position.set(-28, roadY, 38);
      westCorner.rotation.y = Math.PI / 2;
      roadGroup.add(westCorner);

      const eastCorner = cornerBase.clone();
      eastCorner.position.set(28, roadY, 38);
      eastCorner.rotation.y = 0;
      roadGroup.add(eastCorner);

      // Extensions from corners
      for (let z = 34; z >= 22; z -= 4) {
        const westTurnTile = straightBase.clone();
        westTurnTile.position.set(-28, roadY, z);
        roadGroup.add(westTurnTile);

        const eastTurnTile = straightBase.clone();
        eastTurnTile.position.set(28, roadY, z);
        roadGroup.add(eastTurnTile);
      }

      // Central Avenue (x = 0, z = 34 down to 8)
      for (let z = 34; z >= 8; z -= 4) {
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

      for (let z = -8; z >= -28; z -= 4) {
        const t = baseTile.clone();
        t.position.set(0, tileY, z);
        tileGroup.add(t);
      }
      for (let x = 8; x <= 24; x += 4) {
        const t = baseTile.clone();
        t.position.set(x, tileY, 0);
        tileGroup.add(t);
      }

      this.scene.add(tileGroup);
    }, undefined, (err) => console.error('[Town] Agora flagstone tile GLB error:', err));

    // 3. Cute Hideout Cottages for Hide & Seek (Only 3 well-separated, non-overlapping cottages)
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

      // Non-overlapping dedicated coordinates:
      const cuteCottages = [
        // South-East Flower Shop (x: 18, z: 30)
        { x: 18, z: 30, rotY: Math.PI, w: 3.4, d: 3.8 },
        // South-West Bakery Shop (x: -18, z: 30)
        { x: -18, z: 30, rotY: Math.PI, w: 3.4, d: 3.8 },
        // North-Center Romantic Valley Cabin (x: 0, z: -46)
        { x: 0, z: -46, rotY: 0, w: 3.4, d: 3.8 }
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
    // 1. Central Plaza Romantic Fountain: positioned at (x = 0, z = 20) in plaza clearing
    const fountainGrp = new THREE.Group();
    fountainGrp.position.set(0, 0, 20);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const goldHayMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
    const crateMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x16a34a, flatShading: true });
    const flowerPinkMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });

    const poolRing = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.45, 16), stoneMat);
    poolRing.position.y = 0.225;
    poolRing.receiveShadow = true;
    fountainGrp.add(poolRing);

    const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.4, 16), this.materials.fountainWater);
    poolWater.position.y = 0.25;
    fountainGrp.add(poolWater);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.2, 12), stoneMat);
    pedestal.position.y = 0.8;
    fountainGrp.add(pedestal);

    const upperBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.35, 0.3, 12), stoneMat);
    upperBasin.position.y = 1.45;
    fountainGrp.add(upperBasin);

    const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.25, 12), this.materials.fountainWater);
    upperWater.position.y = 1.55;
    fountainGrp.add(upperWater);

    const spout = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), this.materials.fountainWater);
    spout.position.y = 1.8;
    fountainGrp.add(spout);

    // 4 Plaza Stone Benches surrounding fountain (clean radius)
    [
      { x: -3.4, z: 0, rotY: Math.PI / 2 },
      { x: 3.4, z: 0, rotY: -Math.PI / 2 },
      { x: 0, z: -3.4, rotY: 0 },
      { x: 0, z: 3.4, rotY: Math.PI }
    ].forEach(b => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.5), stoneMat);
      bench.position.set(b.x, 0.18, b.z);
      bench.rotation.y = b.rotY;
      bench.castShadow = true;
      fountainGrp.add(bench);
    });

    this.scene.add(fountainGrp);
    this.colliders.push({ type: 'circle', x: 0, z: 20, r: 2.4 });

    // 2. Romantic Wooden Gazebo with Seating: Open East spot at (x: 18, z: 8)
    const gazeboGrp = new THREE.Group();
    gazeboGrp.position.set(18, 0, 8);

    const gazBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.2, 8), woodMat);
    gazBase.position.y = 0.1;
    gazBase.receiveShadow = true;
    gazeboGrp.add(gazBase);

    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3;
      const px = Math.cos(angle) * 1.8;
      const pz = Math.sin(angle) * 1.8;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.16), woodMat);
      post.position.set(px, 1.3, pz);
      post.castShadow = true;
      gazeboGrp.add(post);
    }

    const gazRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.3, 8), new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true }));
    gazRoof.position.y = 3.2;
    gazRoof.castShadow = true;
    gazeboGrp.add(gazRoof);

    const gazBench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.45), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    gazBench.position.set(0, 0.28, -0.5);
    gazeboGrp.add(gazBench);

    this.scene.add(gazeboGrp);
    this.colliders.push({ type: 'circle', x: 18, z: 8, r: 2.2 });

    // 3. Hay Bale Stacks for Tactical Cover (distinct non-overlapping coordinates)
    const hayBaleConfigs = [
      { x: -14, z: 4, rotY: 0.2 },
      { x: -15.1, z: 4.6, rotY: -0.3 },
      { x: 10, z: 24, rotY: -0.2 },
      { x: 11.1, z: 23.5, rotY: 0.25 },
      { x: -8, z: -22, rotY: 0.3 },
      { x: -9.1, z: -22.5, rotY: -0.2 }
    ];

    hayBaleConfigs.forEach(hb => {
      const bale = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.8), goldHayMat);
      bale.position.set(hb.x, 0.3, hb.z);
      bale.rotation.y = hb.rotY;
      bale.castShadow = true;
      bale.receiveShadow = true;
      this.scene.add(bale);
    });

    this.colliders.push({ type: 'box', minX: -16, maxX: -13, minZ: 3, maxZ: 6 });
    this.colliders.push({ type: 'box', minX: 9, maxX: 12.5, minZ: 22.5, maxZ: 25.5 });
    this.colliders.push({ type: 'box', minX: -10.5, maxX: -7, minZ: -24, maxZ: -20.5 });

    // 4. Wooden Cargo Crates & Vintage Barrels (Clean placement along sidewalk niches)
    const crateBarrelSpots = [
      { cx: -8, cz: 26, r: 1.3 },
      { cx: 8, cz: 26, r: 1.3 },
      { cx: -12, cz: -14, r: 1.3 }
    ];

    crateBarrelSpots.forEach(s => {
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), crateMat);
      c1.position.set(s.cx, 0.4, s.cz);
      c1.castShadow = true;
      this.scene.add(c1);

      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.85, 12), barrelMat);
      b1.position.set(s.cx + 0.8, 0.425, s.cz + 0.15);
      b1.castShadow = true;
      this.scene.add(b1);

      this.colliders.push({ type: 'circle', x: s.cx, z: s.cz, r: s.r });
    });

    // 5. Flower Hedges: Clean corridor boundary along central avenue
    const hedgeConfigs = [
      { x: -5.0, z: 12, w: 0.7, d: 4.8 },
      { x: 5.0, z: 12, w: 0.7, d: 4.8 },
      { x: -5.0, z: 22, w: 0.7, d: 4.8 },
      { x: 5.0, z: 22, w: 0.7, d: 4.8 }
    ];

    hedgeConfigs.forEach(h => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(h.w, 1.15, h.d), hedgeMat);
      hedge.position.set(h.x, 0.575, h.z);
      hedge.castShadow = true;
      hedge.receiveShadow = true;
      this.scene.add(hedge);

      for (let f = -h.d / 2 + 0.5; f < h.d / 2; f += 1.3) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerPinkMat);
        blossom.position.set(h.x, 1.2, h.z + f);
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

    // 6. Charming Street Flower Market Stall with Striped Pastel Awning
    const stallGrp = new THREE.Group();
    stallGrp.position.set(-10, 0, 36);

    const table = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.0), woodMat);
    table.position.set(0, 0.4, 0);
    table.castShadow = true;
    stallGrp.add(table);

    [-0.85, 0.85].forEach(cx => {
      [-0.4, 0.4].forEach(cz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), woodMat);
        post.position.set(cx, 1.0, cz);
        stallGrp.add(post);
      });
    });

    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 1.3), new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }));
    awning.position.set(0, 2.05, 0);
    awning.rotation.x = -0.15;
    awning.castShadow = true;
    stallGrp.add(awning);

    this.scene.add(stallGrp);
    this.colliders.push({ type: 'box', minX: -11.2, maxX: -8.8, minZ: 35.3, maxZ: 36.7 });
  }

  buildTrees() {
    // Handled by CherryBlossomGroves & TreeChoppingSystem
  }

  buildStreetlamps() {
    this.streetLamps = [];
    const lampCoords = [
      { x: -6, z: -8 }, { x: 6, z: -8 },
      { x: -6, z: 8 }, { x: 6, z: 8 },
      { x: -16, z: 36 }, { x: 16, z: 36 },
      { x: 0, z: 24 }, { x: 0, z: -20 }
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

  getTreehouseLadderPos() {
    return { x: -36, y: 0, z: -26.0 };
  }

  getTreehouseDeckPos() {
    return { x: -36, y: 3.2, z: -27.5 };
  }

  checkCollision(x, z, radius = 0.35, y = 0) {
    if (x < -53 || x > 53 || z < -53 || z > 53) return true;

    // Elevated Treehouse Cabin collision boundary (y >= 2.5)
    if (y >= 2.5 && x > -38.5 && x < -33.5 && z > -30.5 && z < -25.5) {
      // Treehouse walls: Left (-37.3), Right (-34.7), Back (-29.3)
      if (x - radius < -37.3 || x + radius > -34.7 || z - radius < -29.3) return true;
      // Front guard rails (leaving ladder doorway open between -36.6 and -35.4)
      if (z + radius > -26.3) {
        if (x < -36.6 || x > -35.4) return true;
      }
      return false; // Walk freely inside treehouse deck
    }

    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      if (col.groundOnly && y >= 2.5) continue;
      if (col.type === 'circle') {
        if (Math.hypot(x - col.x, z - col.z) < col.r + radius) return true;
      } else if (col.type === 'box') {
        if (x + radius > col.minX && x - radius < col.maxX && z + radius > col.minZ && z - radius < col.maxZ) return true;
      }
    }
    return false;
  }
}
