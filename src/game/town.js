// Procedural Low-Poly Dreamy Pastel Expanded Town (75x75 map, No external textures)
import * as THREE from 'three';

export class Town {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactiveSpots = {};

    this.initPalette();
    this.buildGround();
    this.buildRoadsAndPaths();
    this.buildCentralFountainPlaza();
    this.buildRiverAndBridge();
    this.buildBuildings();
    this.buildRomanticGazebo();
    this.buildTrees();
    this.buildStreetlamps();
    this.buildBenches();
    this.buildPerimeterHedges();
  }

  initPalette() {
    this.colors = {
      grass: 0xc7f9cc,        // Fresh mint grass
      groundUnder: 0x86efac,
      road: 0xfef3c7,         // Warm sandstone road
      roadBorder: 0xfde68a,
      water: 0x93c5fd,        // Sparkling water
      waterDeep: 0x60a5fa,
      lilyPad: 0x86efac,
      stone: 0xe2e8f0,        // Soft river stone
      fountainWater: 0x67e8f9,
      woodDark: 0x78350f,     // Rich chestnut wood
      woodWarm: 0xb45309,
      
      // Buildings
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
      roadBorder: new THREE.MeshLambertMaterial({ color: this.colors.roadBorder }),
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
      foliageLavender: new THREE.MeshLambertMaterial({ color: 0xddd6fe, flatShading: true }),
      hedge: new THREE.MeshLambertMaterial({ color: 0x6ee7b7, flatShading: true })
    };
  }

  buildGround() {
    // Large 75x75 island ground
    const groundGeo = new THREE.BoxGeometry(75, 1.2, 75);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Decorative floating underside rim
    const underGeo = new THREE.BoxGeometry(75.8, 0.5, 75.8);
    const underMat = new THREE.MeshLambertMaterial({ color: this.colors.groundUnder });
    const under = new THREE.Mesh(underGeo, underMat);
    under.position.y = -0.9;
    this.scene.add(under);
  }

  buildRoadsAndPaths() {
    // Wide network of open roads for walking and driving the motorbike smoothly
    // 1. Central Ring Road & Cross Roads
    this.createRoadSegment(0, 0, 70, 4.2); // East-West Grand Avenue
    this.createRoadSegment(0, 0, 4.2, 70); // North-South Promenade

    // Outer Boulevard loop
    this.createRoadSegment(0, -22, 54, 3.6); // North Boulevard
    this.createRoadSegment(0, 22, 54, 3.6);  // South Boulevard
    this.createRoadSegment(22, 0, 3.6, 46);  // East Residential Street
    this.createRoadSegment(-22, 0, 3.6, 46); // West Riverbank Way
  }

  createRoadSegment(x, z, width, length) {
    const geo = new THREE.BoxGeometry(width, 0.04, length);
    const mesh = new THREE.Mesh(geo, this.materials.road);
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildCentralFountainPlaza() {
    // Grand Circular Town Square Plaza
    const plazaGeo = new THREE.CylinderGeometry(6.8, 6.8, 0.06, 28);
    const plaza = new THREE.Mesh(plazaGeo, this.materials.road);
    plaza.position.set(0, 0.03, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Plaza cobblestone border
    const stoneGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 6);
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const stone = new THREE.Mesh(stoneGeo, this.materials.stone);
      stone.position.set(Math.cos(angle) * 7.0, 0.05, Math.sin(angle) * 7.0);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      this.scene.add(stone);
    }

    // Central Romantic Tiered Fountain
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);

    // Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.55, 16), this.materials.stone);
    basin.position.y = 0.275;
    basin.castShadow = true;
    fountainGroup.add(basin);

    // Water surface inside basin
    const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.04, 16), this.materials.fountainWater);
    waterMesh.position.y = 0.48;
    fountainGroup.add(waterMesh);

    // Middle pedestal & top tier
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.2, 10), this.materials.stone);
    stem.position.y = 0.85;
    stem.castShadow = true;
    fountainGroup.add(stem);

    const upperTier = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.25, 12), this.materials.stone);
    upperTier.position.y = 1.35;
    upperTier.castShadow = true;
    fountainGroup.add(upperTier);

    const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.02, 12), this.materials.fountainWater);
    upperWater.position.y = 1.48;
    fountainGroup.add(upperWater);

    // Spouting finial / sphere with heart
    const topSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), this.materials.stone);
    topSphere.position.y = 1.7;
    fountainGroup.add(topSphere);

    this.scene.add(fountainGroup);

    // Collider for fountain center
    this.colliders.push({
      type: 'circle',
      x: 0,
      z: 0,
      r: 2.6
    });
  }

  buildRiverAndBridge() {
    // Scenic River / Canal flowing through western side of town
    const riverGeo = new THREE.BoxGeometry(7.0, 0.02, 54);
    const river = new THREE.Mesh(riverGeo, this.materials.water);
    river.position.set(-18, 0.01, 0);
    this.scene.add(river);

    // River stone banks
    for (let z = -25; z <= 25; z += 2.5) {
      [-21.6, -14.4].forEach(x => {
        const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.2, 1), this.materials.stone);
        s.position.set(x + (Math.random() - 0.5) * 0.4, 0.08, z + (Math.random() - 0.5) * 0.4);
        s.scale.set(1.4, 0.6, 1.2);
        this.scene.add(s);
      });
    }

    // Lily pads in river
    const lilyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.02, 8);
    const lilyMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    for (let i = 0; i < 14; i++) {
      const lily = new THREE.Mesh(lilyGeo, lilyMat);
      lily.position.set(-18 + (Math.sin(i * 1.7) * 2.4), 0.02, -22 + i * 3.6);
      this.scene.add(lily);
    }

    // Charming Arched Wooden Bridge over the river at Grand Avenue (x = -18, z = 0)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-18, 0, 0);

    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.16, 4.6), this.materials.wood);
    bridgeDeck.position.y = 0.45;
    bridgeDeck.castShadow = true;
    bridgeGroup.add(bridgeDeck);

    // Bridge ramps
    [-4.6, 4.6].forEach((rx, idx) => {
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 4.6), this.materials.wood);
      ramp.position.set(rx * 0.9, 0.22, 0);
      ramp.rotation.z = idx === 0 ? 0.2 : -0.2;
      bridgeGroup.add(ramp);
    });

    // Bridge Handrails
    [-2.2, 2.2].forEach(rz => {
      // Rail bar
      const rail = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.08, 0.08), this.materials.woodDark);
      rail.position.set(0, 1.05, rz);
      rail.castShadow = true;
      bridgeGroup.add(rail);

      // Posts
      for (let px = -4.0; px <= 4.0; px += 1.6) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), this.materials.woodDark);
        post.position.set(px, 0.75, rz);
        bridgeGroup.add(post);
      }
    });

    this.scene.add(bridgeGroup);

    // River Colliders: block water except on the bridge
    this.colliders.push({
      type: 'box',
      minX: -21.8,
      maxX: -14.2,
      minZ: -28,
      maxZ: -2.8
    });
    this.colliders.push({
      type: 'box',
      minX: -21.8,
      maxX: -14.2,
      minZ: 2.8,
      maxZ: 28
    });
  }

  buildBuildings() {
    // 6 Cozy Pastel Cottages in residential street & around town
    const houses = [
      { x: 12, z: -12, w: 5.2, d: 4.8, h: 3.4, color: this.colors.wallPink, roof: this.colors.roofPurple, rot: 0 },
      { x: 24, z: -12, w: 4.8, d: 4.5, h: 3.2, color: this.colors.wallLavender, roof: this.colors.roofPink, rot: 0 },
      { x: 12, z: 12,  w: 5.0, d: 4.6, h: 3.4, color: this.colors.wallPeach, roof: this.colors.roofTeal, rot: Math.PI },
      { x: 24, z: 12,  w: 5.4, d: 4.8, h: 3.5, color: this.colors.wallMint, roof: this.colors.roofOrange, rot: Math.PI },
      { x: -10, z: -22, w: 5.0, d: 4.4, h: 3.2, color: this.colors.wallSky, roof: this.colors.roofRose, rot: Math.PI / 2 },
      { x: 12, z: -26, w: 4.6, d: 4.2, h: 3.0, color: this.colors.wallYellow, roof: this.colors.roofSky, rot: 0 }
    ];

    houses.forEach(h => {
      this.createHouse(h.x, h.z, h.w, h.d, h.h, h.color, h.roof, h.rot);
    });
  }

  createHouse(x, z, width, depth, height, wallColor, roofColor, rotY) {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, 0, z);
    houseGroup.rotation.y = rotY;

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Gabled Roof
    const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.74, height * 0.55, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + (height * 0.27);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(width / depth, 1, 1);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
    chimney.position.set(width * 0.28, height + 0.6, -depth * 0.2);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.6, 0.08), this.materials.woodDark);
    door.position.set(0, 0.8, depth / 2 + 0.04);
    houseGroup.add(door);

    // Windows with warm glow
    [-width * 0.28, width * 0.28].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.06), this.materials.window);
      win.position.set(wx, 1.6, depth / 2 + 0.04);
      houseGroup.add(win);
    });

    this.scene.add(houseGroup);

    // Collider for house
    this.colliders.push({
      type: 'box',
      minX: x - width / 2 - 0.2,
      maxX: x + width / 2 + 0.2,
      minZ: z - depth / 2 - 0.2,
      maxZ: z + depth / 2 + 0.2
    });
  }

  buildRomanticGazebo() {
    // Octagonal romantic garden gazebo at South-East park (x = 18, z = 24)
    const gazeboGroup = new THREE.Group();
    gazeboGroup.position.set(18, 0, 24);

    // Stone base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.4, 8), this.materials.stone);
    base.position.y = 0.2;
    base.castShadow = true;
    gazeboGroup.add(base);

    // 8 White Wooden Pillars
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      pillar.position.set(Math.cos(a) * 2.8, 1.3, Math.sin(a) * 2.8);
      pillar.castShadow = true;
      gazeboGroup.add(pillar);
    }

    // Octagonal Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    roof.position.y = 3.1;
    roof.castShadow = true;
    gazeboGroup.add(roof);

    // Center circular table & round bench
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.7, 10), this.materials.wood);
    table.position.y = 0.75;
    gazeboGroup.add(table);

    this.scene.add(gazeboGroup);

    this.colliders.push({
      type: 'circle',
      x: 18,
      z: 24,
      r: 3.2
    });
  }

  buildTrees() {
    // 45+ lush low-poly trees scattered across parks and avenues
    const treeTypes = ['foliagePink', 'foliagePeach', 'foliageMint', 'foliageLavender'];
    const treeCoords = [
      // Along North promenade
      { x: -5, z: -8 }, { x: 5, z: -8 }, { x: -5, z: -16 }, { x: 5, z: -16 },
      // Near Tea Stall
      { x: -3.5, z: -14 }, { x: 3.5, z: -14 }, { x: 0, z: -18 },
      // Waterfront park (West)
      { x: -12, z: 6 }, { x: -12, z: 14 }, { x: -16, z: 18 }, { x: -24, z: 10 },
      { x: -24, z: -8 }, { x: -24, z: -18 }, { x: -14, z: -12 }, { x: -12, z: 22 },
      // Residential gardens (East)
      { x: 18, z: -6 }, { x: 28, z: -6 }, { x: 8, z: -18 }, { x: 28, z: -18 },
      { x: 18, z: 6 }, { x: 28, z: 6 }, { x: 8, z: 18 }, { x: 28, z: 18 },
      // Gazebo park (South)
      { x: 12, z: 24 }, { x: 24, z: 24 }, { x: 18, z: 30 }, { x: 14, z: 30 },
      // Perimeter grove
      { x: -30, z: -30 }, { x: -20, z: -32 }, { x: 0, z: -32 }, { x: 20, z: -32 }, { x: 30, z: -30 },
      { x: -32, z: 0 }, { x: -32, z: 20 }, { x: -30, z: 30 }, { x: 0, z: 32 }, { x: 30, z: 30 }
    ];

    treeCoords.forEach((pt, idx) => {
      const type = treeTypes[idx % treeTypes.length];
      const scale = 0.85 + (idx % 3) * 0.2;
      this.createTree(pt.x, pt.z, type, scale);
    });
  }

  createTree(x, z, foliageType, scale = 1) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunkMat = new THREE.MeshLambertMaterial({ color: this.colors.woodDark });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.26 * scale, 1.8 * scale, 8), trunkMat);
    trunk.position.y = 0.9 * scale;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Fluffy cloud-like foliage spheres
    const mat = this.materials[foliageType] || this.materials.foliagePink;
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * scale, 1), mat);
    crown1.position.y = 2.4 * scale;
    crown1.castShadow = true;
    treeGroup.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95 * scale, 1), mat);
    crown2.position.set(0.4 * scale, 2.9 * scale, 0.3 * scale);
    crown2.castShadow = true;
    treeGroup.add(crown2);

    const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85 * scale, 1), mat);
    crown3.position.set(-0.35 * scale, 2.8 * scale, -0.3 * scale);
    crown3.castShadow = true;
    treeGroup.add(crown3);

    this.scene.add(treeGroup);

    // Small collider for trunk
    this.colliders.push({
      type: 'circle',
      x,
      z,
      r: 0.45 * scale
    });
  }

  buildStreetlamps() {
    // Beautiful lampposts with glowing warm globes along roads
    const lampCoords = [
      { x: -5, z: -5 }, { x: 5, z: -5 }, { x: -5, z: 5 }, { x: 5, z: 5 },
      { x: -14, z: 0 }, { x: 14, z: 0 }, { x: 0, z: -14 }, { x: 0, z: 14 },
      { x: 22, z: -18 }, { x: 22, z: 18 }, { x: -18, z: 10 }, { x: 18, z: 18 }
    ];

    lampCoords.forEach(pos => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(pos.x, 0, pos.y || pos.z);

      const postMat = new THREE.MeshLambertMaterial({ color: this.colors.lampPost });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 8), postMat);
      post.position.y = 1.4;
      post.castShadow = true;
      lampGroup.add(post);

      // Glowing sphere head
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), this.materials.lampLight);
      globe.position.y = 2.85;
      lampGroup.add(globe);

      this.scene.add(lampGroup);

      this.colliders.push({
        type: 'circle',
        x: pos.x,
        z: pos.y || pos.z,
        r: 0.25
      });
    });
  }

  buildBenches() {
    // Cozy park benches for couples
    const benchPositions = [
      { x: -4.5, z: -3.5, rot: Math.PI / 4 },
      { x: 4.5, z: -3.5, rot: -Math.PI / 4 },
      { x: -13.5, z: 7, rot: -Math.PI / 2 }, // By the river
      { x: 8, z: 8, rot: 0 }
    ];

    benchPositions.forEach(b => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(b.x, 0, b.z);
      benchGroup.rotation.y = b.rot;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.42), this.materials.wood);
      seat.position.y = 0.42;
      seat.castShadow = true;
      benchGroup.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.06), this.materials.wood);
      back.position.set(0, 0.72, -0.18);
      back.castShadow = true;
      benchGroup.add(back);

      this.scene.add(benchGroup);
    });
  }

  buildPerimeterHedges() {
    // Perimeter safety hedges around the 75x75 island
    const half = 35.5;
    const hedgeThick = 1.2;
    const hedgeHeight = 1.6;

    // North & South
    [-half, half].forEach(z => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(72, hedgeHeight, hedgeThick), this.materials.hedge);
      hedge.position.set(0, hedgeHeight / 2, z);
      this.scene.add(hedge);
      this.colliders.push({
        type: 'box',
        minX: -36,
        maxX: 36,
        minZ: z - hedgeThick,
        maxZ: z + hedgeThick
      });
    });

    // East & West
    [-half, half].forEach(x => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(hedgeThick, hedgeHeight, 72), this.materials.hedge);
      hedge.position.set(x, hedgeHeight / 2, 0);
      this.scene.add(hedge);
      this.colliders.push({
        type: 'box',
        minX: x - hedgeThick,
        maxX: x + hedgeThick,
        minZ: -36,
        maxZ: 36
      });
    });
  }

  // Smooth circular and box collision detection with cushion radius
  checkCollision(x, z, radius = 0.35) {
    // Map boundaries check
    if (x < -34 || x > 34 || z < -34 || z > 34) {
      return true;
    }

    for (let i = 0; i < this.colliders.length; i++) {
      const col = this.colliders[i];
      if (col.type === 'circle') {
        const dist = Math.hypot(x - col.x, z - col.z);
        if (dist < col.r + radius) return true;
      } else if (col.type === 'box') {
        if (
          x + radius > col.minX &&
          x - radius < col.maxX &&
          z + radius > col.minZ &&
          z - radius < col.maxZ
        ) {
          return true;
        }
      }
    }
    return false;
  }
}
