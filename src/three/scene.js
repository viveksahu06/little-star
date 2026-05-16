import * as THREE from 'three';

export class Scene3D {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(0, 0);
    this.scrollProgress = 0;
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupFog();
    this.setupListeners();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 0.1, 200);
    this.camera.position.set(0, 0, 30);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    this.scene.add(ambient);

    this.spotLight = new THREE.SpotLight(0xffd700, 2, 100, Math.PI * 0.15, 0.5, 1);
    this.spotLight.position.set(0, 20, 15);
    this.scene.add(this.spotLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 1.5, 60);
    purpleLight.position.set(-15, 5, 10);
    this.scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 60);
    cyanLight.position.set(15, -5, 10);
    this.scene.add(cyanLight);
  }

  setupFog() {
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / this.sizes.width) * 2 - 1;
      this.mouse.y = -(e.clientY / this.sizes.height) * 2 + 1;
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
