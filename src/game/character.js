// Low-Poly Procedural Couple Character with Walk Animations and Customizable Outfits
import * as THREE from 'three';

export class Character {
  constructor(slot = 1, nickname = '', scene) {
    this.slot = slot;
    this.nickname = nickname || `Player ${slot}`;
    this.scene = scene;
    this.anim = 'idle';
    this.animTime = 0;
    this.isLocal = false;

    // Default palette depending on player slot
    this.outfit = {
      hat: 'none',
      topColor: slot === 1 ? '#f472b6' : '#60a5fa',     // Pink for P1, Sky Blue for P2
      bottomColor: slot === 1 ? '#cbd5e1' : '#94a3b8',  // Soft denim
      accessory: 'none'
    };

    this.group = new THREE.Group();
    this.buildMesh();
    this.scene.add(this.group);
  }

  buildMesh() {
    // Clear any existing children
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    // Root model container for animations
    this.modelRoot = new THREE.Group();
    this.group.add(this.modelRoot);

    // Cute grounded blob shadow underneath
    const shadowGeo = new THREE.PlaneGeometry(0.7, 0.7);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 32;
    shadowCanvas.height = 32;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 32, 32);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    this.blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.blobShadow.rotation.x = -Math.PI / 2;
    this.blobShadow.position.y = 0.02;
    this.group.add(this.blobShadow);

