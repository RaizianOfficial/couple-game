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
    this.buildHideoutCottages();
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

    // 4 Heavy Sturdy Timber Support Stilts (Wide footprint 4.4m x 4.4m)
    [-2.2, 2.2].forEach(px => {
      [-2.2, 2.2].forEach(pz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 8), woodMat);
        post.position.set(px, 1.6, pz);
        post.castShadow = true;
        thGrp.add(post);
      });
    });

    // Spacious Wooden Deck Floor (5.4m x 5.4m) at y = 3.1
    const thFloor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.22, 5.4), woodMat);
    thFloor.position.set(0, 3.1, 0);
    thFloor.receiveShadow = true;
    thGrp.add(thFloor);

    // High Cabin Walls (Height 2.6m with plenty of headroom, interior width 4.8m)
    const thLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 5.0), cabinMat);
    thLeft.position.set(-2.4, 4.4, -0.2);
    thGrp.add(thLeft);

    const thRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 5.0), cabinMat);
    thRight.position.set(2.4, 4.4, -0.2);
    thGrp.add(thRight);

    const thBack = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.6, 0.2), cabinMat);
    thBack.position.set(0, 4.4, -2.6);
    thGrp.add(thBack);

    // Front Balcony Safety Railings on left and right, leaving wide 2.0m open doorway
    [-1.75, 1.75].forEach(gx => {
      const railFront = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.12), woodMat);
      railFront.position.set(gx, 3.65, 2.6);
      thGrp.add(railFront);
    });

    // High Vaulted Pyramid Roof at y = 6.9 (Interior ceiling > 3.5m tall!)
    const thRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), roofMat);
    thRoof.position.set(0, 6.7, -0.1);
    thRoof.rotation.y = Math.PI / 4;
    thRoof.castShadow = true;
    thGrp.add(thRoof);

    // Large Plush Romantic Pink Rug (Radius 1.8m)
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.04, 24), new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }));
    rug.position.set(0, 3.23, -0.4);
    thGrp.add(rug);

    // 4 Cozy Cuddle Cushions around the rug
    const cushionColors = [0xf472b6, 0x93c5fd, 0xa855f7, 0xfde047];
    const cushionCoords = [
      { x: -0.9, z: -1.0, rot: 0.2 },
      { x: 0.9, z: -1.0, rot: -0.2 },
      { x: -0.9, z: 0.2, rot: -0.3 },
      { x: 0.9, z: 0.2, rot: 0.3 }
    ];
    cushionCoords.forEach((cc, idx) => {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.14, 0.55),
        new THREE.MeshLambertMaterial({ color: cushionColors[idx] })
      );
      pillow.position.set(cc.x, 3.28, cc.z);
      pillow.rotation.y = cc.rot;
      thGrp.add(pillow);
    });

    // Cute Low Wooden Tea Table in Center
    const tableMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    const centerTable = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.38, 16), tableMat);
    centerTable.position.set(0, 3.4, -0.4);
    thGrp.add(centerTable);

    // 2 Little Cups of Warm Tea
    [-0.18, 0.18].forEach((cx, i) => {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.12, 10),
        new THREE.MeshLambertMaterial({ color: i === 0 ? 0xf43f5e : 0x0ea5e9 })
      );
      cup.position.set(cx, 3.65, -0.4);
      thGrp.add(cup);
    });

    // Warm Hanging Fairy Chandelier Lantern inside roof peak
    const fairyLantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    fairyLantern.position.set(0, 5.4, -0.4);
    thGrp.add(fairyLantern);

    // Climbing Ladder: Side rails + rungs at front edge (z = 2.6)
    [-0.35, 0.35].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.3, 8), woodMat);
      rail.position.set(rx, 1.6, 2.6);
      rail.castShadow = true;
      thGrp.add(rail);
    });

    for (let r = 0.4; r <= 3.0; r += 0.38) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.08), woodMat);
      rung.position.set(0, r, 2.6);
      thGrp.add(rung);
    }

    this.scene.add(thGrp);

    // 4 Corner Stilts ground colliders (wide open central passage at z = -25.4)
    [-2.2, 2.2].forEach(px => {
      [-2.2, 2.2].forEach(pz => {
        this.colliders.push({ type: 'circle', x: -36 + px, z: -28 + pz, r: 0.35, groundOnly: true });
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

  buildHideoutCottages() {
    this.walkInHouses = [
      // 1. Honeybee Woodland Manor (South-East near flower garden)
      { name: 'Honeybee Woodland Manor', x: 20, z: 30, w: 8.6, d: 7.2, h: 4.2, wallMat: new THREE.MeshLambertMaterial({ color: 0x9a3412 }), roofMat: new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }), rotY: Math.PI },
      // 2. Sunny Valley Bakery Manor (South-West meadow)
      { name: 'Sunny Valley Bakery Manor', x: -20, z: 30, w: 8.6, d: 7.2, h: 4.2, wallMat: new THREE.MeshLambertMaterial({ color: 0xffedd5 }), roofMat: new THREE.MeshLambertMaterial({ color: 0xc2410c, flatShading: true }), rotY: Math.PI },
      // 3. Sweet Blossom River Chalet (West bank near river)
      { name: 'Sweet Blossom River Chalet', x: -14, z: -18, w: 8.4, d: 7.0, h: 4.2, wallMat: new THREE.MeshLambertMaterial({ color: 0xfce7f3 }), roofMat: new THREE.MeshLambertMaterial({ color: 0xf472b6, flatShading: true }), rotY: -Math.PI / 2 },
      // 4. Starry Pine Forest Lodge (North-East clearing near orchard)
      { name: 'Starry Pine Forest Lodge', x: 24, z: -28, w: 8.6, d: 7.2, h: 4.2, wallMat: new THREE.MeshLambertMaterial({ color: 0xa7f3d0 }), roofMat: new THREE.MeshLambertMaterial({ color: 0x059669, flatShading: true }), rotY: 0 }
    ];

    const woodFloorMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const porchWoodMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const stoneHearthMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const sofaMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const sofaCushionMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const crateMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const hayMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
    const windowFrameMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const lanternBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    this.walkInHouses.forEach((house) => {
      const houseGrp = new THREE.Group();
      houseGrp.position.set(house.x, 0, house.z);
      houseGrp.rotation.y = house.rotY;

      // 1. Polished Hardwood Floor
      const floor = new THREE.Mesh(new THREE.BoxGeometry(house.w, 0.16, house.d), woodFloorMat);
      floor.position.y = 0.08;
      floor.receiveShadow = true;
      houseGrp.add(floor);

      // 2. Front Porch with 2 Steps leading up from grass
      const porch = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 1.8), porchWoodMat);
      porch.position.set(0, 0.08, house.d / 2 + 0.9);
      porch.receiveShadow = true;
      houseGrp.add(porch);

      const step1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.6), porchWoodMat);
      step1.position.set(0, 0.04, house.d / 2 + 2.0);
      houseGrp.add(step1);

      [-1.9, 1.9].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.2, house.h, 0.2), porchWoodMat);
        pillar.position.set(px, house.h / 2, house.d / 2 + 1.6);
        pillar.castShadow = true;
        houseGrp.add(pillar);
      });

      // 3. Walls - Grand 4.2m Height (Nearly 3x Human Height!)
      // Back Wall
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(house.w, house.h, 0.24), house.wallMat);
      backWall.position.set(0, house.h / 2, -house.d / 2 + 0.12);
      backWall.castShadow = true;
      houseGrp.add(backWall);

      // Left Wall with big picture window
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, house.h, house.d), house.wallMat);
      leftWall.position.set(-house.w / 2 + 0.12, house.h / 2, 0);
      leftWall.castShadow = true;
      houseGrp.add(leftWall);

      // Right Wall with big picture window
      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.24, house.h, house.d), house.wallMat);
      rightWall.position.set(house.w / 2 - 0.12, house.h / 2, 0);
      rightWall.castShadow = true;
      houseGrp.add(rightWall);

      // Windows with glass and cross frames on side walls
      [-house.w / 2 + 0.12, house.w / 2 - 0.12].forEach(wx => {
        const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 2.4), glassMat);
        winGlass.position.set(wx, 2.2, 0);
        houseGrp.add(winGlass);

        const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 2.5), windowFrameMat);
        winFrame.position.set(wx, 2.2, 0);
        houseGrp.add(winFrame);
      });

      // 4. Front Wall with 2.4m Wide Grand Entrance Doorway!
      const doorW = 2.4;
      const doorH = 3.2; // 3.2m tall door (abundant headroom for humans!)
      const sideWallW = (house.w - doorW) / 2;

      // Front Left Wall
      const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, house.h, 0.24), house.wallMat);
      frontLeft.position.set(-house.w / 2 + sideWallW / 2, house.h / 2, house.d / 2 - 0.12);
      frontLeft.castShadow = true;
      houseGrp.add(frontLeft);

      // Front Right Wall
      const frontRight = new THREE.Mesh(new THREE.BoxGeometry(sideWallW, house.h, 0.24), house.wallMat);
      frontRight.position.set(house.w / 2 - sideWallW / 2, house.h / 2, house.d / 2 - 0.12);
      frontRight.castShadow = true;
      houseGrp.add(frontRight);

      // Door Lintel (Above 3.2m doorway)
      const lintelH = house.h - doorH;
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW, lintelH, 0.24), house.wallMat);
      lintel.position.set(0, doorH + lintelH / 2, house.d / 2 - 0.12);
      lintel.castShadow = true;
      houseGrp.add(lintel);

      // Decorative Door Arch Frame
      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.12, doorH, 0.28), windowFrameMat);
      frameL.position.set(-doorW / 2 + 0.06, doorH / 2, house.d / 2 - 0.12);
      houseGrp.add(frameL);
      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.12, doorH, 0.28), windowFrameMat);
      frameR.position.set(doorW / 2 - 0.06, doorH / 2, house.d / 2 - 0.12);
      houseGrp.add(frameR);
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.14, 0.28), windowFrameMat);
      frameTop.position.set(0, doorH + 0.07, house.d / 2 - 0.12);
      houseGrp.add(frameTop);

      // 5. Authentic Pitched Gable Roof with Front/Rear Overhangs (Peak at y = 6.2m)
      const roofPitch = 0.48; // ~27.5 degree slope
      const roofLen = (house.d / 2 + 0.6) / Math.cos(roofPitch);
      const roofWidth = house.w + 0.6;

      // Front slope (slopes DOWN towards +Z front porch)
      const roofSlopeFront = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.18, roofLen), house.roofMat);
      roofSlopeFront.position.set(0, house.h + 0.95, (house.d / 4) + 0.15);
      roofSlopeFront.rotation.x = roofPitch;
      roofSlopeFront.castShadow = true;
      houseGrp.add(roofSlopeFront);

      // Back slope (slopes DOWN towards -Z back wall)
      const roofSlopeBack = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.18, roofLen), house.roofMat);
      roofSlopeBack.position.set(0, house.h + 0.95, -(house.d / 4) - 0.15);
      roofSlopeBack.rotation.x = -roofPitch;
      roofSlopeBack.castShadow = true;
      houseGrp.add(roofSlopeBack);

      // Ridge Beam along the top apex
      const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(roofWidth + 0.2, 0.24, 0.24), porchWoodMat);
      ridgeBeam.position.set(0, house.h + 1.95, 0);
      houseGrp.add(ridgeBeam);

      // Triangular Gables on Left and Right Walls
      const gableMat = house.wallMat.clone();
      gableMat.side = THREE.DoubleSide;
      [-house.w / 2 + 0.12, house.w / 2 - 0.12].forEach(gx => {
        const gableShape = new THREE.Shape();
        gableShape.moveTo(-house.d / 2, 0);
        gableShape.lineTo(0, 1.95);
        gableShape.lineTo(house.d / 2, 0);
        gableShape.closePath();
        const gableGeo = new THREE.ShapeGeometry(gableShape);
        const gableMesh = new THREE.Mesh(gableGeo, gableMat);
        gableMesh.position.set(gx, house.h, 0);
        gableMesh.rotation.y = gx > 0 ? -Math.PI / 2 : Math.PI / 2;
        gableMesh.castShadow = true;
        houseGrp.add(gableMesh);
      });

      // 6. REAL INTERIOR LIVING COMFORT & HIDE & SEEK PROPS
      // Stone Fireplace with dancing fire glow
      const fireplace = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 1.8), stoneHearthMat);
      fireplace.position.set(-house.w / 2 + 0.52, 1.1, -house.d / 4);
      houseGrp.add(fireplace);

      const firePit = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.9), fireMat);
      firePit.position.set(-house.w / 2 + 0.72, 0.4, -house.d / 4);
      houseGrp.add(firePit);

      const fireLight = new THREE.PointLight(0xf97316, 0.8, 8);
      fireLight.position.set(-house.w / 2 + 1.1, 0.6, -house.d / 4);
      houseGrp.add(fireLight);

      // Living Room Sofa & Coffee Table
      const sofa = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 2.4), sofaMat);
      sofa.position.set(house.w / 2 - 0.65, 0.25, -house.d / 6);
      houseGrp.add(sofa);

      const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 2.4), sofaMat);
      sofaBack.position.set(house.w / 2 - 0.22, 0.6, -house.d / 6);
      houseGrp.add(sofaBack);

      const rug = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.02, 2.6), sofaCushionMat);
      rug.position.set(house.w / 2 - 2.0, 0.17, -house.d / 6);
      houseGrp.add(rug);

      const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.38, 12), porchWoodMat);
      coffeeTable.position.set(house.w / 2 - 2.0, 0.36, -house.d / 6);
      houseGrp.add(coffeeTable);

      // Bookshelf / Display Cupboard on back wall
      const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.45), porchWoodMat);
      bookshelf.position.set(house.w / 4, 1.1, -house.d / 2 + 0.35);
      houseGrp.add(bookshelf);

      // Hiding Stack of Crates (Back-left corner)
      const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), crateMat);
      crate1.position.set(-house.w / 2 + 0.8, 0.5, -house.d / 2 + 0.8);
      houseGrp.add(crate1);

      const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), crateMat);
      crate2.position.set(-house.w / 2 + 0.7, 1.4, -house.d / 2 + 0.8);
      houseGrp.add(crate2);

      // Hiding Hay Bales (Front-right corner)
      const hay1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 0.85), hayMat);
      hay1.position.set(house.w / 2 - 1.0, 0.35, house.d / 2 - 1.2);
      hay1.rotation.y = 0.25;
      houseGrp.add(hay1);

      // Warm Ceiling Chandelier / Hanging Lantern
      const lanternPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), stoneHearthMat);
      lanternPole.position.set(0, house.h + 0.5, 0);
      houseGrp.add(lanternPole);

      const lanternBulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), lanternBulbMat);
      lanternBulb.position.set(0, house.h, 0);
      houseGrp.add(lanternBulb);

      const roomLight = new THREE.PointLight(0xfef08a, 0.9, 14);
      roomLight.position.set(0, house.h - 0.2, 0);
      houseGrp.add(roomLight);

      this.scene.add(houseGrp);

      // 7. BULLETPROOF ACCURATE COLLIDERS WITH UNBLOCKED 2.4m DOORWAY
      this.addWalkInHouseColliders(house.x, house.z, house.w, house.d, house.rotY, 2.4);
    });
  }

  addWalkInHouseColliders(cx, cz, width, depth, rotY = 0, doorWidth = 2.4) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const wallThick = 0.35;

    let norm = rotY % (Math.PI * 2);
    if (norm < 0) norm += Math.PI * 2;

    if (Math.abs(norm - 0) < 0.2) {
      // Front door is at local +d/2 (which is world cz + halfD)
      // Back wall (North, cz - halfD)
      this.colliders.push({ type: 'box', minX: cx - halfW, maxX: cx + halfW, minZ: cz - halfD - wallThick, maxZ: cz - halfD });
      // Left wall (West, cx - halfW)
      this.colliders.push({ type: 'box', minX: cx - halfW - wallThick, maxX: cx - halfW, minZ: cz - halfD, maxZ: cz + halfD });
      // Right wall (East, cx + halfW)
      this.colliders.push({ type: 'box', minX: cx + halfW, maxX: cx + halfW + wallThick, minZ: cz - halfD, maxZ: cz + halfD });
      // Front Left Wall (cz + halfD) leaving door from (cx - doorWidth/2) to (cx + doorWidth/2) open!
      this.colliders.push({ type: 'box', minX: cx - halfW, maxX: cx - doorWidth / 2, minZ: cz + halfD, maxZ: cz + halfD + wallThick });
      // Front Right Wall (cz + halfD)
      this.colliders.push({ type: 'box', minX: cx + doorWidth / 2, maxX: cx + halfW, minZ: cz + halfD, maxZ: cz + halfD + wallThick });
    } else if (Math.abs(norm - Math.PI) < 0.2) {
      // Rotated 180 deg: local +d/2 is world cz - halfD (front door faces North)
      // Back wall (South, cz + halfD)
      this.colliders.push({ type: 'box', minX: cx - halfW, maxX: cx + halfW, minZ: cz + halfD, maxZ: cz + halfD + wallThick });
      // Left wall (cx - halfW)
      this.colliders.push({ type: 'box', minX: cx - halfW - wallThick, maxX: cx - halfW, minZ: cz - halfD, maxZ: cz + halfD });
      // Right wall (cx + halfW)
      this.colliders.push({ type: 'box', minX: cx + halfW, maxX: cx + halfW + wallThick, minZ: cz - halfD, maxZ: cz + halfD });
      // Front Left Wall (cz - halfD) leaving door open!
      this.colliders.push({ type: 'box', minX: cx - halfW, maxX: cx - doorWidth / 2, minZ: cz - halfD - wallThick, maxZ: cz - halfD });
      // Front Right Wall (cz - halfD)
      this.colliders.push({ type: 'box', minX: cx + doorWidth / 2, maxX: cx + halfW, minZ: cz - halfD - wallThick, maxZ: cz - halfD });
    } else if (Math.abs(norm - (3 * Math.PI / 2)) < 0.2 || Math.abs(norm - (-Math.PI / 2)) < 0.2) {
      // Rotated -90 deg: local +d/2 is world cx + halfD (front door faces East)
      // Back wall (West, cx - halfD)
      this.colliders.push({ type: 'box', minX: cx - halfD - wallThick, maxX: cx - halfD, minZ: cz - halfW, maxZ: cz + halfW });
      // Top wall (cz - halfW)
      this.colliders.push({ type: 'box', minX: cx - halfD, maxX: cx + halfD, minZ: cz - halfW - wallThick, maxZ: cz - halfW });
      // Bottom wall (cz + halfW)
      this.colliders.push({ type: 'box', minX: cx - halfD, maxX: cx + halfD, minZ: cz + halfW, maxZ: cz + halfW + wallThick });
      // Front Top Wall (cx + halfD) leaving door open!
      this.colliders.push({ type: 'box', minX: cx + halfD, maxX: cx + halfD + wallThick, minZ: cz - halfW, maxZ: cz - doorWidth / 2 });
      // Front Bottom Wall (cx + halfD)
      this.colliders.push({ type: 'box', minX: cx + halfD, maxX: cx + halfD + wallThick, minZ: cz + doorWidth / 2, maxZ: cz + halfW });
    } else if (Math.abs(norm - (Math.PI / 2)) < 0.2) {
      // Rotated +90 deg: local +d/2 is world cx - halfD (front door faces West)
      // Back wall (East, cx + halfD)
      this.colliders.push({ type: 'box', minX: cx + halfD, maxX: cx + halfD + wallThick, minZ: cz - halfW, maxZ: cz + halfW });
      // Top wall (cz - halfW)
      this.colliders.push({ type: 'box', minX: cx - halfD, maxX: cx + halfD, minZ: cz - halfW - wallThick, maxZ: cz - halfW });
      // Bottom wall (cz + halfW)
      this.colliders.push({ type: 'box', minX: cx - halfD, maxX: cx + halfD, minZ: cz + halfW, maxZ: cz + halfW + wallThick });
      // Front Top Wall (cx - halfD) leaving door open!
      this.colliders.push({ type: 'box', minX: cx - halfD - wallThick, maxX: cx - halfD, minZ: cz - halfW, maxZ: cz - doorWidth / 2 });
      // Front Bottom Wall (cx - halfD)
      this.colliders.push({ type: 'box', minX: cx - halfD - wallThick, maxX: cx - halfD, minZ: cz + doorWidth / 2, maxZ: cz + halfW });
    }
  }

  isInsideAnyHouse(pos) {
    if (!pos || !this.walkInHouses) return false;
    for (let i = 0; i < this.walkInHouses.length; i++) {
      const h = this.walkInHouses[i];
      if (Math.abs(pos.x - h.x) < h.w / 2 - 0.2 && Math.abs(pos.z - h.z) < h.d / 2 - 0.2) {
        return true;
      }
    }
    return false;
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
    return { x: -36, y: 0, z: -25.3 };
  }

  getTreehouseDeckPos() {
    return { x: -36, y: 3.25, z: -28.0 };
  }

  checkCollision(x, z, radius = 0.35, y = 0) {
    if (x < -53 || x > 53 || z < -53 || z > 53) return true;

    // Elevated Treehouse Cabin collision boundary (y >= 2.5)
    if (y >= 2.5 && x > -39.2 && x < -32.8 && z > -31.4 && z < -24.6) {
      // Treehouse walls: Left (-38.3), Right (-33.7), Back (-30.5)
      if (x - radius < -38.3 || x + radius > -33.7 || z - radius < -30.5) return true;
      // Front guard rails (leaving wide doorway open between -37.0 and -35.0)
      if (z + radius > -25.4) {
        if (x < -37.0 || x > -35.0) return true;
      }
      return false; // Walk freely inside spacious treehouse deck
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
