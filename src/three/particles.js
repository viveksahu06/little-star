import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.createStarField();
    this.createFloatingNotes();
    this.createGlowOrbs();
  }

  createStarField() {
    const count = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorPalette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xec4899),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 40;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  createFloatingNotes() {
    const noteGroup = new THREE.Group();
    const noteCount = 30;

    for (let i = 0; i < noteCount; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x8b5cf6 : 0x06b6d4,
        emissive: i % 2 === 0 ? 0x8b5cf6 : 0x06b6d4,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6,
      });

      const note = new THREE.Mesh(geometry, material);
      note.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 10
      );
      note.userData = {
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        amplitude: 1 + Math.random() * 3,
      };
      noteGroup.add(note);
    }

    this.notesGroup = noteGroup;
    this.scene.add(noteGroup);
  }

  createGlowOrbs() {
    const orbGroup = new THREE.Group();
    const orbData = [
      { pos: [-10, 8, -5], color: 0xffd700, size: 1.5 },
      { pos: [12, -6, -8], color: 0x8b5cf6, size: 1.2 },
      { pos: [-8, -10, -3], color: 0x06b6d4, size: 1.0 },
      { pos: [15, 10, -10], color: 0xec4899, size: 0.8 },
    ];

    orbData.forEach((data) => {
      const geometry = new THREE.SphereGeometry(data.size, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.25,
      });
      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(...data.pos);
      orbGroup.add(orb);
    });

    this.orbGroup = orbGroup;
    this.scene.add(orbGroup);
  }

  update(time, scrollProgress, mouse) {
    // Rotate star field slowly
    if (this.starField) {
      this.starField.rotation.y = time * 0.02 + scrollProgress * Math.PI;
      this.starField.rotation.x = Math.sin(time * 0.01) * 0.1;
      // Mouse parallax
      this.starField.rotation.z = mouse.x * 0.05;
    }

    // Animate floating notes
    if (this.notesGroup) {
      this.notesGroup.children.forEach((note) => {
        const { speed, offset, amplitude } = note.userData;
        note.position.y += Math.sin(time * speed + offset) * 0.005 * amplitude;
        note.position.x += Math.cos(time * speed * 0.5 + offset) * 0.003;
        note.rotation.x = time * speed * 0.5;
        note.rotation.z = time * speed * 0.3;
      });
    }

    // Animate glow orbs
    if (this.orbGroup) {
      this.orbGroup.children.forEach((orb, i) => {
        orb.position.y += Math.sin(time * 0.3 + i * 1.5) * 0.008;
        orb.position.x += Math.cos(time * 0.2 + i * 2) * 0.005;
        orb.scale.setScalar(1 + Math.sin(time * 0.5 + i) * 0.15);
        orb.material.opacity = 0.2 + Math.sin(time * 0.4 + i) * 0.1;
      });
    }
  }
}
