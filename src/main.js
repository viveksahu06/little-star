import './style.css';
import { Scene3D } from './three/scene.js';
import { ParticleSystem } from './three/particles.js';
import { SceneObjects } from './three/objects.js';
import { ScrollAnimator } from './animations/scroll.js';
import { Interactions } from './animations/interactions.js';

class App {
  constructor() {
    this.scene3D = null;
    this.particles = null;
    this.objects = null;
    this.scrollAnimator = null;
    this.interactions = null;
    this.isReady = false;
    this.init();
  }

  async init() {
    // Show preloader
    this.updatePreloader(0, 'Initializing 3D engine...');

    // Init 3D Scene
    this.scene3D = new Scene3D();
    this.updatePreloader(20, 'Creating particle systems...');

    // Create particles
    this.particles = new ParticleSystem(this.scene3D.scene);
    this.updatePreloader(40, 'Building 3D objects...');

    // Create 3D objects
    this.objects = new SceneObjects(this.scene3D.scene);
    this.updatePreloader(60, 'Setting up animations...');

    // Init scroll animations
    this.scrollAnimator = new ScrollAnimator(this.scene3D);
    this.updatePreloader(80, 'Preparing interactions...');

    // Init interactions
    this.interactions = new Interactions();
    this.updatePreloader(100, 'Ready!');

    // Hide preloader
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.classList.add('hidden');
      this.isReady = true;
    }, 800);

    // Start render loop
    this.animate();
  }

  updatePreloader(progress, text) {
    const bar = document.getElementById('preloaderProgress');
    const txt = document.getElementById('preloaderText');
    if (bar) bar.style.width = progress + '%';
    if (txt) txt.textContent = text;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = this.scene3D.clock.getElapsedTime();
    const scrollProgress = this.scrollAnimator ? this.scrollAnimator.getProgress() : 0;

    // Update camera based on scroll
    this.updateCamera(time, scrollProgress);

    // Update particles
    if (this.particles) {
      this.particles.update(time, scrollProgress, this.scene3D.mouse);
    }

    // Update 3D objects
    if (this.objects) {
      this.objects.update(time, scrollProgress);
    }

    // Render
    this.scene3D.render();
  }

  updateCamera(time, scrollProgress) {
    const camera = this.scene3D.camera;

    // Camera follows scroll with smooth sine wave path
    const sectionIndex = scrollProgress * 9;

    // Subtle camera movement based on scroll
    camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 3 + this.scene3D.mouse.x * 1.5;
    camera.position.y = Math.cos(scrollProgress * Math.PI) * 2 + this.scene3D.mouse.y * 1;
    camera.position.z = 30 - scrollProgress * 8;

    // Camera always looks at center with slight offset
    camera.lookAt(
      Math.sin(time * 0.1) * 0.5,
      Math.cos(time * 0.15) * 0.5,
      -10
    );

    // Adjust spotlight
    if (this.scene3D.spotLight) {
      this.scene3D.spotLight.intensity = 2 + Math.sin(time * 0.5) * 0.5;
    }
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
