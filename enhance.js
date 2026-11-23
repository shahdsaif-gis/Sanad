/* =====================================================================
   Sanad — interaction layer (no dependencies)
   Purely additive: reads the DOM that script.js renders, never changes
   its state or logic. Safe to delete — the site works without it.
   ===================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- scroll: progress bar, nav state, light parallax ---------- */
  const bar = $('.progress i');
  const nav = $('.nav');
  const parallax = reduce ? [] : [
    ...$$('.blob').map((el, i) => [el, [-0.05, -0.1, -0.03][i] || -0.05]),
    ...$$('.chip').map((el, i) => [el, [0.05, 0.09, 0.03][i] || 0.05])
  ];
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = root.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (nav) nav.classList.toggle('scrolled', y > 12);
      parallax.forEach(([el, k]) => { el.style.translate = `0 ${(y * k).toFixed(1)}px`; });
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- reveal on scroll (headings, groups, tiles, map, footer) ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    const arm = (el, i = 0) => {
      if (el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', i * 45 + 'ms');
      io.observe(el);
    };
    $$('.section-head, .group, .loc-bar, .map-wrap, .footer').forEach(el => arm(el));

    // tiles are re-rendered by script.js (language switch / clear), so watch them
    $$('.tiles').forEach(box => {
      const armTiles = () => $$('.tile', box).forEach((t, i) => arm(t, i % 8));
      armTiles();
      new MutationObserver(armTiles).observe(box, { childList: true });
    });
  }

  // stagger index for hospital cards (the CSS animation uses --i)
  const list = $('#list');
  if (list) {
    new MutationObserver(() => {
      $$('.hcard', list).forEach((c, i) => c.style.setProperty('--i', Math.min(i, 8)));
    }).observe(list, { childList: true });
  }

  /* ---------- press feedback: ripple ---------- */
  if (!reduce) {
    document.addEventListener('pointerdown', e => {
      const el = e.target.closest('.btn, .tile, .pill, .sos');
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const s = Math.max(r.width, r.height) * 2;
      const d = document.createElement('span');
      d.className = 'ripple';
      d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      el.appendChild(d);
      d.addEventListener('animationend', () => d.remove());
    });
  }

  /* ---------- pointer effects (mouse/trackpad only) ---------- */
  if (fine && !reduce) {
    // 3D tilt + cursor glow on tiles and the hero arch
    const TILT = { tile: 7, arch: 8 };
    document.addEventListener('pointermove', e => {
      const el = e.target.closest('.tile, .arch');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const max = el.classList.contains('arch') ? TILT.arch : TILT.tile;
      el.style.setProperty('--rx', ((0.5 - py) * max).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * max).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const el = e.target.closest('.tile, .arch');
      if (el && !el.contains(e.relatedTarget)) {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      }
    });

    // light magnetic pull on the primary calls to action
    $$('.hero-cta .btn, .nav .sos').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- hero: a few drifting crosses behind the route ---------- */
  const hv = $('.hero-visual');
  if (hv && !reduce) {
    [[8, 12, 9, 0], [86, 22, 11, -3], [14, 66, 10, -5], [92, 70, 12, -2], [48, 4, 8, -6], [4, 40, 13, -4]]
      .forEach(([x, y, t, dl]) => {
        const s = document.createElement('i');
        s.className = 'spark';
        s.setAttribute('aria-hidden', 'true');
        s.style.cssText = `--x:${x}%;--y:${y}%;--t:${t}s;--dl:${dl}s`;
        hv.prepend(s);
      });
    // SMIL motion can't be paused by CSS, so respect reduced motion here too
  } else if (reduce) {
    $$('animateMotion').forEach(a => a.remove());
  }

  /* ---------- stats: real numbers from the data, counted up on view ---------- */
  const stats = $('#stats');
  if (stats && Array.isArray(window.HOSPITALS)) {
    const vals = {
      hospitals: HOSPITALS.length,
      localities: new Set(HOSPITALS.map(h => h.locality_en).filter(Boolean)).size,
      services: $$('.tile').length || 18
    };
    const LABEL = {
      ar: { hospitals: 'مستشفى في ولاية الخرطوم', localities: 'محليات مغطّاة', services: 'خدمة يمكنك البحث عنها' },
      en: { hospitals: 'Hospitals across Khartoum State', localities: 'Localities covered', services: 'Services you can search' }
    };
    const fmt = n => Math.round(n).toLocaleString(root.lang === 'ar' ? 'ar-EG' : 'en-US');
    let counted = false;

    const paint = () => {
      const L = LABEL[root.lang === 'ar' ? 'ar' : 'en'];
      $$('[data-stat]', stats).forEach(el => {
        const k = el.dataset.stat;
        $('small', el).textContent = L[k];
        $('b', el).textContent = fmt(counted ? vals[k] : 0);
      });
    };
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['lang'] });

    const run = () => {
      if (reduce) { counted = true; paint(); return; }
      const t0 = performance.now(), dur = 1200;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        $$('[data-stat]', stats).forEach(el => { $('b', el).textContent = fmt(vals[el.dataset.stat] * e); });
        if (p < 1) requestAnimationFrame(step); else { counted = true; paint(); }
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { o.disconnect(); run(); }
      }, { threshold: 0.4 });
      o.observe(stats);
    } else run();
  }

  /* ---------- ambulance dialog: focus management ---------- */
  const modal = $('#sosModal');
  if (modal) {
    let last = null;
    const focusables = () => $$('button:not(:disabled), a[href]', modal).filter(el => el.offsetParent !== null);
    new MutationObserver(() => {
      if (!modal.classList.contains('hidden')) {
        last = document.activeElement;
        setTimeout(() => (focusables()[0] || modal).focus(), 60);
      } else if (last) { last.focus && last.focus(); last = null; }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });

    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }
})();
