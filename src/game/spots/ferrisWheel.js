// Romantic Giant Wheel (Ferris Wheel) for Couple Rides & Panoramic Valley Views
import * as THREE from 'three';

export class FerrisWheelSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'ferrisWheel';

    // Positioned in the scenic East park clearing (x: 36, z: 24)
    this.position = new THREE.Vector3(36, 0, 24);
    this.rotationY = 0;

    this.wheelRadius = 5.8;
    this.hubHeight = 8.5;
    this.wheelAngle = 0;
    this.rotationSpeed = 0.16; // Relaxing, romantic rotation pace

    this.gondolas = [];
    this.seat1Node = null;
    this.seat2Node = null;

    this.buildWheel();
  }

  buildWheel() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Materials
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Slate steel
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b }); // Warm brass / gold
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Timber
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 }); // Boarding platform stone
    const stonePlinthMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const railingMat = new THREE.MeshLambertMaterial({ color: 0xfde047 }); // Golden railing

    // 1. Concrete / Stone Base Plinths
    [-1.6, 1.6].forEach(px => {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 7.4), stonePlinthMat);
      plinth.position.set(px, 0.225, 0);
      plinth.receiveShadow = true;
      this.group.add(plinth);
    });

    // 2. Twin A-Frame Support Towers (meeting at central axle hub y = 8.5)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.15, 9.4, 8);
    const legAngle = Math.atan2(3.2, 8.5); // Tilt along Z axis
    const legLen = Math.hypot(3.2, 8.5);

    [-1.6, 1.6].forEach(sideX => {
      // Front leg (+Z)
      const legFront = new THREE.Mesh(legGeo, steelMat);
      legFront.position.set(sideX, 4.25, 1.6);
      legFront.rotation.x = -legAngle;
      legFront.castShadow = true;
      this.group.add(legFront);

      // Back leg (-Z)
      const legBack = new THREE.Mesh(legGeo, steelMat);
      legBack.position.set(sideX, 4.25, -1.6);
      legBack.rotation.x = legAngle;
      legBack.castShadow = true;
      this.group.add(legBack);

      // Horizontal cross-tie brace
      const crossTie = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 2.8), steelMat);
      crossTie.position.set(sideX, 3.8, 0);
      this.group.add(crossTie);

      // Upper tie
      const upperTie = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4), steelMat);
      upperTie.position.set(sideX, 6.4, 0);
      this.group.add(upperTie);

      // Axle Pillow Bearing at top
      const bearing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.45), goldMat);
      bearing.position.set(sideX, this.hubHeight, 0);
      this.group.add(bearing);
    });

    // Central stationary axle cylinder
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.8, 12), steelMat);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, this.hubHeight, 0);
    this.group.add(axle);

    // 3. Central Hub & Rotating Wheel Assembly
    this.wheelGroup = new THREE.Group();
    this.wheelGroup.position.set(0, this.hubHeight, 0);

    // Rotating Hub Barrel
    const hubCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.3, 16), goldMat);
    hubCyl.rotation.z = Math.PI / 2;
    this.wheelGroup.add(hubCyl);

    // Decorative Hub Endcaps with Heart Emblems
    [-1.2, 1.2].forEach(hx => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 16), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
      cap.rotation.z = Math.PI / 2;
      cap.position.set(hx, 0, 0);
      this.wheelGroup.add(cap);
    });

    // Dual Wheel Rims (Front and Back rings at x = -0.9 and x = +0.9)
    const spokeCount = 8;
    const spokeMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }); // Romantic pastel pink rim
    const innerRimMat = new THREE.MeshLambertMaterial({ color: 0xfde047 }); // Golden inner truss ring

    const fairyColors = [0xfef08a, 0xf472b6, 0x38bdf8, 0xa855f7];

    [-0.9, 0.9].forEach(sideX => {
      // Outer polygonal tubular rim (16 segments)
      const segCount = 16;
      for (let s = 0; s < segCount; s++) {
        const a1 = (s * Math.PI * 2) / segCount;
        const a2 = ((s + 1) * Math.PI * 2) / segCount;
        const y1 = Math.sin(a1) * 6.0, z1 = Math.cos(a1) * 6.0;
        const y2 = Math.sin(a2) * 6.0, z2 = Math.cos(a2) * 6.0;

        const chordLen = Math.hypot(y2 - y1, z2 - z1);
        const rimSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, chordLen, 6), rimMat);
        rimSeg.position.set(sideX, (y1 + y2) / 2, (z1 + z2) / 2);
        rimSeg.rotation.x = Math.atan2(z2 - z1, y2 - y1) - Math.PI / 2;
        this.wheelGroup.add(rimSeg);

        // Fairy light bulb on each vertex
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshBasicMaterial({ color: fairyColors[s % fairyColors.length] })
        );
        bulb.position.set(sideX + (sideX > 0 ? 0.08 : -0.08), y1, z1);
        this.wheelGroup.add(bulb);
      }

      // Inner brace ring
      for (let s = 0; s < 12; s++) {
        const a1 = (s * Math.PI * 2) / 12;
        const a2 = ((s + 1) * Math.PI * 2) / 12;
        const y1 = Math.sin(a1) * 3.6, z1 = Math.cos(a1) * 3.6;
        const y2 = Math.sin(a2) * 3.6, z2 = Math.cos(a2) * 3.6;
        const chordLen = Math.hypot(y2 - y1, z2 - z1);
        const inSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, chordLen, 6), innerRimMat);
        inSeg.position.set(sideX, (y1 + y2) / 2, (z1 + z2) / 2);
        inSeg.rotation.x = Math.atan2(z2 - z1, y2 - y1) - Math.PI / 2;
        this.wheelGroup.add(inSeg);
      }

      // 8 Radial Spokes connecting hub to outer rim
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i * Math.PI * 2) / spokeCount;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.9, 6), spokeMat);
        spoke.position.set(sideX, Math.sin(angle) * 2.95, Math.cos(angle) * 2.95);
        spoke.rotation.x = angle + Math.PI / 2;
        this.wheelGroup.add(spoke);
      }
    });

    // 4. Gondola Cross-Axles and 8 Hanging Passenger Cabins
    const gondolaColors = [
      0xf472b6, // 0: Couple VIP Cabin (Rose Pink)
      0x38bdf8, // 1: Sky Blue
      0xa855f7, // 2: Lavender
      0xfbbf24, // 3: Golden Sunset
      0xec4899, // 4: Magenta Love
      0x34d399, // 5: Mint Clover
      0x60a5fa, // 6: Royal Azure
      0xf97316  // 7: Coral Glow
    ];

    for (let k = 0; k < spokeCount; k++) {
      // Angle: k=0 starts at bottom (-PI/2) for direct boarding station access
      const angle = (k * Math.PI * 2) / spokeCount - Math.PI / 2;
      const gondolaRadius = this.wheelRadius;
      const gy = Math.sin(angle) * gondolaRadius;
      const gz = Math.cos(angle) * gondolaRadius;

      // Cross axle bar spanning front and back rims
      const crossAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.1, 6), goldMat);
      crossAxle.rotation.z = Math.PI / 2;
      crossAxle.position.set(0, gy, gz);
      this.wheelGroup.add(crossAxle);

      // Gondola Pivot Group (always stays upright by compensating wheel rotation)
      const gondolaPivot = new THREE.Group();
      gondolaPivot.position.set(0, gy, gz);

      // Cabin Hanger Struts (Hanging down from the cross-axle)
      const hangerMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
      [-0.7, 0.7].forEach(hx => {
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), hangerMat);
        hanger.position.set(hx, -0.6, 0);
        gondolaPivot.add(hanger);
      });

      // Gondola Cabin Group (y = -1.2)
      const cabin = new THREE.Group();
      cabin.position.set(0, -1.2, 0);

      const cabinColor = gondolaColors[k % gondolaColors.length];
      const cabinMat = new THREE.MeshLambertMaterial({ color: cabinColor });
      const seatCushionMat = new THREE.MeshLambertMaterial({ color: k === 0 ? 0xfbcfe8 : 0xffedd5 });

      // Cabin base basket
      const basket = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.2), cabinMat);
      basket.position.set(0, 0.225, 0);
      basket.castShadow = true;
      cabin.add(basket);

      // Arched canopy roof
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.66, 12, 1, false, 0, Math.PI), cabinMat);
      roof.rotation.z = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.position.set(0, 1.25, 0);
      roof.castShadow = true;
      cabin.add(roof);

      // 4 Corner Roof Support Pillars
      [-0.7, 0.7].forEach(cx => {
        [-0.5, 0.5].forEach(cz => {
          const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6), goldMat);
          pil.position.set(cx, 0.85, cz);
          cabin.add(pil);
        });
      });

      // Front & Back Golden Safety Railings
      [-0.55, 0.55].forEach(rz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.04), railingMat);
        rail.position.set(0, 0.55, rz);
        cabin.add(rail);
      });

      // Bench Seat Inside Cabin
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.15, 0.45), seatCushionMat);
      bench.position.set(0, 0.35, -0.15);
      cabin.add(bench);

      // Hanging Fairy Light inside cabin roof
      const lantern = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.12, 0),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      lantern.position.set(0, 1.05, 0);
      cabin.add(lantern);

      // Gondola 0 Special: Romantic Couple Crest & Heart Emblem
      if (k === 0) {
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const heartSphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), heartMat);
        heartSphere1.position.set(-0.06, 1.38, 0.62);
        cabin.add(heartSphere1);
        const heartSphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), heartMat);
        heartSphere2.position.set(0.06, 1.38, 0.62);
        cabin.add(heartSphere2);

        // Designated Seat 1 (Left) and Seat 2 (Right) anchor nodes
        this.seat1Node = new THREE.Group();
        this.seat1Node.position.set(-0.35, 0.42, -0.15);
        cabin.add(this.seat1Node);

        this.seat2Node = new THREE.Group();
        this.seat2Node.position.set(0.35, 0.42, -0.15);
        cabin.add(this.seat2Node);
      }

      gondolaPivot.add(cabin);
      this.wheelGroup.add(gondolaPivot);

      this.gondolas.push({
        pivot: gondolaPivot,
        cabin,
        baseAngle: angle
      });
    }

    this.group.add(this.wheelGroup);

    // 5. Boarding Platform & Steps (Facing West towards road/avenue)
    const platformGrp = new THREE.Group();
    // Platform placed at x = -2.6 (towards pathway)
    platformGrp.position.set(-2.5, 0, 0);

    // Main platform deck at y = 1.2 (perfect step-in height to bottom gondola)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 3.4), woodMat);
    deck.position.set(0, 1.2, 0);
    deck.receiveShadow = true;
    platformGrp.add(deck);

    // Platform Support Stilts
    [-1.0, 1.0].forEach(sx => {
      [-1.5, 1.5].forEach(sz => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), woodMat);
        stilt.position.set(sx, 0.6, sz);
        platformGrp.add(stilt);
      });
    });

    // Boarding Steps (3 steps leading down towards the path on -X)
    for (let step = 1; step <= 3; step++) {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 1.6), deckMat);
      stepMesh.position.set(-1.2 - step * 0.35, 1.2 - step * 0.3, 0);
      stepMesh.receiveShadow = true;
      platformGrp.add(stepMesh);
    }

    // Safety Railings around the platform
    const platRailMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    [-1.65, 1.65].forEach(rz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.05), platRailMat);
      rail.position.set(0, 1.6, rz);
      platformGrp.add(rail);
    });

    // Welcome Archway with Golden Lanterns
    const archMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    [-0.8, 0.8].forEach(az => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), archMat);
      post.position.set(-2.2, 1.3, az);
      platformGrp.add(post);

      const lamp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lamp.position.set(-2.2, 2.6, az);
      platformGrp.add(lamp);
    });

    const archTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.8), archMat);
    archTop.position.set(-2.2, 2.6, 0);
    platformGrp.add(archTop);

    this.group.add(platformGrp);

    this.scene.add(this.group);

    // Collision boundary around the Ferris Wheel base
    if (this.town && this.town.colliders) {
      this.town.colliders.push({
        type: 'box',
        minX: this.position.x - 3.8,
        maxX: this.position.x + 2.6,
        minZ: this.position.z - 3.6,
        maxZ: this.position.z + 3.6
      });
    }

    this._tmpVec1 = new THREE.Vector3();
    this._tmpVec2 = new THREE.Vector3();
  }

  getSeat1WorldPos() {
    if (this.seat1Node) {
      this.seat1Node.getWorldPosition(this._tmpVec1);
      return this._tmpVec1;
    }
    return this.position.clone().add(new THREE.Vector3(-0.35, 1.5, 0));
  }

  getSeat2WorldPos() {
    if (this.seat2Node) {
      this.seat2Node.getWorldPosition(this._tmpVec2);
      return this._tmpVec2;
    }
    return this.position.clone().add(new THREE.Vector3(0.35, 1.5, 0));
  }

  getBoardingWorldPos() {
    // Boarding platform center in world coords
    return new THREE.Vector3(this.position.x - 2.5, 1.28, this.position.z);
  }

  getDismountWorldPos() {
    // Ground level exit at bottom of steps
    return new THREE.Vector3(this.position.x - 4.4, 0, this.position.z);
  }

  update(delta, hasRiders = false) {
    // Continuous majestic scenic rotation
    this.wheelAngle += delta * this.rotationSpeed;
    if (this.wheelAngle > Math.PI * 2) {
      this.wheelAngle -= Math.PI * 2;
    }

    this.wheelGroup.rotation.x = this.wheelAngle;

    // Keep every gondola gravity-level and perfectly upright!
    for (let i = 0; i < this.gondolas.length; i++) {
      this.gondolas[i].pivot.rotation.x = -this.wheelAngle;
    }
  }
}
