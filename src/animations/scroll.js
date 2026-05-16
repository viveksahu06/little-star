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
    this.initSplitText();
    this.initScrollProgress();
  }

  async initLenis() {
    try {
      const Lenis = (await import('lenis')).default;
      this.lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
      });
      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { this.lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis not available');
    }
  }

  initScrollTrigger() {
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
    // Generic reveal
    document.querySelectorAll('[data-animate]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('visible'),
      });
    });

    // Hero parallax fadeout
    gsap.to('.hero-content', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
      y: -150, opacity: 0, scale: 0.9,
    });

    // Service cards stagger
    gsap.from('.service-card', {
      scrollTrigger: { trigger: '#services', start: 'top 70%' },
      y: 80, opacity: 0, rotateY: 15, duration: 1, stagger: 0.3, ease: 'power3.out',
    });

    // Gallery items stagger
    gsap.from('.gallery-item', {
      scrollTrigger: { trigger: '#gallery', start: 'top 70%' },
      y: 50, opacity: 0, scale: 0.85, duration: 0.7, stagger: 0.08, ease: 'back.out(1.2)',
    });

    // Schedule cards
    gsap.from('.schedule-card', {
      scrollTrigger: { trigger: '#schedule', start: 'top 70%' },
      y: 60, opacity: 0, rotateX: -10, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    });

    // Event items
    gsap.from('.event-item', {
      scrollTrigger: { trigger: '#events', start: 'top 70%' },
      x: -60, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
    });

    // Timeline line grow
    gsap.from('.timeline-line', {
      scrollTrigger: { trigger: '#events', start: 'top 70%', end: 'bottom 80%', scrub: true },
      scaleY: 0, transformOrigin: 'top',
    });

    // Registration form
    gsap.from('.register-form', {
      scrollTrigger: { trigger: '#register', start: 'top 70%' },
      y: 60, opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out',
    });

    // Video section
    gsap.from('.video-main', {
      scrollTrigger: { trigger: '#videos', start: 'top 70%' },
      y: 40, opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out',
    });
    gsap.from('.video-thumb', {
      scrollTrigger: { trigger: '#videos', start: 'top 60%' },
      y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
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
    document.querySelectorAll('[data-count]').forEach(counter => {
      const target = parseInt(counter.dataset.count);
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerText: target, duration: 2.5,
            snap: { innerText: 1 }, ease: 'power2.out',
          });
        },
      });
    });
  }

  initSplitText() {
    // Split section titles into spans for character-by-character reveal
    document.querySelectorAll('.section-title').forEach(title => {
      const text = title.innerHTML;
      // Don't split if already has child elements (like gradient spans)
      // Instead animate the whole title with a clip effect
      ScrollTrigger.create({
        trigger: title,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.from(title, {
            clipPath: 'inset(0 100% 0 0)',
            duration: 1.2,
            ease: 'power4.out',
          });
        },
      });
    });
  }

  initScrollProgress() {
    // Create scroll progress bar
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.innerHTML = '<div class="scroll-progress-fill"></div><div class="scroll-progress-dot"></div>';
    document.body.appendChild(bar);

    const fill = bar.querySelector('.scroll-progress-fill');
    const dot = bar.querySelector('.scroll-progress-dot');

    ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress * 100;
        fill.style.height = p + '%';
        dot.style.top = p + '%';
      },
    });
  }

  getProgress() {
    return this.progress;
  }
}
