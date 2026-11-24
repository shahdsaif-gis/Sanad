/* =====================================================================
   Sanad — homepage logic
   ===================================================================== */
(() => {
  'use strict';

  // ---- Config ----
  const EMERGENCY_NUMBER = '';   // put the ambulance number here to show a "Call" button
  const AVG_SPEED_KMH = 30;      // used only for rough estimates
  const PAGE_SIZE = 8;           // hospitals shown before "show more"

  // ---- Icons (inline SVG, stroke style) ----
  const ICONS = {
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    drops: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
    venus: '<circle cx="12" cy="8" r="5"/><path d="M12 13v8"/><path d="M9 18h6"/>',
    steth: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
    bone: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
    brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>',
    kidney: '<path d="M15 3C19 3 21 6 21 10c0 5-3 11-8 11-3.5 0-5-2.5-4-5 .7-1.7 2-2 2-4 0-1.5-1.5-2-2-3.5C7 5.5 9.5 3 15 3Z"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    ribbon: '<path d="M12 11C8 8 8 3 12 3s4 5 0 8Z"/><path d="M12 11 8 21"/><path d="M12 11l4 10"/>',
    tooth: '<path d="M7 3c-2 0-4 1.5-4 4.5 0 3 1.5 4.5 2 7 .4 2 .7 6.5 2.5 6.5 1.5 0 1.5-4 2.5-4s1 4 2.5 4c1.8 0 2.1-4.5 2.5-6.5.5-2.5 2-4 2-7C19 4.5 17 3 15 3c-1.2 0-2 .6-3 .6S8.2 3 7 3Z"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    ambulance: '<path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  const icon = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  // ---- Translations ----
  const T = {
    ar: {
      brand: 'سَنَد', nav_find: 'ابحث عن رعاية', sos: 'طلب إسعاف',
      hero_tag: 'أسرع طريق للرعاية',
      hero_h1a: 'اختر المشكلة..', hero_h1b: 'ونوصّلك لأقرب مستشفى جاهز',
      hero_p: 'حدّد ما يحتاجه المريض ونوريك أقرب مستشفى متوفرة فيه الخدمة، مع الطريق إليه مباشرة.',
      hero_cta: 'ابدأ الآن',
      chip1_t: 'مستشفى', chip1_s: 'في ٧ محليات',
      chip2_t: 'الخدمة متوفرة', chip2_s: 'قبل ما تتحرك',
      chip3_t: 'مسار مباشر', chip3_s: 'من موقعك',
      step1: 'الخطوة ١', step2: 'الخطوة ٢',
      need_title: 'ما الذي يحتاجه المريض؟', need_sub: 'اختر واحداً أو أكثر',
      group_urgent: 'احتياج عاجل', group_spec: 'تخصص أو مرض', group_diag: 'فحوصات وتصوير',
      none_sel: 'لم تختر شيئاً بعد', n_sel: 'تم اختيار {n}', clear: 'مسح', find: 'ابحث عن أقرب مستشفى',
      res_title: 'أقرب مستشفى متوفر فيه ما تحتاجه',
      loc_getting: 'جارٍ تحديد موقعك...', loc_ok: 'تم تحديد موقعك', loc_fail: 'ما قدرنا نحدد موقعك تلقائياً — اختر منطقتك:',
      loc_change: 'تغيير الموقع', loc_area: 'موقعك: {a}',
      full: '✓ كل ما تحتاجه متوفر', partial: 'متوفر {a} من {b}',
      km: 'كم', min: 'دقيقة', route_btn: 'المسار', call: 'اتصال', open_maps: 'افتح في الخرائط',
      est: 'تقدير تقريبي — المسار غير متاح الآن', loading_route: 'جارٍ رسم المسار...', none: 'ما في مستشفى فيها هذه الخدمة حالياً',
      more: 'عرض المزيد ({n})', less: 'عرض أقل',
      toast_loc: 'تم تحديد موقعك', toast_loc_fail: 'تعذّر تحديد الموقع — اختر منطقتك',
      toast_route: 'تعذّر رسم الطريق — عرضنا خطاً تقريبياً', toast_sos: 'تم إرسال طلب الإسعاف',
      det: 'التفاصيل', d_spec: 'التخصصات', d_doc: 'الأطباء', d_tests: 'الفحوصات', d_dev: 'الأجهزة', d_social: 'التواصل',
      foot_warn: 'في الحالات الحرجة اطلب الإسعاف فوراً.',
      sos_title: 'طلب إسعاف', sos_sub: 'سنرسل موقعك لأقرب إسعاف متاح.', sos_confirm: 'تأكيد الطلب', cancel: 'إلغاء', close: 'إغلاق',
      sos_sent: 'تم إرسال الطلب',
      sos_eta: 'أقرب إسعاف من {h} — الوصول المتوقع خلال حوالي {m} دقيقة.',
      sos_demo: 'نسخة تجريبية: لا يتم إرسال طلب حقيقي.', sos_call: 'اتصل: {n}'
    },
    en: {
      brand: 'Sanad', nav_find: 'Find care', sos: 'Ambulance',
      hero_tag: 'The fastest way to care',
      hero_h1a: 'Pick the problem.', hero_h1b: 'We find the nearest ready hospital.',
      hero_p: 'Choose what the patient needs and we show the nearest hospital that has it, with the route straight there.',
      hero_cta: 'Start now',
      chip1_t: 'hospitals', chip1_s: 'across 7 localities',
      chip2_t: 'Service available', chip2_s: 'before you leave',
      chip3_t: 'Direct route', chip3_s: 'from your location',
      step1: 'Step 1', step2: 'Step 2',
      need_title: 'What does the patient need?', need_sub: 'Choose one or more',
      group_urgent: 'Urgent need', group_spec: 'Specialty or condition', group_diag: 'Tests & imaging',
      none_sel: 'Nothing selected yet', n_sel: '{n} selected', clear: 'Clear', find: 'Find nearest hospital',
      res_title: 'Nearest hospital with what you need',
      loc_getting: 'Finding your location...', loc_ok: 'Location found', loc_fail: "Couldn't get your location — pick your area:",
      loc_change: 'Change location', loc_area: 'Your location: {a}',
      full: '✓ Everything you need is available', partial: '{a} of {b} available',
      km: 'km', min: 'min', route_btn: 'Route', call: 'Call', open_maps: 'Open in Maps',
      est: 'Rough estimate — route unavailable right now', loading_route: 'Drawing route...', none: 'No hospital lists this service right now',
      more: 'Show more ({n})', less: 'Show less',
      toast_loc: 'Location found', toast_loc_fail: "Couldn't get your location — pick your area",
      toast_route: "Couldn't draw the road — showing a rough line", toast_sos: 'Ambulance request sent',
      det: 'Details', d_spec: 'Specialties', d_doc: 'Doctors', d_tests: 'Tests', d_dev: 'Equipment', d_social: 'Contact',
      foot_warn: 'In a critical emergency, request an ambulance immediately.',
      sos_title: 'Request ambulance', sos_sub: 'We will send your location to the nearest available ambulance.', sos_confirm: 'Confirm request', cancel: 'Cancel', close: 'Close',
      sos_sent: 'Request sent',
      sos_eta: 'Nearest ambulance from {h} — estimated arrival in about {m} min.',
      sos_demo: 'Demo version: no real request is sent.', sos_call: 'Call: {n}'
    }
  };

  // ---- Services (tap tiles) ----
  const SERVICES = [
    { id: 'oxygen',    g: 'urgent', ic: 'wind',     ar: 'أوكسجين وتنفس صناعي', en: 'Oxygen & ventilators' },
    { id: 'icu',       g: 'urgent', ic: 'activity', ar: 'عناية مكثفة',          en: 'Intensive care' },
    { id: 'emergency', g: 'urgent', ic: 'siren',    ar: 'طوارئ وحوادث',         en: 'Emergency & trauma' },
    { id: 'blood',     g: 'urgent', ic: 'drop',     ar: 'بنك دم',               en: 'Blood bank' },
    { id: 'dialysis',  g: 'urgent', ic: 'drops',    ar: 'غسيل كلى',             en: 'Dialysis' },

    { id: 'cardiac',    g: 'spec', ic: 'heart',    ar: 'قلب',                   en: 'Heart' },
    { id: 'pediatrics', g: 'spec', ic: 'baby',     ar: 'أطفال',                 en: 'Children' },
    { id: 'maternity',  g: 'spec', ic: 'venus',    ar: 'نساء وتوليد',           en: 'Women & maternity' },
    { id: 'internal',   g: 'spec', ic: 'steth',    ar: 'باطنية',                en: 'Internal medicine' },
    { id: 'surgery',    g: 'spec', ic: 'scissors', ar: 'جراحة',                 en: 'Surgery' },
    { id: 'ortho',      g: 'spec', ic: 'bone',     ar: 'عظام وكسور',            en: 'Bones & fractures' },
    { id: 'neuro',      g: 'spec', ic: 'brain',    ar: 'مخ وأعصاب',             en: 'Brain & nerves' },
    { id: 'kidney',     g: 'spec', ic: 'kidney',   ar: 'كلى ومسالك بولية',      en: 'Kidney & urology' },
    { id: 'eye',        g: 'spec', ic: 'eye',      ar: 'عيون',                  en: 'Eyes' },
    { id: 'oncology',   g: 'spec', ic: 'ribbon',   ar: 'أورام',                 en: 'Oncology' },
    { id: 'dental',     g: 'spec', ic: 'tooth',    ar: 'أسنان',                 en: 'Dental' },

    { id: 'lab',     g: 'diag', ic: 'flask', ar: 'مختبر وتحاليل',    en: 'Lab tests' },
    { id: 'imaging', g: 'diag', ic: 'scan',  ar: 'أشعة مقطعية ورنين', en: 'CT & MRI' }
  ];

  // Fallback areas if GPS is unavailable (approximate centers — adjust later)
  const AREAS = [
    { ar: 'الخرطوم',    en: 'Khartoum',     lat: 15.5007, lng: 32.5599 },
    { ar: 'أم درمان',   en: 'Omdurman',     lat: 15.6445, lng: 32.4777 },
    { ar: 'بحري',       en: 'Bahri',        lat: 15.6389, lng: 32.5300 },
    { ar: 'شرق النيل',  en: 'Sharq El Nil', lat: 15.5900, lng: 32.6300 },
    { ar: 'جبل أولياء', en: 'Jebel Awlia',  lat: 15.2433, lng: 32.4967 },
    { ar: 'كرري',       en: 'Karari',       lat: 15.7300, lng: 32.4800 },
    { ar: 'أمبدة',      en: 'Umbada',       lat: 15.6700, lng: 32.4200 }
  ];

  // ---- State ----
  const $ = (s, r = document) => r.querySelector(s);
  const state = {
    lang: localStorage.getItem('lang') || 'ar',
    selected: new Set(),
    loc: null,            // {lat,lng,areaIdx|null}
    resultsOpen: false,
    rows: [],
    showAll: false,
    activeId: null,
    locFailed: false
  };
  let map, userMarker, hospMarkers = {}, routeLayers = [], routeToken = 0;

  const t = (k, v = {}) => (T[state.lang][k] ?? k).replace(/\{(\w+)\}/g, (_, n) => v[n] ?? '');
  const svcLabel = id => SERVICES.find(s => s.id === id)[state.lang];
  const hName = h => h['name_' + state.lang];
  const hArea = h => h['area_' + state.lang];

  const haversine = (a, b) => {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  // ---- Toast (visual feedback) ----
  function toast(msg, type = 'ok') {   // rendered by fx.js
    if (window.FX) window.FX.toast(msg, type === 'ok' ? 'success' : type === 'error' ? 'error' : 'info');
  }
  const skeleton = () => Array.from({ length: 3 }, () =>
    '<div class="glass skel-card"><div class="skel w80"></div><div class="skel w40"></div><div class="skel w60"></div></div>').join('');

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- i18n ----
  function applyI18n() {
    const l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.title = l === 'ar' ? 'سَنَد | الوصول السريع للرعاية الصحية' : 'Sanad | Fast access to healthcare';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('#langBtn').textContent = l === 'ar' ? 'EN' : 'عربي';
    renderTiles(); renderSummary(); renderLocStatus();
    renderAreaChips($('#localityBox'), pickArea);
    renderAreaChips($('#sosLoc'), pickArea);
    if (state.resultsOpen) { renderList(); renderMarkers(); if (state.activeId) drawRoute(state.activeId, true); }
    if (!$('#sosStep2').classList.contains('hidden')) showSosResult();
    window.FX && window.FX.onLang();   // fx.js: re-split headline words, refresh counters
  }
  const hydrateIcons = () => document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  // ---- Tiles ----
  function renderTiles() {
    ['urgent', 'spec', 'diag'].forEach(g => {
      const box = $('#tiles-' + g);
      box.innerHTML = '';
      SERVICES.filter(s => s.g === g).forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tile'; b.dataset.id = s.id;
        b.style.setProperty('--i', i);
        b.setAttribute('aria-pressed', state.selected.has(s.id));
        b.innerHTML = `<span class="ico">${icon(s.ic)}</span><span>${s[state.lang]}</span>`;
        b.onclick = () => {
          state.selected.has(s.id) ? state.selected.delete(s.id) : state.selected.add(s.id);
          b.setAttribute('aria-pressed', state.selected.has(s.id));
          renderSummary();
          if (state.resultsOpen && state.loc) refreshResults();
        };
        box.appendChild(b);
      });
    });
  }
  function renderSummary() {
    const n = state.selected.size;
    $('#selectedSummary').textContent = n ? t('n_sel', { n }) : t('none_sel');
    $('#clearBtn').classList.toggle('hidden', !n);
    $('#findBtn').disabled = !n;
  }

  // ---- Location ----
  function geolocate(ok, fail) {
    if (!navigator.geolocation) return fail();
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lng: p.coords.longitude, areaIdx: null }),
      fail,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }
  function renderAreaChips(box, cb) {
    box.innerHTML = '';
    AREAS.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = a[state.lang];
      b.style.setProperty('--i', i);
      b.onclick = () => cb(i);
      box.appendChild(b);
    });
  }
  function pickArea(i) {
    const a = AREAS[i];
    $('#findBtn').classList.remove('loading');
    setLoc({ lat: a.lat, lng: a.lng, areaIdx: i });
    toast(t('loc_area', { a: a[state.lang] }));
    $('#localityBox').classList.add('hidden');
    $('#sosLoc').classList.add('hidden');
  }
  function setLoc(l) {
    state.loc = l;
    $('#findBtn').classList.remove('loading');
    renderLocStatus();
    $('#sosConfirm').disabled = false;
    if (state.resultsOpen) refreshResults();
  }
  function renderLocStatus() {
    const el = $('#locStatus');
    let txt;
    if (state.loc) txt = state.loc.areaIdx !== null ? t('loc_area', { a: AREAS[state.loc.areaIdx][state.lang] }) : t('loc_ok');
    else txt = state.locFailed ? t('loc_fail') : t('loc_getting');
    el.innerHTML = `<span class="i pin">${icon('pin')}</span> ${txt}`;
  }
  function locate() {
    state.locFailed = false; renderLocStatus();
    $('#findBtn').classList.add('loading');
    geolocate(l => { setLoc(l); toast(t('toast_loc')); }, () => {
      $('#findBtn').classList.remove('loading');
      if (state.loc) return;   // user already picked an area manually
      state.locFailed = true; renderLocStatus(); renderList();
      $('#localityBox').classList.remove('hidden');
      toast(t('toast_loc_fail'), 'error');
    });
  }

  // ---- Results ----
  function openResults() {
    state.resultsOpen = true;
    $('#results').classList.remove('hidden');
    initMap();
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => map && map.invalidateSize(), 350);
    if (state.loc) refreshResults(); else { renderList(); locate(); }
  }
  function computeRows() {
    const sel = [...state.selected];
    return HOSPITALS.map(h => {
      const have = sel.filter(s => h.services[s]).length;
      return { h, have, total: sel.length, d: haversine(state.loc, h) };
    })
      .filter(r => r.have > 0)
      .sort((a, b) => ((b.have === b.total) - (a.have === a.total)) || (b.have - a.have) || (a.d - b.d));
  }
  const visibleRows = () => state.showAll ? state.rows : state.rows.slice(0, PAGE_SIZE);

  function refreshResults() {
    state.rows = computeRows();
    if (!state.rows.some(r => r.h.id === state.activeId)) state.activeId = null;
    renderList(); renderMarkers();
    if (state.rows.length) drawRoute(state.activeId || state.rows[0].h.id, true);
    else { clearRoute(); $('#routeInfo').classList.add('hidden'); }
  }
  function renderList() {
    const L = $('#list');
    if (!state.loc) { L.innerHTML = state.locFailed ? '' : skeleton(); return; }
    if (!state.rows.length) { L.innerHTML = `<div class="glass empty">${t('none')}</div>`; return; }
    const sel = [...state.selected];
    const rows = visibleRows();
    L.innerHTML = rows.map((r, i) => {
      const h = r.h, full = r.have === r.total;
      return `
      <article class="hcard glass ${h.id === state.activeId ? 'active' : ''}" data-id="${h.id}" style="--i:${i}">
        <div class="hc-top">
          <span class="rank">${i + 1}</span>
          <div><h4>${esc(hName(h))}</h4><small>${esc(hArea(h))}</small></div>
          <div class="dist">≈ <b>${r.d.toFixed(1)}</b> ${t('km')}</div>
        </div>
        <span class="badge ${full ? 'ok' : 'part'}">${full ? t('full') : t('partial', { a: r.have, b: r.total })}</span>
        <div class="svcs">${sel.map(s => `<span class="sv ${h.services[s] ? 'y' : 'n'}">${h.services[s] ? '✓' : '✕'} ${svcLabel(s)}</span>`).join('')}</div>
        <details class="more">
          <summary>${t('det')}</summary>
          <dl lang="ar" dir="rtl">
            <dt>${T.ar.d_spec}</dt><dd>${esc(h.specialties)}</dd>
            <dt>${T.ar.d_doc}</dt><dd>${esc(h.doctors)}</dd>
            <dt>${T.ar.d_tests}</dt><dd>${esc(h.tests)}</dd>
            <dt>${T.ar.d_dev}</dt><dd>${esc(h.devices)}</dd>
            <dt>${T.ar.d_social}</dt><dd>${esc(h.social)}</dd>
          </dl>
        </details>
        <div class="hc-actions">
          <button class="btn small primary" type="button" data-route>${t('route_btn')}</button>
          ${h.phone ? `<a class="btn small ghost" href="tel:${esc(h.phone)}">${t('call')}</a>` : ''}
        </div>
      </article>`;
    }).join('') + (state.rows.length > PAGE_SIZE
      ? `<button id="moreBtn" class="btn ghost small" type="button">${state.showAll ? t('less') : t('more', { n: state.rows.length - PAGE_SIZE })}</button>` : '');
  }
  $('#list').addEventListener('click', e => {
    if (e.target.closest('#moreBtn')) {
      state.showAll = !state.showAll; renderList(); renderMarkers(); return;
    }
    const card = e.target.closest('.hcard');
    if (card && !e.target.closest('a') && !e.target.closest('details')) drawRoute(card.dataset.id);
  });

  // ---- Map ----
  function initMap() {
    if (map || typeof L === 'undefined') return;
    map = L.map('map', { zoomControl: true }).setView([15.58, 32.53], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(map);
  }
  const divIcon = (cls, html = '', size = 34) =>
    L.divIcon({ className: '', html: `<div class="mk ${cls}">${html}</div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

  function renderMarkers() {
    if (!map || !state.loc) return;
    Object.values(hospMarkers).forEach(m => m.remove()); hospMarkers = {};
    if (userMarker) userMarker.remove();
    userMarker = L.marker([state.loc.lat, state.loc.lng], { icon: divIcon('mk-u', '', 22), zIndexOffset: 900 }).addTo(map);
    visibleRows().forEach((r, i) => {
      const m = L.marker([r.h.lat, r.h.lng], { icon: divIcon('mk-h' + (r.h.id === state.activeId ? ' on' : ''), i + 1) }).addTo(map);
      m.bindTooltip(hName(r.h), { direction: 'top', offset: [0, -14] });
      m.on('click', () => drawRoute(r.h.id));
      hospMarkers[r.h.id] = m;
    });
  }
  function clearRoute() { routeLayers.forEach(l => l.remove()); routeLayers = []; }

  async function drawRoute(id, silent) {
    const row = state.rows.find(r => r.h.id === id); if (!row || !state.loc) return;
    const h = row.h, u = state.loc, my = ++routeToken;
    state.activeId = id;
    document.querySelectorAll('.hcard').forEach(c => c.classList.toggle('active', c.dataset.id === id));
    visibleRows().forEach((r, i) => hospMarkers[r.h.id] && hospMarkers[r.h.id].setIcon(divIcon('mk-h' + (r.h.id === id ? ' on' : ''), i + 1)));
    clearRoute();
    const info = $('#routeInfo'); info.classList.remove('hidden');
    info.innerHTML = `<b>${t('loading_route')}</b>`;

    let coords = null, km = row.d, mins = Math.max(2, Math.round(row.d / AVG_SPEED_KMH * 60)), est = true;
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 8000);
      const url = `https://router.project-osrm.org/route/v1/driving/${u.lng},${u.lat};${h.lng},${h.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: ctrl.signal }); clearTimeout(to);
      const j = await res.json();
      if (j.code !== 'Ok') throw new Error('no route');
      coords = j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      km = j.routes[0].distance / 1000; mins = Math.max(1, Math.round(j.routes[0].duration / 60)); est = false;
    } catch (e) { /* fallback below */ }
    if (my !== routeToken) return;

    if (map) {
      if (coords) {
        routeLayers.push(L.polyline(coords, { color: '#fff', weight: 11, opacity: .95 }).addTo(map));
        routeLayers.push(L.polyline(coords, { color: '#26658C', weight: 6, opacity: 1 }).addTo(map));
      } else {
        routeLayers.push(L.polyline([[u.lat, u.lng], [h.lat, h.lng]], { color: '#26658C', weight: 5, dashArray: '4 10' }).addTo(map));
      }
      map.fitBounds(L.latLngBounds([[u.lat, u.lng], [h.lat, h.lng]]).pad(0.25));
    }
    const gm = `https://www.google.com/maps/dir/?api=1&origin=${u.lat},${u.lng}&destination=${h.lat},${h.lng}&travelmode=driving`;
    if (est && !silent) toast(t('toast_route'), 'error');
    info.classList.remove('pop'); void info.offsetWidth; info.classList.add('pop');
    info.innerHTML = `
      <div><b>${esc(hName(h))}</b><span class="big"> ${km.toFixed(1)} ${t('km')} · ${mins} ${t('min')}</span>${est ? `<small>${t('est')}</small>` : ''}</div>
      <a class="btn small primary" href="${gm}" target="_blank" rel="noopener">${t('open_maps')}</a>`;
    if (!silent) document.querySelector(`.hcard[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ---- Ambulance (demo) ----
  function openSos() {
    $('#sosStep1').classList.remove('hidden'); $('#sosStep2').classList.add('hidden');
    $('#sosModal').classList.remove('hidden');
    $('#sosConfirm').disabled = !state.loc;
    $('#sosLoc').classList.toggle('hidden', !!state.loc);
    if (!state.loc) geolocate(l => { setLoc(l); $('#sosLoc').classList.add('hidden'); }, () => { $('#sosLoc').classList.remove('hidden'); });
  }
  function showSosResult() {
    if (!state.loc) return;
    const pool = HOSPITALS.filter(h => h.services.emergency);
    const best = pool.map(h => ({ h, d: haversine(state.loc, h) })).sort((a, b) => a.d - b.d)[0];
    const m = Math.max(3, Math.round(best.d / AVG_SPEED_KMH * 60));
    $('#sosResult').textContent = t('sos_eta', { h: hName(best.h), m });
    const call = $('#sosCall');
    if (EMERGENCY_NUMBER) { call.href = 'tel:' + EMERGENCY_NUMBER; call.textContent = t('sos_call', { n: EMERGENCY_NUMBER }); call.classList.remove('hidden'); }
  }
  const closeSos = () => $('#sosModal').classList.add('hidden');

  // ---- Wire up ----
  $('#langBtn').onclick = () => {
    state.lang = state.lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('lang', state.lang);
    // smooth cross-fade between languages where the browser supports it
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(applyI18n);
    else applyI18n();
  };
  $('#clearBtn').onclick = () => { state.selected.clear(); renderTiles(); renderSummary(); if (state.resultsOpen && state.loc) refreshResults(); };
  $('#findBtn').onclick = openResults;
  $('#changeLoc').onclick = () => $('#localityBox').classList.toggle('hidden');
  $('#sosBtn').onclick = openSos;
  $('#heroSos').onclick = openSos;
  $('#sosConfirm').onclick = () => {
    const btn = $('#sosConfirm');
    btn.classList.add('loading');                        // loading state (demo delay)
    setTimeout(() => {
      btn.classList.remove('loading');
      showSosResult(); $('#sosStep1').classList.add('hidden'); $('#sosStep2').classList.remove('hidden');
      toast(t('toast_sos'));
    }, 900);
  };
  document.querySelectorAll('.sosClose').forEach(b => b.onclick = closeSos);
  $('#sosModal').addEventListener('click', e => { if (e.target.id === 'sosModal') closeSos(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSos(); });

  hydrateIcons();
  applyI18n();
})();
