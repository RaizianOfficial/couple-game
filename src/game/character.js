// Low-Poly Procedural Couple Character with Walk Animations and Gender (Boy/Girl)
import * as THREE from 'three';

export class Character {
  constructor(slot = 1, nickname = '', scene, gender = 'boy') {
    this.slot = slot;
    this.nickname = nickname || `Player ${slot}`;
    this.scene = scene;
    this.gender = gender; // 'boy' or 'girl'
    this.anim = 'idle';
    this.animTime = 0;
    this.isLocal = false;
    this.isHoldingCup = false;
    this.isHoldingHands = false;
    this.holdingSide = slot === 1 ? 'right' : 'left';

    // Default palette based on gender
    this.outfit = {
      hat: 'none',
      topColor: this.gender === 'girl' ? '#f472b6' : '#38bdf8', // Girl = Pink, Boy = Blue
      bottomColor: this.gender === 'girl' ? '#94a3b8' : '#cbd5e1',
      accessory: 'none'
    };

    this.group = new THREE.Group();
    this.group.name = 'character'; // Protects from raycaster wall collision
    this.buildMesh();
    this.scene.add(this.group);
  }

  buildMesh() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    this.modelRoot = new THREE.Group();
    this.group.add(this.modelRoot);

    const shadowGeo = new THREE.PlaneGeometry(0.7, 0.7);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 32; shadowCanvas.height = 32;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad; sCtx.fillRect(0, 0, 32, 32);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    this.blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.blobShadow.rotation.x = -Math.PI / 2;
    this.blobShadow.position.y = 0.02;
    this.group.add(this.blobShadow);

