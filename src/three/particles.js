import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.createStarField();
    this.createFloatingNotes();
    this.createGlowOrbs();
    this.createCursorTrail();
    this.clickParticles = [];
  }

  createStarField() {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    const colorPalette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xec4899),
      new THREE.Color(0xffffff),
      new THREE.Color(0xf59e0b),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 30 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 30;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 0.5;
      speeds[i] = Math.random() * 0.5 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.starField = new THREE.Points(geometry, material);
    this.starSpeeds = speeds;
    this.scene.add(this.starField);
  }

  createFloatingNotes() {
    const noteGroup = new THREE.Group();
    const noteCount = 40;

    for (let i = 0; i < noteCount; i++) {
      const size = 0.1 + Math.random() * 0.2;
      const geometry = new THREE.SphereGeometry(size, 8, 8);
      const hue = i % 3 === 0 ? 0xffd700 : (i % 3 === 1 ? 0x8b5cf6 : 0x06b6d4);
      const material = new THREE.MeshStandardMaterial({
        color: hue,
        emissive: hue,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.5,
      });

      const note = new THREE.Mesh(geometry, material);
      note.position.set(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40 - 10
      );
      note.userData = {
        speed: 0.2 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
        amplitude: 1 + Math.random() * 4,
        origY: note.position.y,
        origX: note.position.x,
      };
      noteGroup.add(note);
    }

    this.notesGroup = noteGroup;
    this.scene.add(noteGroup);
  }

  createGlowOrbs() {
    const orbGroup = new THREE.Group();
    const orbData = [
      { pos: [-12, 10, -5], color: 0xffd700, size: 2.0 },
      { pos: [14, -8, -8], color: 0x8b5cf6, size: 1.5 },
      { pos: [-10, -12, -3], color: 0x06b6d4, size: 1.2 },
      { pos: [18, 12, -12], color: 0xec4899, size: 1.0 },
      { pos: [0, 18, -6], color: 0xf59e0b, size: 1.8 },
      { pos: [-18, 0, -10], color: 0x22d3ee, size: 0.9 },
    ];

    orbData.forEach((data, i) => {
      const geometry = new THREE.SphereGeometry(data.size, 20, 20);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.2,
      });
      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(...data.pos);
      orb.userData = { origPos: [...data.pos], index: i };
      orbGroup.add(orb);
    });

    this.orbGroup = orbGroup;
    this.scene.add(orbGroup);
  }

  createCursorTrail() {
    const trailCount = 25;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(trailCount * 3);
    const sizes = new Float32Array(trailCount);
    const opacities = new Float32Array(trailCount);

    for (let i = 0; i < trailCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 20;
      sizes[i] = (1 - i / trailCount) * 3;
      opacities[i] = (1 - i / trailCount) * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.cursorTrail = new THREE.Points(geometry, material);
    this.cursorTrailPositions = [];
    for (let i = 0; i < trailCount; i++) {
      this.cursorTrailPositions.push(new THREE.Vector3(0, 0, 20));
    }
    this.scene.add(this.cursorTrail);
  }

  spawnClickParticles(mouseX, mouseY, camera) {
    const count = 30;
    const group = new THREE.Group();

    // Convert screen coords to 3D
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const pos = camera.position.clone().add(dir.multiplyScalar(15));

    const colors = [0xffd700, 0x8b5cf6, 0x06b6d4, 0xec4899, 0xf59e0b];

    for (let i = 0; i < count; i++) {
      const size = 0.05 + Math.random() * 0.15;
      const geometry = new THREE.SphereGeometry(size, 6, 6);
      const material = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: colors[Math.floor(Math.random() * colors.length)],
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 1,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(pos);
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ),
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
      };
      group.add(particle);
    }

    this.scene.add(group);
    this.clickParticles.push(group);

    // Auto-remove after 3s
    setTimeout(() => {
      this.scene.remove(group);
      this.clickParticles = this.clickParticles.filter(g => g !== group);
    }, 3000);
  }

  update(time, scrollProgress, mouse, camera) {
    // Star field rotation + mouse parallax (layer 1 - far)
    if (this.starField) {
      this.starField.rotation.y = time * 0.015 + scrollProgress * Math.PI * 0.5;
      this.starField.rotation.x = Math.sin(time * 0.008) * 0.08;
      this.starField.position.x = -mouse.x * 2;
      this.starField.position.y = -mouse.y * 1.5;

      // Twinkle
      const positions = this.starField.geometry.attributes.position.array;
      for (let i = 0; i < 100; i++) {
        const idx = Math.floor(Math.random() * (positions.length / 3));
        // Subtle position jitter for twinkle
      }
    }

    // Floating notes (layer 2 - mid) + mouse parallax
    if (this.notesGroup) {
      this.notesGroup.position.x = -mouse.x * 4;
      this.notesGroup.position.y = -mouse.y * 3;

      this.notesGroup.children.forEach((note) => {
        const { speed, offset, amplitude, origY, origX } = note.userData;
        note.position.y = origY + Math.sin(time * speed + offset) * amplitude * 0.3;
        note.position.x = origX + Math.cos(time * speed * 0.7 + offset) * 2;
        note.rotation.x = time * speed * 0.4;
        note.rotation.z = time * speed * 0.2;
        note.material.opacity = 0.3 + Math.sin(time * speed + offset) * 0.2;
      });
    }

    // Glow orbs (layer 3 - near) + mouse parallax
    if (this.orbGroup) {
      this.orbGroup.position.x = -mouse.x * 6;
      this.orbGroup.position.y = -mouse.y * 4;

      this.orbGroup.children.forEach((orb, i) => {
        const { origPos } = orb.userData;
        orb.position.y = origPos[1] + Math.sin(time * 0.3 + i * 1.5) * 2;
        orb.position.x = origPos[0] + Math.cos(time * 0.2 + i * 2) * 1.5;
        orb.scale.setScalar(1 + Math.sin(time * 0.4 + i) * 0.2);
        orb.material.opacity = 0.15 + Math.sin(time * 0.3 + i) * 0.08;
      });
    }

    // Cursor trail
    if (this.cursorTrail && camera) {
      // Convert mouse to 3D position
      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const cursorPos = camera.position.clone().add(dir.multiplyScalar(18));

      // Update trail positions (shift all back, new at front)
      for (let i = this.cursorTrailPositions.length - 1; i > 0; i--) {
        this.cursorTrailPositions[i].lerp(this.cursorTrailPositions[i - 1], 0.4);
      }
      this.cursorTrailPositions[0].copy(cursorPos);

      // Write to geometry
      const posAttr = this.cursorTrail.geometry.attributes.position;
      for (let i = 0; i < this.cursorTrailPositions.length; i++) {
        posAttr.array[i * 3] = this.cursorTrailPositions[i].x;
        posAttr.array[i * 3 + 1] = this.cursorTrailPositions[i].y;
        posAttr.array[i * 3 + 2] = this.cursorTrailPositions[i].z;
      }
      posAttr.needsUpdate = true;

      // Color shift based on scroll
      const section = scrollProgress * 9;
      if (section < 2) this.cursorTrail.material.color.setHex(0xffd700);
      else if (section < 4) this.cursorTrail.material.color.setHex(0x8b5cf6);
      else if (section < 6) this.cursorTrail.material.color.setHex(0x06b6d4);
      else this.cursorTrail.material.color.setHex(0xec4899);
    }

    // Click particles
    this.clickParticles.forEach(group => {
      group.children.forEach(p => {
        p.position.add(p.userData.velocity);
        p.userData.velocity.multiplyScalar(0.96);
        p.userData.velocity.y -= 0.003; // gravity
        p.userData.life -= p.userData.decay;
        p.material.opacity = Math.max(0, p.userData.life);
        p.scale.setScalar(p.userData.life);
      });
    });
  }
}
