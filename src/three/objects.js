import * as THREE from 'three';

export class SceneObjects {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.createHeroStage();
    this.createServiceCards();
    this.createPortalRing();
    this.createGeometricShapes();
  }

  createHeroStage() {
    const group = new THREE.Group();

    // Central star
    const starShape = new THREE.Shape();
    const outerR = 3, innerR = 1.2, points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 };
    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.z = -0.25;
    group.add(star);

    // Ring around star
    const ringGeometry = new THREE.TorusGeometry(5, 0.08, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.5;
    group.add(ring);

    // Outer ring
    const ring2Geometry = new THREE.TorusGeometry(7, 0.05, 16, 120);
    const ring2Material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = Math.PI * 0.6;
    ring2.rotation.y = Math.PI * 0.2;
    group.add(ring2);

    group.position.set(0, 0, -5);
    this.objects.heroStage = group;
    this.scene.add(group);
  }

  createServiceCards() {
    const group = new THREE.Group();

    // Dance card
    const cardGeo = new THREE.BoxGeometry(4, 5.5, 0.15, 1, 1, 1);
    const danceMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.15,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const danceCard = new THREE.Mesh(cardGeo, danceMat);
    danceCard.position.set(-3.5, 0, 0);
    danceCard.rotation.y = 0.15;

    // Guitar card
    const guitarMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.15,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const guitarCard = new THREE.Mesh(cardGeo.clone(), guitarMat);
    guitarCard.position.set(3.5, 0, 0);
    guitarCard.rotation.y = -0.15;

    // Card borders (wireframe)
    const wireGeo = new THREE.BoxGeometry(4.1, 5.6, 0.2);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.15 });
    const danceWire = new THREE.Mesh(wireGeo, wireMat);
    danceWire.position.copy(danceCard.position);
    danceWire.rotation.copy(danceCard.rotation);
    const guitarWire = new THREE.Mesh(wireGeo.clone(), wireMat.clone());
    guitarWire.position.copy(guitarCard.position);
    guitarWire.rotation.copy(guitarCard.rotation);

    group.add(danceCard, guitarCard, danceWire, guitarWire);
    group.position.set(0, -60, -8);
    group.visible = false;

    this.objects.serviceCards = group;
    this.objects.danceCard = danceCard;
    this.objects.guitarCard = guitarCard;
    this.scene.add(group);
  }

  createPortalRing() {
    const group = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(6, 0.3, 32, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.5,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);

    // Inner glow ring
    const innerGeo = new THREE.TorusGeometry(5.5, 0.15, 16, 80);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.3,
    });
    const innerRing = new THREE.Mesh(innerGeo, innerMat);

    group.add(torus, innerRing);
    group.position.set(0, -200, -10);
    group.visible = false;
    this.objects.portal = group;
    this.scene.add(group);
  }

  createGeometricShapes() {
    const shapes = new THREE.Group();
    const geos = [
      new THREE.OctahedronGeometry(0.8),
      new THREE.IcosahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.7),
      new THREE.DodecahedronGeometry(0.5),
    ];
    const colors = [0xffd700, 0x8b5cf6, 0x06b6d4, 0xec4899];

    for (let i = 0; i < 12; i++) {
      const geo = geos[i % geos.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.2,
        metalness: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.4,
        wireframe: i % 3 === 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20 - 15
      );
      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01, z: (Math.random() - 0.5) * 0.01 },
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
      };
      shapes.add(mesh);
    }

    this.objects.shapes = shapes;
    this.scene.add(shapes);
  }

  update(time, scrollProgress) {
    // Hero star rotation
    if (this.objects.heroStage) {
      this.objects.heroStage.rotation.z = time * 0.1;
      this.objects.heroStage.children[0].rotation.z = -time * 0.15;
      this.objects.heroStage.children[1].rotation.z = time * 0.3;
      const heroScale = Math.max(0.5, 1 - scrollProgress * 2);
      this.objects.heroStage.scale.setScalar(heroScale);
      this.objects.heroStage.material && (this.objects.heroStage.material.opacity = heroScale);
    }

    // Service cards visibility
    if (this.objects.serviceCards) {
      const sectionProgress = scrollProgress * 9;
      if (sectionProgress > 1.5 && sectionProgress < 4) {
        this.objects.serviceCards.visible = true;
        const cardProgress = (sectionProgress - 1.5) / 2.5;
        this.objects.serviceCards.position.y = 0;
        this.objects.serviceCards.position.z = -8;
        this.objects.danceCard.rotation.y = 0.15 + Math.sin(time * 0.5) * 0.05;
        this.objects.guitarCard.rotation.y = -0.15 + Math.sin(time * 0.5 + 1) * 0.05;
        this.objects.serviceCards.children.forEach(c => {
          if (c.material) c.material.opacity = Math.min(0.7, cardProgress);
        });
      } else {
        this.objects.serviceCards.visible = false;
      }
    }

    // Portal ring
    if (this.objects.portal) {
      const sectionProgress = scrollProgress * 9;
      if (sectionProgress > 6.5) {
        this.objects.portal.visible = true;
        this.objects.portal.position.y = 0;
        this.objects.portal.position.z = -10;
        this.objects.portal.rotation.x = Math.sin(time * 0.3) * 0.1;
        this.objects.portal.rotation.y = time * 0.2;
        const portalScale = Math.min(1, (sectionProgress - 6.5) * 2);
        this.objects.portal.scale.setScalar(portalScale);
      } else {
        this.objects.portal.visible = false;
      }
    }

    // Floating geometric shapes
    if (this.objects.shapes) {
      this.objects.shapes.children.forEach((shape) => {
        const { rotSpeed, floatSpeed, floatOffset } = shape.userData;
        shape.rotation.x += rotSpeed.x;
        shape.rotation.y += rotSpeed.y;
        shape.rotation.z += rotSpeed.z;
        shape.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.005;
      });
    }
  }
}