    this.skinMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
    this.topMat = new THREE.MeshLambertMaterial({ color: this.outfit.topColor });
    this.bottomMat = new THREE.MeshLambertMaterial({ color: this.outfit.bottomColor });
    this.hairMat = new THREE.MeshLambertMaterial({ color: this.gender === 'girl' ? 0x451a03 : 0x1e293b }); // Darker brown for girl
    this.shoeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.blushMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.52, 10);
    this.torso = new THREE.Mesh(torsoGeo, this.topMat);
    this.torso.position.y = 0.65;
    this.torso.castShadow = true;
    this.modelRoot.add(this.torso);

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.12, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.castShadow = true;
    this.headGroup.add(this.head);

    // Base Hair
    const hairGeo = new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 0.04;
    this.headGroup.add(hair);

    // Cute Bangs
    const tuftGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const tuft1 = new THREE.Mesh(tuftGeo, this.hairMat);
    tuft1.position.set(-0.16, 0.06, 0.2);
    this.headGroup.add(tuft1);
    const tuft2 = new THREE.Mesh(tuftGeo, this.hairMat);
    tuft2.position.set(0.16, 0.06, 0.2);
    this.headGroup.add(tuft2);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.09, 0.02, 0.24);
    this.headGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.09, 0.02, 0.24);
    this.headGroup.add(rightEye);

    // Blushes
    const blushGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const leftBlush = new THREE.Mesh(blushGeo, this.blushMat);
    leftBlush.position.set(-0.16, -0.05, 0.2);
    this.headGroup.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, this.blushMat);
    rightBlush.position.set(0.16, -0.05, 0.2);
    this.headGroup.add(rightBlush);

    // ✨ GENDER SPECIFIC DETAILS (Girl Pigtails & Eyelashes) ✨
    if (this.gender === 'girl') {
      // Eyelashes
      const lashGeo = new THREE.BoxGeometry(0.04, 0.012, 0.01);
      const leftLash = new THREE.Mesh(lashGeo, eyeMat);
      leftLash.position.set(-0.13, 0.04, 0.25);
      leftLash.rotation.z = 0.2;
      this.headGroup.add(leftLash);

      const rightLash = new THREE.Mesh(lashGeo, eyeMat);
      rightLash.position.set(0.13, 0.04, 0.25);
      rightLash.rotation.z = -0.2;
      this.headGroup.add(rightLash);

      // Cute Pigtails
      const tailGeo = new THREE.CapsuleGeometry(0.07, 0.16, 4, 8);
      const leftTail = new THREE.Mesh(tailGeo, this.hairMat);
      leftTail.position.set(-0.25, 0.02, 0);
      leftTail.rotation.z = 0.5;
      this.headGroup.add(leftTail);

      const rightTail = new THREE.Mesh(tailGeo, this.hairMat);
      rightTail.position.set(0.25, 0.02, 0);
      rightTail.rotation.z = -0.5;
      this.headGroup.add(rightTail);
    }

    this.modelRoot.add(this.headGroup);

    // Limbs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.36, 8);
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.18);
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.38, 8);
    const handGeo = new THREE.SphereGeometry(0.065, 6, 6);

    this.leftLegPivot = new THREE.Group(); this.leftLegPivot.position.set(-0.12, 0.42, 0);
    const leftLeg = new THREE.Mesh(legGeo, this.bottomMat); leftLeg.position.y = -0.16; leftLeg.castShadow = true;
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoeMat); leftShoe.position.set(0, -0.32, 0.03);
    this.leftLegPivot.add(leftLeg, leftShoe); this.modelRoot.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group(); this.rightLegPivot.position.set(0.12, 0.42, 0);
    const rightLeg = new THREE.Mesh(legGeo, this.bottomMat); rightLeg.position.y = -0.16; rightLeg.castShadow = true;
    const rightShoe = new THREE.Mesh(shoeGeo, this.shoeMat); rightShoe.position.set(0, -0.32, 0.03);
    this.rightLegPivot.add(rightLeg, rightShoe); this.modelRoot.add(this.rightLegPivot);

    this.leftArmPivot = new THREE.Group(); this.leftArmPivot.position.set(-0.28, 0.85, 0);
    const leftArm = new THREE.Mesh(armGeo, this.topMat); leftArm.position.y = -0.16; leftArm.castShadow = true;
    this.leftHand = new THREE.Mesh(handGeo, this.skinMat); this.leftHand.position.y = -0.34;
    this.leftArmPivot.add(leftArm, this.leftHand); this.modelRoot.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group(); this.rightArmPivot.position.set(0.28, 0.85, 0);
    const rightArm = new THREE.Mesh(armGeo, this.topMat); rightArm.position.y = -0.16; rightArm.castShadow = true;
    this.rightHand = new THREE.Mesh(handGeo, this.skinMat); this.rightHand.position.y = -0.34;
    this.rightArmPivot.add(rightArm, this.rightHand); this.modelRoot.add(this.rightArmPivot);

    // Automatic Flashlight / Torch for Night
    this.torchGroup = new THREE.Group();
    const torchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.28, 8), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    torchBody.rotation.x = Math.PI / 2;
    const torchHead = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.1, 8), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
    torchHead.rotation.x = Math.PI / 2;
    torchHead.position.z = 0.16;
    this.torchGroup.add(torchBody, torchHead);

    this.torchLight = new THREE.SpotLight(0xfef08a, 0, 16, Math.PI / 4, 0.5, 1.2);
    this.torchLight.position.set(0, 0, 0.2);
    this.torchTarget = new THREE.Object3D();
    this.torchTarget.position.set(0, -0.5, 6);
    this.torchGroup.add(this.torchLight, this.torchTarget);
    this.torchLight.target = this.torchTarget;

    this.torchGroup.position.set(0, -0.28, 0.1);
    this.torchGroup.visible = false;
    this.leftHand.add(this.torchGroup);

    this.applyAccessories();
  }

  setNightTorch(isNight) {
    if (this.torchGroup) {
      this.torchGroup.visible = isNight;
      if (this.torchLight) {
        this.torchLight.intensity = isNight ? 2.8 : 0;
      }
    }
  }

  applyOutfit(newOutfit) {
    if (!newOutfit) return;
    this.outfit = { ...this.outfit, ...newOutfit };
    this.topMat.color.set(this.outfit.topColor);
    this.bottomMat.color.set(this.outfit.bottomColor);
    this.applyAccessories();
  }

  applyAccessories() {
    if (this.hatMesh) { this.headGroup.remove(this.hatMesh); this.hatMesh = null; }
    if (this.accessoryMesh) { this.headGroup.remove(this.accessoryMesh); this.accessoryMesh = null; }

    if (this.outfit.hat === 'beret') {
      const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.12, 12), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
      beret.position.set(0.04, 0.32, -0.02); beret.rotation.z = -0.2;
      this.hatMesh = beret; this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'straw') {
      const g = new THREE.Group();
      const straw = new THREE.MeshLambertMaterial({ color: 0xfde047 });
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.04, 16), straw);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), straw); c.position.y = 0.1;
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 16), new THREE.MeshLambertMaterial({ color: 0xec4899 })); r.position.y = 0.04;
      g.add(b, c, r); g.position.set(0, 0.3, 0);
      this.hatMesh = g; this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'beanie') {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshLambertMaterial({ color: 0x06b6d4 }));
      b.position.set(0, 0.16, 0); this.hatMesh = b; this.headGroup.add(this.hatMesh);
    } else if (this.outfit.hat === 'flower') {
      const g = new THREE.Group();
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
      const pMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), pMat);
        const a = (i / 5) * Math.PI * 2; p.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0); g.add(p);
      }
      g.add(c); g.position.set(0.22, 0.22, 0.16); g.rotation.y = -0.5;
      this.hatMesh = g; this.headGroup.add(this.hatMesh);
    }

    if (this.outfit.accessory === 'glasses') {
      const g = new THREE.Group();
      const f = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const r = new THREE.TorusGeometry(0.07, 0.015, 6, 12);
      const lR = new THREE.Mesh(r, f); lR.position.set(-0.09, 0.02, 0.26);
      const rR = new THREE.Mesh(r, f); rR.position.set(0.09, 0.02, 0.26);
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), f); br.position.set(0, 0.02, 0.26);
      g.add(lR, rR, br); this.accessoryMesh = g; this.headGroup.add(this.accessoryMesh);
    } else if (this.outfit.accessory === 'scarf') {
      const s = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 16), new THREE.MeshLambertMaterial({ color: 0xf97316 }));
      s.rotation.x = Math.PI / 2; s.position.set(0, -0.22, 0);
      this.accessoryMesh = s; this.headGroup.add(this.accessoryMesh);
    } else if (this.outfit.accessory === 'bow') {
      const g = new THREE.Group();
      const bm = new THREE.MeshLambertMaterial({ color: 0xec4899 });
      const c = new THREE.ConeGeometry(0.08, 0.1, 4);
      const l = new THREE.Mesh(c, bm); l.rotation.z = Math.PI / 2; l.position.set(-0.06, 0, 0);
      const r = new THREE.Mesh(c, bm); r.rotation.z = -Math.PI / 2; r.position.set(0.06, 0, 0);
      g.add(l, r); g.position.set(0, -0.22, 0.24);
      this.accessoryMesh = g; this.headGroup.add(this.accessoryMesh);
    }
  }

  update(delta) {
    this.animTime += delta;
    this.modelRoot.rotation.x = 0; this.modelRoot.rotation.z = 0; this.headGroup.rotation.y = 0;

    if (this.anim === 'walk') {
      const s = 12;
      const lA = Math.sin(this.animTime * s) * 0.65;
      const aA = Math.sin(this.animTime * s) * 0.55;
      this.leftLegPivot.rotation.x = lA; this.rightLegPivot.rotation.x = -lA;

      if (this.isHoldingHands) {
        if (this.holdingSide === 'right') { this.rightArmPivot.rotation.x = -0.55; this.rightArmPivot.rotation.z = -0.42; this.leftArmPivot.rotation.x = -aA; this.leftArmPivot.rotation.z = 0; }
        else { this.leftArmPivot.rotation.x = -0.55; this.leftArmPivot.rotation.z = 0.42; this.rightArmPivot.rotation.x = aA; this.rightArmPivot.rotation.z = 0; }
      } else if (this.isHoldingCup) {
        this.leftArmPivot.rotation.x = -aA; this.leftArmPivot.rotation.z = 0;
        this.rightArmPivot.rotation.x = -1.25; this.rightArmPivot.rotation.z = -0.3;
      } else {
        this.leftArmPivot.rotation.x = -aA; this.leftArmPivot.rotation.z = 0;
        this.rightArmPivot.rotation.x = aA; this.rightArmPivot.rotation.z = 0;
      }
      this.modelRoot.position.y = Math.abs(Math.sin(this.animTime * s)) * 0.08;
      this.headGroup.rotation.z = Math.sin(this.animTime * s * 0.5) * 0.05;
    } else if (this.anim === 'jump') {
      this.leftLegPivot.rotation.x = -0.45; this.rightLegPivot.rotation.x = -0.35;
      this.leftLegPivot.rotation.z = -0.15; this.rightLegPivot.rotation.z = 0.15;
      this.leftArmPivot.rotation.x = -1.6; this.rightArmPivot.rotation.x = -1.6;
      this.leftArmPivot.rotation.z = -0.35; this.rightArmPivot.rotation.z = 0.35;
      this.headGroup.rotation.z = 0;
    } else if (this.anim === 'hug') {
      this.modelRoot.position.y = 0.02;
      this.leftLegPivot.rotation.x = 0; this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = -1.45; this.rightArmPivot.rotation.x = -1.45;
      this.leftArmPivot.rotation.z = 0.52; this.rightArmPivot.rotation.z = -0.52;
      this.headGroup.rotation.z = 0.12; this.headGroup.rotation.y = 0.08;
    } else if (this.anim === 'sleep') {
      this.modelRoot.rotation.x = -Math.PI / 2;
      this.modelRoot.position.y = 0.22 + Math.sin(this.animTime * 1.8) * 0.02;
      this.modelRoot.position.z = 0.2;
      this.leftLegPivot.rotation.x = 0; this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = -0.2; this.rightArmPivot.rotation.x = -0.2;
      this.leftArmPivot.rotation.z = 0.15; this.rightArmPivot.rotation.z = -0.15;
      this.headGroup.rotation.z = 0.1;
    } else if (this.anim === 'chop') {
      const sw = Math.sin(this.animTime * 9);
      this.modelRoot.rotation.x = Math.max(0, sw * 0.35); this.modelRoot.position.y = Math.max(0, -sw * 0.1);
      this.leftLegPivot.rotation.x = -0.25; this.rightLegPivot.rotation.x = 0.25;
      this.leftArmPivot.rotation.x = -1.6 + sw * 1.1; this.rightArmPivot.rotation.x = -1.6 + sw * 1.1;
      this.leftArmPivot.rotation.z = 0.25; this.rightArmPivot.rotation.z = -0.25;
    } else if (this.anim === 'farm') {
      this.modelRoot.position.y = -0.12; this.modelRoot.rotation.x = 0.42;
      this.leftLegPivot.rotation.x = -0.2; this.rightLegPivot.rotation.x = 0.2;
      const t = Math.sin(this.animTime * 6) * 0.3;
      this.leftArmPivot.rotation.x = -1.1 + t; this.rightArmPivot.rotation.x = -1.1 - t;
      this.leftArmPivot.rotation.z = 0.2; this.rightArmPivot.rotation.z = -0.2;
    } else if (this.anim === 'slide') {
      this.modelRoot.position.y = -0.06;
      this.leftLegPivot.rotation.x = -Math.PI / 2.05; this.rightLegPivot.rotation.x = -Math.PI / 2.05;
      this.leftLegPivot.rotation.z = -0.08; this.rightLegPivot.rotation.z = 0.08;
      this.leftArmPivot.rotation.x = -2.1; this.rightArmPivot.rotation.x = -2.1;
      this.leftArmPivot.rotation.z = -0.3; this.rightArmPivot.rotation.z = 0.3;
      this.headGroup.rotation.z = Math.sin(this.animTime * 8) * 0.08;
    } else if (this.anim === 'angry') {
      const st = Math.sin(this.animTime * 10);
      this.leftLegPivot.rotation.x = Math.max(0, st * 0.5); this.rightLegPivot.rotation.x = Math.max(0, -st * 0.5);
      this.leftArmPivot.rotation.x = -0.9; this.rightArmPivot.rotation.x = -0.9;
      this.leftArmPivot.rotation.z = 0.45; this.rightArmPivot.rotation.z = -0.45;
      this.headGroup.rotation.y = Math.sin(this.animTime * 8) * 0.18; this.headGroup.rotation.z = -0.06;
    } else if (this.anim === 'sit') {
      this.modelRoot.position.y = -0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.2; this.rightLegPivot.rotation.x = -Math.PI / 2.2;
      this.leftLegPivot.rotation.z = -0.15; this.rightLegPivot.rotation.z = 0.15;
      this.leftArmPivot.rotation.x = -0.4; this.rightArmPivot.rotation.x = -0.4;
      this.leftArmPivot.rotation.z = 0; this.rightArmPivot.rotation.z = 0;
      this.headGroup.rotation.z = 0;
    } else if (this.anim === 'ride') {
      this.modelRoot.position.y = 0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.6; this.rightLegPivot.rotation.x = -Math.PI / 2.6;
      this.leftLegPivot.rotation.z = -0.25; this.rightLegPivot.rotation.z = 0.25;
      this.leftArmPivot.rotation.x = -1.15; this.rightArmPivot.rotation.x = -1.15;
      this.leftArmPivot.rotation.z = -0.2; this.rightArmPivot.rotation.z = 0.2;
      this.headGroup.rotation.z = 0;
    } else if (this.anim === 'passenger') {
      this.modelRoot.position.y = 0.05;
      this.leftLegPivot.rotation.x = -Math.PI / 2.4; this.rightLegPivot.rotation.x = -Math.PI / 2.4;
      this.leftLegPivot.rotation.z = -0.2; this.rightLegPivot.rotation.z = 0.2;
      this.leftArmPivot.rotation.x = -0.9; this.rightArmPivot.rotation.x = -0.9;
      this.leftArmPivot.rotation.z = 0.2; this.rightArmPivot.rotation.z = -0.2;
      this.headGroup.rotation.z = 0.05;
    } else if (this.anim === 'swing') {
      this.modelRoot.position.y = -0.02;
      const swa = Math.sin(this.animTime * 2.2) * 0.25;
      this.leftLegPivot.rotation.x = -Math.PI / 2.3 + swa; this.rightLegPivot.rotation.x = -Math.PI / 2.3 + swa;
      this.leftLegPivot.rotation.z = -0.1; this.rightLegPivot.rotation.z = 0.1;
      this.leftArmPivot.rotation.x = -2.6; this.rightArmPivot.rotation.x = -2.6;
      this.leftArmPivot.rotation.z = -0.15; this.rightArmPivot.rotation.z = 0.15;
      this.headGroup.rotation.z = Math.sin(this.animTime * 1.5) * 0.08;
    } else if (this.anim === 'cheer') {
      this.leftArmPivot.rotation.x = -2.8; this.rightArmPivot.rotation.x = -2.8;
      this.leftArmPivot.rotation.z = -0.4; this.rightArmPivot.rotation.z = 0.4;
      this.modelRoot.position.y = Math.abs(Math.sin(this.animTime * 10)) * 0.2;
    } else {
      this.modelRoot.position.y = Math.sin(this.animTime * 2.5) * 0.02;
      this.leftLegPivot.rotation.x = 0; this.rightLegPivot.rotation.x = 0;
      if (this.isHoldingHands) {
        if (this.holdingSide === 'right') { this.rightArmPivot.rotation.x = -0.55; this.rightArmPivot.rotation.z = -0.42; this.leftArmPivot.rotation.x = 0; this.leftArmPivot.rotation.z = 0; }
        else { this.leftArmPivot.rotation.x = -0.55; this.leftArmPivot.rotation.z = 0.42; this.rightArmPivot.rotation.x = 0; this.rightArmPivot.rotation.z = 0; }
      } else if (this.isHoldingCup) {
        this.leftArmPivot.rotation.x = 0; this.leftArmPivot.rotation.z = 0;
        this.rightArmPivot.rotation.x = -1.25; this.rightArmPivot.rotation.z = -0.3;
      } else {
        this.leftArmPivot.rotation.x = 0; this.leftArmPivot.rotation.z = 0;
        this.rightArmPivot.rotation.x = 0; this.rightArmPivot.rotation.z = 0;
      }
      this.headGroup.rotation.z = 0;
    }
  }

  getHandWorldPosition(isRight = true) {
    const pos = new THREE.Vector3();
    if (isRight && this.rightHand) this.rightHand.getWorldPosition(pos);
    else if (!isRight && this.leftHand) this.leftHand.getWorldPosition(pos);
    return pos;
  }

  setPosition(x, z, rotY, y) {
    if (x !== undefined && !isNaN(x)) this.group.position.x = x;
    if (z !== undefined && !isNaN(z)) this.group.position.z = z;
    if (y !== undefined && !isNaN(y)) this.group.position.y = y;
    if (rotY !== undefined && !isNaN(rotY)) this.group.rotation.y = rotY;
  }

  getPosition() {
    return { x: this.group.position.x, y: this.group.position.y, z: this.group.position.z, rotY: this.group.rotation.y };
  }
}