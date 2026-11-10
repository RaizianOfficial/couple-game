// Procedural Low-Poly Dreamy Pastel Town (No external textures or assets)
import * as THREE from 'three';

export class Town {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Array of collision boundaries: { type: 'box', minX, maxX, minZ, maxZ } or { type: 'circle', x, z, r }
    this.interactiveSpots = {}; // Anchors for bike, swing, tea stall

    this.initPalette();
    this.buildGround();
    this.buildPaths();
    this.buildPond();
    this.buildBuildings();
    this.buildTrees();
    this.buildLampPosts();
    this.buildBenches();
    this.buildFences();
  }

  initPalette() {
    this.colors = {
      grass: 0xc7f9cc,        // Fresh soft mint grass
      groundBase: 0xa7f3d0,
      path: 0xfef3c7,         // Warm sand / stone path
      pathBorder: 0xfde68a,
      water: 0x93c5fd,        // Dreamy sky blue water
      waterDeep: 0x60a5fa,
      lilyPad: 0x86efac,
      stone: 0xe2e8f0,        // Soft river stone
      fenceWood: 0xfde047,    // Cute warm wooden fence
      bark: 0x92400e,         // Warm chestnut bark
      
      // Building Pastel Colors
      wallPink: 0xfce7f3,
      wallLavender: 0xede9fe,
      wallPeach: 0xffedd5,
      wallMint: 0xccfbf1,
      roofPink: 0xf472b6,
      roofPurple: 0xa78bfa,
      roofOrange: 0xfb923c,
      roofTeal: 0x2dd4bf,
      doorWood: 0xb45309,
      windowGlow: 0xfef08a,
      lampGlow: 0xfef08a,
      lampPost: 0x475569
    };

    // Shared materials for performance and batching
    this.materials = {
      grass: new THREE.MeshLambertMaterial({ color: this.colors.grass }),
      path: new THREE.MeshLambertMaterial({ color: this.colors.path }),
      stone: new THREE.MeshLambertMaterial({ color: this.colors.stone }),
      water: new THREE.MeshLambertMaterial({ color: this.colors.water, transparent: true, opacity: 0.85 }),
      bark: new THREE.MeshLambertMaterial({ color: this.colors.bark }),
      foliagePink: new THREE.MeshLambertMaterial({ color: 0xfbcfe8, flatShading: true }),
      foliagePeach: new THREE.MeshLambertMaterial({ color: 0xfed7aa, flatShading: true }),
      foliageMint: new THREE.MeshLambertMaterial({ color: 0xa7f3d0, flatShading: true }),
      foliageLavender: new THREE.MeshLambertMaterial({ color: 0xddd6fe, flatShading: true }),
      window: new THREE.MeshBasicMaterial({ color: this.colors.windowGlow }),
      lampLight: new THREE.MeshBasicMaterial({ color: 0xfffbeb })
    };
  }

  buildGround() {
    // 32x32 Main island ground
    const groundGeo = new THREE.BoxGeometry(32, 1, 32);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Decorative floating underside rim
    const underGeo = new THREE.BoxGeometry(32.4, 0.4, 32.4);
    const underMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
    const under = new THREE.Mesh(underGeo, underMat);
    under.position.y = -0.7;
    this.scene.add(under);
  }

  buildPaths() {
    // Central circular plaza
    const plazaGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.04, 24);
    const plaza = new THREE.Mesh(plazaGeo, this.materials.path);
    plaza.position.set(0, 0.02, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Cute cobblestone circle border
    const stoneGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.08, 6);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const stone = new THREE.Mesh(stoneGeo, this.materials.stone);
      stone.position.set(Math.cos(angle) * 4.3, 0.04, Math.sin(angle) * 4.3);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      this.scene.add(stone);
    }

    // Paths connecting to spots
    // North path (to Tea Stall)
    this.createPathSegment(0, -6.5, 2.6, 5);
    // East path (to Bike Spot)
    this.createPathSegment(6.5, 0, 5, 2.6);
    // South-West path (to Swing & Pond)
    this.createPathSegment(-5.5, 5, 4.5, 2.4);
    // South path
    this.createPathSegment(0, 7.5, 2.4, 4);
  }

  createPathSegment(x, z, width, length) {
    const geo = new THREE.BoxGeometry(width, 0.03, length);
    const pathMesh = new THREE.Mesh(geo, this.materials.path);
    pathMesh.position.set(x, 0.015, z);
    pathMesh.receiveShadow = true;
    this.scene.add(pathMesh);
  }

  buildPond() {
    // Tranquil pond at bottom-left (-7.5, 7.5)
    const pondCenter = { x: -8, z: 8 };
    const pondRadius = 3.6;

    // Recessed water surface
    const waterGeo = new THREE.CylinderGeometry(pondRadius, pondRadius, 0.15, 24);
    const water = new THREE.Mesh(waterGeo, this.materials.water);
    water.position.set(pondCenter.x, 0.05, pondCenter.z);
    water.receiveShadow = true;
    this.scene.add(water);

    // Pond bed ring
    const ringGeo = new THREE.RingGeometry(pondRadius - 0.2, pondRadius + 0.5, 24);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xfde68a, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pondCenter.x, 0.02, pondCenter.z);
    this.scene.add(ring);

    // Lily pads
    const lilyGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 8);
    const lilyMat = new THREE.MeshLambertMaterial({ color: this.colors.lilyPad });
    [
      { x: -7.5, z: 7.2 },
      { x: -8.8, z: 8.5 },
      { x: -7.0, z: 9.0 }
    ].forEach((pos) => {
      const lily = new THREE.Mesh(lilyGeo, lilyMat);
      lily.position.set(pos.x, 0.14, pos.z);
      this.scene.add(lily);

      // Pink lotus flower bud
      const flowerGeo = new THREE.SphereGeometry(0.1, 6, 6);
      const flowerMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
      const flower = new THREE.Mesh(flowerGeo, flowerMat);
      flower.position.set(pos.x, 0.22, pos.z);
      this.scene.add(flower);
    });

    // Decorative river stones around pond
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const r = pondRadius + 0.3 + (Math.sin(i * 3) * 0.2);
      const stoneGeo = new THREE.DodecahedronGeometry(0.22 + Math.random() * 0.12, 0);
      const stone = new THREE.Mesh(stoneGeo, this.materials.stone);
      stone.position.set(pondCenter.x + Math.cos(angle) * r, 0.15, pondCenter.z + Math.sin(angle) * r);
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.scene.add(stone);
    }

    // Add circular collider for pond so characters don't walk into deep water
    this.colliders.push({
      type: 'circle',
      x: pondCenter.x,
      z: pondCenter.z,
      r: pondRadius - 0.2
    });
  }

  buildBuildings() {
    // 1. Cozy Pastel Bakery / Cafe (Top-Left: x=-8.5, z=-8.5)
    this.createHouse({
      x: -8.5,
      z: -8.5,
      width: 4.5,
      depth: 4.2,
      height: 3.2,
      wallColor: this.colors.wallPeach,
      roofColor: this.colors.roofOrange,
      doorFacing: '+z',
      hasAwning: true,
      awningColor: 0xfb7185
    });

    // 2. Sweet Lavender Library / Bookshop (Top-Right: x=8.5, z=-8.5)
    this.createHouse({
      x: 8.5,
      z: -8.5,
      width: 4.8,
      depth: 4.4,
      height: 3.5,
      wallColor: this.colors.wallLavender,
      roofColor: this.colors.roofPurple,
      doorFacing: '+z',
      hasChimney: true
    });

    // 3. Flower Cottage (Bottom-Right: x=8.5, z=8.5)
    this.createHouse({
      x: 8.5,
      z: 8.5,
      width: 4.2,
      depth: 4.0,
      height: 3.0,
      wallColor: this.colors.wallMint,
      roofColor: this.colors.roofPink,
      doorFacing: '-z',
      hasChimney: true
    });
  }

  createHouse(cfg) {
    const group = new THREE.Group();
    group.position.set(cfg.x, 0, cfg.z);

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(cfg.width, cfg.height, cfg.depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color: cfg.wallColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = cfg.height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Roof (Prism / Slanted roof)
    const roofOverhang = 0.5;
    const roofHeight = 1.6;
    const roofGeo = new THREE.ConeGeometry((cfg.width + roofOverhang) * 0.75, roofHeight, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: cfg.roofColor, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = cfg.height + roofHeight / 2 - 0.1;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, cfg.depth / cfg.width);
    roof.castShadow = true;
    group.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.0, 1.8, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: this.colors.doorWood });
    const door = new THREE.Mesh(doorGeo, doorMat);
    const doorZ = cfg.doorFacing === '+z' ? cfg.depth / 2 + 0.05 : -cfg.depth / 2 - 0.05;
    door.position.set(0, 0.9, doorZ);
    group.add(door);

    // Glowing Windows
    const winGeo = new THREE.BoxGeometry(0.7, 0.7, 0.12);
    const win1 = new THREE.Mesh(winGeo, this.materials.window);
    win1.position.set(-1.2, 1.8, doorZ);
    group.add(win1);

    const win2 = new THREE.Mesh(winGeo, this.materials.window);
    win2.position.set(1.2, 1.8, doorZ);
    group.add(win2);

    // Optional Cute Chimney
    if (cfg.hasChimney) {
      const chimGeo = new THREE.BoxGeometry(0.6, 1.4, 0.6);
      const chimMat = new THREE.MeshLambertMaterial({ color: cfg.wallColor });
      const chimney = new THREE.Mesh(chimGeo, chimMat);
      chimney.position.set(cfg.width * 0.3, cfg.height + 1.2, 0);
      chimney.castShadow = true;
      group.add(chimney);
    }

    // Optional Cute Striped Awning
    if (cfg.hasAwning) {
      const awnGeo = new THREE.BoxGeometry(1.6, 0.15, 0.8);
      const awnMat = new THREE.MeshLambertMaterial({ color: cfg.awningColor });
      const awning = new THREE.Mesh(awnGeo, awnMat);
      awning.position.set(0, 2.0, cfg.depth / 2 + 0.4);
      awning.rotation.x = 0.25;
      awning.castShadow = true;
      group.add(awning);
    }

    this.scene.add(group);

    // Add AABB collider with small padding
    const halfW = cfg.width / 2 + 0.3;
    const halfD = cfg.depth / 2 + 0.3;
    this.colliders.push({
      type: 'box',
      minX: cfg.x - halfW,
      maxX: cfg.x + halfW,
      minZ: cfg.z - halfD,
      maxZ: cfg.z + halfD
    });
  }

  buildTrees() {
    // Cherry blossom and pastel trees scattered in corners and parks
    const treePositions = [
      { x: -12, z: -4, col: 'foliagePink', s: 1.2 },
      { x: -12, z: 2, col: 'foliagePeach', s: 1.0 },
      { x: -3.5, z: -11, col: 'foliagePink', s: 1.1 },
      { x: 3.5, z: -11, col: 'foliageMint', s: 1.0 },
      { x: 12, z: -4, col: 'foliageLavender', s: 1.2 },
      { x: 12, z: 3, col: 'foliagePink', s: 1.1 },
      { x: -12, z: 12, col: 'foliageMint', s: 1.1 },
      { x: 4, z: 12, col: 'foliagePeach', s: 1.0 },
      { x: -2.5, z: 11, col: 'foliagePink', s: 0.9 }
    ];

    treePositions.forEach(t => {
      this.createTree(t.x, t.z, t.col, t.s);
    });
  }

  createTree(x, z, foliageType, scale = 1.0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22 * scale, 0.3 * scale, 1.8 * scale, 7);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.bark);
    trunk.position.y = 0.9 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Foliage (Layered cute spheres / dodecahedrons)
    const mat = this.materials[foliageType] || this.materials.foliagePink;

    const f1Geo = new THREE.DodecahedronGeometry(1.2 * scale, 1);
    const f1 = new THREE.Mesh(f1Geo, mat);
    f1.position.y = 2.2 * scale;
    f1.castShadow = true;
    group.add(f1);

    const f2Geo = new THREE.DodecahedronGeometry(0.9 * scale, 1);
    const f2 = new THREE.Mesh(f2Geo, mat);
    f2.position.set(0.2 * scale, 2.9 * scale, -0.1 * scale);
    f2.castShadow = true;
    group.add(f2);

    this.scene.add(group);

    // Collider for tree trunk
    this.colliders.push({
      type: 'circle',
      x,
      z,
      r: 0.65 * scale
    });
  }

  buildLampPosts() {
    const posts = [
      { x: -3.2, z: -3.2 },
      { x: 3.2, z: -3.2 },
      { x: -3.2, z: 3.2 },
      { x: 3.2, z: 3.2 }
    ];

    posts.forEach(p => {
      const group = new THREE.Group();
      group.position.set(p.x, 0, p.z);

      // Post
      const postGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.4, 8);
      const postMat = new THREE.MeshLambertMaterial({ color: this.colors.lampPost });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 1.2;
      post.castShadow = true;
      group.add(post);

      // Glowing Lantern head
      const headGeo = new THREE.DodecahedronGeometry(0.28, 0);
      const head = new THREE.Mesh(headGeo, this.materials.lampLight);
      head.position.y = 2.4;
      group.add(head);

      // Cute small soft point light
      const light = new THREE.PointLight(0xfef08a, 0.4, 4.5);
      light.position.y = 2.4;
      group.add(light);

      this.scene.add(group);

      this.colliders.push({
        type: 'circle',
        x: p.x,
        z: p.z,
        r: 0.3
      });
    });
  }

  buildBenches() {
    // Park benches near the plaza
    const benchPositions = [
      { x: -2.8, z: 0, rotY: Math.PI / 2 },
      { x: 0, z: -2.8, rotY: 0 }
    ];

    const benchMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const legMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

    benchPositions.forEach(b => {
      const group = new THREE.Group();
      group.position.set(b.x, 0, b.z);
      group.rotation.y = b.rotY;

      // Seat
      const seatGeo = new THREE.BoxGeometry(1.6, 0.08, 0.5);
      const seat = new THREE.Mesh(seatGeo, benchMat);
      seat.position.y = 0.45;
      seat.castShadow = true;
      group.add(seat);

      // Backrest
      const backGeo = new THREE.BoxGeometry(1.6, 0.4, 0.08);
      const back = new THREE.Mesh(backGeo, benchMat);
      back.position.set(0, 0.75, -0.22);
      back.castShadow = true;
      group.add(back);

      // Legs
      [-0.65, 0.65].forEach(lx => {
        const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.45);
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.225, 0);
        group.add(leg);
      });

      this.scene.add(group);

      this.colliders.push({
        type: 'box',
        minX: b.x - (b.rotY ? 0.4 : 0.9),
        maxX: b.x + (b.rotY ? 0.4 : 0.9),
        minZ: b.z - (b.rotY ? 0.9 : 0.4),
        maxZ: b.z + (b.rotY ? 0.9 : 0.4)
      });
    });
  }

  buildFences() {
    // Perimeter bounds: town map is bounded between [-15, 15] x [-15, 15]
    this.mapBounds = { minX: -14.5, maxX: 14.5, minZ: -14.5, maxZ: 14.5 };

    const fenceMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
    const postMat = new THREE.MeshLambertMaterial({ color: 0xfcd34d });

    const postGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);
    const railGeo = new THREE.BoxGeometry(1.8, 0.1, 0.08);

    // Build perimeter picket fence segments along 4 sides with entry gaps
    const createFenceLine = (start, end) => {
      const dist = Math.hypot(end.x - start.x, end.z - start.z);
      const steps = Math.floor(dist / 1.8);
      const dx = (end.x - start.x) / steps;
      const dz = (end.z - start.z) / steps;

      for (let i = 0; i <= steps; i++) {
        const px = start.x + dx * i;
        const pz = start.z + dz * i;

        // Post
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, 0.375, pz);
        post.castShadow = true;
        this.scene.add(post);

        // Rail
        if (i < steps) {
          const rail = new THREE.Mesh(railGeo, fenceMat);
          rail.position.set(px + dx / 2, 0.45, pz + dz / 2);
          rail.rotation.y = Math.atan2(-dz, dx);
          rail.castShadow = true;
          this.scene.add(rail);
        }
      }
    };

    // 4 borders
    createFenceLine({ x: -14.5, z: -14.5 }, { x: 14.5, z: -14.5 });
    createFenceLine({ x: 14.5, z: -14.5 }, { x: 14.5, z: 14.5 });
    createFenceLine({ x: 14.5, z: 14.5 }, { x: -14.5, z: 14.5 });
    createFenceLine({ x: -14.5, z: 14.5 }, { x: -14.5, z: -14.5 });
  }

  // Check collision for an entity with radius r at (x, z)
  checkCollision(x, z, r = 0.4) {
    // 1. Boundary check
    if (
      x - r < this.mapBounds.minX ||
      x + r > this.mapBounds.maxX ||
      z - r < this.mapBounds.minZ ||
      z + r > this.mapBounds.maxZ
    ) {
      return true;
    }

    // 2. Obstacles check
    for (const c of this.colliders) {
      if (c.type === 'circle') {
        const distSq = (x - c.x) ** 2 + (z - c.z) ** 2;
        const minDist = r + c.r;
        if (distSq < minDist * minDist) {
          return true;
        }
      } else if (c.type === 'box') {
        // Nearest point on box
        const nearestX = Math.max(c.minX, Math.min(x, c.maxX));
        const nearestZ = Math.max(c.minZ, Math.min(z, c.maxZ));
        const distSq = (x - nearestX) ** 2 + (z - nearestZ) ** 2;
        if (distSq < r * r) {
          return true;
        }
      }
    }
    return false;
  }
}
