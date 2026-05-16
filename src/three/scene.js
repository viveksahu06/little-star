import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const chromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0015 },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float dist = distance(uv, vec2(0.5));
      float dynamicAmount = amount * (1.0 + dist * 2.0);
      float r = texture2D(tDiffuse, uv + vec2(dynamicAmount, 0.0)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(dynamicAmount, 0.0)).b;
      float a = texture2D(tDiffuse, uv).a;
      // Vignette
      float vignette = 1.0 - dist * 0.8;
      gl_FragColor = vec4(r * vignette, g * vignette, b * vignette, a);
    }
  `,
};

export class Scene3D {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.scrollProgress = 0;
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.setupCamera();
    this.setupRenderer();
    this.setupPostProcessing();
    this.setupLights();
    this.setupFog();
    this.setupListeners();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 0.1, 300);
    this.camera.position.set(0, 0, 30);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      0.8,   // strength
      0.4,   // radius
      0.6    // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Chromatic Aberration + Vignette
    this.caPass = new ShaderPass(chromaticAberrationShader);
    this.composer.addPass(this.caPass);

    // Output
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0x1a1a3a, 0.8);
    this.scene.add(ambient);

    this.spotLight = new THREE.SpotLight(0xffd700, 3, 120, Math.PI * 0.15, 0.5, 1);
    this.spotLight.position.set(0, 25, 20);
    this.scene.add(this.spotLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 80);
    purpleLight.position.set(-20, 8, 15);
    this.scene.add(purpleLight);
    this.purpleLight = purpleLight;

    const cyanLight = new THREE.PointLight(0x06b6d4, 2, 80);
    cyanLight.position.set(20, -8, 15);
    this.scene.add(cyanLight);
    this.cyanLight = cyanLight;

    const pinkLight = new THREE.PointLight(0xec4899, 1, 50);
    pinkLight.position.set(0, -15, 10);
    this.scene.add(pinkLight);
    this.pinkLight = pinkLight;
  }

  setupFog() {
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.012);
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.composer.setSize(this.sizes.width, this.sizes.height);
      this.bloomPass.resolution.set(this.sizes.width, this.sizes.height);
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / this.sizes.width) * 2 - 1;
      this.targetMouse.y = -(e.clientY / this.sizes.height) * 2 + 1;
    });
  }

  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  update(time) {
    // Smooth mouse with lerp
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Update chromatic aberration time
    if (this.caPass) {
      this.caPass.uniforms.time.value = time;
    }

    // Animate lights subtly
    if (this.spotLight) {
      this.spotLight.intensity = 3 + Math.sin(time * 0.5) * 0.5;
    }
    if (this.purpleLight) {
      this.purpleLight.position.x = -20 + Math.sin(time * 0.3) * 5;
      this.purpleLight.position.y = 8 + Math.cos(time * 0.4) * 3;
    }
    if (this.cyanLight) {
      this.cyanLight.position.x = 20 + Math.cos(time * 0.3) * 5;
      this.cyanLight.position.y = -8 + Math.sin(time * 0.4) * 3;
    }
  }

  render() {
    this.composer.render();
  }
}
