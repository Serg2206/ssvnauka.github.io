/* ═══════════════════════════════════════════════════════════
   ssvnauka.com · Phase 1 · Animation Engine
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ──────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'p1-scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }

  /* ── 2. NAV SHADOW ON SCROLL ─────────────────────────────── */
  const nav = document.querySelector('nav');
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('p1-nav-scrolled');
    else nav.classList.remove('p1-nav-scrolled');
  }

  /* ── 3. AUTO-DETECT REVEAL ELEMENTS ─────────────────────── */
  // Elements that get fade-up reveal
  const REVEAL_SELECTORS = [
    '.section-label',
    '.section-chip',
    '.section-title',
    '.section-lead',
    '.section-sub',
    '.stoma-block',
    '.stoma-note',
    '.sci-wrap',
    '.tour-wrap',
    '.acad-intl',
    '.ai-hero-banner',
    '.ai-workflow',
    '.type-demo',
    'section > .container > p',
    '.ba-grid',
    '.cta-section h2',
    '.cta-section p',
  ].join(',');

  // Card grids — children get staggered
  const CARD_GRID_SELECTORS = [
    '.prob-grid',
    '.pillars',
    '.clin-grid',
    '.plan-cards',
    '.formats',
    '.tech-grid',
    '.roi-grid',
    '.wire-grid',
    '.phases',
    '.sci-grid',
    '.acad-grid',
    '.ai-cards',
    '.tour-steps',
    '.tour-services',
    '.anim-grid',
    '.feat-grid',
    '.cover-meta',
    '.creds-row',
    '.hero-demo-stats',
    '.faq-list',
    '.cta-contacts',
    '.palette-grid',
  ].join(',');

  // Scale-in elements
  const SCALE_SELECTORS = [
    '.stoma-stage-n',
    '.ts-num',
    '.tl-dot',
    '.acad-stat-n',
    '.stat-n',
  ].join(',');

  function initReveal() {
    // Single elements — fade up
    document.querySelectorAll(REVEAL_SELECTORS).forEach(el => {
      if (!el.closest('.p1-reveal') && !el.classList.contains('p1-reveal')) {
        el.classList.add('p1-reveal');
      }
    });

    // Card grids — stagger children
    document.querySelectorAll(CARD_GRID_SELECTORS).forEach(grid => {
      const children = Array.from(grid.children).filter(c => !c.classList.contains('p1-reveal'));
      children.forEach((child, i) => {
        child.classList.add('p1-reveal');
        if (i < 6) child.classList.add('p1-d' + (i + 1));
      });
    });

    // Scale elements
    document.querySelectorAll(SCALE_SELECTORS).forEach(el => {
      el.classList.add('p1-scale');
    });

    // FAQ items — slide from left
    document.querySelectorAll('.faq-item').forEach((el, i) => {
      el.classList.remove('p1-reveal');
      el.classList.add('p1-slide-left');
      if (i < 6) el.classList.add('p1-d' + Math.min(i + 1, 6));
    });

    // Add hover enhancement to cards
    const HOVER_SELECTORS = [
      '.proc-card', '.clin-card', '.plan-card', '.format-card',
      '.tech-card', '.roi-card', '.wire-card', '.acad-card',
      '.ai-card', '.feat-card', '.tour-step', '.sci-item',
      '.pillar', '.phase', '.acad-visual-card',
    ].join(',');

    document.querySelectorAll(HOVER_SELECTORS).forEach(el => {
      el.classList.add('p1-hover');
    });

    // Ripple on CTA buttons
    document.querySelectorAll('.nav-cta, .btn-gold, .btn-primary, [href*="appointment"], [href*="записаться"]').forEach(btn => {
      btn.classList.add('p1-ripple');
      btn.addEventListener('click', function(e) {
        const wave = document.createElement('span');
        wave.className = 'p1-ripple-wave';
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
        this.appendChild(wave);
        setTimeout(() => wave.remove(), 600);
      });
    });
  }

  /* ── 4. INTERSECTION OBSERVER ────────────────────────────── */
  function initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('p1-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.p1-reveal, .p1-fade, .p1-scale, .p1-slide-left').forEach(el => {
      observer.observe(el);
    });
  }

  /* ── 5. ANIMATED COUNTERS ────────────────────────────────── */
  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    // Patterns to detect numeric stat elements
    // We look for: text like "121", "18", "40+", "h=6", "6" in known parent contexts
    const statPatterns = [
      { pattern: /^(\d+)\+?$/, suffix: el => el.textContent.includes('+') ? '+' : '' },
      { pattern: /^h=(\d+)$/, suffix: () => '', prefix: 'h=' },
      { pattern: /^(\d+(?:\.\d+)?)$/, suffix: () => '' },
    ];

    // Target elements in credential badges, hero stats, cover meta
    const counterContainers = [
      '.cred', '.hds-item .n', '.cover-meta-item .n',
      '.stat-n', '.acad-stat-n', '.roi-n',
    ].join(',');

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.p1Counted) return;
        el.dataset.p1Counted = '1';

        const txt = el.textContent.trim();

        // Match "121", "18", "40+", "h=6", "×3"
        let numMatch, suffix = '', prefix = '';

        if (/^(\d+)\+$/.test(txt)) {
          numMatch = parseInt(txt); suffix = '+';
        } else if (/^(\d+)$/.test(txt)) {
          numMatch = parseInt(txt);
        } else if (/^h=(\d+)$/.test(txt)) {
          numMatch = parseInt(txt.slice(2)); prefix = 'h=';
        } else if (/^×(\d+)$/.test(txt)) {
          numMatch = parseInt(txt.slice(1)); prefix = '×';
        } else if (/^\+(\d+)%$/.test(txt)) {
          numMatch = parseInt(txt.slice(1, -1)); prefix = '+'; suffix = '%';
        }

        if (numMatch && numMatch > 1) {
          el.textContent = prefix + '0' + suffix;
          animateCount({ textContent: '' , set content(v){ el.textContent = prefix + v + suffix; } },
            numMatch, '', 1600);
        }

        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(counterContainers).forEach(el => {
      counterObserver.observe(el);
    });
  }

  /* ── 6. TELEGRAM FLOATING BUTTON ─────────────────────────── */
  function createTelegramBtn() {
    const btn = document.createElement('a');
    btn.href = 'https://t.me/SSVPROFF_MEDICAL';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.className = 'p1-tg-btn';
    btn.setAttribute('aria-label', 'Написать в Telegram');
    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.686l-1.686 7.946c-.125.558-.46.693-.931.43l-2.573-1.896-1.243 1.196c-.137.137-.252.252-.517.252l.185-2.622 4.772-4.311c.207-.185-.045-.288-.32-.103L7.38 13.6l-2.545-.796c-.553-.172-.564-.553.116-.82l9.93-3.83c.46-.168.863.103.714.82l-.665-.288z" fill="white"/>
      </svg>
      <span class="p1-tg-tip">Написать профессору</span>
    `;
    document.body.appendChild(btn);

    // Animate in after short delay
    setTimeout(() => { btn.style.opacity = '0'; btn.style.transition = 'opacity .5s'; btn.style.opacity = '1'; }, 800);
  }

  /* ── 7. STICKY APPOINTMENT BAR ───────────────────────────── */
  function createStickyBar() {
    const bar = document.createElement('div');
    bar.className = 'p1-sticky-bar';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Запись к профессору');
    bar.innerHTML = `
      <span class="p1-bar-text">🏥 МЦ MARIA · Проф. Сушков С.В. · <strong>Консультация 2000 грн</strong></span>
      <a class="p1-bar-btn gold" href="tel:+380675707949">📞 Позвонить</a>
      <a class="p1-bar-btn" href="https://t.me/SSVPROFF_MEDICAL" target="_blank" rel="noopener">✈️ Telegram</a>
      <a class="p1-bar-btn" href="mailto:ssvproff@gmail.com">📧 Email</a>
      <button class="p1-bar-close" aria-label="Закрыть">✕</button>
    `;
    document.body.appendChild(bar);

    // Detect existing footer CTA area — hide bar near footer
    let barDismissed = false;
    const footer = document.querySelector('footer');

    bar.querySelector('.p1-bar-close').addEventListener('click', () => {
      barDismissed = true;
      bar.classList.remove('p1-bar-visible');
      document.body.classList.remove('p1-bar-active');
      // Restore after 15 min
      setTimeout(() => { barDismissed = false; }, 15 * 60 * 1000);
    });

    function updateBar() {
      if (barDismissed) return;
      const scrollY = window.scrollY;
      const scrolled = scrollY > 420;

      // Hide when near footer
      let nearFooter = false;
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        nearFooter = footerTop < window.innerHeight + 20;
      }

      if (scrolled && !nearFooter) {
        bar.classList.add('p1-bar-visible');
        document.body.classList.add('p1-bar-active');
      } else {
        bar.classList.remove('p1-bar-visible');
        document.body.classList.remove('p1-bar-active');
      }
    }

    return updateBar;
  }

  /* ── 8. SMOOTH SECTION ENTRY (hero) ──────────────────────── */
  function enhanceHero() {
    const hero = document.querySelector('.hero, .cover');
    if (!hero) return;
    // Ensure content is visible on load
    hero.querySelectorAll('*').forEach(el => {
      el.style.opacity = el.style.opacity || '';
    });
  }

  /* ── 9. SCROLL EVENT (throttled) ─────────────────────────── */
  let ticking = false;
  let updateBarFn = null;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateNav();
      if (updateBarFn) updateBarFn();
      ticking = false;
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    enhanceHero();
    initReveal();
    initObserver();
    initCounters();
    createTelegramBtn();
    updateBarFn = createStickyBar();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial state
    updateProgress();
    updateNav();
    if (updateBarFn) updateBarFn();

    // Re-run observer for dynamically visible items
    setTimeout(() => {
      document.querySelectorAll('.p1-reveal:not(.p1-in), .p1-fade:not(.p1-in), .p1-scale:not(.p1-in), .p1-slide-left:not(.p1-in)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) el.classList.add('p1-in');
      });
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
