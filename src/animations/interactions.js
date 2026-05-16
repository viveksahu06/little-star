import gsap from 'gsap';

export class Interactions {
  constructor() {
    this.initCustomCursor();
    this.initTiltCards();
    this.initMagneticButtons();
    this.initSpotlightCards();
    this.initGallery();
    this.initLightbox();
    this.initRegistration();
    this.initSmoothLinks();
  }

  initCustomCursor() {
    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let cx = 0, cy = 0, dx = 0, dy = 0;

    document.addEventListener('mousemove', (e) => {
      dx = e.clientX;
      dy = e.clientY;
    });

    // Smooth follow
    const animateCursor = () => {
      cx += (dx - cx) * 0.15;
      cy += (dy - cy) * 0.15;
      cursor.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
      cursorDot.style.transform = `translate(${dx - 4}px, ${dy - 4}px)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effects
    const interactives = document.querySelectorAll('a, button, .service-card, .schedule-card, .gallery-item, .video-thumb, input, select, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      });
    });

    // Click effect
    document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));
  }

  initTiltCards() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
        card.style.transition = 'transform 0.1s ease-out';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        card.style.transition = 'transform 0.5s ease-out';
      });
    });
  }

  initMagneticButtons() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      });
    });
  }

  initSpotlightCards() {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,215,0,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.02) 100%)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = 'rgba(255,255,255,0.05)';
      });
    });
  }

  initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const items = [
      { src: '/images/gallery/dance-performance.png', title: 'Annual Day Dance Performance', cat: 'dance' },
      { src: '/images/gallery/guitar-performance.png', title: 'Guitar Recital Night', cat: 'guitar' },
      { src: '/images/gallery/bollywood-dance.png', title: 'Kids Bollywood Dance', cat: 'dance' },
      { src: '/images/gallery/folk-dance.png', title: 'Folk Dance Competition', cat: 'dance' },
      { src: '/images/gallery/guitar-class.png', title: 'Guitar Class Session', cat: 'guitar' },
      { src: '/images/gallery/annual-event.png', title: 'Annual Day Celebration', cat: 'events' },
      { src: '/images/gallery/dance-performance.png', title: 'Classical Dance Show', cat: 'dance' },
      { src: '/images/gallery/guitar-performance.png', title: 'Solo Guitar Performance', cat: 'guitar' },
      { src: '/images/gallery/annual-event.png', title: 'Summer Camp Event', cat: 'events' },
    ];

    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.dataset.category = item.cat;
      div.innerHTML = `
        <img src="${item.src}" alt="${item.title}" loading="lazy" />
        <div class="gallery-overlay"><span>${item.title}</span></div>
      `;
      div.addEventListener('click', () => this.openLightbox(item.src, item.title));
      grid.appendChild(div);
    });

    // Filters
    document.querySelectorAll('.gallery-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gallery-filter').forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        grid.querySelectorAll('.gallery-item').forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
          if (show) {
            gsap.from(item, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'back.out(1.5)' });
          }
        });
      });
    });
  }

  openLightbox(src, title) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (lightbox && img) {
      img.src = src;
      img.alt = title;
      lightbox.style.display = 'flex';
      gsap.from(lightbox, { opacity: 0, duration: 0.3 });
      gsap.from(img, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.5)' });
    }
  }

  initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        gsap.to(lightbox, {
          opacity: 0, duration: 0.3,
          onComplete: () => { lightbox.style.display = 'none'; lightbox.style.opacity = 1; }
        });
      });
    }
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          gsap.to(lightbox, {
            opacity: 0, duration: 0.3,
            onComplete: () => { lightbox.style.display = 'none'; lightbox.style.opacity = 1; }
          });
        }
      });
    }
  }

  initRegistration() {
    const form = document.getElementById('registerForm');
    const success = document.getElementById('registerSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.innerHTML = '<span>Submitting...</span>';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        gsap.to(form, {
          opacity: 0, scale: 0.95, duration: 0.4,
          onComplete: () => {
            form.style.display = 'none';
            success.style.display = 'block';
            gsap.from(success, { opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.5)' });
          }
        });
      }, 1200);
    });
  }

  initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}
