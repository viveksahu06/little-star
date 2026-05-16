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
    this.init();
  }

  async init() {
    this.updatePreloader(0, 'Initializing 3D engine...');

    this.scene3D = new Scene3D();
    this.updatePreloader(15, 'Creating star field...');
    await this.delay(100);

    this.particles = new ParticleSystem(this.scene3D.scene);
    this.updatePreloader(35, 'Building 3D world...');
    await this.delay(100);

    this.objects = new SceneObjects(this.scene3D.scene);
    this.updatePreloader(55, 'Setting up animations...');
    await this.delay(100);

    this.scrollAnimator = new ScrollAnimator(this.scene3D);
    this.updatePreloader(75, 'Preparing interactions...');
    await this.delay(100);

    this.interactions = new Interactions();
    this.updatePreloader(90, 'Almost ready...');
    await this.delay(200);

    this.updatePreloader(100, '✨ Welcome!');

    // Setup click particle explosions
    this.setupClickParticles();

    // Hide preloader with animation
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.classList.add('hidden');
    }, 600);

    this.animate();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updatePreloader(progress, text) {
    const bar = document.getElementById('preloaderProgress');
    const txt = document.getElementById('preloaderText');
    if (bar) bar.style.width = progress + '%';
    if (txt) txt.textContent = text;
  }

  setupClickParticles() {
    window.addEventListener('click', (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      if (this.particles && this.scene3D) {
        this.particles.spawnClickParticles(mouseX, mouseY, this.scene3D.camera);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = this.scene3D.clock.getElapsedTime();
    const scrollProgress = this.scrollAnimator ? this.scrollAnimator.getProgress() : 0;
    const mouse = this.scene3D.mouse;

    // Update scene (lights, post-processing)
    this.scene3D.update(time);

    // Update camera path
    this.updateCamera(time, scrollProgress, mouse);

    // Update particles + cursor trail
    if (this.particles) {
      this.particles.update(time, scrollProgress, mouse, this.scene3D.camera);
    }

    // Update 3D objects
    if (this.objects) {
      this.objects.update(time, scrollProgress, mouse);
    }

    // Render with post-processing
    this.scene3D.render();
  }

  updateCamera(time, scrollProgress, mouse) {
    const camera = this.scene3D.camera;
    const section = scrollProgress * 9;

    // Cinematic camera path
    let targetX, targetY, targetZ;
    let lookX = 0, lookY = 0, lookZ = -10;

    if (section < 1) {
      // Hero: front and center
      targetX = Math.sin(time * 0.1) * 0.5;
      targetY = Math.cos(time * 0.08) * 0.3;
      targetZ = 30 - section * 3;
    } else if (section < 2) {
      // About: slight right pan
      const t = section - 1;
      targetX = 3 * t;
      targetY = 1 * t;
      targetZ = 27 - t * 2;
    } else if (section < 3.5) {
      // Services: pull back to see cards
      const t = (section - 2) / 1.5;
      targetX = 3 - 3 * t;
      targetY = 1 - 2 * t;
      targetZ = 25;
    } else if (section < 5) {
      // Gallery + Videos: sweep left
      const t = (section - 3.5) / 1.5;
      targetX = -4 * t;
      targetY = -1 + 2 * t;
      targetZ = 25 + t * 2;
    } else if (section < 7) {
      // Schedule + Events
      const t = (section - 5) / 2;
      targetX = -4 + 6 * t;
      targetY = 1 - t;
      targetZ = 27 - t * 3;
    } else {
      // Register + Footer: zoom toward portal
      const t = (section - 7) / 2;
      targetX = 2 - 2 * t;
      targetY = 0;
      targetZ = 24 - t * 6;
      lookZ = -12;
    }

    // Mouse parallax on camera
    targetX += mouse.x * 2;
    targetY += mouse.y * 1.5;

    // Smooth lerp camera
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z += (targetZ - camera.position.z) * 0.03;

    // Look at with slight organic movement
    lookX += Math.sin(time * 0.12) * 0.3;
    lookY += Math.cos(time * 0.1) * 0.2;
    camera.lookAt(lookX, lookY, lookZ);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
