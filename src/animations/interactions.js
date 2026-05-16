export class Interactions {
  constructor() {
    this.initTiltCards();
    this.initGallery();
    this.initLightbox();
    this.initRegistration();
    this.initSmoothLinks();
  }

  initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });
  }

  initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const items = [
      { src: '', title: 'Annual Day Dance Performance', cat: 'dance' },
      { src: '', title: 'Guitar Recital Night', cat: 'guitar' },
      { src: '', title: 'Kids Bollywood Dance', cat: 'dance' },
      { src: '', title: 'Classical Dance Show', cat: 'dance' },
      { src: '', title: 'Guitar Band Session', cat: 'guitar' },
      { src: '', title: 'Summer Camp Event', cat: 'events' },
      { src: '', title: 'Folk Dance Competition', cat: 'dance' },
      { src: '', title: 'Solo Guitar Performance', cat: 'guitar' },
      { src: '', title: 'Annual Awards Ceremony', cat: 'events' },
    ];

    const colors = { dance: '#8b5cf6', guitar: '#06b6d4', events: '#ffd700' };
    const emojis = { dance: '💃', guitar: '🎸', events: '🎪' };

    items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.dataset.category = item.cat;
      div.innerHTML = `
        <div style="width:100%;height:100%;background:linear-gradient(135deg,${colors[item.cat]}22,${colors[item.cat]}11);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0.5rem;">
          <span style="font-size:3rem">${emojis[item.cat]}</span>
          <span style="font-size:0.8rem;color:var(--text-secondary)">${item.title}</span>
        </div>
        <div class="gallery-overlay"><span>${item.title}</span></div>
      `;
      div.addEventListener('click', () => this.openLightbox(item));
      grid.appendChild(div);
    });

    // Filters
    const filters = document.querySelectorAll('.gallery-filter');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        grid.querySelectorAll('.gallery-item').forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  openLightbox(item) {
    // For now, no real images — just show overlay
  }

  initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
      });
    }
  }

  initRegistration() {
    const form = document.getElementById('registerForm');
    const success = document.getElementById('registerSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Animate submit button
      const btn = document.getElementById('submitBtn');
      btn.innerHTML = '<span>Submitting...</span>';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        success.style.display = 'block';
        success.style.opacity = '0';
        requestAnimationFrame(() => {
          success.style.transition = 'opacity 0.6s';
          success.style.opacity = '1';
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
