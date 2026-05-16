import * as THREE from 'three';

export class SceneObjects {
  constructor(scene) {
    this.scene = scene;
    this.objects = {};
    this.createHeroStar();
    this.createServiceCards();
    this.createPortalRing();
    this.createGeometricShapes();
    this.createDancerSilhouette();
    this.createGuitarShape();
  }

  createHeroStar() {
    const group = new THREE.Group();

    // Central 3D star (extruded)
    const starShape = new THREE.Shape();
    const outerR = 3.5, innerR = 1.4, points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.8, bevelEnabled: true, bevelThickness: 0.15,
      bevelSize: 0.15, bevelSegments: 4,
    });
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.6,
      metalness: 0.9, roughness: 0.1,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.z = -0.4;
    group.add(star);

    // Multiple orbital rings
    const ringData = [
      { radius: 6, thickness: 0.1, color: 0x8b5cf6, rotX: Math.PI * 0.5, rotY: 0 },
      { radius: 8, thickness: 0.06, color: 0x06b6d4, rotX: Math.PI * 0.6, rotY: 0.3 },
      { radius: 10, thickness: 0.04, color: 0xec4899, rotX: Math.PI * 0.4, rotY: -0.2 },
    ];

    ringData.forEach(d => {
      const rGeo = new THREE.TorusGeometry(d.radius, d.thickness, 20, 120);
      const rMat = new THREE.MeshStandardMaterial({
        color: d.color, emissive: d.color, emissiveIntensity: 0.8,
        transparent: true, opacity: 0.5,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = d.rotX;
      ring.rotation.y = d.rotY;
      group.add(ring);
    });

    group.position.set(0, 0, -5);
    this.objects.heroStage = group;
    this.objects.heroStar = star;
    this.scene.add(group);
  }

  createDancerSilhouette() {
    // Abstract dancer figure made of connected spheres and cylinders
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.4,
      transparent: true, opacity: 0.6, metalness: 0.5, roughness: 0.3,
    });

    // Body parts as stylized shapes
    const parts = [
      { geo: new THREE.SphereGeometry(0.4, 12, 12), pos: [0, 2, 0] },     // head
      { geo: new THREE.CylinderGeometry(0.15, 0.25, 1.5, 8), pos: [0, 0.8, 0] }, // torso
      { geo: new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), pos: [-0.5, -0.3, 0], rot: [0, 0, 0.4] }, // left arm up
      { geo: new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), pos: [0.5, 0.2, 0], rot: [0, 0, -0.8] }, // right arm
      { geo: new THREE.CylinderGeometry(0.12, 0.1, 1.5, 6), pos: [-0.2, -1.2, 0], rot: [0, 0, 0.15] }, // left leg
      { geo: new THREE.CylinderGeometry(0.12, 0.1, 1.5, 6), pos: [0.4, -1.0, 0], rot: [0, 0, -0.5] }, // right leg (dance pose)
    ];

    parts.forEach(p => {
      const mesh = new THREE.Mesh(p.geo, mat.clone());
      mesh.position.set(...p.pos);
      if (p.rot) mesh.rotation.set(...p.rot);
      group.add(mesh);
    });

    group.position.set(-15, 0, -15);
    group.scale.setScalar(1.5);
    group.visible = false;
    this.objects.dancer = group;
    this.scene.add(group);
  }

  createGuitarShape() {
    // Stylized guitar from basic shapes
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.4,
      transparent: true, opacity: 0.6, metalness: 0.5, roughness: 0.3,
    });

    // Body (two spheres merged look)
    const bodyLower = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI), mat.clone());
    bodyLower.scale.set(1, 0.8, 0.3);
    bodyLower.position.y = -0.5;

    const bodyUpper = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), mat.clone());
    bodyUpper.scale.set(1, 0.8, 0.3);
    bodyUpper.position.y = 0.8;

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.5, 8), mat.clone());
    neck.position.y = 2.5;

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.15), mat.clone());
    head.position.y = 4;

    // Sound hole
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x000000, emissive: 0x06b6d4, emissiveIntensity: 0.2,
      transparent: true, opacity: 0.8,
    });
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), holeMat);
    hole.position.set(0, 0.2, 0.2);

    // Strings
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5 });
    for (let i = -2; i <= 2; i++) {
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 4.5, 4), stringMat.clone());
      string.position.set(i * 0.05, 1.5, 0.16);
      group.add(string);
    }

    group.add(bodyLower, bodyUpper, neck, head, hole);
    group.position.set(15, 0, -15);
    group.scale.setScalar(1.2);
    group.visible = false;
    this.objects.guitar = group;
    this.scene.add(group);
  }

  createServiceCards() {
    const group = new THREE.Group();
    const cardGeo = new THREE.BoxGeometry(4, 5.5, 0.15);

    const danceMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.25,
      metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.6,
    });
    const danceCard = new THREE.Mesh(cardGeo, danceMat);
    danceCard.position.set(-3.5, 0, 0);
    danceCard.rotation.y = 0.15;

    const guitarMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.25,
      metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.6,
    });
    const guitarCard = new THREE.Mesh(cardGeo.clone(), guitarMat);
    guitarCard.position.set(3.5, 0, 0);
    guitarCard.rotation.y = -0.15;

    // Wireframe borders
    const wireGeo = new THREE.BoxGeometry(4.1, 5.6, 0.2);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.1 });
    [danceCard, guitarCard].forEach(card => {
      const wire = new THREE.Mesh(wireGeo.clone(), wireMat.clone());
      wire.position.copy(card.position);
      wire.rotation.copy(card.rotation);
      group.add(wire);
    });

    group.add(danceCard, guitarCard);
    group.position.set(0, 0, -8);
    group.visible = false;
    this.objects.serviceCards = group;
    this.objects.danceCard = danceCard;
    this.objects.guitarCard = guitarCard;
    this.scene.add(group);
  }

  createPortalRing() {
    const group = new THREE.Group();

    // Main ring
    const torusGeo = new THREE.TorusGeometry(6, 0.35, 32, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.8,
      metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0.6,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);

    // Inner rings
    const innerData = [
      { radius: 5.2, thickness: 0.15, color: 0x8b5cf6 },
      { radius: 4.5, thickness: 0.1, color: 0x06b6d4 },
    ];
    innerData.forEach(d => {
      const g = new THREE.TorusGeometry(d.radius, d.thickness, 16, 80);
      const m = new THREE.MeshStandardMaterial({
        color: d.color, emissive: d.color, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.3,
      });
      group.add(new THREE.Mesh(g, m));
    });

    // Portal center glow
    const glowGeo = new THREE.CircleGeometry(4, 32);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3,
      transparent: true, opacity: 0.08, side: THREE.DoubleSide,
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    group.add(torus);
    group.position.set(0, 0, -12);
    group.visible = false;
    this.objects.portal = group;
    this.scene.add(group);
  }

  createGeometricShapes() {
    const shapes = new THREE.Group();
    const geos = [
      new THREE.OctahedronGeometry(0.6),
      new THREE.IcosahedronGeometry(0.5),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.DodecahedronGeometry(0.4),
      new THREE.TorusKnotGeometry(0.3, 0.1, 50, 8),
    ];
    const colors = [0xffd700, 0x8b5cf6, 0x06b6d4, 0xec4899, 0xf59e0b];

    for (let i = 0; i < 18; i++) {
      const geo = geos[i % geos.length];
      const color = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.3,
        metalness: 0.6, roughness: 0.3, transparent: true,
        opacity: 0.35, wireframe: i % 4 === 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25 - 12
      );
      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.015, y: (Math.random() - 0.5) * 0.015, z: (Math.random() - 0.5) * 0.01 },
        floatSpeed: 0.2 + Math.random() * 0.4,
        floatOffset: Math.random() * Math.PI * 2,
        origY: mesh.position.y,
      };
      shapes.add(mesh);
    }

    this.objects.shapes = shapes;
    this.scene.add(shapes);
  }

  update(time, scrollProgress, mouse) {
    const section = scrollProgress * 9;

    // Hero star
    if (this.objects.heroStage) {
      const heroGroup = this.objects.heroStage;
      heroGroup.rotation.z = time * 0.08;
      this.objects.heroStar.rotation.z = -time * 0.12;

      // Rings rotate independently
      heroGroup.children.forEach((child, i) => {
        if (i > 0 && i <= 3) {
          child.rotation.z = time * (0.15 + i * 0.08);
        }
      });

      // Fade out as scroll progresses
      const heroScale = Math.max(0.3, 1 - scrollProgress * 2.5);
      heroGroup.scale.setScalar(heroScale);
      heroGroup.position.y = -scrollProgress * 15;
    }

    // Service cards
    if (this.objects.serviceCards) {
      if (section > 1.5 && section < 4) {
        this.objects.serviceCards.visible = true;
        const t = (section - 1.5) / 2.5;
        this.objects.serviceCards.position.y = 0;
        this.objects.danceCard.rotation.y = 0.15 + Math.sin(time * 0.4) * 0.08 + mouse.x * 0.1;
        this.objects.guitarCard.rotation.y = -0.15 + Math.sin(time * 0.4 + 1) * 0.08 + mouse.x * 0.1;
        this.objects.danceCard.position.y = Math.sin(time * 0.5) * 0.3;
        this.objects.guitarCard.position.y = Math.sin(time * 0.5 + 1) * 0.3;
      } else {
        this.objects.serviceCards.visible = false;
      }
    }

    // Dancer silhouette
    if (this.objects.dancer) {
      if (section > 1.5 && section < 4) {
        this.objects.dancer.visible = true;
        this.objects.dancer.rotation.y = time * 0.3;
        this.objects.dancer.position.y = Math.sin(time * 0.8) * 0.5;
      } else {
        this.objects.dancer.visible = false;
      }
    }

    // Guitar shape
    if (this.objects.guitar) {
      if (section > 1.5 && section < 4) {
        this.objects.guitar.visible = true;
        this.objects.guitar.rotation.y = -time * 0.2;
        this.objects.guitar.rotation.z = Math.sin(time * 0.5) * 0.1;
      } else {
        this.objects.guitar.visible = false;
      }
    }

    // Portal
    if (this.objects.portal) {
      if (section > 6) {
        this.objects.portal.visible = true;
        this.objects.portal.rotation.y = time * 0.15;
        this.objects.portal.rotation.x = Math.sin(time * 0.2) * 0.1;
        const scale = Math.min(1, (section - 6) * 0.7);
        this.objects.portal.scale.setScalar(scale);
        this.objects.portal.children.forEach((child, i) => {
          if (child.geometry.type === 'TorusGeometry') {
            child.rotation.z = time * (0.2 + i * 0.1);
          }
        });
      } else {
        this.objects.portal.visible = false;
      }
    }

    // Geometric shapes
    if (this.objects.shapes) {
      this.objects.shapes.position.x = -mouse.x * 3;
      this.objects.shapes.position.y = -mouse.y * 2;

      this.objects.shapes.children.forEach((shape) => {
        const { rotSpeed, floatSpeed, floatOffset, origY } = shape.userData;
        shape.rotation.x += rotSpeed.x;
        shape.rotation.y += rotSpeed.y;
        shape.rotation.z += rotSpeed.z;
        shape.position.y = origY + Math.sin(time * floatSpeed + floatOffset) * 1.5;
      });
    }
  }
}