    // Materials
    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 }); // Warm peach skin
    this.topMat = new THREE.MeshLambertMaterial({ color: this.outfit.topColor });
    this.bottomMat = new THREE.MeshLambertMaterial({ color: this.outfit.bottomColor });
    this.hairMat = new THREE.MeshLambertMaterial({ color: this.slot === 1 ? 0x78350f : 0x1e293b }); // Chestnut vs Dark Slate
    this.shoeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.blushMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });

    // 1. Torso / Body (Capsule/Rounded Box)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.52, 10);
    this.torso = new THREE.Mesh(torsoGeo, this.topMat);
    this.torso.position.y = 0.65;
    this.torso.castShadow = true;
    this.modelRoot.add(this.torso);

    // 2. Head (Sphere with cute cheeks and simple face)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.12, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.castShadow = true;
    this.headGroup.add(this.head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 0.04;
    this.headGroup.add(hair);

    // Hair bangs / side tufts
    const tuftGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const tuft1 = new THREE.Mesh(tuftGeo, this.hairMat);
    tuft1.position.set(-0.16, 0.06, 0.2);
    this.headGroup.add(tuft1);
    const tuft2 = new THREE.Mesh(tuftGeo, this.hairMat);
    tuft2.position.set(0.16, 0.06, 0.2);
    this.headGroup.add(tuft2);

    // Cute Eyes (Tiny dark spheres)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.09, 0.02, 0.24);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.09, 0.02, 0.24);
    this.headGroup.add(rightEye);

    // Cheerful Rose Blushes
    const blushGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const leftBlush = new THREE.Mesh(blushGeo, this.blushMat);
    leftBlush.position.set(-0.16, -0.05, 0.2);
    this.headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, this.blushMat);
    rightBlush.position.set(0.16, -0.05, 0.2);
    this.headGroup.add(rightBlush);

    this.modelRoot.add(this.headGroup);

    // 3. Limbs (Pivoted Arms & Legs for walking animation)
    // Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.12, 0.42, 0);
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 8);
    const leftLeg = new THREE.Mesh(legGeo, this.bottomMat);
    leftLeg.position.y = -0.16;
    leftLeg.castShadow = true;
    this.leftLegPivot.add(leftLeg);
    // Shoe
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.18);
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    leftShoe.position.set(0, -0.32, 0.03);
    this.leftLegPivot.add(leftShoe);
    this.modelRoot.add(this.leftLegPivot);

    // Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.12, 0.42, 0);
    const rightLeg = new THREE.Mesh(legGeo, this.bottomMat);
    rightLeg.position.y = -0.16;
    rightLeg.castShadow = true;
    this.rightLegPivot.add(rightLeg);
    const rightShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    rightShoe.position.set(0, -0.32, 0.03);
    this.rightLegPivot.add(rightShoe);
    this.modelRoot.add(this.rightLegPivot);

    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.28, 0.85, 0);
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.38, 8);
    const leftArm = new THREE.Mesh(armGeo, this.topMat);
    leftArm.position.y = -0.16;
    leftArm.castShadow = true;
    this.leftArmPivot.add(leftArm);
    // Hand
    const handGeo = new THREE.SphereGeometry(0.065, 6, 6);
    this.leftHand = new THREE.Mesh(handGeo, this.skinMat);
    this.leftHand.position.y = -0.34;
    this.leftArmPivot.add(this.leftHand);
    this.modelRoot.add(this.leftArmPivot);

    // Right Arm
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.28, 0.85, 0);
    const rightArm = new THREE.Mesh(armGeo, this.topMat);
    rightArm.position.y = -0.16;
    rightArm.castShadow = true;
    this.rightArmPivot.add(rightArm);
    this.rightHand = new THREE.Mesh(handGeo, this.skinMat);
    this.rightHand.position.y = -0.34;
    this.rightArmPivot.add(this.rightHand);
    this.modelRoot.add(this.rightArmPivot);

    // Apply any customized hat or accessory
    this.applyAccessories();
  }

  applyOutfit(newOutfit) {
    if (!newOutfit) return;
    this.outfit = { ...this.outfit, ...newOutfit };
    this.topMat.color.set(this.outfit.topColor);
    this.bottomMat.color.set(this.outfit.bottomColor);
    this.applyAccessories();
  }

  applyAccessories() {
    // Remove old accessories if any
    if (this.hatMesh) {
      this.headGroup.remove(this.hatMesh);
      this.hatMesh = null;
    }
    if (this.accessoryMesh) {
      this.headGroup.remove(this.accessoryMesh);
      this.accessoryMesh = null;
    }

    // Hat Options
    if (this.outfit.hat === 'beret') {
      const beretGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.12, 12);
      const beretMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
      this.hatMesh = new THREE.Mesh(beretGeo, beretMat);
      this.hatMesh.position.set(0.04, 0.32, -0.02);
      this.hatMesh.rotation.z = -0.2;
      this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'straw') {
      const strawGroup = new THREE.Group();
      const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.04, 16);
      const crownGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
      const strawMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
      const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xec4899 });
      const brim = new THREE.Mesh(brimGeo, strawMat);
      const crown = new THREE.Mesh(crownGeo, strawMat);
      crown.position.y = 0.1;
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 16), ribbonMat);
      ribbon.position.y = 0.04;
      strawGroup.add(brim, crown, ribbon);
      strawGroup.position.set(0, 0.3, 0);
      this.hatMesh = strawGroup;
      this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'beanie') {
      const beanieGeo = new THREE.SphereGeometry(0.29, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const beanieMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
      this.hatMesh = new THREE.Mesh(beanieGeo, beanieMat);
      this.hatMesh.position.set(0, 0.16, 0);
      this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'flower') {
      const flowerGroup = new THREE.Group();
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
      const petalMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), petalMat);
        const a = (i / 5) * Math.PI * 2;
        p.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0);
        flowerGroup.add(p);
      }
      flowerGroup.add(center);
      flowerGroup.position.set(0.22, 0.22, 0.16);
      flowerGroup.rotation.y = -0.5;
      this.hatMesh = flowerGroup;
      this.headGroup.add(this.hatMesh);
    }

    // Accessory Options
    if (this.outfit.accessory === 'glasses') {
      const glassesGroup = new THREE.Group();
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const ringGeo = new THREE.TorusGeometry(0.07, 0.015, 6, 12);
      const leftRing = new THREE.Mesh(ringGeo, frameMat);
      leftRing.position.set(-0.09, 0.02, 0.26);
      const rightRing = new THREE.Mesh(ringGeo, frameMat);
      rightRing.position.set(0.09, 0.02, 0.26);
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), frameMat);
      bridge.position.set(0, 0.02, 0.26);
      glassesGroup.add(leftRing, rightRing, bridge);
      this.accessoryMesh = glassesGroup;
      this.headGroup.add(this.accessoryMesh);
    } else if (this.outfit.accessory === 'scarf') {
      const scarfGeo = new THREE.TorusGeometry(0.24, 0.07, 8, 16);
      const scarfMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
      const scarf = new THREE.Mesh(scarfGeo, scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.set(0, -0.22, 0);
      this.accessoryMesh = scarf;
      this.headGroup.add(this.accessoryMesh);
    } else if (this.outfit.accessory === 'bow') {
      const bowGroup = new THREE.Group();
      const bowMat = new THREE.MeshLambertMaterial({ color: 0xec4899 });
      const coneGeo = new THREE.ConeGeometry(0.08, 0.1, 4);
      const leftWing = new THREE.Mesh(coneGeo, bowMat);
      leftWing.rotation.z = Math.PI / 2;
      leftWing.position.set(-0.06, 0, 0);
      const rightWing = new THREE.Mesh(coneGeo, bowMat);
      rightWing.rotation.z = -Math.PI / 2;
      rightWing.position.set(0.06, 0, 0);
      bowGroup.add(leftWing, rightWing);
      bowGroup.position.set(0, -0.22, 0.24);
      this.accessoryMesh = bowGroup;
      this.headGroup.add(this.accessoryMesh);
    }
  }

  // Animation update
  update(delta) {
    this.animTime += delta;

    if (this.anim === 'walk') {
      const speed = 12;
      const legAngle = Math.sin(this.animTime * speed) * 0.65;
      const armAngle = Math.sin(this.animTime * speed) * 0.55;

      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;
      this.leftArmPivot.rotation.x = -armAngle;

      // If holding cup with right hand, keep right arm bent forward holding cup
      if (this.isHoldingCup) {
        this.rightArmPivot.rotation.x = -1.25;
        this.rightArmPivot.rotation.z = -0.3;
      } else {
        this.rightArmPivot.rotation.x = armAngle;
        this.rightArmPivot.rotation.z = 0;
      }

      // Cute head & body vertical bob
      this.modelRoot.position.y = Math.abs(Math.sin(this.animTime * speed)) * 0.08;
      this.headGroup.rotation.z = Math.sin(this.animTime * speed * 0.5) * 0.05;
    } else if (this.anim === 'sit') {
      this.modelRoot.position.y = -0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.2;
      this.rightLegPivot.rotation.x = -Math.PI / 2.2;
      this.leftLegPivot.rotation.z = -0.15;
      this.rightLegPivot.rotation.z = 0.15;
      this.leftArmPivot.rotation.x = -0.4;
      this.rightArmPivot.rotation.x = -0.4;
      this.leftArmPivot.rotation.z = 0;
      this.rightArmPivot.rotation.z = 0;
      this.headGroup.rotation.z = 0;
    } else if (this.anim === 'ride') {
      // Driver holding motorbike handlebars
      this.modelRoot.position.y = 0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.6;
      this.rightLegPivot.rotation.x = -Math.PI / 2.6;
      this.leftLegPivot.rotation.z = -0.25;
      this.rightLegPivot.rotation.z = 0.25;
      // Reach hands forward to handlebars
      this.leftArmPivot.rotation.x = -1.15;
      this.rightArmPivot.rotation.x = -1.15;
      this.leftArmPivot.rotation.z = -0.2;
      this.rightArmPivot.rotation.z = 0.2;
      this.headGroup.rotation.z = 0;
    } else if (this.anim === 'passenger') {
      // Passenger holding onto driver's waist/seat
      this.modelRoot.position.y = 0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.4;
      this.rightLegPivot.rotation.x = -Math.PI / 2.4;
      this.leftLegPivot.rotation.z = -0.2;
      this.rightLegPivot.rotation.z = 0.2;
      this.leftArmPivot.rotation.x = -0.9;
      this.rightArmPivot.rotation.x = -0.9;
      this.leftArmPivot.rotation.z = 0.2;
      this.rightArmPivot.rotation.z = -0.2;
      this.headGroup.rotation.z = 0.05;
    } else if (this.anim === 'swing') {
      // Relaxed swing sit with gentle leg sway
      this.modelRoot.position.y = -0.02;
      const sway = Math.sin(this.animTime * 2.2) * 0.25;
      this.leftLegPivot.rotation.x = -Math.PI / 2.3 + sway;
      this.rightLegPivot.rotation.x = -Math.PI / 2.3 + sway;
      this.leftLegPivot.rotation.z = -0.1;
      this.rightLegPivot.rotation.z = 0.1;
      // Arms reaching UP to hold swing ropes (nearly vertical)
      this.leftArmPivot.rotation.x = -2.6;
      this.rightArmPivot.rotation.x = -2.6;
      this.leftArmPivot.rotation.z = -0.15;
      this.rightArmPivot.rotation.z = 0.15;
      this.headGroup.rotation.z = Math.sin(this.animTime * 1.5) * 0.08;
    } else if (this.anim === 'cheer') {
      // Arms up cheering
      this.leftArmPivot.rotation.x = -2.8;
      this.rightArmPivot.rotation.x = -2.8;
      this.leftArmPivot.rotation.z = -0.4;
      this.rightArmPivot.rotation.z = 0.4;
      this.modelRoot.position.y = Math.abs(Math.sin(this.animTime * 10)) * 0.2;
    } else {
      // Idle breathing
      const breath = Math.sin(this.animTime * 2.5) * 0.02;
      this.modelRoot.position.y = breath;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = 0;
      this.leftArmPivot.rotation.z = 0;

      if (this.isHoldingCup) {
        this.rightArmPivot.rotation.x = -1.25;
        this.rightArmPivot.rotation.z = -0.3;
      } else {
        this.rightArmPivot.rotation.x = 0;
        this.rightArmPivot.rotation.z = 0;
      }
      this.headGroup.rotation.z = 0;
    }
  }

  // Get world position of hands for hand holding
  getHandWorldPosition(isRight = true) {
    const hand = isRight ? this.rightHand : this.leftHand;
    const pos = new THREE.Vector3();
    if (hand) hand.getWorldPosition(pos);
    return pos;
  }

  setPosition(x, z, rotY, y = 0) {
    this.group.position.x = x;
    this.group.position.z = z;
    this.group.position.y = y;
    if (rotY !== undefined) {
      this.group.rotation.y = rotY;
    }
  }

  getPosition() {
    return {
      x: this.group.position.x,
      y: this.group.position.y,
      z: this.group.position.z,
      rotY: this.group.rotation.y
    };
  }
}
