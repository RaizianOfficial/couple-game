// Interactive Cute Low-Poly Pets System: Dogs, Cats, and Rabbits (Taming & Following)
import * as THREE from 'three';
import { soundEngine } from '../audio.js';

export class PetSystem {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.pets = [];

    this.initPalette();
    this.spawnPets();
  }

  initPalette() {
    this.materials = {
      dogBrown: new THREE.MeshLambertMaterial({ color: 0xb45309 }),
      dogGolden: new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
      catGinger: new THREE.MeshLambertMaterial({ color: 0xf97316 }),
      catWhite: new THREE.MeshLambertMaterial({ color: 0xf8fafc }),
      rabbitWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      rabbitBrown: new THREE.MeshLambertMaterial({ color: 0xd97706 }),
      collarPink: new THREE.MeshLambertMaterial({ color: 0xf43f5e }),
      collarBlue: new THREE.MeshLambertMaterial({ color: 0x3b82f6 }),
      nosePink: new THREE.MeshLambertMaterial({ color: 0xfb7185 }),
      noseBlack: new THREE.MeshLambertMaterial({ color: 0x1e293b }),
      eyeBlack: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
      heartPink: new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    };
  }

  spawnPets() {
    // 2 Dogs, 2 Cats, 2 Rabbits
    const petDefs = [
      { id: 'dog_1', type: 'dog', name: 'Buddy 🐶', color: 'dogBrown', x: -4, z: 2, scale: 0.95 },
      { id: 'dog_2', type: 'dog', name: 'Milo 🐕', color: 'dogGolden', x: 8, z: -6, scale: 0.9 },
      { id: 'cat_1', type: 'cat', name: 'Luna 🐱', color: 'catWhite', x: 25, z: 32, scale: 0.8 },
      { id: 'cat_2', type: 'cat', name: 'Mochi 🐈', color: 'catGinger', x: -18, z: 8, scale: 0.8 },
      { id: 'rabbit_1', type: 'rabbit', name: 'Bunbun 🐰', color: 'rabbitWhite', x: -28, z: -28, scale: 0.75 },
      { id: 'rabbit_2', type: 'rabbit', name: 'Coco 🐇', color: 'rabbitBrown', x: -48, z: 46, scale: 0.75 }
    ];

    petDefs.forEach((def) => {
      const group = new THREE.Group();
      group.position.set(def.x, 0, def.z);

      let meshData;
      if (def.type === 'dog') {
        meshData = this.buildDogMesh(def.color);
      } else if (def.type === 'cat') {
        meshData = this.buildCatMesh(def.color);
      } else {
        meshData = this.buildRabbitMesh(def.color);
      }

      group.add(meshData.root);
      group.scale.setScalar(def.scale);

      // Name & Tamed Tag Canvas Billboard
      const tag = this.createPetTag(def.name);
      tag.position.set(0, 1.1, 0);
      group.add(tag);

      this.scene.add(group);

      this.pets.push({
        id: def.id,
        type: def.type,
        name: def.name,
        group,
        tagMesh: tag,
        parts: meshData,
        tamedBy: null, // uid of player who tamed it
        ownerNick: '',
        targetPos: new THREE.Vector3(def.x, 0, def.z),
        animTime: Math.random() * 10,
        hopTimer: 0,
        barkTimer: 0
      });
    });
  }

  buildDogMesh(colorKey) {
    const root = new THREE.Group();
    const bodyMat = this.materials[colorKey] || this.materials.dogBrown;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.8), bodyMat);
    body.position.set(0, 0.42, 0);
    body.castShadow = true;
    root.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.45), bodyMat);
    head.position.set(0, 0.72, 0.42);
    head.castShadow = true;
    root.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.25), bodyMat);
    snout.position.set(0, 0.64, 0.68);
    root.add(snout);

    // Nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), this.materials.noseBlack);
    nose.position.set(0, 0.7, 0.81);
    root.add(nose);

    // Eyes
    [-0.12, 0.12].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), this.materials.eyeBlack);
      eye.position.set(ex, 0.76, 0.64);
      root.add(eye);
    });

    // Floppy Ears
    const earGeo = new THREE.BoxGeometry(0.12, 0.32, 0.12);
    [-0.24, 0.24].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, bodyMat);
      ear.position.set(ex, 0.7, 0.38);
      ear.rotation.z = ex > 0 ? -0.2 : 0.2;
      root.add(ear);
    });

    // Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.46), this.materials.collarPink);
    collar.position.set(0, 0.52, 0.38);
    collar.visible = false; // Becomes visible when tamed
    root.add(collar);

    // Tail
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.55, -0.4);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.35, 6), bodyMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.12, -0.1);
    tailPivot.add(tail);
    root.add(tailPivot);

    // 4 Legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.28, 0.14);
    const legs = [];
    [
      { x: -0.18, z: 0.24 }, { x: 0.18, z: 0.24 },
      { x: -0.18, z: -0.24 }, { x: 0.18, z: -0.24 }
    ].forEach(lp => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lp.x, 0.14, lp.z);
      root.add(leg);
      legs.push(leg);
    });

    return { root, collar, tailPivot, legs };
  }

  buildCatMesh(colorKey) {
    const root = new THREE.Group();
    const bodyMat = this.materials[colorKey] || this.materials.catGinger;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.65), bodyMat);
    body.position.set(0, 0.35, 0);
    body.castShadow = true;
    root.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.36), bodyMat);
    head.position.set(0, 0.58, 0.36);
    head.castShadow = true;
    root.add(head);

    // Pointy Triangular Ears
    const earGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
    [-0.14, 0.14].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, bodyMat);
      ear.position.set(ex, 0.8, 0.36);
      root.add(ear);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.04), this.materials.nosePink);
    nose.position.set(0, 0.55, 0.55);
    root.add(nose);

    // Eyes
    [-0.11, 0.11].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), this.materials.eyeBlack);
      eye.position.set(ex, 0.62, 0.53);
      root.add(eye);
    });

    // Collar
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), this.materials.collarBlue);
    collar.position.set(0, 0.42, 0.32);
    collar.visible = false;
    root.add(collar);

    // Tail (curved upwards)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.42, -0.32);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 6), bodyMat);
    tail.rotation.x = Math.PI / 4;
    tail.position.set(0, 0.18, 0.08);
    tailPivot.add(tail);
    root.add(tailPivot);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.22, 0.11);
    const legs = [];
    [
      { x: -0.14, z: 0.2 }, { x: 0.14, z: 0.2 },
      { x: -0.14, z: -0.2 }, { x: 0.14, z: -0.2 }
    ].forEach(lp => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lp.x, 0.11, lp.z);
      root.add(leg);
      legs.push(leg);
    });

    return { root, collar, tailPivot, legs };
  }

  buildRabbitMesh(colorKey) {
    const root = new THREE.Group();
    const bodyMat = this.materials[colorKey] || this.materials.rabbitWhite;

    // Chubby round Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), bodyMat);
    body.position.set(0, 0.3, 0);
    body.scale.set(0.9, 0.85, 1.2);
    body.castShadow = true;
    root.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), bodyMat);
    head.position.set(0, 0.46, 0.28);
    root.add(head);

    // Long upright ears
    const earGeo = new THREE.BoxGeometry(0.08, 0.38, 0.06);
    [-0.09, 0.09].forEach(ex => {
      const ear = new THREE.Mesh(earGeo, bodyMat);
      ear.position.set(ex, 0.74, 0.24);
      ear.rotation.z = ex > 0 ? -0.15 : 0.15;
      root.add(ear);
    });

    // Pink Nose & Eyes
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this.materials.nosePink);
    nose.position.set(0, 0.44, 0.48);
    root.add(nose);

    [-0.09, 0.09].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this.materials.eyeBlack);
      eye.position.set(ex, 0.5, 0.44);
      root.add(eye);
    });

    // Fluffy Pompom Tail
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), bodyMat);
    tail.position.set(0, 0.32, -0.34);
    root.add(tail);

    // Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 12), this.materials.collarPink);
    collar.position.set(0, 0.38, 0.24);
    collar.rotation.x = Math.PI / 2;
    collar.visible = false;
    root.add(collar);

    return { root, collar, tailPivot: root, legs: [] };
  }

  createPetTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect ? ctx.roundRect(4, 4, 152, 40, 12) : ctx.rect(4, 4, 152, 40);
    ctx.fill();

    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(name, 80, 31);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 0.42, 1);
    return sprite;
  }

  updatePetTag(pet) {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 54;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = pet.tamedBy ? 'rgba(236, 72, 153, 0.88)' : 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect ? ctx.roundRect(4, 4, 172, 46, 14) : ctx.rect(4, 4, 172, 46);
    ctx.fill();

    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const text = pet.tamedBy ? `❤️ ${pet.name}` : pet.name;
    ctx.fillText(text, 90, 32);

    if (pet.tagMesh && pet.tagMesh.material.map) {
      pet.tagMesh.material.map.dispose();
      pet.tagMesh.material.map = new THREE.CanvasTexture(canvas);
      pet.tagMesh.material.needsUpdate = true;
    }
  }

  getNearestPet(myPos, maxDist = 2.4) {
    if (!myPos) return null;
    let closest = null;
    let closestDist = maxDist;
    for (const pet of this.pets) {
      const d = Math.hypot(myPos.x - pet.group.position.x, myPos.z - pet.group.position.z);
      if (d < closestDist) {
        closestDist = d;
        closest = pet;
      }
    }
    return closest;
  }

  tamePet(pet, uid, nick) {
    if (!pet) return false;
    pet.tamedBy = uid;
    pet.ownerNick = nick || 'Partner';
    if (pet.parts.collar) pet.parts.collar.visible = true;
    this.updatePetTag(pet);
    soundEngine.playCheer();
    return true;
  }

  untamePet(pet) {
    if (!pet) return false;
    pet.tamedBy = null;
    pet.ownerNick = '';
    if (pet.parts.collar) pet.parts.collar.visible = false;
    this.updatePetTag(pet);
    soundEngine.playPop();
    return true;
  }

  // Network sync update: sync state from Firebase
  applySyncState(syncData) {
    if (!syncData) return;
    for (const pet of this.pets) {
      if (syncData[pet.id]) {
        const pState = syncData[pet.id];
        if (pState.tamedBy !== pet.tamedBy) {
          pet.tamedBy = pState.tamedBy;
          pet.ownerNick = pState.ownerNick || '';
          if (pet.parts.collar) pet.parts.collar.visible = Boolean(pet.tamedBy);
          this.updatePetTag(pet);
        }
      }
    }
  }

  update(delta, myChar, partnerChar, localUid, partnerUid) {
    for (const pet of this.pets) {
      pet.animTime += delta;

      // Determine who this pet should follow
      let targetChar = null;
      if (pet.tamedBy) {
        if (pet.tamedBy === localUid && myChar) {
          targetChar = myChar;
        } else if (pet.tamedBy === partnerUid && partnerChar && partnerChar.group.visible) {
          targetChar = partnerChar;
        }
      }

      if (targetChar) {
        // Follow owner sweetly!
        const ownerPos = targetChar.getPosition();
        const curPos = pet.group.position;
        const dx = ownerPos.x - curPos.x;
        const dz = ownerPos.z - curPos.z;
        const dist = Math.hypot(dx, dz);

        // Keep friendly 1.2m offset
        if (dist > 1.4) {
          const moveSpeed = Math.min(3.5, dist * 1.5);
          const angle = Math.atan2(dx, dz);
          curPos.x += Math.sin(angle) * moveSpeed * delta;
          curPos.z += Math.cos(angle) * moveSpeed * delta;

          // Face movement direction
          let diff = angle - pet.group.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          pet.group.rotation.y += diff * Math.min(1, delta * 10);

          // Walking / hopping animation
          if (pet.type === 'rabbit') {
            pet.group.position.y = Math.abs(Math.sin(pet.animTime * 12)) * 0.25;
          } else {
            pet.group.position.y = Math.abs(Math.sin(pet.animTime * 10)) * 0.08;
            if (pet.parts.legs && pet.parts.legs.length === 4) {
              const legSwing = Math.sin(pet.animTime * 10) * 0.3;
              pet.parts.legs[0].rotation.x = legSwing;
              pet.parts.legs[1].rotation.x = -legSwing;
              pet.parts.legs[2].rotation.x = -legSwing;
              pet.parts.legs[3].rotation.x = legSwing;
            }
          }
        } else {
          // Idle near owner, wag tail happily!
          pet.group.position.y = 0;
          if (pet.parts.tailPivot) {
            pet.parts.tailPivot.rotation.y = Math.sin(pet.animTime * 16) * 0.45;
          }
        }
      } else {
        // Wild gentle wander / idle
        pet.group.position.y = (pet.type === 'rabbit') ? Math.abs(Math.sin(pet.animTime * 4)) * 0.1 : 0;
        if (pet.parts.tailPivot) {
          pet.parts.tailPivot.rotation.y = Math.sin(pet.animTime * 4) * 0.2;
        }
      }
    }
  }
}

