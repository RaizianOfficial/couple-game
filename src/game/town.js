// Procedural Low-Poly Dreamy Pastel Expanded Town (150x150 map, No external textures)
import * as THREE from 'three';

export class Town {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactiveSpots = {};

    this.initPalette();
    this.buildGround();
    this.buildBoundaryWalls();
    this.buildRoadsAndPaths();
    this.buildCentralFountainPlaza();
    this.buildRiverAndBridge();
    this.buildBuildings();
    this.buildRomanticGazebo();
    this.buildExpandedPark();
    this.buildTrees();
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
    this.createRoadSegment(0, 0, 120, 4.2);
    this.createRoadSegment(0, 0, 4.2, 120);
    this.createRoadSegment(0, -45, 110, 3.6);
    this.createRoadSegment(0, 45, 110, 3.6);
    this.createRoadSegment(45, 0, 3.6, 90);
    this.createRoadSegment(-45, 0, 3.6, 90);
  }

  createRoadSegment(x, z, width, length) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length), this.materials.road);
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  buildExpandedPark() {
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 11.0, 0.08, 24), this.materials.water);
    pond.position.set(-45, 0.04, 45);
    this.scene.add(pond);

    const rimStoneGeo = new THREE.DodecahedronGeometry(0.45, 1);
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const stone = new THREE.Mesh(rimStoneGeo, this.materials.stone);
      stone.position.set(-45 + Math.cos(a) * 10.8, 0.15, 45 + Math.sin(a) * 10.8);
      this.scene.add(stone);
    }

    for (let i = 0; i < 9; i++) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 8), new THREE.MeshLambertMaterial({ color: 0x86efac }));
      const pa = (i / 9) * Math.PI * 2;
      pad.position.set(-45 + Math.cos(pa) * (3 + (i % 3) * 2), 0.07, 45 + Math.sin(pa) * (3 + (i % 3) * 2));
      this.scene.add(pad);
    }

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 2.8), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    blanket.position.set(-30, 0.03, 58);
    this.scene.add(blanket);

    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.4), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
    basket.position.set(-30, 0.25, 58);
    this.scene.add(basket);

    const flowerGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const flowerColors = [0xf472b6, 0xfb7185, 0xfde047, 0xa78bfa, 0x67e8f9];
    for (let i = 0; i < 60; i++) {
      const fl = new THREE.Mesh(flowerGeo, new THREE.MeshBasicMaterial({ color: flowerColors[i % 5] }));
      fl.position.set(-58 + (i % 10) * 3, 0.14, 20 + Math.floor(i / 10) * 6 + (Math.cos(i) * 2));
      this.scene.add(fl);
    }
  }

  buildCentralFountainPlaza() {
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 8.0, 0.06, 28), this.materials.road);
    plaza.position.set(0, 0.03, 0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);

    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.55, 16), this.materials.stone);
    basin.position.y = 0.275;
    fountainGroup.add(basin);

    const waterMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.04, 16), this.materials.fountainWater);
    waterMesh.position.y = 0.48;
    fountainGroup.add(waterMesh);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.2, 10), this.materials.stone);
    stem.position.y = 0.85;
    fountainGroup.add(stem);

    const upperTier = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.25, 12), this.materials.stone);
    upperTier.position.y = 1.35;
    fountainGroup.add(upperTier);

    const topSphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this.materials.stone);
    topSphere.position.y = 1.7;
    fountainGroup.add(topSphere);

    this.scene.add(fountainGroup);
    this.colliders.push({ type: 'circle', x: 0, z: 0, r: 3.6 });
  }

  buildRiverAndBridge() {
    // 1. Scenic River spanning full 150m map
    const river = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.04, 150), this.materials.water);
    river.position.set(-24, 0.02, 0);
    this.scene.add(river);

    // River bed under water
    const riverBed = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.1, 150), new THREE.MeshLambertMaterial({ color: 0x60a5fa }));
    riverBed.position.set(-24, -0.06, 0);
    this.scene.add(riverBed);

    // 2. Charming Arched Wooden Footbridge
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-24, 0, 0);

    const deckWidth = 4.6; // Matches road alignment
    const deckLen = 9.6;

    // Bridge Deck Planks
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(deckLen, 0.22, deckWidth), this.materials.wood);
    bridgeDeck.position.y = 0.38;
    bridgeDeck.receiveShadow = true;
    bridgeGroup.add(bridgeDeck);

    // Flush approach ramps connecting to road smoothly
    [-5.6, 5.6].forEach((rx, idx) => {
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, deckWidth), this.materials.wood);
      ramp.position.set(rx > 0 ? 5.2 : -5.2, 0.18, 0);
      ramp.rotation.z = idx === 0 ? 0.16 : -0.16;
      ramp.receiveShadow = true;
      bridgeGroup.add(ramp);
    });

    // 4 Heavy Timber Under-Pillars in River
    [-2.8, 2.8].forEach(px => {
      [-1.9, 1.9].forEach(pz => {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8), this.materials.stone);
        pier.position.set(px, 0.15, pz);
        bridgeGroup.add(pier);
      });
    });

    // Elegant Wooden Railings perfectly aligned with deck
    const railMat = this.materials.woodDark;
    [-deckWidth / 2 + 0.1, deckWidth / 2 - 0.1].forEach(rz => {
      // Top handrail
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(deckLen, 0.1, 0.1), railMat);
      topRail.position.set(0, 0.98, rz);
      bridgeGroup.add(topRail);

      // Mid safety rail
      const midRail = new THREE.Mesh(new THREE.BoxGeometry(deckLen, 0.06, 0.06), railMat);
      midRail.position.set(0, 0.68, rz);
      bridgeGroup.add(midRail);

      // Vertical spindles
      for (let px = -deckLen / 2 + 0.2; px <= deckLen / 2 - 0.2; px += 1.35) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 6), railMat);
        post.position.set(px, 0.68, rz);
        bridgeGroup.add(post);
      }

      // Sturdy end posts
      [-deckLen / 2, deckLen / 2].forEach(ex => {
        const endPost = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.14), railMat);
        endPost.position.set(ex, 0.72, rz);
        bridgeGroup.add(endPost);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), this.materials.wood);
        cap.position.set(ex, 1.15, rz);
        bridgeGroup.add(cap);
      });
    });

    this.scene.add(bridgeGroup);

    // River impassable boundaries (leave walkway at z: -2.4 to 2.4 open)
    this.colliders.push({ type: 'box', minX: -28.2, maxX: -19.8, minZ: -75, maxZ: -2.5 });
    this.colliders.push({ type: 'box', minX: -28.2, maxX: -19.8, minZ: 2.5, maxZ: 75 });
  }

  buildBuildings() {
    const houses = [
      { x: 12, z: -16, w: 5.2, d: 4.8, h: 3.4, color: this.colors.wallPink, roof: this.colors.roofPurple, rot: 0 },
      // Note: Removed cramped house at (26, -16) to give the Couple's Master Villa a grand open front lawn!
      { x: 12, z: 16, w: 5.0, d: 4.6, h: 3.4, color: this.colors.wallPeach, roof: this.colors.roofTeal, rot: Math.PI },
      { x: 26, z: 16, w: 5.4, d: 4.8, h: 3.5, color: this.colors.wallMint, roof: this.colors.roofOrange, rot: Math.PI },
      { x: -10, z: -32, w: 5.0, d: 4.4, h: 3.2, color: this.colors.wallSky, roof: this.colors.roofRose, rot: Math.PI / 2 },
      { x: 12, z: -36, w: 4.6, d: 4.2, h: 3.0, color: this.colors.wallYellow, roof: this.colors.roofSky, rot: 0 }
    ];

    houses.forEach(h => this.createHouse(h.x, h.z, h.w, h.d, h.h, h.color, h.roof, h.rot));

    // Charming garden path leading to Couple's Master Villa
    this.createRoadSegment(38, -26, 3.6, 16);
  }

  createHouse(x, z, w, d, h, wc, rc, ry) {
    const grp = new THREE.Group();
    grp.position.set(x, 0, z);
    grp.rotation.y = ry;

    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: wc }));
    walls.position.y = h / 2;
    grp.add(walls);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.74, h * 0.55, 4), new THREE.MeshLambertMaterial({ color: rc }));
    roof.position.y = h + (h * 0.27);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(w / d, 1, 1);
    grp.add(roof);

    this.scene.add(grp);
    this.colliders.push({ type: 'box', minX: x - w / 2 - 0.2, maxX: x + w / 2 + 0.2, minZ: z - d / 2 - 0.2, maxZ: z + d / 2 + 0.2 });
  }

  buildRomanticGazebo() {
    const grp = new THREE.Group();
    grp.position.set(24, 0, 32);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.4, 8), this.materials.stone);
    base.position.y = 0.2;
    grp.add(base);
    for (let i = 0; i < 8; i++) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      pillar.position.set(Math.cos(i / 8 * Math.PI * 2) * 3.2, 1.4, Math.sin(i / 8 * Math.PI * 2) * 3.2);
      grp.add(pillar);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.6, 8), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    roof.position.y = 3.4;
    grp.add(roof);
    this.scene.add(grp);
    this.colliders.push({ type: 'circle', x: 24, z: 32, r: 3.6 });
  }

  buildTrees() {
    // All trees are now managed dynamically by TreeChoppingSystem so that EVERY tree is interactive & choppable!
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

  buildStreetlamps() { }

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