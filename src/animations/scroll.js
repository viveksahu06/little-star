import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimator {
  constructor(scene3D) {
    this.scene3D = scene3D;
    this.lenis = null;
    this.progress = 0;
    this.initLenis();
    this.initScrollTrigger();
    this.initSectionAnimations();
    this.initNavScroll();
    this.initCounters();
  }

  async initLenis() {
    try {
      const Lenis = (await import('lenis')).default;
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { this.lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis not available, using native scroll');
    }
  }

  initScrollTrigger() {
    const sections = document.querySelectorAll('.section');
    const totalSections = sections.length;

    ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.progress = self.progress;
        this.scene3D.setScrollProgress(self.progress);
      },
    });
  }

  initSectionAnimations() {
    // Reveal animations for all [data-animate] elements
    const animElements = document.querySelectorAll('[data-animate]');
    animElements.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('visible'),
      });
    });

    // Hero parallax
    gsap.to('.hero-content', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -100,
      opacity: 0,
    });

    // Service cards stagger
    gsap.from('.service-card', {
      scrollTrigger: { trigger: '#services', start: 'top 70%' },
      y: 60, opacity: 0, duration: 0.8, stagger: 0.2,
    });

    // Gallery items stagger
    gsap.from('.gallery-item', {
      scrollTrigger: { trigger: '#gallery', start: 'top 70%' },
      y: 40, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1,
    });

    // Schedule cards
    gsap.from('.schedule-card', {
      scrollTrigger: { trigger: '#schedule', start: 'top 70%' },
      y: 50, opacity: 0, duration: 0.6, stagger: 0.15,
    });

    // Event items
    gsap.from('.event-item', {
      scrollTrigger: { trigger: '#events', start: 'top 70%' },
      x: -40, opacity: 0, duration: 0.6, stagger: 0.2,
    });

    // Timeline line grow
    gsap.from('.timeline-line', {
      scrollTrigger: { trigger: '#events', start: 'top 70%', end: 'bottom 80%', scrub: true },
      scaleY: 0, transformOrigin: 'top',
    });
  }

  initNavScroll() {
    const nav = document.getElementById('main-nav');
    ScrollTrigger.create({
      start: 80,
      onUpdate: (self) => {
        if (self.scroll() > 80) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      },
    });

    // Nav toggle (mobile)
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('open'));
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('open'));
      });
    }
  }

  initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count);
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out',
          });
        },
      });
    });
  }

  getProgress() {
    return this.progress;
  }
}
