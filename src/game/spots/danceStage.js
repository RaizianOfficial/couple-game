// Romantic Couple Music & Dance Pavilion Stage with Auto-Dance Choreography
import * as THREE from 'three';

export class DanceStageSpot {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.id = 'danceStage';

    // Positioned in the romantic East pavilion meadow (x: 18, z: 8)
    this.position = new THREE.Vector3(18, 0, 8);
    this.rotationY = 0;

    this.musicNotes = [];
    this.buildStage();
    this.initMusicNotes();
  }

  buildStage() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const speakerMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const neonPink = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const neonCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // 1. Elevated Circular Dance Floor (Radius 3.2m, height 0.25m)
    const baseStage = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.4, 0.25, 24), woodMat);
    baseStage.position.y = 0.125;
    baseStage.receiveShadow = true;
    this.group.add(baseStage);

    // Glowing Neon Stage Rim
    const neonRim = new THREE.Mesh(new THREE.TorusGeometry(3.28, 0.06, 8, 32), neonPink);
    neonRim.rotation.x = Math.PI / 2;
    neonRim.position.y = 0.25;
    this.group.add(neonRim);

    // Polished Wood Parquet Dance Floor
    const danceFloor = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.04, 24), new THREE.MeshLambertMaterial({ color: 0xfde047 }));
    danceFloor.position.y = 0.26;
    danceFloor.receiveShadow = true;
    this.group.add(danceFloor);

    // Center Heart Dance Logo
    const heartLogo = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16), new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide }));
    heartLogo.rotation.x = -Math.PI / 2;
    heartLogo.position.y = 0.285;
    this.group.add(heartLogo);

    // 2. Retro Party Jukebox with Golden Vinyl Record
    const jukeboxGrp = new THREE.Group();
    jukeboxGrp.position.set(0, 0.26, -2.6);

    const jbBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.6), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    jbBody.position.y = 0.7;
    jbBody.castShadow = true;
    jukeboxGrp.add(jbBody);

    const jbArch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 16, 1, false, 0, Math.PI), neonCyan);
    jbArch.rotation.z = Math.PI / 2;
    jbArch.rotation.y = Math.PI / 2;
    jbArch.position.set(0, 1.4, 0);
    jukeboxGrp.add(jbArch);

    // Spinning Vinyl Record
    this.vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    this.vinyl.rotation.x = Math.PI / 4;
    this.vinyl.position.set(0, 0.95, 0.32);
    jukeboxGrp.add(this.vinyl);

    this.group.add(jukeboxGrp);

    // 3. Dual Party Speaker Towers
    [-2.2, 2.2].forEach(sx => {
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.3, 0.55), speakerMat);
      spk.position.set(sx, 0.9, -1.8);
      spk.castShadow = true;
      this.group.add(spk);

      // Speaker Cones
      [-0.28, 0.28].forEach(cy => {
        const cone = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), new THREE.MeshBasicMaterial({ color: 0x64748b, side: THREE.DoubleSide }));
        cone.position.set(sx, 0.9 + cy, -1.52);
        this.group.add(cone);
      });
    });

    // 4. Perimeter Fairy Light Posts (4 posts with glowing lanterns)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const px = Math.cos(angle) * 3.0;
      const pz = Math.sin(angle) * 3.0;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.8, 6), woodMat);
      post.position.set(px, 1.4, pz);
      this.group.add(post);

      const lamp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfef08a : 0xf472b6 }));
      lamp.position.set(px, 2.8, pz);
      this.group.add(lamp);
    }

    this.scene.add(this.group);

    // Collision for Jukebox & Speakers at back
    if (this.town && this.town.colliders) {
      this.town.colliders.push({ type: 'box', minX: this.position.x - 2.8, maxX: this.position.x + 2.8, minZ: this.position.z - 3.0, maxZ: this.position.z - 1.4 });
    }
  }

  initMusicNotes() {
    this.notesGroup = new THREE.Group();
    const colors = [0xf43f5e, 0x38bdf8, 0xfacc15, 0xa855f7];
    for (let i = 0; i < 8; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      sphere.visible = false;
      this.notesGroup.add(sphere);
      this.musicNotes.push({
        mesh: sphere,
        x: (Math.random() - 0.5) * 2.2,
        y: 0.8,
        z: (Math.random() - 0.5) * 2.2,
        speedY: 0.6 + Math.random() * 0.4,
        life: Math.random() * 2
      });
    }
    this.group.add(this.notesGroup);
  }

  update(delta, isDancing = false) {
    if (this.vinyl) {
      this.vinyl.rotation.y += delta * 4;
    }

    // Animate floating musical sparkle notes
    for (let i = 0; i < this.musicNotes.length; i++) {
      const n = this.musicNotes[i];
      n.life += delta;
      if (n.life > 2.2) {
        n.life = 0;
        n.y = 0.6;
        n.x = (Math.random() - 0.5) * 3.4;
        n.z = (Math.random() - 0.5) * 3.4;
      }
      n.y += n.speedY * delta;
      n.mesh.position.set(n.x + Math.sin(n.life * 4) * 0.15, n.y, n.z);
      n.mesh.visible = isDancing || true;
    }
  }

  isOnStage(pos) {
    if (!pos) return false;
    return Math.hypot(pos.x - this.position.x, pos.z - this.position.z) < 3.2;
  }
}

