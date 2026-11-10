// Cooperative Hand Holding Mechanic with Mutual Consent, Particle Trail & Blended Movement
import * as THREE from 'three';
import { soundEngine } from '../audio.js';

export class HandHoldingSystem {
  constructor(scene) {
    this.scene = scene;
    this.isHoldingLocal = false; // Whether this local player is holding the button
    this.isConnected = false;    // Whether both players are holding hands
    this.maxHoldDist = 3.8;      // Generous sweet tether distance
    this.proximityDist = 3.0;

    this.initVisuals();
  }

  initVisuals() {
    // Visual pink/lavender soft glowing hand ribbon
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf472b6,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    this.handLine = new THREE.Line(lineGeo, lineMat);
    this.handLine.visible = false;
    this.scene.add(this.handLine);

    // Heart particles emitter pool between joined hands
    this.heartParticles = [];
    const count = 10;
    const heartGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.9 });

    this.heartGroup = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(heartGeo, heartMat.clone());
      p.visible = false;
      this.heartGroup.add(p);
      this.heartParticles.push({
        mesh: p,
        life: 0,
        maxLife: 0.9,
        velY: 0.4 + Math.random() * 0.3,
        wobble: Math.random() * Math.PI * 2
      });
    }
    this.scene.add(this.heartGroup);
  }

  checkProximity(char1Pos, char2Pos) {
    if (!char1Pos || !char2Pos) return false;
    const dist = Math.hypot(char1Pos.x - char2Pos.x, char1Pos.z - char2Pos.z);
    // If already connected, use max tether distance so button doesn't vanish while walking together
    return dist <= (this.isConnected ? this.maxHoldDist : this.proximityDist);
  }

  update(char1, char2, bothHolding, delta) {
    if (!char1 || !char2) {
      this.disconnect(char1, char2);
      return false;
    }

    const pos1 = char1.getPosition();
    const pos2 = char2.getPosition();
    const dist = Math.hypot(pos1.x - pos2.x, pos1.z - pos2.z);

    // If both holding and within tether distance
    if (bothHolding && dist <= this.maxHoldDist) {
      if (!this.isConnected) {
        this.isConnected = true;
        soundEngine.playHandHold();
      }

      // Dynamically face appropriate hand towards partner
      const p1ToRight = (pos2.x >= pos1.x);
      char1.isHoldingHands = true;
      char1.holdingSide = p1ToRight ? 'right' : 'left';
      char2.isHoldingHands = true;
      char2.holdingSide = p1ToRight ? 'left' : 'right';

      this.handLine.visible = true;
      const h1Pos = char1.getHandWorldPosition(char1.holdingSide === 'right');
      const h2Pos = char2.getHandWorldPosition(char2.holdingSide === 'right');

      // Update line points
      const positions = this.handLine.geometry.attributes.position.array;
      positions[0] = h1Pos.x;
      positions[1] = h1Pos.y;
      positions[2] = h1Pos.z;
      positions[3] = h2Pos.x;
      positions[4] = h2Pos.y;
      positions[5] = h2Pos.z;
      this.handLine.geometry.attributes.position.needsUpdate = true;

      // Update heart particles between hands
      const midPoint = new THREE.Vector3().addVectors(h1Pos, h2Pos).multiplyScalar(0.5);
      this.updateHearts(midPoint, delta);

      return true;
    } else {
      if (this.isConnected) {
        this.disconnect(char1, char2);
      }
      return false;
    }
  }

  updateHearts(center, delta) {
    for (let i = 0; i < this.heartParticles.length; i++) {
      const hp = this.heartParticles[i];
      hp.life += delta;
      if (hp.life > hp.maxLife) {
        hp.life = 0;
        hp.mesh.position.set(
          center.x + (Math.random() - 0.5) * 0.2,
          center.y + (Math.random() - 0.5) * 0.1,
          center.z + (Math.random() - 0.5) * 0.2
        );
        hp.mesh.visible = true;
      }
      hp.mesh.position.y += hp.velY * delta;
      hp.wobble += delta * 4;
      hp.mesh.position.x += Math.sin(hp.wobble) * 0.003;
      const progress = hp.life / hp.maxLife;
      hp.mesh.material.opacity = Math.max(0, 1 - progress);
      hp.mesh.scale.setScalar(0.6 + progress * 0.6);
    }
  }

  disconnect(char1, char2) {
    this.isConnected = false;
    this.handLine.visible = false;
    if (char1) char1.isHoldingHands = false;
    if (char2) char2.isHoldingHands = false;
    for (const hp of this.heartParticles) {
      hp.mesh.visible = false;
      hp.life = hp.maxLife;
    }
  }
}
