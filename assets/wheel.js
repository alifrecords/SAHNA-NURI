// SAHNA NURI — sichqoncha g'ildiragi bilan har qanday boshqaruvni oshirish / kamaytirish.
//  • Slayderlar (intensivlik, pan/tilt, faderlar, kanal slayderlari…): sichqoncha ustida turganda g'ildirak bilan.
//  • Raqam maydonlari (fade, qiymat…): faqat bosib tanlangan (fokusdagi) bo'lsa — sahifani aylantirganda
//    tasodifan o'zgarib ketmasligi uchun.
//  • Pan/Tilt maydoni: g'ildirak — Tilt, Shift + g'ildirak — Pan. Pan/Tilt slayderlari: bir chiq ≈ 3°.
//  G'ildirak yuqoriga — oshadi, pastga — kamayadi. Shift — aniq (eng kichik qadam), Alt — tez (5 barobar).
(() => {
  const STEP_PX = 60;          // trackpad uchun: shuncha piksel = 1 qadam
  let acc = 0, accEl = null, lastT = 0;
  const changeTimers = new WeakMap();

  function notches(e, el) {
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 20; else if (e.deltaMode === 2) dy *= 400;
    if (Math.abs(dy) < Math.abs(e.deltaX)) dy = e.deltaX; // gorizontal g'ildirak / Shift ba'zi brauzerlarda
    const now = performance.now();
    if (el !== accEl || now - lastT > 400) acc = 0;
    accEl = el; lastT = now;
    // Sichqoncha g'ildiragi (katta qadam) — har bir "chiq" 1 qadam; trackpad — yig'ib boriladi
    if (Math.abs(dy) >= 50 && e.deltaMode === 0 && Number.isInteger(dy)) return -Math.sign(dy);
    acc += dy;
    const n = Math.trunc(acc / STEP_PX);
    acc -= n * STEP_PX;
    return -n;
  }

  function stepOf(el, e) {
    const min = el.min === '' ? 0 : +el.min, max = el.max === '' ? 100 : +el.max;
    const base = el.step && el.step !== 'any' ? +el.step : 1;
    if (e.shiftKey) return base;                                   // aniq
    if (el.dataset.wstep) return (+el.dataset.wstep || base) * (e.altKey ? 5 : 1); // pan/tilt: ~3° qadam
    const span = isFinite(max - min) ? max - min : 100;
    let st = Math.max(base, Math.round(span / 50 / base) * base);  // ~2% qadam
    if (span <= 20) st = base;                                     // kichik diapazonda — eng kichik qadam
    return e.altKey ? st * 5 : st;
  }

  function fire(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    clearTimeout(changeTimers.get(el));
    changeTimers.set(el, setTimeout(() => el.dispatchEvent(new Event('change', { bubbles: true })), 250));
  }

  function nudge(el, e) {
    const n = notches(e, el);
    if (!n) return;
    const min = el.min === '' ? -Infinity : +el.min, max = el.max === '' ? Infinity : +el.max;
    const st = stepOf(el, e);
    const cur = el.value === '' ? (isFinite(min) ? min : 0) : +el.value;
    const dec = (String(st).split('.')[1] || '').length;
    const nv = Math.min(max, Math.max(min, +(cur + n * st).toFixed(dec)));
    if (nv === cur) return;
    el.value = nv;
    fire(el);
  }

  // Pan/Tilt maydoni: tegishli slayderni topib, o'shani suramiz (inspektor kanallari orqali)
  function nudgeXY(pad, e) {
    const rows = document.getElementById('inspRows'); if (!rows) return false;
    const want = e.shiftKey ? 'pan' : 'tilt';
    const row = [...rows.querySelectorAll('.ir')].find((r) => {
      const em = r.querySelector('.ir-n em');
      return em && em.textContent.trim().toLowerCase() === want;
    });
    const el = row && row.querySelector('input[type=range]');
    if (!el || el.disabled) return false;
    const fake = { deltaY: e.deltaY, deltaX: e.deltaX, deltaMode: e.deltaMode, shiftKey: false, altKey: e.altKey };
    nudge(el, fake);
    return true;
  }

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) return; // brauzer masshtabi (zoom) — tegmaymiz
    const t = e.target;
    if (!(t instanceof Element)) return;
    const pad = t.closest('#inspXY');
    if (pad) { if (nudgeXY(pad, e)) e.preventDefault(); return; }
    const el = t.closest('input[type=range], input[type=number]');
    if (!el || el.disabled || el.readOnly) return;
    if (el.type === 'number' && document.activeElement !== el) return; // raqam maydoni — faqat fokusda
    e.preventDefault(); // sahifa aylanib ketmasin
    nudge(el, e);
  }, { passive: false, capture: true });
})();
