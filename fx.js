/* =====================================================================
   FX layer — loader, reveal, parallax, tilt, magnetic buttons, ripple,
   particles, count-up, scroll progress, toasts.  Plain JS, no libraries.
   Exposes window.FX = { toast, onLang }
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const lang = () => root.lang || 'ar';
  const fmt = n => n.toLocaleString(lang() === 'ar' ? 'ar-EG' : 'en');

  /* ---------- Toasts ---------- */
  const TOAST_ICON = {
    success: '<path d="M20 6 9 17l-5-5"/>',
    error: '<path d="M12 8v5"/><path d="M12 17h.01"/>',
    info: '<path d="M12 8h.01"/><path d="M11 12h1v5h1"/>'
  };
  function toast(msg, type = 'info', ms = 3400) {
    const box = $('#toasts'); if (!box || !msg) return;
    if ($$('.toast', box).some(t => t.dataset.msg === msg)) return;   // de-duplicate
    const el = document.createElement('div');
    el.className = 'toast ' + type; el.dataset.msg = msg; el.setAttribute('role', 'status');
    el.innerHTML = `<span class="ti"><svg viewBox="0 0 24 24">${TOAST_ICON[type] || TOAST_ICON.info}</svg></span><span></span>`;
    el.lastChild.textContent = msg;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, ms);
  }

  /* ---------- Hero headline: staggered words ---------- */
  function splitHero() {
    let n = 0;
    $$('.h1a,.h1b').forEach(el => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="w"><span style="--i:${n++}"></span></span>`).join(' ');
      $$('.w>span', el).forEach((s, i) => { s.textContent = words[i]; });
    });
  }

  /* ---------- Count-up ---------- */
  function setCounts(animate) {
    $$('[data-count]').forEach(el => {
      const to = +el.dataset.count;
      if (!animate || reduced) { el.textContent = fmt(to); el.dataset.done = '1'; return; }
      const t0 = performance.now(), dur = 1400;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * e));
        if (p < 1) requestAnimationFrame(step); else el.dataset.done = '1';
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduced) { items.forEach(i => i.classList.add('in', 'settled')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.classList.contains('tiles')) setTimeout(() => e.target.classList.add('settled'), 1500);
      io.unobserve(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ---------- Scroll: progress, nav, parallax ---------- */
  const mouse = { x: 0, y: 0 };
  let ticking = false;
  function onScrollFrame() {
    ticking = false;
    const sy = window.scrollY, h = root.scrollHeight - innerHeight;
    $('#progress').style.transform = `scaleX(${h > 0 ? Math.min(1, sy / h) : 0})`;
    $('.nav').classList.toggle('scrolled', sy > 24);
    if (reduced) return;
    $$('[data-depth],[data-scroll]').forEach(el => {
      const d = parseFloat(el.dataset.depth || 0), s = parseFloat(el.dataset.scroll || 0);
      el.style.translate = `${(mouse.x * d * 14).toFixed(1)}px ${(mouse.y * d * 10 + sy * s).toFixed(1)}px`;
    });
  }
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); } };

  /* ---------- Pointer: tilt, glow, magnetic, parallax ---------- */
  let last = null, pending = null;
  function resetEl(el) { if (el) { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); } }
  function onPointerMove(e) {
    pending = e;
    if (onPointerMove.raf) return;
    onPointerMove.raf = requestAnimationFrame(() => {
      onPointerMove.raf = 0; const ev = pending; if (!ev) return;
      // hero parallax
      mouse.x = (ev.clientX / innerWidth - .5) * 2; mouse.y = (ev.clientY / innerHeight - .5) * 2;
      if (window.scrollY < innerHeight * 1.2) requestFrame();
      // card glow + tilt
      const card = ev.target.closest && ev.target.closest('.tile,.hcard,.arch');
      if (last && last !== card) resetEl(last);
      if (card) {
        const r = card.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
        card.style.setProperty('--gx', x + 'px'); card.style.setProperty('--gy', y + 'px');
        if (!card.classList.contains('hcard')) {
          const k = card.classList.contains('arch') ? 8 : 10;
          card.style.setProperty('--ry', ((x / r.width - .5) * k).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (-(y / r.height - .5) * k).toFixed(2) + 'deg');
        }
      }
      last = card;
      // magnetic buttons
      $$('.mag-on').forEach(m => { if (m !== ev.target.closest('.mag')) { m.style.translate = ''; m.classList.remove('mag-on'); } });
      const mag = ev.target.closest && ev.target.closest('.mag');
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.translate = `${((ev.clientX - (r.left + r.width / 2)) * .22).toFixed(1)}px ${((ev.clientY - (r.top + r.height / 2)) * .3).toFixed(1)}px`;
        mag.classList.add('mag-on');
      }
    });
  }
  function onPointerLeaveDoc() { resetEl(last); last = null; $$('.mag-on').forEach(m => { m.style.translate = ''; m.classList.remove('mag-on'); }); mouse.x = mouse.y = 0; requestFrame(); }

  /* ---------- Ripple ---------- */
  function onPointerDown(e) {
    const el = e.target.closest('.btn,.pill,.tile'); if (!el || el.disabled || reduced) return;
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
    const sp = document.createElement('span');
    sp.className = 'ripple';
    sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    el.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
  }

  /* ---------- Particles ---------- */
  function initParticles() {
    const c = $('#fx-canvas'); if (!c || reduced) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, pts = [], raf = 0;
    function resize() {
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(44, W * H / 34000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: 1 + Math.random() * 1.8 }));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        ctx.fillStyle = 'rgba(38,101,140,.28)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 14400) {
            ctx.strokeStyle = `rgba(38,101,140,${(0.14 * (1 - d2 / 14400)).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    resize(); frame();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) frame(); });
  }

  /* ---------- Boot ---------- */
  let booted = false;
  function reveal() {
    if (booted) return; booted = true;
    const ld = $('#loader'); if (ld) { ld.classList.add('hide'); setTimeout(() => ld.remove(), 800); }
    root.classList.add('hero-ready');
    setTimeout(() => setCounts(true), 700);
  }
  function init() {
    // data-driven number
    const cnt = $('#cntH'); if (cnt && window.HOSPITALS) cnt.dataset.count = window.HOSPITALS.length;
    $$('.btn.primary,.btn.sosbtn,.pill,.sos').forEach(b => b.classList.add('mag'));
    splitHero(); setCounts(false); initReveal(); initParticles();
    addEventListener('scroll', requestFrame, { passive: true });
    addEventListener('resize', requestFrame);
    if (finePointer && !reduced) {
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeaveDoc);
    }
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    requestFrame();

    const t0 = performance.now(), minMs = 700;
    const go = () => setTimeout(reveal, Math.max(0, minMs - (performance.now() - t0)));
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
    setTimeout(reveal, 2500);  // safety net if a font/CDN is slow
    if (reduced) reveal();
  }

  window.FX = {
    toast,
    onLang() { if (!root.classList.contains('js')) return; splitHero(); setCounts(false); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
