// Interactive 2-Seater Flyable Helicopter Spot with Helipad and Aerial Flight Controls
import * as THREE from 'three';
import { soundEngine } from '../../audio.js';

export class HelicopterSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'helicopter';

    // Positioned on the open eastern scenic plateau near mountains
    this.padPosition = new THREE.Vector3(42, 0, 38);
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

    // Perimeter landing lights (4 warm glowing mini pylons)
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lightMat);
      lightMesh.position.set(Math.cos(a) * 4.1, 0.12, Math.sin(a) * 4.1);
      this.padGroup.add(lightMesh);
    }

    this.scene.add(this.padGroup);
  }

  buildHelicopterMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Materials
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 }); // Sky Cyan pastel body
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.72 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Slate dark metal
    const rotorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Graphite rotor blades
    const seatMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });  // Pastel pink seats

    // 1. Aerodynamic Main Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 1.25, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 1.05, 0.1);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Nose cone / cockpit curve
    const noseGeo = new THREE.ConeGeometry(0.95, 1.0, 12);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.98, 1.45);
    nose.castShadow = true;
    this.group.add(nose);

    // Cockpit Windshield (large panoramic pastel glass)
    const windshieldGeo = new THREE.BoxGeometry(1.45, 0.82, 0.95);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.22, 0.88);
    this.group.add(windshield);

    // Side windows
    [-0.81, 0.81].forEach(wx => {
      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.9), glassMat);
      sideWin.position.set(wx, 1.15, 0.1);
      this.group.add(sideWin);
    });

    // 2. Cockpit Interior Seats (Dual: Pilot on Left, Passenger on Right)
    [-0.42, 0.42].forEach((sx, idx) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.48), seatMat);
      seat.position.set(sx, 0.65, 0.3);
      this.group.add(seat);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.08), seatMat);
      seatBack.position.set(sx, 0.92, 0.08);
      this.group.add(seatBack);

      // Flight stick
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), metalMat);
      stick.position.set(sx, 0.8, 0.65);
      stick.rotation.x = -0.2;
      this.group.add(stick);
    });

    // 3. Tail Boom & Fin
    const tailGeo = new THREE.CylinderGeometry(0.18, 0.32, 2.8, 8);
    const tailBoom = new THREE.Mesh(tailGeo, bodyMat);
    tailBoom.rotation.x = Math.PI / 2;
    tailBoom.position.set(0, 1.1, -2.1);
    tailBoom.castShadow = true;
    this.group.add(tailBoom);

    // Vertical Tail Fin
    const finGeo = new THREE.BoxGeometry(0.08, 0.9, 0.55);
    const fin = new THREE.Mesh(finGeo, bodyMat);
    fin.position.set(0, 1.45, -3.4);
    fin.castShadow = true;
    this.group.add(fin);

    // Horizontal stabilizer
    const stabGeo = new THREE.BoxGeometry(1.1, 0.06, 0.3);
    const stab = new THREE.Mesh(stabGeo, whiteMat);
    stab.position.set(0, 1.18, -3.0);
    this.group.add(stab);

    // 4. Main Rotor Mast & Blades (Pivots at top)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), metalMat);
    mast.position.set(0, 1.85, 0.1);
    this.group.add(mast);

    this.mainRotorPivot = new THREE.Group();
    this.mainRotorPivot.position.set(0, 2.05, 0.1);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), metalMat);
    this.mainRotorPivot.add(hub);

    // Twin long aerodynamic rotor blades (span ~4.4m)
    const bladeGeo = new THREE.BoxGeometry(0.18, 0.03, 4.4);
    const blade1 = new THREE.Mesh(bladeGeo, rotorMat);
    blade1.castShadow = true;
    this.mainRotorPivot.add(blade1);

    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.03, 0.18), rotorMat);
    blade2.castShadow = true;
    this.mainRotorPivot.add(blade2);

    this.group.add(this.mainRotorPivot);

    // 5. Tail Rotor (Spinning on side of tail fin)
    this.tailRotorPivot = new THREE.Group();
    this.tailRotorPivot.position.set(0.12, 1.6, -3.4);

    const tailBladeGeo = new THREE.BoxGeometry(0.06, 0.8, 0.02);
    const tb1 = new THREE.Mesh(tailBladeGeo, rotorMat);
    this.tailRotorPivot.add(tb1);

    const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.8), rotorMat);
    this.tailRotorPivot.add(tb2);

    this.group.add(this.tailRotorPivot);

    // 6. Landing Skids
    const skidGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.5, 8);
    const skidMat = metalMat;

    [-0.75, 0.75].forEach(sx => {
      // Horizontal skid bar
      const skid = new THREE.Mesh(skidGeo, skidMat);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(sx, 0.12, 0.2);
      skid.castShadow = true;
      this.group.add(skid);

      // Curved skid tips
      const tipGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.4, 6);
      const tipF = new THREE.Mesh(tipGeo, skidMat);
      tipF.position.set(sx, 0.24, 1.45);
      tipF.rotation.x = -0.55;
      this.group.add(tipF);

      // Vertical support struts
      [-0.45, 0.55].forEach(sz => {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 6), skidMat);
        strut.position.set(sx * 0.75, 0.42, sz);
        strut.rotation.z = sx > 0 ? -0.32 : 0.32;
        this.group.add(strut);
      });
    });

    this.scene.add(this.group);
  }

  // Seating world positions for character attachment
  getPilotSeatWorldPos() {
    const local = new THREE.Vector3(-0.42, 0.65, 0.3);
    this.group.localToWorld(local);
    return local;
  }

  getPassengerSeatWorldPos() {
    const local = new THREE.Vector3(0.42, 0.65, 0.3);
    this.group.localToWorld(local);
    return local;
  }

  // Update rotor spin, altitude, banking and sound
  update(delta, isDrivenLocally = false) {
    // Rotor speed interpolation
    const targetSpeed = this.isFlying ? 32 : (this.hasOccupants ? 18 : 0);
    this.rotorSpeed += (targetSpeed - this.rotorSpeed) * Math.min(1, delta * 3);

    if (this.rotorSpeed > 0.1) {
      this.rotorAngle += this.rotorSpeed * delta;
      this.tailRotorAngle += this.rotorSpeed * 1.5 * delta;
      this.mainRotorPivot.rotation.y = this.rotorAngle;
      this.tailRotorPivot.rotation.x = this.tailRotorAngle;

      // Play audio pulse periodically
      if (isDrivenLocally) {
        this.soundTimer += delta;
        if (this.soundTimer > 0.15) {
          this.soundTimer = 0;
          soundEngine.playHelicopter();
        }
      }
    }

    // Apply tilt / bank smoothly
    this.group.rotation.x = this.pitch;
    this.group.rotation.z = this.roll;
  }

  // Set position from driver movement or network sync
  setTransform(x, y, z, rotY, pitch = 0, roll = 0) {
    this.group.position.set(x, y, z);
    this.group.rotation.y = rotY;
    this.pitch = pitch;
    this.roll = roll;
    this.altitude = y;
  }
}
