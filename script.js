/**
 * ============================================================================
 * DEVCLUB NATIVE JASVASCRIPT ENGINE (ES6+)
 * Funcionalidades:
 * 1. Canvas Background Interativo 60 FPS (Partículas com repulsão de cursor e física de retorno)
 * 2. Efeito Spotlight / Mouse Lens Interativo na Imagem do Astronauta no Hero
 * 3. IntersectionObserver para Animações de Scroll
 * 4. FAQ Accordion Interativo
 * 5. Sistema de Filtros de Trilhas e Formações
 * 6. Navbar Sticky Elevation e Menu Mobile
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de todos os módulos
  initParticleCanvas();
  initSpotlightLens();
  initScrollReveal();
  initFaqAccordion();
  initTrilhasFilter();
  initNavbarScroll();
  initMobileMenu();
  initSalaryScrollAnimation();
  initVideoScrubAndCardFocus();
  initBottomBanner();
  initInfiniteMarquees();
});

/* ============================================================================
   1. CANVAS PARTICLE ENGINE (60 FPS, Mouse Repulsion & Return Physics)
   ============================================================================ */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Estado do Mouse
  const mouse = {
    x: null,
    y: null,
    radius: 170, // Raio de influência do cursor
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  });

  // Configuração das Partículas
  const particles = [];
  const particleDensity = 100; // Quantidade de partículas

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.radius = Math.random() * 2.2 + 1;
      this.color = '#00FF88';
      this.density = Math.random() * 20 + 10;
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00FF88';
      ctx.fill();
      ctx.restore();
    }

    update() {
      // Movimento contínuo base
      this.x += this.vx;
      this.y += this.vy;

      // Colisão com bordas da tela
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interatividade com o Cursor do Mouse (Afastar e Retornar)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;

          // Afasta a partícula do cursor
          this.x -= directionX * 0.4;
          this.y -= directionY * 0.4;
        }
      }
    }
  }

  function createParticles() {
    particles.length = 0;
    const count = Math.floor((width * height) / 12000);
    for (let i = 0; i < Math.min(count, particleDensity); i++) {
      particles.push(new Particle());
    }
  }

  function connectLines() {
    const maxDist = 140;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = 1 - dist / maxDist;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = `rgba(0, 255, 136, ${opacity * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // Render Loop 60 FPS
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectLines();

    requestAnimationFrame(animate);
  }

  createParticles();
  animate();
}

/* ============================================================================
   2. SPOTLIGHT / MOUSE LENS EFFECT (Astronaut Image Interactivity)
   ============================================================================ */
function initSpotlightLens() {
  const containers = document.querySelectorAll('.spotlight-container');
  if (!containers.length) return;

  containers.forEach((container) => {
    const overlay = container.querySelector('.spotlight-overlay');
    const ring = container.querySelector('.spotlight-ring');

    if (!overlay || !ring) return;

    const updateLens = (x, y) => {
      container.classList.add('lens-active');
      overlay.style.clipPath = `circle(70px at ${x}px ${y}px)`;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
    };

    const resetLens = () => {
      container.classList.remove('lens-active');
      overlay.style.clipPath = `circle(0px at 50% 50%)`;
    };

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateLens(x, y);
    });

    container.addEventListener('mouseleave', resetLens);

    // Suporte para telas de toque (Mobile / Tablet)
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        updateLens(x, y);
      }
    }, { passive: true });

    container.addEventListener('touchend', resetLens);
  });
}

/* ============================================================================
   3. INTERSECTION OBSERVER (Scroll Animations)
   ============================================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target); // Anima apenas 1 vez
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/* ============================================================================
   4. FAQ ACCORDION INTERACTIVITY
   ============================================================================ */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const parentItem = header.parentElement;
      const isActive = parentItem.classList.contains('active');

      // Fecha todos os outros itens
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
      });

      // Toggle no selecionado
      if (!isActive) {
        parentItem.classList.add('active');
      }
    });
  });
}

/* ============================================================================
   5. TRILHAS & FORMAÇÕES FILTER SYSTEM
   ============================================================================ */
function initTrilhasFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const trilhaCards = document.querySelectorAll('.trilha-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Atualiza botão ativo
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');

      trilhaCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ============================================================================
   6. NAVBAR SCROLL ELEVATION & MOBILE MENU
   ============================================================================ */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Fechar menu ao clicar em qualquer link
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}

/* ============================================================================
   7. SALARY ANIMATION (3 Seconds Smooth Loading Fill & Counter)
   ============================================================================ */
function initSalaryScrollAnimation() {
  const salarySection = document.getElementById('salarios');
  if (!salarySection) return;

  const fills = document.querySelectorAll('.progress-bar-fill');
  const valElements = document.querySelectorAll('.salary-val');
  let hasAnimated = false;

  function start3SecondAnimation() {
    if (hasAnimated) return;
    hasAnimated = true;

    const duration = 3000; // 3 segundos exatos de carregamento
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsedTime = currentTime - startTime;
      let progress = Math.min(elapsedTime / duration, 1);

      // Easing suave (easeOutCubic) para preenchimento constante e elegante
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // 1. Atualiza as barras de progresso durante os 3 segundos
      fills.forEach((fill) => {
        const targetPercent = parseFloat(fill.getAttribute('data-target-width') || '0');
        const currentWidth = (targetPercent * easeProgress).toFixed(2);
        fill.style.width = `${currentWidth}%`;
      });

      // 2. Atualiza os contadores de valores em R$ durante os 3 segundos
      valElements.forEach((el) => {
        const targetVal = parseInt(el.getAttribute('data-target') || '0', 10);
        const isPlus = el.getAttribute('data-is-plus') === 'true';
        const currentVal = Math.floor(targetVal * easeProgress);

        const isComplete = progress >= 0.98;
        const formatted = `R$ ${currentVal.toLocaleString('pt-BR')}${isPlus && isComplete ? '+' : ''} / ano`;
        el.textContent = formatted;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // Ativa a animação de 3 segundos quando a seção de salários entra na tela
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        start3SecondAnimation();
      }
    });
  }, { threshold: 0.15 });

  observer.observe(salarySection);
}

/* ============================================================================
   8. TRILHAS VIDEO SCRUBBING ENGINE
   ============================================================================ */
function initVideoScrubAndCardFocus() {
  const canvas = document.querySelector('#scrub-canvas') || document.querySelector('.trilhas-right canvas') || document.querySelector('.masked-video-container canvas');
  const section = document.querySelector('#trilhas-section') || document.querySelector('#trilhas');

  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');
  const totalFrames = 40;
  const images = [];
  let loadedCount = 0;
  let currentFrameIndex = 0;
  let isTicking = false;

  // Redimensiona o canvas dinamicamente mantendo nitidez em telas Retina/HighDPI
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      renderFrame(currentFrameIndex);
    }
  }

  // Pré-carrega todos os 40 frames da pasta img/ em memória
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(3, '0');
    img.src = `img/ezgif-frame-${frameNum}.jpg`;
    img.onload = () => {
      loadedCount++;
      if (currentFrameIndex === 0 && (i === 1 || loadedCount === 1)) {
        renderFrame(0);
      }
    };
    images.push(img);
  }

  // Desenha a imagem contida no canvas proporcionalmente sem cortes ou dimensões gigantes
  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let renderW, renderH, x, y;

    if (canvasRatio > imgRatio) {
      renderH = ch;
      renderW = ch * imgRatio;
      x = (cw - renderW) / 2;
      y = 0;
    } else {
      renderW = cw;
      renderH = cw / imgRatio;
      x = 0;
      y = (ch - renderH) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, renderW, renderH);
  }

  const updateScrub = () => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight - window.innerHeight;
    if (sectionHeight <= 0) {
      isTicking = false;
      return;
    }

    const scrollTop = -rect.top;
    const progress = Math.min(Math.max(scrollTop / sectionHeight, 0), 1);

    const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      renderFrame(currentFrameIndex);
    } else if (loadedCount > 0) {
      renderFrame(currentFrameIndex);
    }

    // Atualiza o estado verde (active-focus) de cada card conforme ele sobe
    const cards = section.querySelectorAll('.trilha-stack-item, .learn');
    cards.forEach((card, i) => {
      const cardRect = card.getBoundingClientRect();
      const stickyTop = 125 + i * 18;
      if (cardRect.top <= stickyTop + 35) {
        card.classList.add('active-focus');
      } else {
        card.classList.remove('active-focus');
      }
    });

    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      requestAnimationFrame(updateScrub);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    onScroll();
  }, { passive: true });

  resizeCanvas();
  onScroll();
}

/* ============================================================================
   9. FIXED BOTTOM NOTIFICATION BANNER
   ============================================================================ */
function initBottomBanner() {
  const banner = document.getElementById('bottom-banner') || document.querySelector('.bottom-banner');
  if (!banner) return;

  const handleScroll = () => {
    if (window.scrollY > 300) {
      banner.classList.add('visible');
    } else {
      banner.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ============================================================================
   10. AUTO-CLONE PARA MARQUEE INFINITO SEM DUPLICAR HTML
   ============================================================================ */
function initInfiniteMarquees() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    if (track.dataset.cloned) return;
    track.innerHTML += track.innerHTML; // duplica conteúdo
    track.dataset.cloned = "true";
  });
}




