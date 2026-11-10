// Modern 2-Story Couple's Villa with Glowing Elevator & Master Bedroom
import * as THREE from 'three';

export class CoupleHouseSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'coupleHouse';
    this.isLightOn = true;

    this.position = new THREE.Vector3(38, 0, -38);
    this.rotationY = Math.PI;

    this.bedOccupants = { left: null, right: null };
    this.zzzParticles = [];

    this.buildHouse();
    this.initZzzParticles();
  }

  buildHouse() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    const floorMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfce7f3 });
    const accentMat = new THREE.MeshLambertMaterial({ color: 0xa78bfa });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    const bedFrameMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });
    const mattressMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const pillowMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const blanketMat = new THREE.MeshLambertMaterial({ color: 0xec4899 });

    // Ground Floor
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.2, 7.8), floorMat);
    groundFloor.position.set(0, 0.1, 0);
    this.group.add(groundFloor);

    const porch = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.16, 2.2), floorMat);
    porch.position.set(0, 0.08, 4.8);
    this.group.add(porch);

    // Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 5.6, 0.25), wallMat);
    backWall.position.set(0, 2.8, -3.8);
    this.group.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.6, 7.8), wallMat);
    leftWall.position.set(-4.5, 2.8, 0);
    this.group.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 5.6, 7.8), wallMat);
    rightWall.position.set(4.5, 2.8, 0);
    this.group.add(rightWall);

    // Modern Flat Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.4, 8.4), roofMat);
    roof.position.set(0, 5.8, 0);
    this.group.add(roof);

    [-4.3, 4.3].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.6, 0.3), whiteMat);
      pillar.position.set(px, 2.8, 4.0);
      this.group.add(pillar);
    });

    // Second Floor
    const secondFloor = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.18, 7.8), floorMat);
    secondFloor.position.set(0, 2.8, 0);
    this.group.add(secondFloor);
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.16, 2.2), floorMat);
    balcony.position.set(0, 2.8, 4.8);
    this.group.add(balcony);

    const glassRailing = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.8, 0.05), glassMat);
    glassRailing.position.set(0, 3.2, 5.85);
    this.group.add(glassRailing);

    // THE MODERN ELEVATOR
    const elevatorGroup = new THREE.Group();
    elevatorGroup.position.set(3.2, 0, -1.5);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5.6, 16), glassMat);
    tube.position.y = 2.8;
    elevatorGroup.add(tube);
    const pad1 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16), accentMat);
    pad1.position.y = 0.25;
    elevatorGroup.add(pad1);
    const pad2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16), accentMat);
    pad2.position.y = 2.95;
    elevatorGroup.add(pad2);

    // Glowing elevator moving cabin platform
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });
    this.elevatorCabin = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.1, 16), cabinMat);
    this.elevatorCabin.position.y = 0.25;
    elevatorGroup.add(this.elevatorCabin);

    this.group.add(elevatorGroup);

    // Bed on 2nd Floor
    const bedGroup = new THREE.Group();
    bedGroup.position.set(-1.6, 2.9, -2.0);
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.4, 2.5), bedFrameMat);
    bedBase.position.set(0, 0.2, 0);
    bedGroup.add(bedBase);
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.28, 2.35), mattressMat);
    mattress.position.set(0, 0.45, 0);
    bedGroup.add(mattress);
    this.leftPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.5), pillowMat);
    this.leftPillow.position.set(-0.62, 0.62, -0.85);
    bedGroup.add(this.leftPillow);
    this.rightPillow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.5), pillowMat);
    this.rightPillow.position.set(0.62, 0.62, -0.85);
    bedGroup.add(this.rightPillow);
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.12, 1.55), blanketMat);
    blanket.position.set(0, 0.56, 0.35);
    bedGroup.add(blanket);
    this.group.add(bedGroup);

    // Lights & Visible Glowing Ceiling Chandeliers
    this.houseLight1 = new THREE.PointLight(0xfff5b6, 1.2, 16);
    this.houseLight1.position.set(0, 2.2, 0.5);
    this.group.add(this.houseLight1);
    this.houseLight2 = new THREE.PointLight(0xfff5b6, 1.1, 16);
    this.houseLight2.position.set(-1.6, 5.1, -1.0);
    this.group.add(this.houseLight2);

    this.bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cordMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const shadeMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

    // Ground Floor Living Room Pendant Lamp
    const gfLamp = new THREE.Group();
    gfLamp.position.set(0, 2.7, 0.5);
    const gfCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), cordMat);
    gfCord.position.y = -0.225;
    gfLamp.add(gfCord);
    const gfShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.18, 12, 1, true), shadeMat);
    gfShade.position.y = -0.45;
    gfLamp.add(gfShade);
    this.gfBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), this.bulbMat);
    this.gfBulb.position.y = -0.48;
    gfLamp.add(this.gfBulb);
    this.group.add(gfLamp);

    // 2nd Floor Master Bedroom Chandelier
    const sfLamp = new THREE.Group();
    sfLamp.position.set(-1.6, 5.7, -1.0);
    const sfCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), cordMat);
    sfCord.position.y = -0.25;
    sfLamp.add(sfCord);
    const sfShade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 12, 1, true), shadeMat);
    sfShade.position.y = -0.5;
    sfLamp.add(sfShade);
    this.sfBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), this.bulbMat);
    this.sfBulb.position.y = -0.54;
    sfLamp.add(this.sfBulb);
    this.group.add(sfLamp);

    // Light Switch with clean faceplate
    const switchBack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.02), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    switchBack.position.set(-1.1, 1.2, 3.88);
    this.group.add(switchBack);

    this.switchMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.lightSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.04), this.switchMat);
    this.lightSwitch.position.set(-1.1, 1.2, 3.9);
    this.group.add(this.lightSwitch);

    this.scene.add(this.group);

    if (this.town && this.town.colliders) {
      this.town.colliders.push({ type: 'box', minX: this.position.x - 4.6, maxX: this.position.x + 4.6, minZ: this.position.z + 3.5, maxZ: this.position.z + 4.1 });
      this.town.colliders.push({ type: 'box', minX: this.position.x + 4.2, maxX: this.position.x + 4.8, minZ: this.position.z - 4.0, maxZ: this.position.z + 4.0 });
      this.town.colliders.push({ type: 'box', minX: this.position.x - 4.8, maxX: this.position.x - 4.2, minZ: this.position.z - 4.0, maxZ: this.position.z + 4.0 });
    }
  }

  setLightState(isOn) {
    this.isLightOn = Boolean(isOn);
    if (this.houseLight1) this.houseLight1.intensity = this.isLightOn ? 1.2 : 0;
    if (this.houseLight2) this.houseLight2.intensity = this.isLightOn ? 1.1 : 0;
    if (this.switchMat) this.switchMat.color.setHex(this.isLightOn ? 0x22c55e : 0xef4444);
    if (this.bulbMat) this.bulbMat.color.setHex(this.isLightOn ? 0xfef08a : 0x475569);
  }

  toggleLight() {
    this.setLightState(!this.isLightOn);
    return this.isLightOn;
  }

  setElevatorY(y) {
    if (this.elevatorCabin) {
      this.elevatorCabin.position.y = Math.max(0.25, Math.min(2.95, y));
    }
  }

  getLightSwitchWorldPos() {
    const local = new THREE.Vector3(-1.1, 1.2, 3.9);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorBottomWorldPos() {
    const local = new THREE.Vector3(3.2, 0.25, -1.5);
    this.group.localToWorld(local);
    return local;
  }

  getElevatorTopWorldPos() {
    const local = new THREE.Vector3(3.2, 2.95, -1.5);
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
    const local = new THREE.Vector3(localX, 3.48, -2.1);
    this.group.localToWorld(local);
    return local;
  }

  getWakeUpWorldPosition(side = 'left') {
    const localX = side === 'left' ? -3.4 : 0.2;
    const local = new THREE.Vector3(localX, 2.9, -1.0);
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