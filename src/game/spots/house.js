// Romantic Modern 2-Story Couple's Dream Villa with Pitched Roof, Fireplace, Kitchen Nook & Master Bedroom
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

    this.buildHouse();
    this.initZzzParticles();
  }

  buildHouse() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Rich Cozy Pastel & Timber Palette
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }); // Warm honey oak hardwood
    const wallExteriorMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 }); // Warm peach-cream plaster
    const wallInteriorMat = new THREE.MeshLambertMaterial({ color: 0xfdf2f8 }); // Soft blush rose interior
    const wainscotMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Rich cedar paneling trim
    const timberMat = new THREE.MeshLambertMaterial({ color: 0x78350f }); // Dark architectural timber
    const roofSlateMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }); // Slate grey roof tiles
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true }); // Stone masonry for fireplace
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
    const leafGreenMat = new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true });
    const flowerPinkMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const flowerYellowMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });

    // 1. Foundation & Floors
    // Ground Floor Hardwood
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 8.2), floorMat);
    groundFloor.position.set(0, 0.125, 0);
    groundFloor.receiveShadow = true;
    this.group.add(groundFloor);

    // Front Porch Deck with Welcome Mat
    const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 2.6), floorMat);
    porchDeck.position.set(0, 0.1, 5.0);
    porchDeck.receiveShadow = true;
    this.group.add(porchDeck);

    // Cute Welcome Heart Mat on Porch
    const doormat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.2), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    doormat.position.set(0, 0.22, 5.0);
    doormat.receiveShadow = true;
    this.group.add(doormat);

    const matDeco = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    matDeco.position.set(0, 0.23, 5.0);
    this.group.add(matDeco);

    // Second Floor Deck & Balcony
    const secondFloor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.2, 8.2), floorMat);
    secondFloor.position.set(0, 2.9, 0);
    secondFloor.receiveShadow = true;
    this.group.add(secondFloor);

    const balconyDeck = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.18, 2.6), floorMat);
    balconyDeck.position.set(0, 2.9, 5.0);
    balconyDeck.receiveShadow = true;
    this.group.add(balconyDeck);

    // 2. Exterior & Interior Walls
    // Back Solid Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, 5.8, 0.3), wallExteriorMat);
    backWall.position.set(0, 2.9, -4.0);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.group.add(backWall);

    // Left Exterior Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.8, 8.2), wallExteriorMat);
    leftWall.position.set(-4.7, 2.9, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.group.add(leftWall);

    // Right Exterior Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.8, 8.2), wallExteriorMat);
    rightWall.position.set(4.7, 2.9, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.group.add(rightWall);

    // Interior Shiplap Wainscoting (Warm Timber base trim)
    const wainscotBack = new THREE.Mesh(new THREE.BoxGeometry(9.4, 1.2, 0.06), wainscotMat);
    wainscotBack.position.set(0, 0.7, -3.82);
    this.group.add(wainscotBack);

    const wainscotLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 8.0), wainscotMat);
    wainscotLeft.position.set(-4.52, 0.7, 0);
    this.group.add(wainscotLeft);

    // 3. Front Porch Pillars & Decorative Archway
    [-4.5, 4.5].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.8, 0.4), timberMat);
      pillar.position.set(px, 2.9, 4.0);
      pillar.castShadow = true;
      this.group.add(pillar);

      // Porch base pedestal
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), stoneMat);
      ped.position.set(px, 0.4, 4.0);
      this.group.add(ped);

      // Outdoor wall lantern sconces
      const sconceArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), timberMat);
      sconceArm.position.set(px > 0 ? px - 0.25 : px + 0.25, 2.0, 4.0);
      this.group.add(sconceArm);

      const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lantern.position.set(px > 0 ? px - 0.35 : px + 0.35, 1.95, 4.0);
      this.group.add(lantern);
    });

    // Potted Ornamental Shrubs on Porch Entrance
    [-2.2, 2.2].forEach(px => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.45, 10), new THREE.MeshLambertMaterial({ color: 0x9a3412 }));
      pot.position.set(px, 0.42, 5.2);
      pot.castShadow = true;
      this.group.add(pot);

      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), leafGreenMat);
      plant.position.set(px, 0.85, 5.2);
      plant.castShadow = true;
      this.group.add(plant);
    });

    // Front Wooden Pergola Beam & "Welcome Home 💕" Sign
    const pergolaBeam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.28, 0.35), timberMat);
    pergolaBeam.position.set(0, 2.8, 4.0);
    this.group.add(pergolaBeam);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 0.08), new THREE.MeshLambertMaterial({ color: 0xffedd5 }));
    signBoard.position.set(0, 2.8, 4.2);
    this.group.add(signBoard);

    const signTrim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.52, 0.06), timberMat);
    signTrim.position.set(0, 2.8, 4.18);
    this.group.add(signTrim);

    // 4. Balcony Timber Railing & Flower Boxes
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.08, 0.1), whiteMat);
    railFront.position.set(0, 3.8, 6.2);
    this.group.add(railFront);

    // Cross-buck timber balcony slats
    for (let rx = -4.4; rx <= 4.4; rx += 0.8) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), whiteMat);
      slat.position.set(rx, 3.4, 6.2);
      this.group.add(slat);
    }
    [-4.8, 4.8].forEach(sx => {
      const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 2.4), whiteMat);
      sideRail.position.set(sx, 3.8, 5.0);
      this.group.add(sideRail);
      for (let sz = 4.0; sz <= 6.0; sz += 0.6) {
        const sideSlat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), whiteMat);
        sideSlat.position.set(sx, 3.4, sz);
        this.group.add(sideSlat);
      }
    });

    // Hanging Flower Boxes on Balcony
    [-2.5, 0, 2.5].forEach(bx => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.26, 0.32), timberMat);
      box.position.set(bx, 3.4, 6.36);
      this.group.add(box);

      const flowers = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.24, 0.28), leafGreenMat);
      flowers.position.set(bx, 3.55, 6.36);
      this.group.add(flowers);

      // Pink & Yellow blossoms
      for (let i = -0.7; i <= 0.7; i += 0.35) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), (Math.abs(i) < 0.2) ? flowerYellowMat : flowerPinkMat);
        blossom.position.set(bx + i, 3.72, 6.38);
        this.group.add(blossom);
      }
    });

    // 5. Beautiful Pitched Cottage Roof with Chimney
    const roofSlopeL = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 10.6), roofSlateMat);
    roofSlopeL.position.set(-2.4, 6.8, 0.4);
    roofSlopeL.rotation.z = Math.PI / 6;
    roofSlopeL.castShadow = true;
    roofSlopeL.receiveShadow = true;
    this.group.add(roofSlopeL);

    const roofSlopeR = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 10.6), roofSlateMat);
    roofSlopeR.position.set(2.4, 6.8, 0.4);
    roofSlopeR.rotation.z = -Math.PI / 6;
    roofSlopeR.castShadow = true;
    roofSlopeR.receiveShadow = true;
    this.group.add(roofSlopeR);

    // Roof Ridge Beam
    const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 10.8), timberMat);
    roofRidge.position.set(0, 8.2, 0.4);
    roofRidge.castShadow = true;
    this.group.add(roofRidge);

    // Front Gable Triangular Facade
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-4.8, 5.8);
    gableShape.lineTo(4.8, 5.8);
    gableShape.lineTo(0, 8.2);
    gableShape.closePath();
    const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.25, bevelEnabled: false });
    const frontGable = new THREE.Mesh(gableGeo, wallExteriorMat);
    frontGable.position.set(0, 0, 4.0);
    this.group.add(frontGable);

    const backGable = new THREE.Mesh(gableGeo, wallExteriorMat);
    backGable.position.set(0, 0, -4.1);
    this.group.add(backGable);

    // Rustic Stone Chimney on Roof
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 1.1), stoneMat);
    chimney.position.set(-3.2, 7.8, -1.8);
    chimney.castShadow = true;
    this.group.add(chimney);

    const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 1.3), stoneMat);
    chimneyCap.position.set(-3.2, 9.45, -1.8);
    this.group.add(chimneyCap);

    // 6. Ground Floor Living Room Interior: Cozy Stone Fireplace
    const fireplaceGrp = new THREE.Group();
    fireplaceGrp.position.set(-4.0, 0.2, 0.5);

    const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.8), stoneMat);
    hearth.position.set(0, 1.1, 0);
    hearth.castShadow = true;
    fireplaceGrp.add(hearth);

    const firebox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 1.2), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    firebox.position.set(0.25, 0.6, 0);
    fireplaceGrp.add(firebox);

    // Glowing warm fire coals
    const fireEmbers = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    fireEmbers.position.set(0.3, 0.35, 0);
    fireplaceGrp.add(fireEmbers);

    const mantelpiece = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 2.1), timberMat);
    mantelpiece.position.set(0.1, 2.2, 0);
    fireplaceGrp.add(mantelpiece);
    this.group.add(fireplaceGrp);

    // Romantic Couple Loveseat Sofa
    const sofaGrp = new THREE.Group();
    sofaGrp.position.set(-1.8, 0.2, 0.5);
    sofaGrp.rotation.y = Math.PI / 2;

    const sofaMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Soft romantic pink
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });

    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.9), sofaMat);
    sofaSeat.position.set(0, 0.35, 0);
    sofaGrp.add(sofaSeat);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.3), sofaMat);
    sofaBack.position.set(0, 0.75, -0.35);
    sofaGrp.add(sofaBack);

    [-1.0, 1.0].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.9), sofaMat);
      arm.position.set(ax, 0.55, 0);
      sofaGrp.add(arm);
    });

    // Pillows
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.15), cushionMat);
    p1.position.set(-0.6, 0.65, -0.15);
    p1.rotation.y = 0.2;
    sofaGrp.add(p1);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.15), cushionMat);
    p2.position.set(0.6, 0.65, -0.15);
    p2.rotation.y = -0.2;
    sofaGrp.add(p2);
    this.group.add(sofaGrp);

    // Living Room Fluffy Boho Rug
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.03, 16), new THREE.MeshLambertMaterial({ color: 0xffedd5 }));
    rug.position.set(-2.8, 0.26, 0.5);
    this.group.add(rug);

    // Wooden Coffee Table with Couple Hot Chocolate Mugs
    const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.38, 12), timberMat);
    coffeeTable.position.set(-2.8, 0.45, 0.5);
    this.group.add(coffeeTable);

    [-0.15, 0.15].forEach((mx, idx) => {
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.12, 8), new THREE.MeshLambertMaterial({ color: idx === 0 ? 0x38bdf8 : 0xf43f5e }));
      mug.position.set(-2.8 + mx, 0.7, 0.5);
      this.group.add(mug);
    });

    // 7. Kitchen & Cafe Bar Nook (Back Right Corner)
    const kitchenGrp = new THREE.Group();
    kitchenGrp.position.set(0.8, 0.2, -3.2);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0xffedd5 }));
    counter.position.set(0, 0.45, 0);
    kitchenGrp.add(counter);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.98), timberMat);
    counterTop.position.set(0, 0.94, 0);
    kitchenGrp.add(counterTop);

    // Coffee maker & jars on counter
    const coffeeMaker = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    coffeeMaker.position.set(-0.7, 1.18, 0);
    kitchenGrp.add(coffeeMaker);

    // Floating open kitchen shelves with spice jars
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.3), timberMat);
    shelf.position.set(0, 1.8, -0.35);
    kitchenGrp.add(shelf);
    this.group.add(kitchenGrp);

    // Wall Art & Picture Frames ("Home & Love 💕")
    const artFrame1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.04), timberMat);
    artFrame1.position.set(-2.0, 1.9, -3.8);
    this.group.add(artFrame1);

    const artCanvas1 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), new THREE.MeshBasicMaterial({ color: 0xfbcfe8 }));
    artCanvas1.position.set(-2.0, 1.9, -3.76);
    this.group.add(artCanvas1);

    // 8. THE MODERN GLASS ELEVATOR
    const elevatorGroup = new THREE.Group();
    elevatorGroup.position.set(3.4, 0, -1.6);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 5.8, 16), glassMat);
    tube.position.y = 2.9;
    elevatorGroup.add(tube);

    const pad1 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 16), timberMat);
    pad1.position.y = 0.25;
    elevatorGroup.add(pad1);

    const pad2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 16), timberMat);
    pad2.position.y = 3.05;
    elevatorGroup.add(pad2);

    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.3
    });
    this.elevatorCabin = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.1, 16), cabinMat);
    this.elevatorCabin.position.y = 0.25;
    elevatorGroup.add(this.elevatorCabin);
    this.group.add(elevatorGroup);

    // 9. 2nd Floor Master Bedroom Suite
    const bedGroup = new THREE.Group();
    bedGroup.position.set(-1.6, 3.0, -2.0);

    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.45, 2.5), new THREE.MeshLambertMaterial({ color: 0xa16207 }));
    bedBase.position.set(0, 0.225, 0);
    bedGroup.add(bedBase);

    // Ornate Wooden Headboard with warm fairy light garland
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 0.18), timberMat);
    headboard.position.set(0, 0.9, -1.2);
    bedGroup.add(headboard);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.28, 2.35), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
    mattress.position.set(0, 0.5, 0);
    bedGroup.add(mattress);

    const pillowMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    this.leftPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.5), pillowMat);
    this.leftPillow.position.set(-0.62, 0.68, -0.85);
    bedGroup.add(this.leftPillow);

    this.rightPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.5), pillowMat);
    this.rightPillow.position.set(0.62, 0.68, -0.85);
    bedGroup.add(this.rightPillow);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.14, 1.55), new THREE.MeshLambertMaterial({ color: 0xec4899 }));
    blanket.position.set(0, 0.62, 0.35);
    bedGroup.add(blanket);

    // Nightstands on both sides of bed with Glowing Bedside Lamps
    [-1.75, 1.75].forEach(nx => {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.6), timberMat);
      stand.position.set(nx, 0.3, -1.0);
      bedGroup.add(stand);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.25, 8), whiteMat);
      lampBase.position.set(nx, 0.72, -1.0);
      bedGroup.add(lampBase);

      const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lampShade.position.set(nx, 0.9, -1.0);
      bedGroup.add(lampShade);
    });
    this.group.add(bedGroup);

    // 2nd Floor Balcony Stargazing Bench
    const balconyBench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.5), timberMat);
    balconyBench.position.set(-2.0, 3.2, 4.6);
    this.group.add(balconyBench);

    // 10. Chandeliers & Lighting
    this.houseLight1 = new THREE.PointLight(0xfff5b6, 1.3, 18);
    this.houseLight1.position.set(0, 2.3, 0.5);
    this.group.add(this.houseLight1);

    this.houseLight2 = new THREE.PointLight(0xfff5b6, 1.2, 18);
    this.houseLight2.position.set(-1.6, 5.2, -1.0);
    this.group.add(this.houseLight2);

    this.bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cordMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const shadeMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

    // Ground Floor Chandelier
    const gfLamp = new THREE.Group();
    gfLamp.position.set(0, 2.75, 0.5);
    const gfCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), cordMat);
    gfCord.position.y = -0.225;
    gfLamp.add(gfCord);
    const gfShade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 12, 1, true), shadeMat);
    gfShade.position.y = -0.45;
    gfLamp.add(gfShade);
    this.gfBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), this.bulbMat);
    this.gfBulb.position.y = -0.48;
    gfLamp.add(this.gfBulb);
    this.group.add(gfLamp);

    // 2nd Floor Master Bedroom Chandelier
    const sfLamp = new THREE.Group();
    sfLamp.position.set(-1.6, 5.75, -1.0);
    const sfCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), cordMat);
    sfCord.position.y = -0.25;
    sfLamp.add(sfCord);
    const sfShade = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.24, 12, 1, true), shadeMat);
    sfShade.position.y = -0.5;
    sfLamp.add(sfShade);
    this.sfBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), this.bulbMat);
    this.sfBulb.position.y = -0.54;
    sfLamp.add(this.sfBulb);
    this.group.add(sfLamp);

    // Light Switch with clean faceplate on Porch Pillar
    const switchBack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.02), whiteMat);
    switchBack.position.set(-1.1, 1.2, 3.9);
    this.group.add(switchBack);

    this.switchMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.lightSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.04), this.switchMat);
    this.lightSwitch.position.set(-1.1, 1.2, 3.92);
    this.group.add(this.lightSwitch);

    this.scene.add(this.group);
    if (this.town && this.town.engine) {
      this.town.engine.registerWallObstacle(this.group);
    }

    if (this.town && this.town.colliders) {
      // Solid Left Exterior Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x - 5.0, maxX: this.position.x - 4.4, minZ: this.position.z - 4.2, maxZ: this.position.z + 4.2 });
      // Solid Right Exterior Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x + 4.4, maxX: this.position.x + 5.0, minZ: this.position.z - 4.2, maxZ: this.position.z + 4.2 });
      // Solid Back Exterior Wall
      this.town.colliders.push({ type: 'box', minX: this.position.x - 4.8, maxX: this.position.x + 4.8, minZ: this.position.z - 4.3, maxZ: this.position.z - 3.7 });
      // Solid Fireplace obstacle
      this.town.colliders.push({ type: 'box', minX: this.position.x - 4.6, maxX: this.position.x - 3.4, minZ: this.position.z - 0.5, maxZ: this.position.z + 1.5 });
      // Front Porch & Entrance are 100% open with zero barriers!
    }
  }

  setLightState(isOn) {
    this.isLightOn = Boolean(isOn);
    if (this.houseLight1) this.houseLight1.intensity = this.isLightOn ? 1.3 : 0;
    if (this.houseLight2) this.houseLight2.intensity = this.isLightOn ? 1.2 : 0;
    if (this.switchMat) this.switchMat.color.setHex(this.isLightOn ? 0x22c55e : 0xef4444);
    if (this.bulbMat) this.bulbMat.color.setHex(this.isLightOn ? 0xfef08a : 0x475569);
  }

  toggleLight() {
    this.setLightState(!this.isLightOn);
    return this.isLightOn;
  }

  setElevatorY(y) {
    if (this.elevatorCabin) {
      this.elevatorCabin.position.y = Math.max(0.25, Math.min(3.05, y));
    }
  }

  getLightSwitchWorldPos() {
    const local = new THREE.Vector3(-1.1, 1.2, 3.9);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorBottomWorldPos() {
    const local = new THREE.Vector3(3.4, 0.25, -1.6);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorTopWorldPos() {
    const local = new THREE.Vector3(3.4, 3.05, -1.6);
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
    const localX = side === 'left' ? -2.22 : -0.98;
    const local = new THREE.Vector3(localX, 3.58, -2.1);
    this.group.localToWorld(local);
    return local;
  }

  getWakeUpWorldPosition(side = 'left') {
    const localX = side === 'left' ? -3.4 : 0.2;
    const local = new THREE.Vector3(localX, 3.0, -1.0);
    this.group.localToWorld(local);
    return local;
  }

  update(delta, isAnySleeping = false) {
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
