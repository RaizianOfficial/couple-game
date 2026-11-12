// Interactive 2-Seater Flyable Helicopter Spot with Cute Low-Poly Revamped Design
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class HelicopterSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'helicopter';

    // Positioned on the North-East Helipad
    this.padPosition = new THREE.Vector3(36, 0, -42);
    this.position = this.padPosition.clone();
    this.rotationY = Math.PI / 4;

    this.rotorSpeed = 0;
    this.targetRotorSpeed = 0;
    this.rotorAngle = 0;
    this.tailRotorAngle = 0;

    // Flight physics state
    this.altitude = 0;
    this.velY = 0;
    this.pitch = 0;
    this.roll = 0;
    this.isFlying = false;

    this.soundTimer = 0;

    this.buildHelipad();
    this.buildHelicopterMesh();
  }

  buildHelipad() {
    this.padGroup = new THREE.Group();
    this.padGroup.position.copy(this.padPosition);

    // Large circular helipad base
    const padMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Dark asphalt
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // Bright yellow safety border
    const hMat = new THREE.MeshBasicMaterial({ color: 0xffffff });     // White 'H'

    const padBase = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.3, 0.08, 32), padMat);
    padBase.position.y = 0.04;
    padBase.receiveShadow = true;
    this.padGroup.add(padBase);

    // Yellow rim ring
    const ringGeo = new THREE.RingGeometry(3.9, 4.15, 32);
    const ringMesh = new THREE.Mesh(ringGeo, rimMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.085;
    this.padGroup.add(ringMesh);

    // Yellow inner ring
    const innerRingGeo = new THREE.RingGeometry(2.5, 2.65, 32);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, rimMat);
    innerRingMesh.rotation.x = -Math.PI / 2;
    innerRingMesh.position.y = 0.085;
    this.padGroup.add(innerRingMesh);

    // Helipad "H" Marking
    const hLegGeo = new THREE.PlaneGeometry(0.35, 2.2);
    const hCrossGeo = new THREE.PlaneGeometry(1.2, 0.35);

    const leftLeg = new THREE.Mesh(hLegGeo, hMat);
    leftLeg.rotation.x = -Math.PI / 2;
    leftLeg.position.set(-0.6, 0.086, 0);
    this.padGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(hLegGeo, hMat);
    rightLeg.rotation.x = -Math.PI / 2;
    rightLeg.position.set(0.6, 0.086, 0);
    this.padGroup.add(rightLeg);

    const crossBar = new THREE.Mesh(hCrossGeo, hMat);
    crossBar.rotation.x = -Math.PI / 2;
    crossBar.position.set(0, 0.087, 0);
    this.padGroup.add(crossBar);

    // Perimeter landing lights (warm glowing mini pylons)
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lightMat);
      lightMesh.position.set(Math.cos(a) * 4.1, 0.12, Math.sin(a) * 4.1);
      this.padGroup.add(lightMesh);
    }

    this.scene.add(this.padGroup);
  }

  // ✨ Revamped Cute Rounded Low-Poly Helicopter
  buildHelicopterMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Sweet Cute Pastel Color Palette
    const mainColor = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });   // Sky Blue
    const bellyColor = new THREE.MeshLambertMaterial({ color: 0xf8fafc });  // Cream White
    const pinkAccent = new THREE.MeshLambertMaterial({ color: 0xf472b6 });  // Sweet Pink
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0.75 }); // Pastel Tint Glass
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x475569 });    // Slate metal
    const rotorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });    // Dark graphite
    const yellowLight = new THREE.MeshBasicMaterial({ color: 0xfde047 });   // Cute glowing headlights

    // 1. Cute Rounded Cabin Body
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, 0.95, 0.2);

    // Main rounded fuselage (sphere scaled like an egg)
    const fuselage = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 12), mainColor);
    fuselage.scale.set(0.9, 0.85, 1.25);
    fuselage.castShadow = true;
    cabinGroup.add(fuselage);

    // White belly stripe
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1.02, 12, 10), bellyColor);
    belly.scale.set(0.88, 0.42, 1.22);
    belly.position.set(0, -0.36, 0);
    cabinGroup.add(belly);

    // Cute Bubble Windshield (front bubble)
    const bubbleGeo = new THREE.SphereGeometry(0.85, 12, 10);
    const bubble = new THREE.Mesh(bubbleGeo, glassMat);
    bubble.scale.set(0.88, 0.78, 0.95);
    bubble.position.set(0, 0.12, 0.48);
    cabinGroup.add(bubble);

    // Cute Headlights in front
    [-0.42, 0.42].forEach(hx => {
      const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), yellowLight);
      headlight.position.set(hx, -0.15, 1.15);
      cabinGroup.add(headlight);
    });

    // 2. Interior Seats (Left Pilot, Right Passenger)
    [-0.34, 0.34].forEach((sx) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.42), pinkAccent);
      seat.position.set(sx, -0.16, 0.15);
      cabinGroup.add(seat);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.08), pinkAccent);
      seatBack.position.set(sx, 0.08, -0.05);
      cabinGroup.add(seatBack);
    });

    this.group.add(cabinGroup);

    // 3. Sleek Tail Boom & Cute Vertical Fin
    const tailBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 2.4, 8), mainColor);
    tailBoom.rotation.x = Math.PI / 2;
    tailBoom.position.set(0, 1.05, -1.8);
    tailBoom.castShadow = true;
    this.group.add(tailBoom);

    // Vertical fin
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.52), pinkAccent);
    fin.position.set(0, 1.42, -2.9);
    fin.castShadow = true;
    this.group.add(fin);

    // Cute small horizontal stabilizers with winglets
    const stab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.28), bellyColor);
    stab.position.set(0, 1.12, -2.6);
    this.group.add(stab);

    // 4. Main Rotor Mast, Cap & Blades
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.38, 8), metalMat);
    mast.position.set(0, 1.88, 0.2);
    this.group.add(mast);

    this.mainRotorPivot = new THREE.Group();
    this.mainRotorPivot.position.set(0, 2.06, 0.2);

    // Cute rounded rotor cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), pinkAccent);
    cap.scale.set(1, 0.4, 1);
    this.mainRotorPivot.add(cap);

    // 4 Aerodynamic Rotor Blades (cute rounded tip)
    const bladeGeo = new THREE.BoxGeometry(0.16, 0.03, 3.8);
    const blade1 = new THREE.Mesh(bladeGeo, rotorMat);
    blade1.castShadow = true;
    this.mainRotorPivot.add(blade1);

    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.03, 0.16), rotorMat);
    blade2.castShadow = true;
    this.mainRotorPivot.add(blade2);

    this.group.add(this.mainRotorPivot);

    // 5. Tail Rotor (Spinning on side of fin)
    this.tailRotorPivot = new THREE.Group();
    this.tailRotorPivot.position.set(0.12, 1.5, -2.9);

    const tb1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.02), rotorMat);
    this.tailRotorPivot.add(tb1);
    const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.72), rotorMat);
    this.tailRotorPivot.add(tb2);

    this.group.add(this.tailRotorPivot);

    // 6. Cute Tubular Landing Skids
    const skidMat = metalMat;
    [-0.68, 0.68].forEach(sx => {
      // Horizontal skid bar
      const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), skidMat);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(sx, 0.1, 0.15);
      skid.castShadow = true;
      this.group.add(skid);

      // Curved front skid tip
      const tipF = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), skidMat);
      tipF.position.set(sx, 0.2, 1.28);
      tipF.rotation.x = -0.55;
      this.group.add(tipF);

      // Support struts
      [-0.4, 0.45].forEach(sz => {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), skidMat);
        strut.position.set(sx * 0.78, 0.36, sz);
        strut.rotation.z = sx > 0 ? -0.28 : 0.28;
        this.group.add(strut);
      });
    });

    this.scene.add(this.group);
  }

  // Seating world positions for character attachment
  getPilotSeatWorldPos() {
    const local = new THREE.Vector3(-0.34, 0.62, 0.35);
    this.group.localToWorld(local);
    return local;
  }

  getPassengerSeatWorldPos() {
    const local = new THREE.Vector3(0.34, 0.62, 0.35);
    this.group.localToWorld(local);
    return local;
  }

  // Update rotor spin, altitude, banking and sound
  update(delta, isDrivenLocally = false) {
    const targetSpeed = this.isFlying ? 32 : (this.hasOccupants ? 18 : 0);
    this.rotorSpeed += (targetSpeed - this.rotorSpeed) * Math.min(1, delta * 3);

    if (this.rotorSpeed > 0.1) {
      this.rotorAngle += this.rotorSpeed * delta;
      this.tailRotorAngle += this.rotorSpeed * 1.5 * delta;
      this.mainRotorPivot.rotation.y = this.rotorAngle;
      this.tailRotorPivot.rotation.x = this.tailRotorAngle;

      if (isDrivenLocally) {
        this.soundTimer += delta;
        if (this.soundTimer > 0.15) {
          this.soundTimer = 0;
          soundEngine.playHelicopter();
        }
      }
    }

    this.group.rotation.x = this.pitch;
    this.group.rotation.z = this.roll;
  }

  setTransform(x, y, z, rotY, pitch = 0, roll = 0) {
    this.group.position.set(x, y, z);
    this.group.rotation.y = rotY;
    this.pitch = pitch;
    this.roll = roll;
    this.altitude = y;
  }
}
