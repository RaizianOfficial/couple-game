// Modern Aesthetically Rich 2-Story Open House matching Image 13
// Industrial Steel I-Beams, Rustic Wood Logs, Stone Chimney, 4-Seat Dining & Kitchen,
// Glass Elevator, Balcony Glass Railing, Front Fountain, and Cherry Blossom Ambiance.
import * as THREE from 'three';

export class CoupleHouseSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'coupleHouse';
    this.isLightOn = true;

    this.position = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;

    this.bedOccupants = { left: null, right: null };
    this.zzzParticles = [];
    this.sparkParticles = [];
    this.petalParticles = [];
    this.fireflyParticles = [];
    this.fountainRipples = [];

    this.buildHouse();
    this.initZzzParticles();
    this.initHouseAtmosphere();
  }

  buildHouse() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // --- High-Performance Mobile-Friendly Shared Materials ---
    const woodFloorMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Rich warm brown planks
    const woodCeilingMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Ceiling wood paneling
    const backWallMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });   // Crisp light interior walls
    const stoneSlabMat = new THREE.MeshLambertMaterial({ color: 0x334155 });   // Thick flat rooftop stone slab
    const steelBeamMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });   // Industrial dark-gray I-beams
    const rusticLogMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });   // Dark interior wood logs
    const stoneChimneyMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true }); // Stacked stone masonry

    // Glass Railing & Elevator: Translucent light-blue tint
    const glassRailingMat = new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.38,
      roughness: 0.12,
      metalness: 0.1
    });

    const elevatorGlassMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42
    });

    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const downlightGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lampShadeMat = new THREE.MeshLambertMaterial({ color: 0x0f172a }); // Black vintage pendant lamps
    const whiteFurnitureMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pastelPinkMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    const softPinkCushionMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const yellowRugMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
    const naturalOakMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const plantGreenMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true });
    const potMat = new THREE.MeshLambertMaterial({ color: 0xc2410c });

    // ==========================================
    // 1. FLOORS & PORCH (Rich Brown Wood Planks)
    // ==========================================
    // Ground Floor Interior Deck
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.22, 9.0), woodFloorMat);
    groundFloor.position.set(0, 0.11, 0);
    groundFloor.receiveShadow = true;
    this.group.add(groundFloor);

    // Front Extended Porch
    const porch = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.18, 2.6), woodFloorMat);
    porch.position.set(0, 0.09, 5.2);
    porch.receiveShadow = true;
    this.group.add(porch);

    // 2nd Floor Deck & Balcony (at y = 4.0m)
    const secondFloor = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.22, 9.0), woodFloorMat);
    secondFloor.position.set(0, 4.0, 0);
    secondFloor.receiveShadow = true;
    this.group.add(secondFloor);

    const balcony = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.2, 2.6), woodFloorMat);
    balcony.position.set(0, 4.0, 5.2);
    balcony.receiveShadow = true;
    this.group.add(balcony);

    // 2nd Floor Glass Railing: Continuous thin translucent mesh across the front
    const glassRailing = new THREE.Mesh(new THREE.BoxGeometry(11.3, 0.95, 0.04), glassRailingMat);
    glassRailing.position.set(0, 4.58, 6.45);
    this.group.add(glassRailing);

    // Sleek chrome top handrail for glass railing
    const railingCap = new THREE.Mesh(new THREE.BoxGeometry(11.32, 0.04, 0.08), steelBeamMat);
    railingCap.position.set(0, 5.06, 6.45);
    this.group.add(railingCap);

    // ==========================================
    // 2. WALLS & INDUSTRIAL STEEL I-BEAMS
    // ==========================================
    // Back Interior Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(11.2, 8.0, 0.25), backWallMat);
    backWall.position.set(0, 4.1, -4.4);
    this.group.add(backWall);

    // Left & Right Solid Side Walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 8.0, 9.0), backWallMat);
    leftWall.position.set(-5.5, 4.1, 0);
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 8.0, 9.0), backWallMat);
    rightWall.position.set(5.5, 4.1, 0);
    this.group.add(rightWall);

    // Industrial Steel I-Beams on the Far Front Edges (Left & Right)
    [-5.4, 5.4].forEach(bx => {
      const iBeamGrp = new THREE.Group();
      iBeamGrp.position.set(bx, 4.1, 6.4);

      // Outer Flange
      const outerFlange = new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.2, 0.08), steelBeamMat);
      outerFlange.position.z = 0.16;
      iBeamGrp.add(outerFlange);

      // Web
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.08, 8.2, 0.32), steelBeamMat);
      iBeamGrp.add(web);

      // Inner Flange
      const innerFlange = new THREE.Mesh(new THREE.BoxGeometry(0.48, 8.2, 0.08), steelBeamMat);
      innerFlange.position.z = -0.16;
      iBeamGrp.add(innerFlange);

      this.group.add(iBeamGrp);
    });

    // Rustic Dark Wood Interior Log Supports
    [-2.8, 1.4, 4.8].forEach(lx => {
      const log = new THREE.Mesh(new THREE.BoxGeometry(0.36, 8.0, 0.36), rusticLogMat);
      log.position.set(lx, 4.1, 0);
      log.castShadow = true;
      this.group.add(log);
    });

    // ==========================================
    // 3. ROOFTOP: THICK STONE SLAB & WOOD PANELING
    // ==========================================
    // Thick flat stone slab on top
    this.roofMesh = new THREE.Group();
    const stoneSlab = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.45, 9.8), stoneSlabMat);
    stoneSlab.position.set(0, 8.35, 0);
    stoneSlab.castShadow = true;
    this.roofMesh.add(stoneSlab);

    // Wood paneling underneath roof
    const roofWoodUnder = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.08, 9.4), woodCeilingMat);
    roofWoodUnder.position.set(0, 8.1, 0);
    this.roofMesh.add(roofWoodUnder);
    this.group.add(this.roofMesh);

    // Ground Floor Ceiling Wood Paneling (under 2nd floor)
    const gfCeilingWood = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.08, 9.0), woodCeilingMat);
    gfCeilingWood.position.set(0, 3.89, 0);
    this.group.add(gfCeilingWood);

    // Tiny Embedded Downlights (Warm Glowing Yellow Disks)
    const downlightCoords = [
      // 2nd Floor Ceiling
      { x: -3.6, y: 8.05, z: 2.0 }, { x: -1.2, y: 8.05, z: 2.0 },
      { x: 1.8, y: 8.05, z: 2.0 },  { x: 4.2, y: 8.05, z: 2.0 },
      { x: -3.6, y: 8.05, z: -2.0 }, { x: 3.6, y: 8.05, z: -2.0 },
      // Ground Floor Ceiling
      { x: -3.6, y: 3.84, z: 2.0 }, { x: -1.0, y: 3.84, z: 2.0 },
      { x: 1.8, y: 3.84, z: 2.0 },  { x: 4.2, y: 3.84, z: 2.0 }
    ];
    downlightCoords.forEach(dl => {
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), downlightGlowMat);
      disk.position.set(dl.x, dl.y, dl.z);
      this.group.add(disk);
    });

    // 3 Black Vintage Flared Pendant Lamps
    this.buildPendantLamp(-1.8, 3.88, 0.5, 0.8, lampShadeMat, downlightGlowMat); // Living Room
    this.buildPendantLamp(0.6, 3.88, 0.8, 0.8, lampShadeMat, downlightGlowMat);  // Dining Room
    this.buildPendantLamp(-0.8, 8.09, 0.5, 0.95, lampShadeMat, downlightGlowMat); // Bedroom

    // ==========================================
    // 4. LIVING ROOM: CHIMNEY, FIREPLACE, PINK SOFA, YELLOW RUG
    // ==========================================
    // Massive Stone-Cladded Chimney Fireplace (spanning both floors)
    const chimneyGrp = new THREE.Group();
    chimneyGrp.position.set(-4.2, 0, 0.5);

    // Lower hearth base
    const hearthBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.4), stoneChimneyMat);
    hearthBase.position.y = 1.1;
    hearthBase.castShadow = true;
    chimneyGrp.add(hearthBase);

    // Tapered stone chimney breast through 2nd floor and roof
    const upperChimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.2, 1.1), stoneChimneyMat);
    upperChimney.position.set(0, 5.2, 0);
    upperChimney.castShadow = true;
    chimneyGrp.add(upperChimney);

    // Dark firebox recess
    const firebox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.5), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    firebox.position.set(0.55, 0.7, 0);
    chimneyGrp.add(firebox);

    // Glowing orange fire flame
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    flame.position.set(0.6, 0.65, 0);
    chimneyGrp.add(flame);

    // Fireplace warm point light
    this.fireLight = new THREE.PointLight(0xf97316, 1.4, 9);
    this.fireLight.position.set(-3.4, 0.8, 0.5);
    this.group.add(this.fireLight);

    // Stacked firewood logs beside the fireplace
    [-0.2, 0, 0.2].forEach((lz, idx) => {
      const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), rusticLogMat);
      log1.rotation.x = Math.PI / 2;
      log1.position.set(-0.2, 0.1, lz);
      chimneyGrp.add(log1);
    });
    this.group.add(chimneyGrp);

    // Plush Pink L-Shaped Sofa
    const sofaGrp = new THREE.Group();
    sofaGrp.position.set(-2.0, 0.22, 1.2);

    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.9), pastelPinkMat);
    sofaMain.position.set(0, 0.225, 0);
    sofaGrp.add(sofaMain);

    const sofaL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 1.3), pastelPinkMat);
    sofaL.position.set(0.75, 0.225, -1.0);
    sofaGrp.add(sofaL);

    // Soft Pink Backrest
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.22), pastelPinkMat);
    sofaBack.position.set(0, 0.6, 0.38);
    sofaGrp.add(sofaBack);

    // Sofa Pillows
    [-0.7, 0.4].forEach(px => {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.16), softPinkCushionMat);
      pil.position.set(px, 0.52, 0.22);
      pil.rotation.x = -0.2;
      sofaGrp.add(pil);
    });
    this.group.add(sofaGrp);

    // Patterned Vibrant Yellow Living Room Rug
    const yellowRug = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 2.2), yellowRugMat);
    yellowRug.position.set(-1.8, 0.23, 0.2);
    this.group.add(yellowRug);

    // Red wall thermostat / interface box on back wall
    const wallPanel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.04), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    wallPanel.position.set(-0.8, 1.4, -4.25);
    this.group.add(wallPanel);

    // ==========================================
    // 5. DINING & KITCHEN (Ground Floor Center-Right)
    // ==========================================
    // 4-Seat Wooden Dining Table Set
    const diningGrp = new THREE.Group();
    diningGrp.position.set(0.6, 0.22, 0.8);

    const diningTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), naturalOakMat);
    diningTable.position.y = 0.72;
    diningGrp.add(diningTable);

    // 4 Table legs
    [-0.68, 0.68].forEach(tx => {
      [-0.48, 0.48].forEach(tz => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), naturalOakMat);
        leg.position.set(tx, 0.36, tz);
        diningGrp.add(leg);
      });
    });

    // 4 Wooden Dining Chairs
    const chairPositions = [
      { x: -0.95, z: 0, rotY: Math.PI / 2 },
      { x: 0.95, z: 0, rotY: -Math.PI / 2 },
      { x: -0.35, z: -0.72, rotY: 0 },
      { x: 0.35, z: 0.72, rotY: Math.PI }
    ];
    chairPositions.forEach(cp => {
      const chair = new THREE.Group();
      chair.position.set(cp.x, 0, cp.z);
      chair.rotation.y = cp.rotY;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), naturalOakMat);
      seat.position.y = 0.44;
      chair.add(seat);

      const seatPad = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.38), softPinkCushionMat);
      seatPad.position.y = 0.47;
      chair.add(seatPad);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.05), naturalOakMat);
      backrest.position.set(0, 0.68, -0.19);
      chair.add(backrest);

      [-0.16, 0.16].forEach(cx => {
        [-0.16, 0.16].forEach(cz => {
          const cLeg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, 0.05), naturalOakMat);
          cLeg.position.set(cx, 0.22, cz);
          chair.add(cLeg);
        });
      });
      diningGrp.add(chair);
    });
    this.group.add(diningGrp);

    // Modular Kitchen Unit (White-wood counter, blue sink, chrome tap)
    const kitchenGrp = new THREE.Group();
    kitchenGrp.position.set(2.4, 0.22, 1.2);

    const counterBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 0.85), whiteFurnitureMat);
    counterBase.position.y = 0.425;
    kitchenGrp.add(counterBase);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.92), naturalOakMat);
    counterTop.position.y = 0.88;
    kitchenGrp.add(counterTop);

    // Blue Kitchen Sink
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.42), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
    sink.position.set(-0.35, 0.89, 0);
    kitchenGrp.add(sink);

    // Chrome Faucet
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 8), steelBeamMat);
    faucet.position.set(-0.35, 1.05, -0.15);
    kitchenGrp.add(faucet);

    // Cylindrical Blue Trash / Stool Container
    const blueTub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.55, 12), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
    blueTub.position.set(1.15, 0.275, -0.4);
    kitchenGrp.add(blueTub);

    // Back Kitchen Oven / Shelf Stack
    const backFridge = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.75), whiteFurnitureMat);
    backFridge.position.set(2.0, 1.1, -1.2);
    kitchenGrp.add(backFridge);

    const ovenUnit = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.7), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    ovenUnit.position.set(1.0, 0.45, -1.2);
    kitchenGrp.add(ovenUnit);

    this.group.add(kitchenGrp);

    // ==========================================
    // 6. FUTURISTIC CYLINDRICAL GLASS ELEVATOR
    // ==========================================
    const elevatorGrp = new THREE.Group();
    elevatorGrp.position.set(3.4, 0, -1.5);

    // Translucent Blue Cylindrical Tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 7.8, 24), elevatorGlassMat);
    tube.position.y = 4.0;
    elevatorGrp.add(tube);

    // Glowing Cyan LED Rings at Floor Joints
    const ringBase = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.04, 8, 24), neonCyanMat);
    ringBase.rotation.x = Math.PI / 2;
    ringBase.position.y = 0.25;
    elevatorGrp.add(ringBase);

    const ringSecond = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.04, 8, 24), neonCyanMat);
    ringSecond.rotation.x = Math.PI / 2;
    ringSecond.position.y = 4.15;
    elevatorGrp.add(ringSecond);

    // Brushed Metal Trim at Base and Top
    const trimBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.1, 24), steelBeamMat);
    trimBottom.position.y = 0.15;
    elevatorGrp.add(trimBottom);

    const trimTop = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.1, 24), steelBeamMat);
    trimTop.position.y = 7.95;
    elevatorGrp.add(trimTop);

    // Moving Cabin Platform with Glowing Rim
    this.elevatorCabin = new THREE.Group();
    const cabinFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.1, 20), steelBeamMat);
    this.elevatorCabin.add(cabinFloor);

    const cabinNeon = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.03, 6, 20), neonCyanMat);
    cabinNeon.rotation.x = Math.PI / 2;
    cabinNeon.position.y = 0.05;
    this.elevatorCabin.add(cabinNeon);

    this.elevatorCabin.position.y = 0.25;
    elevatorGrp.add(this.elevatorCabin);

    this.group.add(elevatorGrp);

    // ==========================================
    // 7. BEDROOM (2nd Floor): BED, LAMPS, BOOKSHELF, PLANTS
    // ==========================================
    // Master Double Bed
    const bedGrp = new THREE.Group();
    bedGrp.position.set(-1.4, 4.1, -1.8);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 0.12), naturalOakMat);
    headboard.position.set(0, 0.55, -1.2);
    bedGrp.add(headboard);

    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.38, 2.3), naturalOakMat);
    bedBase.position.set(0, 0.19, 0);
    bedGrp.add(bedBase);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.26, 2.15), whiteFurnitureMat);
    mattress.position.set(0, 0.44, 0);
    bedGrp.add(mattress);

    // 2 White Pillows
    this.leftPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.52), softPinkCushionMat);
    this.leftPillow.position.set(-0.55, 0.62, -0.75);
    bedGrp.add(this.leftPillow);

    this.rightPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.52), softPinkCushionMat);
    this.rightPillow.position.set(0.55, 0.62, -0.75);
    bedGrp.add(this.rightPillow);

    // Rich Pink Folded Blanket / Duvet
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.12, 1.45), new THREE.MeshLambertMaterial({ color: 0xec4899 }));
    blanket.position.set(0, 0.56, 0.35);
    bedGrp.add(blanket);

    // Bedside Table with Glowing Table Lamp
    const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.52, 0.55), naturalOakMat);
    nightstand.position.set(-1.6, 0.26, -0.9);
    bedGrp.add(nightstand);

    const tableLampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), steelBeamMat);
    tableLampStem.position.set(-1.6, 0.67, -0.9);
    bedGrp.add(tableLampStem);

    const tableLampShade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.18, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    tableLampShade.position.set(-1.6, 0.82, -0.9);
    bedGrp.add(tableLampShade);

    this.group.add(bedGrp);

    // Tall Wooden Bookshelf on 2nd Floor
    const shelfGrp = new THREE.Group();
    shelfGrp.position.set(1.4, 4.1, -1.8);

    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.4), naturalOakMat);
    shelfFrame.position.y = 1.05;
    shelfGrp.add(shelfFrame);

    // Colorful low-poly book rows
    const bookColors = [0xef4444, 0x38bdf8, 0x22c55e, 0xfacc15, 0xa855f7];
    [-0.3, 0.3, 0.9].forEach((sy, sIdx) => {
      for (let b = -3; b <= 3; b++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.25), new THREE.MeshLambertMaterial({ color: bookColors[(sIdx + b + 6) % bookColors.length] }));
        book.position.set(b * 0.12, 1.05 + sy, 0.05);
        shelfGrp.add(book);
      }
    });
    this.group.add(shelfGrp);

    // Potted House Plants (Monstera & Ferns)
    [-3.8, -3.2].forEach((px, idx) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.32, 8), potMat);
      pot.position.set(px, 4.26, 0.8 + idx * 0.6);
      this.group.add(pot);

      // Lush green fan leaves
      for (let leaf = 0; leaf < 6; leaf++) {
        const lAngle = (leaf * Math.PI * 2) / 6;
        const lMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.35), plantGreenMat);
        lMesh.position.set(px + Math.cos(lAngle) * 0.22, 4.45 + (leaf % 2) * 0.08, 0.8 + idx * 0.6 + Math.sin(lAngle) * 0.22);
        lMesh.rotation.y = lAngle;
        lMesh.rotation.x = 0.35;
        this.group.add(lMesh);
      }
    });

    // ==========================================
    // 8. AMBIENT LIGHTING & LIGHT SWITCH
    // ==========================================
    this.houseLight1 = new THREE.PointLight(0xfff5b6, 1.4, 18);
    this.houseLight1.position.set(0, 3.4, 0.5);
    this.group.add(this.houseLight1);

    this.houseLight2 = new THREE.PointLight(0xfff5b6, 1.3, 18);
    this.houseLight2.position.set(-1.0, 7.2, -0.5);
    this.group.add(this.houseLight2);

    // Light switch faceplate
    this.switchMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.lightSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.04), this.switchMat);
    this.lightSwitch.position.set(-1.1, 1.2, 3.9);
    this.group.add(this.lightSwitch);

    // ==========================================
    // 9. FRONT ENVIRONMENT: OCTAGONAL FOUNTAIN & BUSHES
    // ==========================================
    this.buildFrontCourtyard();

    this.scene.add(this.group);

    // Colliders (Left, Right, Back walls, and selective front posts)
    if (this.town && this.town.colliders) {
      // Solid Left Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x - 5.6, maxX: this.position.x - 5.1, minZ: this.position.z - 4.6, maxZ: this.position.z + 4.6 });
      // Solid Right Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x + 5.1, maxX: this.position.x + 5.6, minZ: this.position.z - 4.6, maxZ: this.position.z + 4.6 });
      // Solid Back Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x - 5.4, maxX: this.position.x + 5.4, minZ: this.position.z - 4.7, maxZ: this.position.z - 4.2 });
      // Front I-Beam Posts
      this.town.colliders.push({ type: 'box', minX: this.position.x - 5.6, maxX: this.position.x - 4.8, minZ: this.position.z + 5.8, maxZ: this.position.z + 6.6 });
      this.town.colliders.push({ type: 'box', minX: this.position.x + 4.8, maxX: this.position.x + 5.6, minZ: this.position.z + 5.8, maxZ: this.position.z + 6.6 });
      // Front Fountain Collider
      this.town.colliders.push({ type: 'circle', x: this.position.x - 4.6, z: this.position.z + 8.4, r: 1.6 });
    }
  }

  buildPendantLamp(x, topY, z, dropLen, shadeMat, bulbMat) {
    const lampGrp = new THREE.Group();
    lampGrp.position.set(x, topY, z);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, dropLen, 6), shadeMat);
    cord.position.y = -dropLen / 2;
    lampGrp.add(cord);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 12, 1, true), shadeMat);
    shade.position.y = -dropLen;
    lampGrp.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), bulbMat);
    bulb.position.y = -dropLen - 0.04;
    lampGrp.add(bulb);

    this.group.add(lampGrp);
  }

  buildFrontCourtyard() {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true });
    const blossomMat = new THREE.MeshLambertMaterial({ color: 0xf472b6, flatShading: true });
    const flowerDotMat = new THREE.MeshBasicMaterial({ color: 0xfbcfe8 });

    // 1. Low-Poly Octagonal Stone Fountain at Bottom-Left (x: -4.6, z: 8.4)
    const fountainGrp = new THREE.Group();
    fountainGrp.position.set(-4.6, 0, 8.4);

    const poolRim = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.45, 8), stoneMat);
    poolRim.position.y = 0.225;
    fountainGrp.add(poolRim);

    const poolWater = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.4, 8), waterMat);
    poolWater.position.y = 0.26;
    fountainGrp.add(poolWater);

    // Concentric Layered Animated Water Ring
    this.fountainRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 16), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
    this.fountainRing.rotation.x = Math.PI / 2;
    this.fountainRing.position.y = 0.45;
    fountainGrp.add(this.fountainRing);

    // Center Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.6, 8), stoneMat);
    spout.position.y = 0.45;
    fountainGrp.add(spout);

    this.group.add(fountainGrp);

    // 2. Stone Flagstone Walkway Tiles leading towards porch
    [-0.6, 0.6].forEach(px => {
      [6.8, 8.0, 9.2].forEach(pz => {
        const tile = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.95), stoneMat);
        tile.position.set(px, 0.02, pz);
        this.group.add(tile);
      });
    });

    // 3. Low-Poly Rounded Bushes with Pink Flowers
    const bushPositions = [
      { x: -2.8, z: 7.8, r: 0.65 },
      { x: 3.2, z: 8.2, r: 0.8 },
      { x: 4.4, z: 7.4, r: 0.6 }
    ];
    bushPositions.forEach(bp => {
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(bp.r, 1), bushMat);
      bush.position.set(bp.x, bp.r * 0.7, bp.z);
      this.group.add(bush);

      // Pink flower dots on bush
      for (let f = 0; f < 6; f++) {
        const fDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), flowerDotMat);
        fDot.position.set(
          bp.x + (Math.sin(f * 2) * bp.r * 0.8),
          bp.r * 0.7 + Math.abs(Math.cos(f * 1.5)) * bp.r * 0.6,
          bp.z + (Math.cos(f * 2) * bp.r * 0.8)
        );
        this.group.add(fDot);
      }
    });

    // 4. Stylized Cherry Blossom Tree on Far Left
    const sakuraGrp = new THREE.Group();
    sakuraGrp.position.set(-7.5, 0, 4.5);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 3.6, 8), new THREE.MeshLambertMaterial({ color: 0x451a03 }));
    trunk.position.y = 1.8;
    sakuraGrp.add(trunk);

    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), blossomMat);
    crown1.position.set(0, 4.2, 0);
    sakuraGrp.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), blossomMat);
    crown2.position.set(1.2, 4.8, 0.6);
    sakuraGrp.add(crown2);

    this.group.add(sakuraGrp);
  }

  initHouseAtmosphere() {
    // 1. Drifting Pink Cherry Blossom Petals
    this.petalsGroup = new THREE.Group();
    const petalMat = new THREE.MeshBasicMaterial({ color: 0xfbcfe8, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 24; i++) {
      const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), petalMat);
      petal.position.set(
        (Math.random() - 0.5) * 14.0,
        1.5 + Math.random() * 6.5,
        (Math.random() - 0.5) * 12.0
      );
      this.petalsGroup.add(petal);
      this.petalParticles.push({
        mesh: petal,
        vx: 0.15 + Math.random() * 0.2,
        vy: -0.35 - Math.random() * 0.3,
        vz: 0.1 + Math.random() * 0.15,
        rotSpeed: Math.random() * 2
      });
    }
    this.group.add(this.petalsGroup);

    // 2. Fireplace Sparks / Embers
    this.sparksGroup = new THREE.Group();
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 8; i++) {
      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), emberMat);
      ember.visible = false;
      this.sparksGroup.add(ember);
      this.sparkParticles.push({
        mesh: ember,
        life: Math.random() * 1.5,
        maxLife: 1.5,
        vy: 0.6 + Math.random() * 0.5,
        wobble: Math.random() * Math.PI * 2
      });
    }
    this.group.add(this.sparksGroup);

    // 3. Faint Glowing Dust Particles / Fireflies around Indoor Lights
    this.firefliesGroup = new THREE.Group();
    const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 12; i++) {
      const ff = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 4), fireflyMat);
      ff.position.set((Math.random() - 0.5) * 8.0, 1.2 + Math.random() * 6.0, (Math.random() - 0.5) * 6.0);
      this.firefliesGroup.add(ff);
      this.fireflyParticles.push({
        mesh: ff,
        baseY: ff.position.y,
        time: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random()
      });
    }
    this.group.add(this.firefliesGroup);
  }

  setRoomMode(isInside) {
    if (this.roofMesh) {
      this.roofMesh.visible = !isInside;
    }
  }

  isInsideHouse(pos) {
    if (!pos) return false;
    return (
      pos.x > this.position.x - 5.4 &&
      pos.x < this.position.x + 5.4 &&
      pos.z > this.position.z - 4.4 &&
      pos.z < this.position.z + 4.4
    );
  }

  setLightState(isOn) {
    this.isLightOn = Boolean(isOn);
    if (this.houseLight1) this.houseLight1.intensity = this.isLightOn ? 1.4 : 0;
    if (this.houseLight2) this.houseLight2.intensity = this.isLightOn ? 1.3 : 0;
    if (this.fireLight) this.fireLight.intensity = this.isLightOn ? 1.4 : 0.3;
    if (this.switchMat) this.switchMat.color.setHex(this.isLightOn ? 0x22c55e : 0xef4444);
  }

  toggleLight() {
    this.setLightState(!this.isLightOn);
    return this.isLightOn;
  }

  setElevatorY(y) {
    if (this.elevatorCabin) {
      this.elevatorCabin.position.y = Math.max(0.25, Math.min(4.15, y));
    }
  }

  getLightSwitchWorldPos() {
    const local = new THREE.Vector3(-1.1, 1.2, 3.9);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorBottomWorldPos() {
    const local = new THREE.Vector3(3.4, 0.25, -1.5);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorTopWorldPos() {
    const local = new THREE.Vector3(3.4, 4.15, -1.5);
    this.group.localToWorld(local);
    return local;
  }

  initZzzParticles() {
    this.zzzGroup = new THREE.Group();
    const zMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 14; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), zMat.clone());
      bead.visible = false;
      this.zzzGroup.add(bead);
      this.zzzParticles.push({
        mesh: bead, life: 0, maxLife: 1.8, velY: 0.35 + Math.random() * 0.2, wobble: Math.random() * Math.PI * 2, active: false
      });
    }
    this.scene.add(this.zzzGroup);
  }

  getBedWorldPosition(side = 'left') {
    const localX = side === 'left' ? -1.95 : -0.85;
    const local = new THREE.Vector3(localX, 4.68, -1.8);
    this.group.localToWorld(local);
    return local;
  }

  getWakeUpWorldPosition(side = 'left') {
    const localX = side === 'left' ? -2.7 : 0.4;
    const local = new THREE.Vector3(localX, 4.1, -0.9);
    this.group.localToWorld(local);
    return local;
  }

  update(delta, isAnySleeping = false) {
    // 1. Drifting Petals
    for (let i = 0; i < this.petalParticles.length; i++) {
      const p = this.petalParticles[i];
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.mesh.rotation.z += p.rotSpeed * delta;
      if (p.mesh.position.y < 0.1) {
        p.mesh.position.y = 6.5 + Math.random() * 2.0;
        p.mesh.position.x = -6.0 + Math.random() * 8.0;
      }
    }

    // 2. Fireplace Sparks
    for (let i = 0; i < this.sparkParticles.length; i++) {
      const sp = this.sparkParticles[i];
      sp.life += delta;
      if (sp.life > sp.maxLife) {
        sp.life = 0;
        sp.mesh.position.set(-3.6 + (Math.random() - 0.5) * 0.3, 0.7, 0.5 + (Math.random() - 0.5) * 0.3);
        sp.mesh.visible = true;
      }
      sp.mesh.position.y += sp.vy * delta;
      sp.wobble += delta * 4;
      sp.mesh.position.x += Math.sin(sp.wobble) * 0.008;
      sp.mesh.material.opacity = Math.max(0, 1 - (sp.life / sp.maxLife));
    }

    // 3. Fireflies
    for (let i = 0; i < this.fireflyParticles.length; i++) {
      const ff = this.fireflyParticles[i];
      ff.time += delta * ff.speed;
      ff.mesh.position.y = ff.baseY + Math.sin(ff.time) * 0.15;
      ff.mesh.position.x += Math.cos(ff.time * 0.7) * 0.005;
    }

    // 4. Fountain Water Ripple Pulse
    if (this.fountainRing) {
      const s = 1.0 + Math.sin(Date.now() * 0.004) * 0.08;
      this.fountainRing.scale.set(s, s, s);
    }

    // 5. Sleep Zzz Particles
    if (!isAnySleeping) {
      for (const p of this.zzzParticles) p.mesh.visible = false;
      return;
    }
    const bedLeftPos = this.getBedWorldPosition('left');
    const bedRightPos = this.getBedWorldPosition('right');

    for (let i = 0; i < this.zzzParticles.length; i++) {
      const p = this.zzzParticles[i];
      p.life += delta;
      if (p.life > p.maxLife) {
        p.life = 0;
        const targetBed = (i % 2 === 0) ? bedLeftPos : bedRightPos;
        p.mesh.position.set(targetBed.x + (Math.random() - 0.5) * 0.3, targetBed.y + 0.1, targetBed.z + (Math.random() - 0.5) * 0.3);
        p.mesh.visible = true;
      }
      p.mesh.position.y += p.velY * delta;
      p.wobble += delta * 3;
      p.mesh.position.x += Math.sin(p.wobble) * 0.005;
      p.mesh.material.opacity = Math.max(0, 1 - (p.life / p.maxLife));
      p.mesh.scale.setScalar(0.7 + (p.life / p.maxLife) * 0.8);
    }
  }
}
