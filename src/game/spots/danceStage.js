// Grand Concert Festival Cuboid Stage with Step Entrance & Automated Dance Choreography
import * as THREE from 'three';

export class DanceStageSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'danceStage';

    // Positioned in the dedicated East festival park grounds at (x: 32, z: 8)
    this.position = new THREE.Vector3(32, 0, 8);
    this.rotationY = 0;

    this.musicNotes = [];
    this.spotlights = [];
    this.stageLightsTimer = 0;

    this.buildConcertStage();
    this.initMusicNotes();
  }

  buildConcertStage() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    const stageMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Dark concert steel/wood
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });  // Non-slip stage floor
    const stairMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const woodTrimMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const speakerMat = new THREE.MeshLambertMaterial({ color: 0x020617 });
    const trussMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const neonPink = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const neonCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const neonGold = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const neonPurple = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

    // 1. GRAND CUBOID CONCERT STAGE PLATFORM (7.6m wide, 6.0m deep, 0.55m elevated)
    const baseStage = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.55, 6.0), stageMat);
    baseStage.position.y = 0.275;
    baseStage.receiveShadow = true;
    this.group.add(baseStage);

    // Polished Charcoal Concert Deck Floor
    const deckFloor = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.02, 5.9), deckMat);
    deckFloor.position.y = 0.555;
    deckFloor.receiveShadow = true;
    this.group.add(deckFloor);

    // Glowing Neon Stage Rim (Perimeter Neon Edging)
    const frontNeon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 5.9), neonPink);
    frontNeon.position.set(-3.76, 0.54, 0);
    this.group.add(frontNeon);

    const backNeon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 5.9), neonCyan);
    backNeon.position.set(3.76, 0.54, 0);
    this.group.add(backNeon);

    const leftNeon = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.06, 0.06), neonCyan);
    leftNeon.position.set(0, 0.54, -2.96);
    this.group.add(leftNeon);

    const rightNeon = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.06, 0.06), neonPink);
    rightNeon.position.set(0, 0.54, 2.96);
    this.group.add(rightNeon);

    // 2. CHHOTI SI SIDHI (3 Cute Little Concert Entrance Stairs at front)
    // Step 1
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 2.0), stairMat);
    step1.position.set(-4.2, 0.09, 0);
    this.group.add(step1);
    // Step 2
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.36, 2.0), stairMat);
    step2.position.set(-3.8, 0.18, 0);
    this.group.add(step2);
    // Step 3
    const step3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.54, 2.0), stairMat);
    step3.position.set(-3.4, 0.27, 0);
    this.group.add(step3);

    // Cute safety step edge stripes
    [-4.0, -3.6, -3.2].forEach((sx, idx) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 1.96), neonGold);
      stripe.position.set(sx, (idx + 1) * 0.18 + 0.005, 0);
      this.group.add(stripe);
    });

    // Cute side step banisters / mini railings
    [-1.02, 1.02].forEach(sz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.05), trussMat);
      rail.position.set(-3.8, 0.45, sz);
      this.group.add(rail);
    });

    // 3. CENTER ILLUMINATED CONCERT DANCE FLOOR DECAL
    const danceCircle = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 1.4, 24),
      new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide })
    );
    danceCircle.rotation.x = -Math.PI / 2;
    danceCircle.position.set(0, 0.565, 0);
    this.group.add(danceCircle);

    const innerHeart = new THREE.Mesh(
      new THREE.CircleGeometry(0.65, 16),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide })
    );
    innerHeart.rotation.x = -Math.PI / 2;
    innerHeart.position.set(0, 0.568, 0);
    this.group.add(innerHeart);

    // 4. GIANT REAR CONCERT LED VIDEO WALL
    const ledWallGroup = new THREE.Group();
    ledWallGroup.position.set(3.4, 2.2, 0);

    const ledFrame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 5.2), stageMat);
    ledWallGroup.add(ledFrame);

    const ledScreen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.1, 4.9), screenMat);
    ledScreen.position.x = -0.09;
    ledWallGroup.add(ledScreen);

    // Neon sound wave bars on screen
    for (let b = -6; b <= 6; b++) {
      const bHeight = 0.5 + Math.abs(Math.sin(b * 0.8)) * 1.6;
      const bColor = b % 2 === 0 ? neonCyan : neonPink;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, bHeight, 0.22), bColor);
      bar.position.set(-0.11, -0.6 + bHeight / 2, b * 0.35);
      ledWallGroup.add(bar);
    }

    // Glowing concert banner text emblem
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 2.2), neonGold);
    crest.position.set(-0.11, 1.1, 0);
    ledWallGroup.add(crest);

    this.group.add(ledWallGroup);

    // 5. ALUMINUM CONCERT LIGHTING TRUSS RIG (Full Overhead Stage Rigging)
    const trussGroup = new THREE.Group();
    // 4 Corner Towers
    [
      { x: -3.5, z: -2.8 },
      { x: -3.5, z: 2.8 },
      { x: 3.5, z: -2.8 },
      { x: 3.5, z: 2.8 }
    ].forEach(pos => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), trussMat);
      pole.position.set(pos.x, 2.1, pos.z);
      trussGroup.add(pole);
    });

    // Horizontal Spans
    const spanFront = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.8, 8), trussMat);
    spanFront.position.set(-3.5, 4.15, 0);
    spanFront.rotation.x = Math.PI / 2;
    trussGroup.add(spanFront);

    const spanBack = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.8, 8), trussMat);
    spanBack.position.set(3.5, 4.15, 0);
    spanBack.rotation.x = Math.PI / 2;
    trussGroup.add(spanBack);

    const spanLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.2, 8), trussMat);
    spanLeft.position.set(0, 4.15, -2.8);
    spanLeft.rotation.z = Math.PI / 2;
    trussGroup.add(spanLeft);

    const spanRight = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.2, 8), trussMat);
    spanRight.position.set(0, 4.15, 2.8);
    spanRight.rotation.z = Math.PI / 2;
    trussGroup.add(spanRight);

    // 4 Overhead Stage Moving-Head Spotlights with glowing beams
    const lightColors = [0x38bdf8, 0xf43f5e, 0xfacc15, 0xa855f7];
    [-1.8, 1.8].forEach((lx, i) => {
      [-1.6, 1.6].forEach((lz, j) => {
        const c = lightColors[(i * 2 + j) % lightColors.length];
        const spotMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.32, 10), new THREE.MeshBasicMaterial({ color: c }));
        spotMesh.position.set(lx, 4.0, lz);
        trussGroup.add(spotMesh);

        // Soft spotlight light cone projecting downward onto the stage
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, 3.2, 12, 1, true),
          new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
        );
        cone.position.set(lx, 2.4, lz);
        trussGroup.add(cone);
        this.spotlights.push({ mesh: spotMesh, cone, baseAngle: i + j });
      });
    });

    this.group.add(trussGroup);

    // 6. DUAL MASSIVE CONCERT SPEAKER STACKS (Stage Left & Stage Right)
    [-2.6, 2.6].forEach(sz => {
      const spkGroup = new THREE.Group();
      spkGroup.position.set(-2.8, 0.55, sz);

      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.8), speakerMat);
      cabinet.position.y = 0.8;
      cabinet.castShadow = true;
      spkGroup.add(cabinet);

      // Subwoofer cones
      [-0.4, 0.15].forEach(cy => {
        const sub = new THREE.Mesh(new THREE.CircleGeometry(0.24, 12), new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide }));
        sub.rotation.y = -Math.PI / 2;
        sub.position.set(-0.46, 0.8 + cy, 0);
        spkGroup.add(sub);
      });

      // High frequency horn tweeter
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.5), neonPink);
      horn.position.set(-0.46, 1.35, 0);
      spkGroup.add(horn);

      this.group.add(spkGroup);
    });

    // 7. DJ WORKSTATION CONSOLE & VINTAGE STAGE MIC
    const djDesk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 2.2), stageMat);
    djDesk.position.set(2.0, 0.55 + 0.425, 0);
    this.group.add(djDesk);

    // DJ Turntable Console Top
    const djTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 2.3), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    djTop.position.set(2.0, 1.02, 0);
    this.group.add(djTop);

    // Dual Spinning Vinyl Records
    [-0.55, 0.55].forEach(vy => {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 16), new THREE.MeshLambertMaterial({ color: 0x020617 }));
      v.position.set(2.0, 1.07, vy);
      this.group.add(v);
      if (!this.vinyl) this.vinyl = v;
    });

    // Center Stage Chrome Microphone on Stand
    const micGrp = new THREE.Group();
    micGrp.position.set(-1.0, 0.55, 0);
    const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), trussMat);
    micBase.position.y = 0.02;
    micGrp.add(micBase);
    const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 6), trussMat);
    micPole.position.y = 0.58;
    micGrp.add(micPole);
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }));
    micHead.position.y = 1.18;
    micGrp.add(micHead);
    this.group.add(micGrp);

    this.scene.add(this.group);

    // Town colliders: Back video wall barrier & side speaker barriers
    if (this.town && this.town.colliders) {
      // Rear wall collider so player doesn't fall off behind the video wall
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x + 3.2,
        maxX: this.position.x + 3.8,
        minZ: this.position.z - 3.2,
        maxZ: this.position.z + 3.2
      });
      // Left speaker stack
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x - 3.3,
        maxX: this.position.x - 2.3,
        minZ: this.position.z - 3.1,
        maxZ: this.position.z - 2.1
      });
      // Right speaker stack
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x - 3.3,
        maxX: this.position.x - 2.3,
        minZ: this.position.z + 2.1,
        maxZ: this.position.z + 3.1
      });
    }
  }

  initMusicNotes() {
    this.notesGroup = new THREE.Group();
    const colors = [0xf43f5e, 0x38bdf8, 0xfacc15, 0xa855f7, 0xec4899];
    for (let i = 0; i < 14; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 6),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      sphere.visible = false;
      this.notesGroup.add(sphere);
      this.musicNotes.push({
        mesh: sphere,
        x: (Math.random() - 0.5) * 4.0,
        y: 0.8,
        z: (Math.random() - 0.5) * 4.0,
        speedY: 0.7 + Math.random() * 0.5,
        life: Math.random() * 2.5
      });
    }
    this.group.add(this.notesGroup);
  }

  update(delta, isDancing = false) {
    if (this.vinyl) {
      this.vinyl.rotation.y += delta * 5.0;
    }

    this.stageLightsTimer += delta * 2.0;

    // Moving concert spotlights
    for (let i = 0; i < this.spotlights.length; i++) {
      const sp = this.spotlights[i];
      const sway = Math.sin(this.stageLightsTimer + sp.baseAngle) * 0.22;
      sp.cone.rotation.z = sway;
      sp.cone.rotation.x = Math.cos(this.stageLightsTimer * 0.8 + sp.baseAngle) * 0.15;
    }

    // Animate floating musical sparkle notes
    for (let i = 0; i < this.musicNotes.length; i++) {
      const n = this.musicNotes[i];
      n.life += delta;
      if (n.life > 2.4) {
        n.life = 0;
        n.y = 0.65;
        n.x = (Math.random() - 0.5) * 4.4;
        n.z = (Math.random() - 0.5) * 4.4;
      }
      n.y += n.speedY * delta;
      n.mesh.position.set(n.x + Math.sin(n.life * 4) * 0.18, n.y, n.z);
      n.mesh.visible = isDancing || true;
    }
  }

  isOnStage(pos) {
    if (!pos) return false;
    // Bounds for the concert stage platform + front stairs
    return (
      pos.x >= this.position.x - 4.4 &&
      pos.x <= this.position.x + 3.8 &&
      pos.z >= this.position.z - 3.1 &&
      pos.z <= this.position.z + 3.1
    );
  }

  isNearCenter(pos) {
    if (!pos) return false;
    return Math.hypot(pos.x - this.position.x, pos.z - this.position.z) < 2.5;
  }
}
