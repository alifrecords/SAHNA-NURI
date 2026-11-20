// SAHNA NURI — pult mantiqi: patch, profillar, programmer, cue'lar, faderlar, effektlar, DMX chiqishi.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const sum = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/[,  ]/g, ' ') + " so'm";
  let toastT;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400); }

  /* ================= Ma'lumotlar ================= */
  const ROLES = {
    dim: 'Intensivlik (dimmer)', r: 'Qizil (R)', g: 'Yashil (G)', b: 'Koʻk (B)', w: 'Oq (W)', a: 'Amber (A)', uv: 'UV',
    pan: 'Pan', panF: 'Pan fine', tilt: 'Tilt', tiltF: 'Tilt fine', strobe: 'Shutter / Strob', cwheel: 'Rang gʻildiragi',
    gobo: 'Gobo', fixed: 'Doimiy qiymat',
  };
  const COLORS = [
    { n: 'Qizil', hex: '#DC2626', rgbw: [255, 0, 0, 0] },
    { n: 'Toʻq sariq', hex: '#EA580C', rgbw: [255, 90, 0, 0] },
    { n: 'Sariq', hex: '#FACC15', rgbw: [255, 200, 0, 0] },
    { n: 'Yashil', hex: '#22C55E', rgbw: [0, 255, 0, 0] },
    { n: 'Koʻk', hex: '#2563EB', rgbw: [0, 0, 255, 0] },
    { n: 'Binafsha', hex: '#9333EA', rgbw: [140, 0, 255, 0] },
    { n: 'Pushti', hex: '#EC4899', rgbw: [255, 0, 140, 0] },
    { n: 'Oq', hex: '#FFFFFF', rgbw: [255, 255, 255, 255] },
    { n: 'Iliq oq', hex: '#FDE7C3', rgbw: [255, 170, 80, 120] },
  ];
  const POSITIONS = [
    { n: 'Markaz', pan: 128, tilt: 128 }, { n: 'Chap', pan: 80, tilt: 128 }, { n: 'Oʻng', pan: 176, tilt: 128 },
    { n: 'Tomoshabin', pan: 128, tilt: 60 }, { n: 'Shift', pan: 128, tilt: 210 }, { n: 'Pol', pan: 128, tilt: 30 },
  ];
  const EFFECTS = [
    { id: 'chase', n: 'Chase' }, { id: 'strob', n: 'Strob' }, { id: 'puls', n: 'Puls' },
    { id: 'kamalak', n: 'Kamalak' }, { id: 'doira', n: 'Doira' }, { id: 'tolqin', n: 'Toʻlqin' },
  ];
  const DEF_WHEEL = { Oq: 0, Qizil: 9, 'Toʻq sariq': 18, Sariq: 27, Yashil: 36, 'Koʻk': 54, Binafsha: 63, Pushti: 72, 'Iliq oq': 90 };
  // Chiroq modellari rasmlari (o'zimiz chizgan vektor; "L" — yonadigan linza/LED qismlari)
  const ICONS = {
    par: `<g class="body"><path d="M14 12h30l6 4v16l-6 4H14z"/><path d="M50 18h4v12h-4"/><path d="M28 36v6M20 42h18"/></g>
          <g class="L"><circle cx="20" cy="20" r="2.4"/><circle cx="27" cy="20" r="2.4"/><circle cx="34" cy="20" r="2.4"/><circle cx="20" cy="28" r="2.4"/><circle cx="27" cy="28" r="2.4"/><circle cx="34" cy="28" r="2.4"/><circle cx="41" cy="24" r="2.4"/></g>`,
    par2: `<g class="body"><path d="M10 24a10 10 0 0 1 10-10h18l10 4v12l-10 4H20a10 10 0 0 1-10-10z"/><path d="M28 34v6M20 40h16"/><path d="M48 20h5v8h-5"/></g>
          <g class="L"><circle cx="20" cy="24" r="7"/></g>`,
    bar: `<g class="body"><rect x="4" y="16" width="56" height="14" rx="3"/><path d="M10 30v6h44v-6"/><path d="M8 36h48"/></g>
          <g class="L"><circle cx="14" cy="23" r="4"/><circle cx="26" cy="23" r="4"/><circle cx="38" cy="23" r="4"/><circle cx="50" cy="23" r="4"/></g>`,
    panel: `<g class="body"><path d="M8 12h48l-4 24H12z"/><path d="M32 36v6M22 42h20"/></g>
          <g class="L">${Array.from({length:18},(_,i)=>`<circle cx="${15+(i%6)*7}" cy="${18+Math.floor(i/6)*6}" r="1.9"/>`).join('')}</g>`,
    fresnel: `<g class="body"><path d="M12 15h28l8 3v12l-8 3H12z"/><path d="M48 19h5v10h-5"/><path d="M8 15h4v18H8z"/><path d="M26 33v7M18 40h16"/><path d="M30 8v7"/></g>
          <g class="L"><rect x="8.5" y="17" width="3" height="14" rx="1"/></g>`,
    beam: `<g class="body"><rect x="16" y="38" width="32" height="7" rx="2"/><path d="M20 38V24M44 38V24"/><rect x="23" y="6" width="18" height="26" rx="9"/></g>
          <g class="L"><circle cx="32" cy="13" r="4.2"/></g>`,
    spot: `<g class="body"><rect x="14" y="38" width="36" height="7" rx="2"/><path d="M17 38V20M47 38V20"/><path d="M21 8h22l4 18H17z"/><path d="M17 26h30v6H17z"/></g>
          <g class="L"><ellipse cx="32" cy="12" rx="8" ry="3.4"/></g>`,
    dimmer: `<g class="body"><rect x="10" y="6" width="44" height="36" rx="3"/><path d="M10 18h44M10 30h44"/><path d="M16 42v3M48 42v3"/></g>
          <g class="L">${[12,24,36].map(y=>[0,1,2,3,4,5].map(j=>`<rect x="${15+j*6.4}" y="${y-3}" width="3.4" height="4" rx="1"/>`).join('')).join('')}</g>`,
  };
  const ICON_BY_KEY = { fs_propar8: 'par', fs_warning8: 'bar', fs_5rc: 'panel', fs_led2lin5: 'fresnel', fs_propar2: 'par2', fs_beam18: 'beam', fs_front12: 'spot', fs_dim24: 'dimmer' };
  function iconKey(f) {
    const pr = show.profiles[f.prof] || {};
    if (pr.icon && ICONS[pr.icon]) return pr.icon;
    if (ICON_BY_KEY[f.prof]) return ICON_BY_KEY[f.prof];
    const has = (r) => (pr.ch || []).some((x) => x.r === r);
    if (has('pan')) return has('gobo') ? 'beam' : 'spot';
    if (has('r') || has('g') || has('b')) return 'par';
    if ((pr.ch || []).length > 8 && (pr.ch || []).every((x) => x.r === 'dim')) return 'dimmer';
    return 'par2';
  }
  const iconSvg = (k) => `<svg class="fxi" viewBox="0 0 64 48" aria-hidden="true">${ICONS[k] || ICONS.par2}</svg>`;
  const c = (n, r, d = 0) => ({ n, r, d });

  // Andijon teatri — FreeStyler X2 (Andijan2026.2.flf) dagi haqiqiy chiroqlar.
  // Kanal nomlari va tartibi FreeStyler'ning o'z .fxt fayllaridan (Fixtures papkasi) olingan.
  // "Ochiq" qiymatlar FreeStyler'dagi highlight qiymatlariga mos (strob 0, shutter 255).
  const fx0 = (n, d = 0) => c(n, 'fixed', d);
  const PROF_REV = 3;
  const DEFAULT_PROFILES = () => ({
    fs_propar8: { name: 'ProPar8 (8 kanal)', group: 'ProPar8',
      ch: [c('Lamp', 'dim'), c('Red', 'r'), c('Green', 'g'), c('Blue', 'b'), c('WW (iliq oq)', 'w'), c('Strobe', 'strobe', 0), fx0('Func Macro'), fx0('Func')] },
    fs_warning8: { name: 'Warning8 (8 kanal)', group: 'Warning8',
      ch: [c('Lamp', 'dim'), c('Strobe', 'strobe', 0), fx0('Func1'), fx0('Func2'), c('Red', 'r'), c('Green', 'g'), c('Blue', 'b'), c('WW (iliq oq)', 'w')] },
    fs_5rc: { name: 'Evro Led 5RC (5 kanal)', group: 'Evro Led 5RC',
      ch: [c('Lamp', 'dim'), fx0('W (iliq oq)', 255), fx0('C (sovuq oq)', 255), c('Strobe', 'strobe', 0), fx0('Func')] },
    fs_led2lin5: { name: 'Evro Led2Lin5 (5 kanal)', group: 'Led2Lin5',
      ch: [fx0('Focus'), c('Dimmer', 'dim'), c('Strobe', 'strobe', 0), fx0('W (iliq oq)', 255), fx0('C (sovuq oq)', 255)] },
    fs_propar2: { name: 'Propar2 4 (4 kanal)', group: 'Propar2',
      ch: [c('Lamp', 'dim'), fx0('W (iliq oq)', 255), fx0('C (sovuq oq)', 255), c('Strobe', 'strobe', 0)] },
    fs_beam18: { name: 'Led Beam 300W (18 kanal)', group: 'Led Beam', wheel: { ...DEF_WHEEL }, panRange: 540, tiltRange: 270,
      ch: [c('Pan', 'pan', 128), c('Pan 16bit', 'panF'), c('Tilt', 'tilt', 128), c('Tilt 16bit', 'tiltF'), c('Strobe', 'strobe', 0),
        c('Dimmer', 'dim'), c('Color1', 'cwheel'), c('Gobo1', 'gobo'), fx0('Gobo2'), fx0('Gobo3'), fx0('Prism'), fx0('PrismRot.'),
        fx0('Frost'), fx0('Zoom'), fx0('Focus'), fx0('Reset'), fx0('Effect'), fx0('EffectSpeed')] },
    fs_front12: { name: 'Front Light 800W (12 kanal)', group: 'Front Light', panRange: 540, tiltRange: 270,
      ch: [c('Pan', 'pan', 128), c('Pan 16bit', 'panF'), c('Tilt', 'tilt', 128), c('Tilt 16bit', 'tiltF'), fx0('PanTilt Speed'),
        // FreeStyler: dimmer = 6-kanal; Lamp (7) — lampa yoqish, 255 = yoniq (doim yoqiq turadi, blackout'da ham o'chmaydi)
        c('Dimmer', 'dim'), fx0('Lamp (yoqish)', 255), c('Shutter', 'strobe', 255), fx0('Color'), fx0('CTO'), fx0('Zoom'), fx0('Func')] },
    fs_dim24: { name: '24 channel dimmerpack (24 kanal)', group: 'Dimmer', ch: Array.from({ length: 24 }, (_, i) => c('Dimmer ' + (i + 1), 'dim')) },
  });
  // Eski (taxminiy) standart profillar — avtomatik yangilash uchun
  const OLD_DEF_KEYS = ['beam16', 'panel8', 'par7', 'bar6', 'front1', 'dim12'];

  // [FreeStyler nomi, profil, boshlang'ich DMX manzil] — FreeStyler "Add/Remove fixtures" ro'yxatidan
  const ANDIJAN_PATCH = [
    ['ProPar8-1', 'fs_propar8', 1], ['ProPar8-2', 'fs_propar8', 9], ['ProPar8-3', 'fs_propar8', 17], ['ProPar8-4', 'fs_propar8', 25],
    ['Warning8-5', 'fs_warning8', 33], ['Warning8-6', 'fs_warning8', 41],
    ['Evro Led 5RC-7', 'fs_5rc', 49], ['Evro Led 5RC-8', 'fs_5rc', 54],
    ['Evro Led2Lin5-9', 'fs_led2lin5', 59], ['Evro Led2Lin5-10', 'fs_led2lin5', 64], ['Evro Led2Lin5-11', 'fs_led2lin5', 69],
    ['Evro Led2Lin5-12', 'fs_led2lin5', 74], ['Evro Led2Lin5-13', 'fs_led2lin5', 79], ['Evro Led2Lin5-14', 'fs_led2lin5', 84],
    ['Evro Led2Lin5-15', 'fs_led2lin5', 89], ['Evro Led2Lin5-16', 'fs_led2lin5', 94], ['Evro Led2Lin5-17', 'fs_led2lin5', 99],
    ['Propar2 4-18', 'fs_propar2', 104], ['Propar2 4-19', 'fs_propar2', 108], ['Propar2 4-20', 'fs_propar2', 112], ['Propar2 4-21', 'fs_propar2', 116],
    ['Led Beam 300W-22', 'fs_beam18', 120], ['Led Beam 300W-23', 'fs_beam18', 138],
    ['Front Light 800W-24', 'fs_front12', 156], ['Front Light 800W-25', 'fs_front12', 168],
    ['24 channel dimmerpack-26', 'fs_dim24', 180],
    ['Led Beam 300W-27', 'fs_beam18', 204], ['Led Beam 300W-28', 'fs_beam18', 222], ['Led Beam 300W-29', 'fs_beam18', 240],
    ['Warning8-30', 'fs_warning8', 258], ['Warning8-31', 'fs_warning8', 266], ['Warning8-32', 'fs_warning8', 274], ['Warning8-33', 'fs_warning8', 282],
    ['Led Beam 300W-34', 'fs_beam18', 290], ['Led Beam 300W-35', 'fs_beam18', 308],
  ];
  function defaultPatch() {
    return ANDIJAN_PATCH.map(([name, prof, addr]) => ({ id: uid(), name, prof, addr }));
  }

  function newStage() { return { w: 12, d: 7, h: 6, img: null, corners: null, pos: {}, cal: {}, points: [], view: 'plan', tz: 0, front: { img: null, corners: null, fpos: {}, grid: true, op: 100 } }; }
  function newShow() {
    const profiles = DEFAULT_PROFILES();
    return { v: 1, profRev: PROF_REV, title: 'Yangi spektakl', profiles, fixtures: defaultPatch(), cues: [], levels: {}, fxDepth: 100, fxSpeed: 40, master: 100, autoOn: true, mib: true, mibMove: 1.5, stage: newStage() };
  }

  const SHOW_KEY = 'sn_show_v1';
  let show;
  try { show = JSON.parse(localStorage.getItem(SHOW_KEY)); } catch (_) { show = null; }
  if (!show || !Array.isArray(show.fixtures) || !show.profiles) show = newShow();
  // FreeStyler profillari yangilangan bo'lsa — saqlangan eski fs_* profillar yangisiga almashtiriladi
  if ((show.profRev || 0) < PROF_REV) {
    const D = DEFAULT_PROFILES(), rev = show.profRev || 0;
    // rev 2: barcha fs_* profillar; rev 3: faqat Front Light (boshqa profillardagi sozlashlar saqlanadi)
    const keys = rev < 2 ? Object.keys(D) : ['fs_front12'];
    for (const k of keys) if (show.profiles[k]) show.profiles[k] = D[k];
    show.profRev = PROF_REV;
    try { localStorage.setItem(SHOW_KEY, JSON.stringify(show)); } catch (_) {}
  }
  // Eski taxminiy 32 talik patch o'zgartirilmagan bo'lsa — Andijon teatri chiroqlariga avtomatik almashtiriladi
  let patchMigrated = false;
  if (show.fixtures.length && show.fixtures.every((f) => OLD_DEF_KEYS.includes(f.prof))) {
    show.profiles = { ...DEFAULT_PROFILES(), ...show.profiles };
    OLD_DEF_KEYS.forEach((k) => delete show.profiles[k]);
    show.fixtures = defaultPatch();
    if (show.stage) show.stage.pos = {};
    patchMigrated = true;
    try { localStorage.setItem(SHOW_KEY, JSON.stringify(show)); } catch (_) {}
  }
  show.stage = { ...newStage(), ...(show.stage || {}) };
  let saveT;
  function save(now) {
    clearTimeout(saveT);
    const f = () => { try { localStorage.setItem(SHOW_KEY, JSON.stringify(show)); } catch (e) { toast('Saqlab boʻlmadi: ' + e.message); } };
    if (now) f(); else saveT = setTimeout(f, 300);
  }

  /* ================= Holat ================= */
  const sel = new Set();                 // tanlangan chiroqlar
  const prog = { vals: {}, fx: [] };     // programmer: {fid: {param: v}}, fx: [{type, fids}]
  const flash = new Set();               // bosib turilgan FLASH guruhlari
  const insp = { focus: null, drag: false, solo: null }; // chiroq sozlamalari paneli: fokusdagi chiroq
  let blackout = false;
  const play = { cur: -1, next: 0, from: null, to: null, start: 0, dur: 0, paused: false, pausedAt: 0, fx: [] };

  const prof = (f) => show.profiles[f.prof] || { name: '?', group: 'Boshqa', ch: [] };
  const hasRole = (p, r) => p.ch.some((x) => x.r === r);
  // Kanal turi → programmer parametri (qolganlari "raw" — alohida kanal qiymati)
  const PARAM_ROLE = { dim: 'dim', r: 'r', g: 'g', b: 'b', w: 'w', pan: 'pan', tilt: 'tilt', gobo: 'gobo' };
  const defParams = () => ({ dim: 0, r: 255, g: 255, b: 255, w: 0, pan: 128, tilt: 128, col: 'Oq', gobo: 0 });
  const groups = () => [...new Set(show.fixtures.map((f) => prof(f).group))];

  function emptyLook() { const l = {}; for (const f of show.fixtures) l[f.id] = defParams(); return l; }
  function cueLook(cue) {
    const l = emptyLook();
    for (const f of show.fixtures) if (cue.look[f.id]) Object.assign(l[f.id], cue.look[f.id]);
    return l;
  }

  /* ---- Qorong'ida burilish (Move in Black) ----
     Joyi (pan/tilt, rang g'ildiragi, gobo) o'zgaradigan chiroq: 1) yonib turgan bo'lsa tez o'chadi,
     2) qorong'ida yangi joyiga buriladi, 3) cue fade vaqti bilan yonadi.
     Cue'da o'chiq turgan chiroqlar keyingi cue'dagi joyiga oldindan qorong'ida burilib turadi. */
  const MIB_OUT_MS = 400;
  const fxById = (id) => show.fixtures.find((f) => f.id === id);
  function mibCapable(f) { const p = f && prof(f); return !!p && (hasRole(p, 'pan') || hasRole(p, 'tilt') || hasRole(p, 'cwheel') || hasRole(p, 'gobo')); }
  function posChanged(a, b, f) {
    const p = prof(f);
    return (hasRole(p, 'pan') && Math.abs((b.pan ?? 128) - (a.pan ?? 128)) > 0.5)
      || (hasRole(p, 'tilt') && Math.abs((b.tilt ?? 128) - (a.tilt ?? 128)) > 0.5)
      || (hasRole(p, 'cwheel') && a.col !== b.col)
      || (hasRole(p, 'gobo') && (a.gobo || 0) !== (b.gobo || 0));
  }
  const mibOn = () => show.mib !== false;
  const mibMoveMs = () => clamp(+show.mibMove || 0, 0, 10) * 1000;
  function lerpParams(a, b, k) {
    const o = {};
    for (const key in b) {
      if (key === 'raw') { // alohida kanallar (shutter, lampa, zoom...) — har biri o'z qiymatiga silliq o'tadi
        const ra = a.raw || {}, rb = b.raw || {}; o.raw = {};
        for (const c in rb) o.raw[c] = ra[c] == null ? rb[c] : ra[c] + (rb[c] - ra[c]) * k;
        continue;
      }
      o[key] = typeof b[key] === 'number' ? a[key] + (b[key] - a[key]) * k : (k < 0.5 ? a[key] : b[key]);
    }
    return o;
  }
  function mixFixture(id, a, b, t) {
    const fade = play.fadeMs || 0;
    const f = fxById(id);
    if (!play.mib || !f || !mibCapable(f) || !posChanged(a, b, f)) return lerpParams(a, b, fade > 0 ? clamp(t / fade, 0, 1) : 1);
    if (b.dim > 0.5) {
      const outMs = a.dim > 0.5 ? MIB_OUT_MS : 0, mv = play.moveMs;
      if (t < outMs) return { ...a, dim: a.dim * (1 - t / outMs) };
      if (t < outMs + mv) return { ...b, dim: 0 };
      const k = fade > 0 ? clamp((t - outMs - mv) / fade, 0, 1) : 1;
      return { ...b, dim: b.dim * k };
    }
    // o'chib ketadigan chiroq: joyidan qimirlamay o'chadi, keyin yangi joyga o'tadi
    const k = fade > 0 ? clamp(t / fade, 0, 1) : 1;
    return k >= 1 ? { ...b } : { ...a, dim: a.dim * (1 - k) };
  }
  // O'chiq chiroqlarni keyingi cue'dagi joyiga oldindan burish
  function preposition(look) {
    if (!mibOn()) return look;
    const ni = play.next;
    if (ni == null || ni < 0 || ni >= show.cues.length || ni === play.cur) return look;
    const nl = cueLook(show.cues[ni]);
    let out = look;
    for (const id in look) {
      const cur = look[id], nx = nl[id];
      if (!nx || cur.dim > 0.5 || nx.dim <= 0.5) continue;
      const f = fxById(id);
      if (!f || !mibCapable(f) || !posChanged(cur, nx, f)) continue;
      if (out === look) out = { ...look };
      out[id] = { ...cur, pan: nx.pan, tilt: nx.tilt, col: nx.col, gobo: nx.gobo };
    }
    return out;
  }
  // Joriy (fade bilan) bazaviy holat
  function baseLook(now) {
    if (!play.to) return preposition(emptyLook());
    const t = (play.paused ? play.pausedAt : now) - play.start;
    if (!play.from || t >= play.dur) return preposition(play.to);
    const out = {};
    for (const id in play.to) out[id] = mixFixture(id, play.from[id] || defParams(), play.to[id], t);
    return out;
  }
  function fadeProgress(now) {
    if (!play.to || play.dur <= 0) return play.to ? 1 : 0;
    return clamp(((play.paused ? play.pausedAt : now) - play.start) / play.dur, 0, 1);
  }

  // Ikki holatni qo'shish: alohida kanallar (raw) ham birlashadi, ustma-ust yozilmaydi
  function mergeP(a, b) {
    if (!b) return { ...a };
    const o = { ...a, ...b };
    if (a.raw || b.raw) o.raw = { ...(a.raw || {}), ...(b.raw || {}) };
    return o;
  }
  // Programmer qo'shilgan "jonli" holat (cue yozish uchun ham shu ishlatiladi)
  function liveLook(now) {
    const base = baseLook(now), out = {};
    for (const f of show.fixtures) out[f.id] = mergeP(base[f.id] || defParams(), prog.vals[f.id]);
    return out;
  }

  function hsv(h) {
    const i = Math.floor(h * 6), f = h * 6 - i, q = 1 - f;
    const m = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][i % 6];
    return m.map((x) => Math.round(x * 255));
  }

  /* ================= DMX hisoblash ================= */
  const chTest = {}; // { fixtureId: { kanalIndeks: qiymat } } — saqlanmaydi
  const buf = new Uint8Array(512);
  function compute(now) {
    const live = liveLook(now);
    const t = now / 1000;
    const speed = 0.1 + (show.fxSpeed / 100) * 3;
    const depth = show.fxDepth / 100;
    const fxList = [...play.fx, ...prog.fx];
    const master = show.master / 100;
    buf.fill(0);
    for (const f of show.fixtures) {
      const p = { ...live[f.id] };
      const pr = prof(f);
      let dimMul = 1;
      for (const fx of fxList) {
        const i = fx.fids.indexOf(f.id);
        if (i < 0) continue;
        const n = fx.fids.length;
        if (fx.type === 'chase') dimMul *= Math.floor(t * speed * 2 * n) % n === i ? 1 : 1 - depth;
        else if (fx.type === 'strob') dimMul *= Math.floor(t * speed * 8) % 2 ? 1 : 1 - depth;
        else if (fx.type === 'puls') dimMul *= 1 - depth * (0.5 - 0.5 * Math.sin(2 * Math.PI * t * speed));
        else if (fx.type === 'tolqin') dimMul *= 1 - depth * (0.5 - 0.5 * Math.sin(2 * Math.PI * (t * speed - i / n)));
        else if (fx.type === 'kamalak') {
          const h = ((t * speed * 0.25 + i / n) % 1 + 1) % 1;
          const [r, g, b] = hsv(h);
          p.r = p.r + (r - p.r) * depth; p.g = p.g + (g - p.g) * depth; p.b = p.b + (b - p.b) * depth; p.w = p.w * (1 - depth);
          if (depth > 0.5) p.col = COLORS[Math.floor(h * 7) % 7].n;
        } else if (fx.type === 'doira') {
          const a = 2 * Math.PI * (t * speed * 0.5 + i / n);
          p.pan = clamp(p.pan + 40 * depth * Math.cos(a), 0, 255); p.tilt = clamp(p.tilt + 40 * depth * Math.sin(a), 0, 255);
        }
      }
      const grp = pr.group;
      const gl = (show.levels[grp] ?? 100) / 100;
      let dim = p.dim * dimMul;
      if (flash.has(grp)) dim = 255;
      else dim = dim * gl * master;
      if (blackout) dim = 0;
      const hasDim = hasRole(pr, 'dim');
      const scale = hasDim ? 1 : dim / 255;
      pr.ch.forEach((ch, k) => {
        const a = f.addr - 1 + k;
        if (a < 0 || a > 511) return;
        let v = 0;
        switch (ch.r) {
          case 'dim': v = dim; break;
          case 'r': v = p.r * scale; break;
          case 'g': v = p.g * scale; break;
          case 'b': v = p.b * scale; break;
          case 'w': v = p.w * scale; break;
          case 'a': case 'uv': v = 0; break;
          case 'pan': v = hasRole(pr, 'panF') ? Math.floor(p.pan) : p.pan; break;
          case 'tilt': v = hasRole(pr, 'tiltF') ? Math.floor(p.tilt) : p.tilt; break;
          case 'panF': v = (p.pan - Math.floor(p.pan)) * 255; break;
          case 'tiltF': v = (p.tilt - Math.floor(p.tilt)) * 255; break;
          case 'strobe': v = ch.d; break;
          case 'cwheel': v = (pr.wheel || DEF_WHEEL)[p.col] ?? 0; break;
          case 'gobo': v = p.gobo || 0; break;
          default: v = ch.d || 0;
        }
        // Chiroq sozlamalari panelida qo'lda berilgan kanal qiymati (yorqinlik/rang/pan/tilt bundan mustasno)
        if (p.raw && p.raw[k] != null && !PARAM_ROLE[ch.r]) v = p.raw[k];
        buf[a] = clamp(Math.round(v), 0, 255);
      });
      // Kanal sinovi: qo'lda ushlab turilgan qiymatlar hammasidan ustun
      const ov = chTest[f.id];
      if (ov) for (const k in ov) { const a = f.addr - 1 + +k; if (a >= 0 && a < 512) buf[a] = ov[k]; }
    }
    return buf;
  }

  let testUntil = 0;
  function frame() {
    const now = performance.now();
    if (now < testUntil) {
      const b = new Uint8Array(512);
      for (const f of show.fixtures) prof(f).ch.forEach((ch, k) => { const a = f.addr - 1 + k; if (a >= 0 && a < 512) b[a] = ch.r === 'dim' || ch.r === 'r' || ch.r === 'g' || ch.r === 'b' || ch.r === 'w' ? 255 : ch.r === 'pan' || ch.r === 'tilt' ? 128 : ch.r === 'strobe' || ch.r === 'fixed' ? ch.d : 0; });
      SNDmx.write(b);
    } else {
      SNDmx.write(compute(now));
    }
    const k = fadeProgress(now);
    $('#fadeBar').style.width = (k * 100).toFixed(1) + '%';
    if (frameN++ % 6 === 0) { updateFixtureLevels(); if (tab === 'monitor') renderMonitor(); if (tab === 'pult') refreshInspOut(); }
    requestAnimationFrame(frame);
  }
  let frameN = 0;
  // Fon rejimida ham signal to'xtamasligi uchun (requestAnimationFrame fonda sekinlashadi)
  setInterval(() => { if (document.hidden) SNDmx.write(compute(performance.now())); }, 40);

  /* ================= Litsenziya cheklovlari ================= */
  const L = () => window.AZLicense;
  const isStart = () => { const l = L() && L().state.license; return !!(l && /^SN-ST-/i.test(l.code || '')); };
  const locked = () => !!(L() && L().isLocked());
  const LIMITS = { fixtures: 32, cues: 100 };
  function guardAction() { if (locked()) { openPaywall(); return false; } return true; }

  /* ================= PULT: chiroqlar ================= */
  function renderGroups() {
    const gs = groups();
    const btns = [{ n: 'Hammasi', ids: show.fixtures.map((f) => f.id) }, ...gs.map((g) => ({ n: g, ids: show.fixtures.filter((f) => prof(f).group === g).map((f) => f.id) })), { n: 'Tozalash', ids: null }];
    $('#groupBtns').innerHTML = btns.map((b, i) => {
      const on = b.ids && b.ids.length && b.ids.every((id) => sel.has(id));
      return `<button class="btn ${on ? 'on' : ''}" data-g="${i}" type="button" aria-pressed="${!!on}">${esc(b.n)}</button>`;
    }).join('');
    $('#groupBtns').onclick = (e) => {
      const el = e.target.closest('[data-g]'); if (!el) return;
      const b = btns[+el.dataset.g];
      if (!b.ids) sel.clear();
      else if (b.ids.every((id) => sel.has(id))) b.ids.forEach((id) => sel.delete(id));
      else b.ids.forEach((id) => sel.add(id));
      renderSel();
    };
  }
  // Nom bitta qatorda: model qismi joy yetmasa qisqaradi (…), raqami (-27) doim ko'rinadi
  function ftName(n) {
    const m = /^(.*?)([-\s]\d+)$/.exec(n);
    return m ? `<span class="ft-n"><span class="pre">${esc(m[1])}</span><b>${esc(m[2])}</b></span>` : `<span class="ft-n"><span class="pre">${esc(n)}</span></span>`;
  }
  function renderFixtures() {
    // Turlar bo'yicha ketma-ket (guruhlar patchdagi birinchi chirog'i tartibida), har guruh — o'z fon tusida
    const groups = [];
    for (const f of show.fixtures) {
      const g = prof(f).group || 'Boshqa';
      let G = groups.find((x) => x.g === g); if (!G) groups.push(G = { g, list: [] });
      G.list.push(f);
    }
    const tile = (f, gi, first) => `<button class="ft g${gi % 2} ${first ? 'gfirst' : ''} ${sel.has(f.id) ? 'on' : ''}" data-f="${f.id}" type="button" aria-pressed="${sel.has(f.id)}" title="${esc(f.name)} · ${esc(prof(f).group)} · DMX ${f.addr}">${iconSvg(iconKey(f))}${ftName(f.name)}<small>DMX ${String(f.addr).padStart(3, '0')}${hasRole(prof(f), 'pan') ? ` <b class="dir" data-dir="${f.id}"></b>` : ''}</small><span class="lvl"><i data-lv="${f.id}"></i></span><i class="led" aria-hidden="true"></i></button>`;
    $('#fixtureBtns').innerHTML = groups.map((G, gi) => G.list.map((f, i) => tile(f, gi, i === 0)).join('')).join('')
      || '<div class="empty" style="grid-column:1/-1">Chiroqlar yoʻq. Patch boʻlimida qoʻshing.</div>';
    fitFixtures();
  }
  // Hamma chiroq bitta oynaga sig'sin: ekran balandligi va panel eniga qarab ustunlar soni va tugma o'lchami tanlanadi
  function fitFixtures() {
    const box = $('#fixtureBtns'); if (!box || !box.offsetParent) return;
    const n = box.querySelectorAll('[data-f]').length; if (!n) return;
    const gap = 5, W = box.clientWidth;
    // Bo'limlar paneli (Pult/Sahna/...) ekran tepasida turgan holat hisobga olinadi — sarlavha yuqoriga surilgan bo'ladi
    const tabs = $('#tabs');
    const ref = tabs ? tabs.getBoundingClientRect().top + window.scrollY - 8 : 0;
    const top = box.getBoundingClientRect().top + window.scrollY - ref;
    const avail = Math.max(260, window.innerHeight - top - 22);
    let best = null;
    for (let cols = 3; cols <= 10; cols++) {
      const w = (W - gap * (cols - 1)) / cols; if (w < 44) break;
      const rows = Math.ceil(n / cols);
      const h = Math.min((avail - gap * (rows - 1)) / rows, w * 1.15, 92);
      const score = Math.min(w * 0.85, h); // ikkala o'lcham ham yetarli bo'lsin
      if (h >= 40 && (!best || score > best.score)) best = { cols, h, w, score };
    }
    if (!best) { const cols = Math.max(4, Math.floor((W + gap) / (48 + gap))); best = { cols, h: 54, w: (W - gap * (cols - 1)) / cols }; }
    box.style.setProperty('--cols', best.cols);
    box.style.setProperty('--th', Math.floor(best.h) + 'px');
    box.classList.toggle('tight', best.h < 54); // juda kichik bo'lsa DMX qatori yashiriladi (sichqoncha ustida ko'rinadi)
    box.style.setProperty('--fs', Math.max(8, Math.min(11.5, best.h / 6.2, best.w / 6.4)).toFixed(1) + 'px');
  }
  window.addEventListener('resize', () => fitFixtures());
  if (window.ResizeObserver) new ResizeObserver(() => fitFixtures()).observe($('#fixtureBtns'));
  // Tugmadagi rasm linzasi yonadigan rang — chiroqqa haqiqatan ketayotgan qiymatlardan
  function outHex(f) {
    const pr = prof(f), at = (r) => { const k = pr.ch.findIndex((x) => x.r === r); return k < 0 ? null : buf[f.addr - 1 + k] || 0; };
    const r = at('r'), g = at('g'), b = at('b'), w = at('w') || 0;
    if (r != null || g != null || b != null) {
      const R = (r || 0) + w * 0.7, G = (g || 0) + w * 0.6, B = (b || 0) + w * 0.4, m = Math.max(R, G, B, 1);
      return `rgb(${Math.round(R / m * 255)},${Math.round(G / m * 255)},${Math.round(B / m * 255)})`;
    }
    const cw = at('cwheel');
    if (cw != null) { const n = Object.entries(pr.wheel || DEF_WHEEL).find(([, v]) => v === cw); const c = n && COLORS.find((x) => x.n === n[0]); return c ? c.hex : '#FFFFFF'; }
    return '#FFE7B0';
  }
  $('#fixtureBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-f]'); if (!el) return;
    const id = el.dataset.f;
    // 1-bosish: tanlash · 2-bosish: faqat shu chiroqni sozlash (yakka) · 3-bosish: tanlovdan olish
    if (!sel.has(id)) { sel.add(id); insp.focus = id; inspOpen(true); }
    else if (insp.solo !== id) { insp.solo = id; insp.focus = id; inspOpen(true); }
    else {
      sel.delete(id); insp.solo = null;
      if (insp.focus === id) insp.focus = sel.size ? [...sel][sel.size - 1] : null;
    }
    renderSel();
  });
  // Chiroq yoniq deb hisoblanadigan eng kichik chiqish qiymati (0–255)
  const LIT_MIN = 3;
  function updateFixtureLevels() {
    let litN = 0;
    for (const f of show.fixtures) {
      const el = document.querySelector(`[data-lv="${f.id}"]`); if (!el) continue;
      const pr = prof(f); const k = pr.ch.findIndex((x) => x.r === 'dim');
      let v = 0;
      if (k >= 0) v = buf[f.addr - 1 + k] || 0;
      else { const ks = ['r', 'g', 'b', 'w'].map((r) => pr.ch.findIndex((x) => x.r === r)).filter((x) => x >= 0); v = Math.max(0, ...ks.map((x) => buf[f.addr - 1 + x] || 0)); }
      el.style.width = (v / 2.55).toFixed(0) + '%';
      // Yoniq chiroq: tugmada yashil chiroqcha + yashil hoshiya
      const lit = v >= LIT_MIN;
      if (lit) litN++;
      const btn = el.closest('[data-f]');
      if (btn && lit) { const c = outHex(f); if (btn._c !== c) { btn._c = c; btn.style.setProperty('--c', c); } }
      if (btn && btn.classList.contains('lit') !== lit) {
        btn.classList.toggle('lit', lit);
        btn.title = lit ? `${f.name}: yoniq (${Math.round(v / 2.55)}%)` : `${f.name}: o'chiq`;
      }
      const d = document.querySelector(`[data-dir="${f.id}"]`);
      if (d) {
        const kp = pr.ch.findIndex((x) => x.r === 'pan');
        const pv = kp >= 0 ? (buf[f.addr - 1 + kp] || 0) : 128;
        const t = pv < 112 ? '◀' : pv > 144 ? '▶' : '●';
        if (d.textContent !== t) d.textContent = t;
      }
    }
    const lc = $('#litCount'), lt = `${litN} ta yoniq`;
    if (lc && lc.dataset.n !== String(litN)) { lc.dataset.n = litN; lc.textContent = lt; $('#litInfo').classList.toggle('any', litN > 0); }
  }
  // Tanlovni ajratish: tanlanganlar ichidan toq / juft / 1-yarmi / 2-yarmi
  const selOrdered = () => show.fixtures.filter((f) => sel.has(f.id));
  $('#selHelp').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sh]'); if (!b) return;
    const list = selOrdered();
    if (!list.length) { toast('Avval chiroq tanlang'); return; }
    const n = list.length, h = Math.ceil(n / 2);
    const keep = list.filter((f, i) => ({ odd: i % 2 === 0, even: i % 2 === 1, h1: i < h, h2: i >= h })[b.dataset.sh]);
    sel.clear(); keep.forEach((f) => sel.add(f.id));
    renderSel(); flashBtn(b);
  });
  function renderSel() {
    if (insp.solo && !sel.has(insp.solo)) insp.solo = null;
    $$('#fixtureBtns [data-f]').forEach((b) => { const on = sel.has(b.dataset.f), ed = insp.solo === b.dataset.f; b.classList.toggle('on', on); b.classList.toggle('edit', ed); b.setAttribute('aria-pressed', on); });
    renderGroups();
    $('#selInfo').textContent = `${show.fixtures.length} ta chiroq · ${sel.size} ta tanlangan`;
    renderProgrammer();
  }

  /* ================= PULT: programmer ================= */
  // Programmer kimga tegadi: yakka sozlanayotgan chiroq bo'lsa — faqat unga, aks holda barcha tanlanganlarga
  const progIds = () => (insp.solo && sel.has(insp.solo) ? [insp.solo] : [...sel]);
  function setProg(param, value, ids = progIds()) {
    if (!ids.length) { toast('Avval chiroq tanlang'); return false; }
    if (!guardAction()) return false;
    for (const id of ids) { prog.vals[id] = prog.vals[id] || {}; prog.vals[id][param] = value; }
    return true;
  }
  function firstSelParams() {
    const id = progIds()[0]; if (!id) return null;
    // maqsad holat (fade tugagandagi qiymat) + programmer
    return mergeP({ ...defParams(), ...((play.to && play.to[id]) || {}) }, prog.vals[id]);
  }
  function renderProgrammer() {
    const p = firstSelParams();
    const dimPct = p ? Math.round(p.dim / 2.55) : 0;
    $('#dimR').value = dimPct; $('#dimV').textContent = dimPct + '%';
    $('#panR').value = p ? Math.round(p.pan) : 128; $('#panV').textContent = Math.round((p ? p.pan : 128) / 2.55) + '%';
    $('#tiltR').value = p ? Math.round(p.tilt) : 128; $('#tiltV').textContent = Math.round((p ? p.tilt : 128) / 2.55) + '%';
    const col = p && sel.size && [...sel].every((id) => prog.vals[id] && prog.vals[id].col) ? p.col : null;
    $('#colorBtns').innerHTML = COLORS.map((x, i) => `<button class="btn ${col === x.n ? 'on' : ''}" data-c="${i}" type="button"><span class="sw" style="background:${x.hex}"></span>${esc(x.n)}</button>`).join('');
    const pos = p && sel.size ? POSITIONS.find((x) => [...sel].every((id) => prog.vals[id] && prog.vals[id].pan === x.pan && prog.vals[id].tilt === x.tilt)) : null;
    $('#posBtns').innerHTML = POSITIONS.map((x, i) => `<button class="btn ${pos === x ? 'on' : ''}" data-p="${i}" type="button">${esc(x.n)}</button>`).join('');
    const activeFx = new Set([...prog.fx, ...play.fx].map((x) => x.type));
    $('#fxBtns').innerHTML = EFFECTS.map((x) => `<button class="btn ${activeFx.has(x.id) ? 'on' : ''}" data-x="${x.id}" type="button" aria-pressed="${activeFx.has(x.id)}">${esc(x.n)}</button>`).join('');
    const n = Object.keys(prog.vals).length;
    $('#progInfo').textContent = n ? `${n} ta chiroq oʻzgartirilgan` : '';
    renderEditBar();
    if (!insp.drag) renderInsp();
  }
  $('#dimR').addEventListener('input', (e) => { if (setProg('dim', +e.target.value * 2.55)) $('#dimV').textContent = e.target.value + '%'; else e.target.value = 0; });
  $$('[data-dim]').forEach((b) => b.addEventListener('click', () => { if (setProg('dim', +b.dataset.dim * 2.55)) renderProgrammer(); }));
  $('#panR').addEventListener('input', (e) => { if (setProg('pan', +e.target.value)) $('#panV').textContent = Math.round(e.target.value / 2.55) + '%'; });
  $('#tiltR').addEventListener('input', (e) => { if (setProg('tilt', +e.target.value)) $('#tiltV').textContent = Math.round(e.target.value / 2.55) + '%'; });
  $('#colorBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-c]'); if (!el) return;
    const x = COLORS[+el.dataset.c];
    const ids = progIds();
    if (!setProg('col', x.n, ids)) return;
    ids.forEach((id) => { const [r, g, b, w] = x.rgbw; Object.assign(prog.vals[id], { r, g, b, w }); });
    renderProgrammer();
  });
  // Bo'lish: tanlangan chiroqlarni chap / o'ng bo'yicha taqsimlash (tilt o'zgarmaydi)
  $('#splitBtns').addEventListener('click', (e) => {
    const b = e.target.closest('[data-split]'); if (!b) return;
    const list = selOrdered().filter((f) => hasRole(prof(f), 'pan'));
    if (!list.length) { toast('Avval moving head tanlang'); return; }
    if (!guardAction()) return;
    const L = POSITIONS[1].pan, R = POSITIONS[2].pan, n = list.length, h = Math.ceil(n / 2);
    let nl = 0, nr = 0;
    list.forEach((f, i) => {
      let pan;
      switch (b.dataset.split) {
        case 'half': pan = i < h ? L : R; break;
        case 'alt': pan = i % 2 === 0 ? L : R; break;
        case 'cross': pan = i < h ? R : L; break;
        default: pan = n === 1 ? 128 : Math.round((L + (R - L) * i / (n - 1)) * 100) / 100;
      }
      if (pan < 128) nl++; else if (pan > 128) nr++;
      prog.vals[f.id] = prog.vals[f.id] || {};
      prog.vals[f.id].pan = pan;
    });
    renderProgrammer(); flashBtn(b);
    toast(`Boʻlindi: ${nl} ta chapga, ${nr} ta oʻngga`);
  });
  $('#posBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-p]'); if (!el) return;
    const x = POSITIONS[+el.dataset.p];
    if (setProg('pan', x.pan)) { setProg('tilt', x.tilt); renderProgrammer(); }
  });
  $('#fxBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-x]'); if (!el) return;
    if (!guardAction()) return;
    const type = el.dataset.x;
    const i = prog.fx.findIndex((x) => x.type === type);
    const j = play.fx.findIndex((x) => x.type === type);
    if (i >= 0) prog.fx.splice(i, 1);
    else if (j >= 0) play.fx.splice(j, 1);
    else {
      if (!sel.size) { toast('Effekt uchun avval chiroq tanlang'); return; }
      prog.fx.push({ type, fids: show.fixtures.filter((f) => sel.has(f.id)).map((f) => f.id) });
    }
    renderProgrammer();
  });
  function release() { prog.vals = {}; prog.fx = []; renderProgrammer(); toast('Programmer tozalandi'); }
  $('#progClr').addEventListener('click', release);
  $('#relBtn').addEventListener('click', release);

  /* ================= PULT: cue'lar ================= */
  function renderCues() {
    const list = $('#cueList');
    if (!show.cues.length) {
      list.innerHTML = '<div class="empty">Hali cue yoʻq. Chiroqlarni tanlab, rang va intensivlik bering, keyin „CUE YOZISH“ ni bosing.</div>';
    } else {
      list.innerHTML = show.cues.map((q, i) => {
        const cls = i === play.cur ? 'cur' : i === play.next ? 'next' : '';
        const st = cueStatus(i);
        return `<div class="cue ${cls}" data-i="${i}" role="button" tabindex="0" aria-label="Cue ${esc(q.num)} ${esc(q.name)}">
          <b>${esc(q.num)}</b>
          <input data-name="${i}" value="${esc(q.name)}" aria-label="Cue nomi">
          <input data-fade="${i}" type="number" min="0" max="600" step="0.5" value="${q.fade}" aria-label="Fade soniya">
          <input class="auto" data-auto="${i}" inputmode="numeric" placeholder="qoʻlda" value="${q.auto ? fmtTime(q.auto) : ''}" aria-label="Avtomatik oʻtish vaqti (daqiqa:soniya)">
          <span class="st" id="cst${i}">${st}</span></div>`;
      }).join('');
    }
    const cur = show.cues[play.cur];
    $('#cueInfo').textContent = cur ? `Joriy: ${cur.num} · ${cur.name}` : `${show.cues.length} ta cue`;
    renderEditBar();
  }
  $('#cueList').addEventListener('click', (e) => {
    if (e.target.closest('input')) return;
    const row = e.target.closest('[data-i]'); if (!row) return;
    // Sahnani bosish — o'sha sahnaga o'tish (sozlamalari darhol ko'rinadi)
    const i = +row.dataset.i;
    if (i === play.cur && !Object.keys(prog.vals).length) return;
    goTo(i);
  });
  $('#cueList').addEventListener('keydown', (e) => {
    const row = e.target.closest('.cue[data-i]');
    if (row && e.target === row && (e.key === 'Enter')) goTo(+row.dataset.i);
  });
  $('#cueList').addEventListener('change', (e) => {
    const n = e.target.dataset.name, f = e.target.dataset.fade;
    if (n != null) { show.cues[+n].name = e.target.value.slice(0, 60); save(); }
    if (f != null) { show.cues[+f].fade = clamp(+e.target.value || 0, 0, 600); save(); }
    const a = e.target.dataset.auto;
    if (a != null) {
      const sec = parseTime(e.target.value);
      if (sec == null) { toast('Vaqtni daq:son koʻrinishida yozing, masalan 1:30'); e.target.value = show.cues[+a].auto ? fmtTime(show.cues[+a].auto) : ''; return; }
      show.cues[+a].auto = sec; e.target.value = sec ? fmtTime(sec) : '';
      if (+a === play.cur) play.autoFired = false;
      save(); updateAuto();
    }
  });

  // Programmerdagi o'zgarishlarni sahnaga yozish (faqat o'zgartirilgan chiroqlar; qolganlari tegilmaydi)
  function commitProg(i) {
    const q = show.cues[i]; if (!q) return 0;
    const ids = Object.keys(prog.vals);
    if (!ids.length && !prog.fx.length) return 0;
    q.look = q.look || {};
    for (const id of ids) {
      const p = mergeP(q.look[id] || defParams(), prog.vals[id]);
      if (p.raw) p.raw = Object.fromEntries(Object.entries(p.raw).map(([k, v]) => [k, Math.round(v)]));
      q.look[id] = { ...p, dim: Math.round(p.dim), r: Math.round(p.r), g: Math.round(p.g), b: Math.round(p.b), w: Math.round(p.w), pan: Math.round(p.pan * 100) / 100, tilt: Math.round(p.tilt * 100) / 100 };
    }
    if (prog.fx.length) q.fx = [...(q.fx || []), ...prog.fx.map((x) => ({ type: x.type, fids: [...x.fids] }))];
    prog.vals = {}; prog.fx = [];
    return ids.length || 1;
  }
  function renderEditBar() {
    const on = show.autoSave !== false, n = Object.keys(prog.vals).length, cur = show.cues[play.cur];
    const b = $('#autoSaveBtn'); if (!b) return;
    b.textContent = on ? '✎ AVTO-SAQLASH: YOQIQ' : '✎ AVTO-SAQLASH: OʻCHIQ';
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    const st = $('#editSt');
    st.className = 'edit-st' + (n ? ' dirty' : '');
    st.textContent = !n ? (cur ? `„${cur.name}“ — oʻzgarish yoʻq` : '')
      : on && cur ? `● ${n} ta chiroq oʻzgardi → „${cur.name}“ga yoziladi`
        : `● ${n} ta chiroq programmerda — barcha sahnalar ustidan turadi`;
  }
  function goTo(i) {
    if (!guardAction()) return;
    if (i < 0 || i >= show.cues.length) { toast(show.cues.length ? 'Roʻyxat oxiri' : 'Avval cue yozing'); return; }
    // Avto-saqlash: joriy sahnaga qilingan o'zgarishlar o'sha sahnada qoladi, keyingi sahnaga "yopishib" o'tmaydi
    if (show.autoSave !== false && play.cur >= 0 && play.cur < show.cues.length) {
      const n = commitProg(play.cur);
      if (n) { toast(`„${show.cues[play.cur].name}“ saqlandi`); play.to = cueLook(show.cues[play.cur]); play.from = null; play.dur = 0; play.fadeMs = 0; }
    }
    const now = performance.now();
    play.from = baseLook(now);
    play.to = cueLook(show.cues[i]);
    play.fadeMs = (show.cues[i].fade || 0) * 1000;
    play.mib = mibOn(); play.moveMs = mibMoveMs();
    // eng uzun vaqt: o'chish + burilish + fade (qorong'ida buriladigan chiroq bo'lsa)
    let extra = 0;
    if (play.mib) for (const id in play.to) {
      const a = play.from[id] || defParams(), b = play.to[id], f = fxById(id);
      if (f && mibCapable(f) && b.dim > 0.5 && posChanged(a, b, f)) extra = Math.max(extra, (a.dim > 0.5 ? MIB_OUT_MS : 0) + play.moveMs);
    }
    play.dur = play.fadeMs + extra;
    play.start = now; play.paused = false;
    play.fx = (show.cues[i].fx || []).map((x) => ({ type: x.type, fids: x.fids.filter((id) => show.fixtures.some((f) => f.id === id)) }));
    play.cur = i; play.next = i + 1 < show.cues.length ? i + 1 : i;
    play.autoFired = false;
    show.lastCue = i; save();
    renderCues(); renderProgrammer();
    flashBtn($('#goBtn')); flashBtn($('#go2Btn'));
  }
  function go() { goTo(play.next >= 0 && play.next < show.cues.length && play.next !== play.cur ? play.next : play.cur + 1); }
  function back() { if (play.cur > 0) goTo(play.cur - 1); }
  function flashBtn(b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 300); }
  function togglePause() {
    if (!play.to) return;
    const now = performance.now();
    if (play.paused) { play.start += now - play.pausedAt; play.paused = false; }
    else { play.pausedAt = now; play.paused = true; }
    $('#pauseBtn').classList.toggle('on', play.paused);
    renderCues();
  }
  $('#goBtn').addEventListener('click', go);
  $('#go2Btn').addEventListener('click', go);
  $('#backBtn').addEventListener('click', back);
  $('#pauseBtn').addEventListener('click', togglePause);

  /* ---- Avtomatik o'tish (auto-follow): cue boshlanganidan N daqiqa:soniya keyin keyingi cue ---- */
  function parseTime(v) {
    v = String(v || '').trim().replace(',', '.');
    if (!v) return 0;
    if (!/^\d+(\.\d+)?(:\d{1,2}(\.\d+)?){0,2}$/.test(v)) return null;
    const parts = v.split(':').map(Number);
    let s = 0; for (const p of parts) s = s * 60 + p;
    return Math.min(Math.round(s * 10) / 10, 24 * 3600);
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  if (show.autoOn === undefined) show.autoOn = true;
  // joriy cue uchun: avtomatik o'tishgacha qolgan soniya (yo'q bo'lsa null)
  function autoRemain(now) {
    const q = show.cues[play.cur];
    if (!show.autoOn || !q || !q.auto || play.autoFired || play.cur + 1 >= show.cues.length) return null;
    const t = (play.paused ? play.pausedAt : now) - play.start;
    return Math.max(0, q.auto - t / 1000);
  }
  function cueStatus(i) {
    if (i === play.cur) {
      const r = autoRemain(performance.now());
      const base = play.paused ? 'PAUZA' : 'IJRODA';
      return r == null ? base : base + ' · → ' + fmtTime(r);
    }
    return i === play.next ? 'KEYINGI' : '';
  }
  let lastAutoTxt = '';
  function updateAuto() {
    const now = performance.now();
    const r = autoRemain(now);
    const q = show.cues[play.cur];
    $('#autoBar').style.width = r == null ? '0%' : ((1 - r / q.auto) * 100).toFixed(1) + '%';
    if (r != null && r <= 0 && !play.paused) {
      play.autoFired = true;
      if (!locked()) { goTo(play.cur + 1); return; }
    }
    const el = document.getElementById('cst' + play.cur);
    if (el) { const t = cueStatus(play.cur); if (t !== lastAutoTxt || el.textContent === '') { el.textContent = t; lastAutoTxt = t; } }
  }
  setInterval(updateAuto, 100);
  function renderAutoBtn() {
    const b = $('#autoBtn');
    b.classList.toggle('on', !!show.autoOn); b.setAttribute('aria-pressed', !!show.autoOn);
    b.textContent = show.autoOn ? 'AVTO YOQIQ' : 'AVTO OʻCHIQ';
  }
  function renderMib() {
    const b = $('#mibBtn');
    b.classList.toggle('on', mibOn()); b.setAttribute('aria-pressed', mibOn());
    b.textContent = mibOn() ? 'QORONGʻIDA BURILISH YOQIQ' : 'QORONGʻIDA BURILISH OʻCHIQ';
    $('#mibTime').value = show.mibMove ?? 1.5;
    $('#mibTime').disabled = !mibOn();
  }
  $('#mibBtn').addEventListener('click', () => {
    show.mib = !mibOn(); save(); renderMib();
    toast(mibOn() ? 'Moving head’lar qorongʻida buriladi, keyin fade bilan yonadi' : 'Qorongʻida burilish oʻchirildi: nur yonib turgan holda buriladi');
  });
  $('#mibTime').addEventListener('change', (e) => { show.mibMove = clamp(+e.target.value || 0, 0, 10); e.target.value = show.mibMove; save(); });
  $('#autoSaveBtn').addEventListener('click', () => {
    show.autoSave = show.autoSave === false;
    save(); renderEditBar();
    toast(show.autoSave ? 'Avto-saqlash yoqildi: sahna almashganda oʻzgarishlar oʻsha sahnaga yoziladi' : 'Avto-saqlash oʻchdi: oʻzgarishlar programmerda qoladi (YANGILASH bilan yozasiz)');
  });
  $('#autoBtn').addEventListener('click', () => {
    show.autoOn = !show.autoOn; save(); renderAutoBtn();
    toast(show.autoOn ? 'Avtomatik oʻtish yoqildi' : 'Avtomatik oʻtish oʻchirildi — faqat GO bilan');
    renderCues(); updateAuto();
  });

  function nextNum() {
    const last = show.cues[show.cues.length - 1];
    const n = last ? Math.floor(parseFloat(last.num) || show.cues.length) + 1 : 1;
    return String(n);
  }
  function snapshot() {
    const live = liveLook(performance.now()), look = {};
    for (const id in live) { const p = live[id]; look[id] = { ...p, ...(p.raw ? { raw: Object.fromEntries(Object.entries(p.raw).map(([k, v]) => [k, Math.round(v)])) } : {}), dim: Math.round(p.dim), pan: Math.round(p.pan * 100) / 100, tilt: Math.round(p.tilt * 100) / 100, r: Math.round(p.r), g: Math.round(p.g), b: Math.round(p.b), w: Math.round(p.w) }; }
    return { look, fx: [...play.fx, ...prog.fx].map((x) => ({ type: x.type, fids: [...x.fids] })) };
  }
  $('#recBtn').addEventListener('click', () => {
    if (!guardAction()) return;
    if (isStart() && show.cues.length >= LIMITS.cues) { toast(`Start tarifida ${LIMITS.cues} tagacha cue. PRO’ga oʻting.`); openPaywall(); return; }
    const s = snapshot();
    const at = play.cur >= 0 ? play.cur + 1 : show.cues.length;
    const sceneWord = { uz: 'Sahna', ru: 'Сцена', en: 'Scene' }[(window.SNI18N && SNI18N.lang()) || 'uz'];
    const q = { id: uid(), num: nextNum(), name: sceneWord + ' ' + (show.cues.length + 1), fade: 2, ...s };
    show.cues.splice(at, 0, q);
    prog.vals = {}; prog.fx = [];
    play.cur = at; play.to = cueLook(q); play.from = null; play.dur = 0; play.fadeMs = 0;
    show.lastCue = at; play.fx = q.fx.map((x) => ({ ...x, fids: [...x.fids] }));
    play.next = Math.min(at + 1, show.cues.length - 1);
    save(); renderCues(); renderProgrammer();
    flashBtn($('#recBtn'));
    toast(`Cue ${q.num} yozildi`);
    setTimeout(() => { const el = $(`[data-name="${at}"]`); if (el) { el.focus(); el.select(); } }, 30);
  });
  $('#updBtn').addEventListener('click', () => {
    if (!guardAction()) return;
    const i = play.cur >= 0 ? play.cur : -1;
    if (i < 0) { toast('Yangilash uchun avval cue’ni ijro eting'); return; }
    Object.assign(show.cues[i], snapshot());
    prog.vals = {}; prog.fx = [];
    play.to = cueLook(show.cues[i]); play.from = null; play.dur = 0; play.fadeMs = 0; play.fx = show.cues[i].fx.map((x) => ({ ...x, fids: [...x.fids] }));
    save(); renderCues(); renderProgrammer(); flashBtn($('#updBtn'));
    toast(`Cue ${show.cues[i].num} yangilandi`);
  });
  $('#delBtn').addEventListener('click', () => {
    const i = play.next >= 0 && play.next < show.cues.length ? play.next : play.cur;
    const q = show.cues[i]; if (!q) return;
    if (!confirmSoft(`Cue ${q.num} · ${q.name} oʻchirilsinmi?`)) return;
    show.cues.splice(i, 1);
    if (play.cur === i) play.cur = -1; else if (play.cur > i) play.cur--;
    play.next = clamp(play.next > i ? play.next - 1 : play.next, 0, Math.max(0, show.cues.length - 1));
    save(); renderCues();
  });
  $('#clrCueBtn').addEventListener('click', () => {
    if (!guardAction()) return;
    const now = performance.now();
    play.from = baseLook(now); play.to = emptyLook(); play.dur = 2000; play.fadeMs = 2000; play.mib = false; play.start = now; play.paused = false; play.fx = []; play.cur = -1;
    show.lastCue = -1; save();
    renderCues(); renderProgrammer(); toast('Sahna 2 soniyada oʻchmoqda');
  });
  let confirmAt = 0, confirmMsg = '';
  function confirmSoft(msg) {
    // ikki marta bosish bilan tasdiqlash (brauzer dialogisiz)
    const now = Date.now();
    if (confirmMsg === msg && now - confirmAt < 3000) { confirmMsg = ''; return true; }
    confirmMsg = msg; confirmAt = now; toast(msg + ' Tasdiqlash uchun yana bir marta bosing.');
    return false;
  }


  /* ================= CHIROQ SOZLAMALARI (inspektor) =================
     Pultda chiroq bosilganda uning har bir kanali ko'rinadi va boshqariladi.
     O'zgarishlar programmerga yoziladi → CUE YOZISH bilan cue'ga tushadi. */
  const INSP_KEY = 'sn_insp_open';
  const ROLE_CHIP = { dim: 'yorqinlik', r: 'qizil', g: 'yashil', b: 'koʻk', w: 'oq', pan: 'pan', tilt: 'tilt', panF: 'pan aniq', tiltF: 'tilt aniq', strobe: 'shutter', cwheel: 'rang gʻild.', gobo: 'gobo', fixed: 'kanal', a: 'amber', uv: 'UV' };
  const ROLE_TINT = { r: '#DC2626', g: '#16A34A', b: '#2563EB', w: '#d4d4d8', dim: '#f59e0b' };
  function inspOpen(v) {
    const open = v ?? !$('#insp').classList.contains('open');
    $('#insp').classList.toggle('open', open);
    document.querySelector('#tab-pult .row3').classList.toggle('insp-open', open);
    $('#inspTab').setAttribute('aria-expanded', open);
    try { localStorage.setItem(INSP_KEY, open ? '1' : '0'); } catch (_) {}
    if (open) renderInsp();
  }
  const inspFix = () => show.fixtures.find((f) => f.id === insp.focus) || null;
  // O'zgarish kimga tegadi: fokusdagi chiroq + u bilan bir turdagi tanlangan chiroqlar
  function inspTargets(f) {
    if (!f) return [];
    if (!sel.has(f.id) || insp.solo === f.id) return [f];
    return show.fixtures.filter((x) => sel.has(x.id) && x.prof === f.prof);
  }
  const tgtParams = (id) => mergeP({ ...defParams(), ...((play.to && play.to[id]) || {}) }, prog.vals[id]);
  function chVal(f, ch, k, p) {
    const pr = prof(f);
    if (PARAM_ROLE[ch.r]) return clamp(Math.round(p[PARAM_ROLE[ch.r]] ?? 0), 0, 255);
    if (p.raw && p.raw[k] != null) return Math.round(p.raw[k]);
    if (ch.r === 'cwheel') return (pr.wheel || DEF_WHEEL)[p.col] ?? 0;
    if (ch.r === 'panF') return Math.round((p.pan - Math.floor(p.pan)) * 255);
    if (ch.r === 'tiltF') return Math.round((p.tilt - Math.floor(p.tilt)) * 255);
    return ch.d || 0;
  }
  const inProg = (id, ch, k) => { const v = prog.vals[id]; if (!v) return false; return PARAM_ROLE[ch.r] ? v[PARAM_ROLE[ch.r]] != null : !!(v.raw && v.raw[k] != null) || (ch.r === 'cwheel' && v.col != null); };
  function chText(f, ch, v) {
    const pr = prof(f);
    if (ch.r === 'dim') return Math.round(v / 2.55) + '%';
    if (ch.r === 'pan') return Math.round((v / 255 - 0.5) * (pr.panRange || 540)) + '°';
    if (ch.r === 'tilt') return Math.round((v / 255 - 0.5) * (pr.tiltRange || 270)) + '°';
    if (ch.r === 'cwheel') { const n = Object.entries(pr.wheel || DEF_WHEEL).find(([, x]) => x === v); return n ? n[0] : ''; }
    return '';
  }
  function outColor(f, p) {
    const pr = prof(f);
    if (hasRole(pr, 'r') || hasRole(pr, 'g') || hasRole(pr, 'b')) {
      const w = hasRole(pr, 'w') ? (p.w || 0) * 0.6 : 0;
      return `rgb(${Math.min(255, p.r + w) | 0},${Math.min(255, p.g + w) | 0},${Math.min(255, p.b + w) | 0})`;
    }
    if (hasRole(pr, 'cwheel')) return (COLORS.find((c) => c.n === p.col) || COLORS[7]).hex;
    return '#FFF4D6';
  }
  function setParam(ids, key, v) {
    for (const id of ids) { prog.vals[id] = prog.vals[id] || {}; prog.vals[id][key] = v; }
  }
  function setRaw(ids, k, v) {
    for (const id of ids) { const o = (prog.vals[id] = prog.vals[id] || {}); o.raw = { ...(o.raw || {}), [k]: v }; }
  }
  function releaseCh(ids, ch, k) {
    for (const id of ids) {
      const o = prog.vals[id]; if (!o) continue;
      if (PARAM_ROLE[ch.r]) delete o[PARAM_ROLE[ch.r]];
      else { if (o.raw) { delete o.raw[k]; if (!Object.keys(o.raw).length) delete o.raw; } if (ch.r === 'cwheel') delete o.col; }
      if (!Object.keys(o).length) delete prog.vals[id];
    }
  }
  function renderInsp() {
    const box = $('#inspContent'); if (!box) return;
    let f = inspFix();
    if (!f && sel.size) { insp.focus = [...sel][0]; f = inspFix(); }
    $('#inspDot').classList.toggle('on', !!f);
    if (!$('#insp').classList.contains('open')) return;
    if (!f) {
      box.innerHTML = `<div class="insp-empty"><div class="insp-bulb" aria-hidden="true"></div><b>Chiroq tanlanmagan</b><span>Chap tomondagi istalgan chiroqni bosing — uning barcha kanallari shu yerda ochiladi.</span></div>`;
      return;
    }
    const pr = prof(f), tg = inspTargets(f), p = tgtParams(f.id);
    const end = f.addr + pr.ch.length - 1;
    const mover = hasRole(pr, 'pan') || hasRole(pr, 'tilt');
    const idx = show.fixtures.indexOf(f) + 1;
    const wheel = hasRole(pr, 'cwheel') ? Object.entries(pr.wheel || DEF_WHEEL) : null;
    const rgb = hasRole(pr, 'r') || hasRole(pr, 'g') || hasRole(pr, 'b');
    box.innerHTML = `
      <div class="insp-card">
        <div class="insp-orb" id="inspOrb" style="--c:${outColor(f, p)}"><i></i></div>
        <div class="insp-id">
          <b>${esc(f.name)}</b>
          <span>${esc(pr.name)}</span>
          <span class="insp-addr">DMX ${f.addr}–${end} · ${idx}/${show.fixtures.length}</span>
        </div>
      </div>
      ${insp.solo === f.id ? '<div class="insp-multi solo">✎ Faqat shu chiroq sozlanmoqda · yana bosilsa — tanlovdan olinadi</div>' : tg.length > 1 ? `<div class="insp-multi">✦ ${tg.length} ta bir xil chiroqqa birdaniga · alohida sozlash uchun chiroqni yana bir marta bosing</div>` : sel.has(f.id) ? '' : '<div class="insp-multi warn">Bu chiroq tanlanmagan — oʻzgarish faqat unga</div>'}
      <div class="insp-quick">
        <button class="btn sm" data-iq="full" type="button">FULL</button>
        <button class="btn sm" data-iq="half" type="button">50%</button>
        <button class="btn sm" data-iq="off" type="button">0%</button>
        <button class="btn sm" data-iq="hl" type="button" title="Toʻliq yorqin, oq, shutter ochiq${mover ? ', markazda' : ''}">YORITISH</button>
        <button class="btn sm" data-iq="rel" type="button" title="Shu chiroq uchun programmerdagi oʻzgarishlarni olib tashlash">TOZALASH</button>
      </div>
      ${rgb ? `<div class="insp-sw">${COLORS.map((c, i) => `<button class="sw-b ${p.col === c.n && prog.vals[f.id]?.col ? 'on' : ''}" data-ic="${i}" type="button" title="${esc(c.n)}" style="--c:${c.hex}"></button>`).join('')}</div>` : ''}
      ${wheel ? `<div class="insp-sw wheel" title="Rang gʻildiragi">${wheel.map(([n, v]) => { const c = COLORS.find((x) => x.n === n); return `<button class="sw-b ${p.col === n ? 'on' : ''}" data-iw="${esc(n)}" type="button" title="${esc(n)} · ${v}" style="--c:${c ? c.hex : '#888'}"></button>`; }).join('')}</div>` : ''}
      ${mover ? `<div class="insp-xy-w">
        <div class="insp-xy" id="inspXY" role="slider" tabindex="0" aria-label="Pan va Tilt" aria-valuetext="Pan ${Math.round(p.pan)}, Tilt ${Math.round(p.tilt)}">
          <i class="xy-c"></i><i class="xy-h"></i><i class="xy-v"></i>
          <b class="xy-dot" id="inspXYDot" style="left:${(p.pan / 255) * 100}%;top:${(1 - p.tilt / 255) * 100}%"></b>
        </div>
        <div class="xy-read"><span>PAN <b id="inspPanT">${chText(f, { r: 'pan' }, p.pan)}</b></span><span>TILT <b id="inspTiltT">${chText(f, { r: 'tilt' }, p.tilt)}</b></span><button class="btn sm" data-iq="center" type="button">MARKAZ</button></div>
      </div>` : ''}
      <div class="insp-rows" id="inspRows">
        ${pr.ch.map((ch, k) => {
          const v = chVal(f, ch, k, p), held = inProg(f.id, ch, k);
          return `<div class="ir ${held ? 'held' : ''}" data-k="${k}">
            <span class="ir-n"><i>${f.addr + k}</i>${esc(ch.n)}<em style="${ROLE_TINT[ch.r] ? `--t:${ROLE_TINT[ch.r]}` : ''}">${ROLE_CHIP[ch.r] || ch.r}</em></span>
            <input type="range" min="0" max="255" value="${v}" data-ik="${k}" aria-label="${esc(ch.n)}" style="${ROLE_TINT[ch.r] ? `accent-color:${ROLE_TINT[ch.r]}` : ''}">
            <input class="n" type="number" min="0" max="255" value="${v}" data-ikn="${k}" aria-label="${esc(ch.n)} qiymati">
            <span class="ir-t" data-it="${k}">${chText(f, ch, v)}</span>
            <button class="btn sm x" data-ir="${k}" type="button" title="Oʻz holiga qaytarish" ${held ? '' : 'disabled'}>↺</button>
            <span class="ir-o" aria-hidden="true"><i data-io="${k}"></i></span>
          </div>`;
        }).join('')}
      </div>
      <p class="muted small insp-foot">Oʻzgarishlar programmerga tushadi — CUE YOZISH yoki YANGILASH bosilsa, sahnaga yoziladi. Ingichka yashil chiziq — chiroqqa hozir ketayotgan haqiqiy qiymat.</p>`;
    refreshInspOut();
  }
  // Har kadrda: haqiqiy chiqish chiziqlari, orb va (surilmayotgan bo'lsa) qiymatlar
  function refreshInspOut() {
    if (!$('#insp').classList.contains('open')) return;
    const f = inspFix(); if (!f) return;
    const pr = prof(f), p = tgtParams(f.id);
    let dimOut = 0;
    pr.ch.forEach((ch, k) => {
      const a = f.addr - 1 + k, o = buf[a] || 0;
      const el = document.querySelector(`[data-io="${k}"]`); if (el) el.style.width = (o / 2.55) + '%';
      if (ch.r === 'dim') dimOut = Math.max(dimOut, o);
      if (insp.drag) return;
      const v = chVal(f, ch, k, p), r = document.querySelector(`[data-ik="${k}"]`), n = document.querySelector(`[data-ikn="${k}"]`);
      if (r && document.activeElement !== r && +r.value !== v) r.value = v;
      if (n && document.activeElement !== n && +n.value !== v) n.value = v;
      const t = document.querySelector(`[data-it="${k}"]`); if (t) t.textContent = chText(f, ch, v);
    });
    if (!hasRole(pr, 'dim')) dimOut = Math.max(...pr.ch.map((ch, k) => (['r', 'g', 'b', 'w'].includes(ch.r) ? buf[f.addr - 1 + k] || 0 : 0)), 0);
    const orb = $('#inspOrb');
    if (orb) { orb.style.setProperty('--c', outColor(f, p)); orb.style.setProperty('--a', (dimOut / 255).toFixed(2)); orb.classList.toggle('lit', dimOut >= LIT_MIN); }
    const dot = $('#inspXYDot');
    if (dot && !insp.drag) { dot.style.left = (p.pan / 255) * 100 + '%'; dot.style.top = (1 - p.tilt / 255) * 100 + '%'; $('#inspPanT').textContent = chText(f, { r: 'pan' }, p.pan); $('#inspTiltT').textContent = chText(f, { r: 'tilt' }, p.tilt); }
  }
  function inspSetCh(k, v) {
    const f = inspFix(); if (!f || !guardAction()) return false;
    const ch = prof(f).ch[k], tg = inspTargets(f).map((x) => x.id);
    v = clamp(Math.round(+v || 0), 0, 255);
    if (PARAM_ROLE[ch.r]) setParam(tg, PARAM_ROLE[ch.r], v);
    else if (ch.r === 'panF' || ch.r === 'tiltF') { const key = ch.r === 'panF' ? 'pan' : 'tilt'; for (const id of tg) { const base = Math.floor(tgtParams(id)[key]); setParam([id], key, base + v / 256); } }
    else setRaw(tg, k, v);
    const row = document.querySelector(`.ir[data-k="${k}"]`);
    if (row) { row.classList.add('held'); row.querySelector('[data-ir]').disabled = false; const t = row.querySelector('[data-it]'); if (t) t.textContent = chText(f, ch, v); }
    return true;
  }
  $('#inspTab').addEventListener('click', () => inspOpen());
  $('#inspClose').addEventListener('click', () => inspOpen(false));
  function inspStep(d) {
    const list = show.fixtures; if (!list.length) return;
    const i = list.indexOf(inspFix());
    const nf = list[((i < 0 ? 0 : i + d) % list.length + list.length) % list.length];
    insp.focus = nf.id; insp.solo = null; sel.clear(); sel.add(nf.id); renderSel();
    const b = document.querySelector(`#fixtureBtns [data-f="${nf.id}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  $('#inspPrev').addEventListener('click', () => inspStep(-1));
  $('#inspNext').addEventListener('click', () => inspStep(1));
  $('#inspContent').addEventListener('pointerdown', (e) => { if (e.target.matches('input[type=range]')) insp.drag = true; });
  window.addEventListener('pointerup', () => { insp.drag = false; });
  $('#inspContent').addEventListener('input', (e) => {
    const k = e.target.dataset.ik ?? e.target.dataset.ikn; if (k == null) return;
    if (!inspSetCh(+k, e.target.value)) { renderInsp(); return; }
    const other = document.querySelector(e.target.dataset.ik != null ? `[data-ikn="${k}"]` : `[data-ik="${k}"]`); if (other) other.value = e.target.value;
  });
  $('#inspContent').addEventListener('change', (e) => { if (e.target.dataset.ik != null || e.target.dataset.ikn != null) { renderProgrammer(); renderInsp(); } });
  $('#inspContent').addEventListener('click', (e) => {
    const f = inspFix(); if (!f) return;
    const pr = prof(f), ids = inspTargets(f).map((x) => x.id);
    const r = e.target.closest('[data-ir]'), q = e.target.closest('[data-iq]'), c = e.target.closest('[data-ic]'), w = e.target.closest('[data-iw]');
    if (r) { releaseCh(ids, pr.ch[+r.dataset.ir], +r.dataset.ir); }
    else if (!(q || c || w)) return;
    else if (!guardAction()) return;
    else if (c) { const x = COLORS[+c.dataset.ic]; const [R, G, B, W] = x.rgbw; ids.forEach((id) => { prog.vals[id] = prog.vals[id] || {}; Object.assign(prog.vals[id], { r: R, g: G, b: B, w: W, col: x.n }); }); }
    else if (w) { ids.forEach((id) => { const o = (prog.vals[id] = prog.vals[id] || {}); o.col = w.dataset.iw; if (o.raw) { pr.ch.forEach((ch, k) => { if (ch.r === 'cwheel') delete o.raw[k]; }); } }); }
    else if (q) {
      const a = q.dataset.iq;
      if (a === 'full') setParam(ids, 'dim', 255);
      else if (a === 'half') setParam(ids, 'dim', 128);
      else if (a === 'off') setParam(ids, 'dim', 0);
      else if (a === 'center') { setParam(ids, 'pan', 128); setParam(ids, 'tilt', 128); }
      else if (a === 'rel') ids.forEach((id) => delete prog.vals[id]);
      else if (a === 'hl') {
        ids.forEach((id) => {
          const o = (prog.vals[id] = prog.vals[id] || {});
          Object.assign(o, { dim: 255, r: 255, g: 255, b: 255, w: 255, col: 'Oq' });
          if (hasRole(pr, 'pan')) Object.assign(o, { pan: 128, tilt: 128 });
          if (o.raw) pr.ch.forEach((ch, k) => { if (ch.r === 'strobe' || ch.r === 'cwheel') delete o.raw[k]; });
        });
      }
    }
    renderProgrammer(); renderInsp();
  });
  // XY pad: Pan (gorizontal) va Tilt (vertikal) bitta barmoq bilan
  function xyFrom(e) {
    const pad = $('#inspXY'), r = pad.getBoundingClientRect();
    return { pan: clamp((e.clientX - r.left) / r.width, 0, 1) * 255, tilt: (1 - clamp((e.clientY - r.top) / r.height, 0, 1)) * 255 };
  }
  function xyApply(v) {
    const f = inspFix(); if (!f) return;
    const ids = inspTargets(f).map((x) => x.id);
    setParam(ids, 'pan', Math.round(v.pan * 100) / 100); setParam(ids, 'tilt', Math.round(v.tilt * 100) / 100);
    const dot = $('#inspXYDot'); dot.style.left = (v.pan / 255) * 100 + '%'; dot.style.top = (1 - v.tilt / 255) * 100 + '%';
    $('#inspPanT').textContent = chText(f, { r: 'pan' }, v.pan); $('#inspTiltT').textContent = chText(f, { r: 'tilt' }, v.tilt);
  }
  $('#inspContent').addEventListener('pointerdown', (e) => {
    const pad = e.target.closest('#inspXY'); if (!pad) return;
    if (!guardAction()) return;
    e.preventDefault(); insp.drag = true; pad.setPointerCapture(e.pointerId); xyApply(xyFrom(e));
    const mv = (ev) => xyApply(xyFrom(ev));
    const up = () => { pad.removeEventListener('pointermove', mv); pad.removeEventListener('pointerup', up); pad.removeEventListener('pointercancel', up); insp.drag = false; renderProgrammer(); renderInsp(); };
    pad.addEventListener('pointermove', mv); pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
  });
  $('#inspContent').addEventListener('keydown', (e) => {
    if (e.target.id !== 'inspXY') return;
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return;
    e.preventDefault(); e.stopPropagation();
    const f = inspFix(); if (!f || !guardAction()) return;
    const p = tgtParams(f.id), st = e.shiftKey ? 8 : 1;
    xyApply({ pan: clamp(p.pan + d[0] * st, 0, 255), tilt: clamp(p.tilt + d[1] * st, 0, 255) });
  });
  try { if (localStorage.getItem(INSP_KEY) === '1') setTimeout(() => inspOpen(true), 0); } catch (_) {}

  /* ================= Faderlar ================= */
  function renderFaders() {
    const gs = groups();
    const items = [...gs.map((g) => ({ k: 'g:' + g, n: g, v: show.levels[g] ?? 100, flash: true })),
      { k: 'fxd', n: 'Effekt', v: show.fxDepth }, { k: 'fxs', n: 'FX tezlik', v: show.fxSpeed }, { k: 'm', n: 'MASTER', v: show.master, master: true }];
    $('#faders').innerHTML = items.map((x) => `<div class="fader ${x.master ? 'master' : ''}">
      <span class="fl">${esc(x.n)}</span>
      <input type="range" min="0" max="100" value="${x.v}" data-fd="${esc(x.k)}" aria-label="${esc(x.n)} darajasi">
      <span class="fv" data-fv="${esc(x.k)}">${x.v}%</span>
      ${x.flash ? `<button class="btn" data-fl="${esc(x.n)}" type="button">FLASH</button>` : '<span style="min-height:40px"></span>'}
    </div>`).join('');
  }
  $('#faders').addEventListener('input', (e) => {
    const k = e.target.dataset.fd; if (k == null) return;
    const v = +e.target.value;
    if (k.startsWith('g:')) show.levels[k.slice(2)] = v;
    else if (k === 'fxd') show.fxDepth = v; else if (k === 'fxs') show.fxSpeed = v; else if (k === 'm') show.master = v;
    const fv = document.querySelector(`[data-fv="${CSS.escape(k)}"]`); if (fv) fv.textContent = v + '%';
    save();
  });
  const flashOn = (e) => { const b = e.target.closest('[data-fl]'); if (!b) return; e.preventDefault(); if (locked()) return; flash.add(b.dataset.fl); b.classList.add('on'); };
  const flashOff = () => { flash.clear(); $$('#faders [data-fl]').forEach((b) => b.classList.remove('on')); };
  $('#faders').addEventListener('pointerdown', flashOn);
  window.addEventListener('pointerup', flashOff);
  window.addEventListener('pointercancel', flashOff);

  /* ================= Blackout, saqlash ================= */
  function toggleBlackout() {
    blackout = !blackout;
    $('#boBtn').classList.toggle('on', blackout);
    $('#boBtn').textContent = blackout ? 'BLACKOUT FAOL' : 'BLACKOUT';
  }
  $('#boBtn').addEventListener('click', toggleBlackout);
  $('#saveBtn').addEventListener('click', () => {
    save(true);
    const b = $('#saveBtn'); b.classList.add('on'); b.textContent = 'SAQLANDI';
    setTimeout(() => { b.classList.remove('on'); b.textContent = 'SAQLASH'; }, 1200);
  });
  $('#showTitle').addEventListener('input', (e) => { show.title = e.target.value.slice(0, 80); document.title = show.title + ' — SAHNA NURI'; save(); });

  /* ================= PATCH ================= */
  function patchProblems() {
    const used = new Map(), bad = new Set();
    for (const f of show.fixtures) {
      const n = prof(f).ch.length;
      if (f.addr < 1 || f.addr + n - 1 > 512) bad.add(f.id);
      for (let a = f.addr; a < f.addr + n; a++) {
        if (used.has(a)) { bad.add(f.id); bad.add(used.get(a)); } else used.set(a, f.id);
      }
    }
    return { bad, used: used.size };
  }
  function renderPatch() {
    const { bad, used } = patchProblems();
    const opts = (cur) => Object.entries(show.profiles).map(([k, p]) => `<option value="${esc(k)}" ${k === cur ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    $('#patchRows').innerHTML = show.fixtures.map((f, i) => {
      const n = prof(f).ch.length;
      return `<tr class="${bad.has(f.id) ? 'bad' : ''}">
        <td>${i + 1}</td>
        <td><input data-pn="${f.id}" value="${esc(f.name)}" aria-label="Nomi"></td>
        <td><select data-pp="${f.id}" aria-label="Profil">${opts(f.prof)}</select></td>
        <td><input class="n" data-pa="${f.id}" type="number" min="1" max="512" value="${f.addr}" aria-label="DMX manzil"></td>
        <td>${n}</td>
        <td>${f.addr}–${f.addr + n - 1}</td>
        <td><button class="btn x" data-pd="${f.id}" type="button" aria-label="Oʻchirish">✕</button></td></tr>`;
    }).join('') || '<tr><td colspan="7" class="muted" style="padding:20px">Chiroqlar yoʻq</td></tr>';
    $('#patchInfo').textContent = `${show.fixtures.length} ta chiroq · ${used} / 512 kanal band`;
    const w = $('#patchWarn');
    if (bad.size) { w.hidden = false; w.textContent = `${bad.size} ta chiroqning manzili ustma-ust tushgan yoki 512 dan oshgan (qizil qatorlar). „Manzillarni ketma-ket qoʻyish“ tugmasi tuzatadi.`; }
    else w.hidden = true;
    $('#addProf').innerHTML = opts($('#addProf').value || 'fs_beam18');
    $('#addAddr').value = nextFree();
    renderLock();
  }

  /* ---------- Patch qulfi: tasodifan o'chirish/o'zgartirishdan himoya ---------- */
  const patchLocked = () => show.patchLocked !== false; // standart: qulflangan
  function renderLock() {
    const L = patchLocked();
    const b = $('#patchLock');
    b.textContent = L ? '🔒 QULFLANGAN' : '🔓 QULF OCHIQ';
    b.classList.toggle('locked', L);
    b.title = L ? 'Patch himoyalangan. Ochish uchun bosing.' : 'Patchni qulflash';
    $('#lockNote').hidden = !L;
    document.querySelectorAll('#patchRows input, #patchRows select').forEach((el) => { el.disabled = L; });
    document.querySelectorAll('#patchRows [data-pd]').forEach((el) => { el.hidden = L; });
    ['#addFix', '#autoAddr', '#defPatch', '#importBtn'].forEach((id) => { const el = $(id); if (el) el.disabled = L; });
    renderRestore();
  }
  $('#patchLock').addEventListener('click', () => {
    if (patchLocked()) {
      if (!confirmSoft('Patch qulfi ochilsinmi? Chiroqlarni oʻchirish va oʻzgartirish mumkin boʻladi.')) return;
      show.patchLocked = false; toast('🔓 Qulf ochildi. Ish tugagach yana qulflang.');
    } else { show.patchLocked = true; toast('🔒 Patch qulflandi'); }
    save(); renderPatch();
  });

  /* ---------- Yo'qolgan chiroqlarni tiklash (Andijon teatri ro'yxati bo'yicha) ---------- */
  function missingStd() {
    const names = new Set(show.fixtures.map((f) => f.name));
    const known = ANDIJAN_PATCH.filter(([n]) => names.has(n)).length;
    if (known < 10) return []; // boshqa teatr patchi — tegilmaydi
    return ANDIJAN_PATCH.filter(([n]) => !names.has(n));
  }
  function renderRestore() {
    const miss = missingStd(), box = $('#restoreBox');
    box.hidden = !miss.length;
    if (miss.length) $('#restoreText').textContent = `Roʻyxatdan ${miss.length} ta chiroq yoʻqolgan: ${miss.map(([n]) => n).join(', ')}`;
  }
  $('#restoreBtn').addEventListener('click', () => {
    const miss = missingStd(); if (!miss.length) return;
    const D = DEFAULT_PROFILES();
    for (const [name, pk, addr] of miss) {
      if (!show.profiles[pk]) show.profiles[pk] = D[pk];
      show.fixtures.push({ id: uid(), name, prof: pk, addr });
    }
    show.fixtures.sort((a, b) => a.addr - b.addr);
    save(); renderPatch(); renderAllPult();
    toast(`${miss.length} ta chiroq tiklandi: ${miss.map(([n]) => n).join(', ')}`);
  });
  function nextFree() { let m = 0; for (const f of show.fixtures) m = Math.max(m, f.addr + prof(f).ch.length - 1); return Math.min(512, m + 1); }
  $('#patchRows').addEventListener('change', (e) => {
    const t = e.target, d = t.dataset;
    const f = show.fixtures.find((x) => x.id === (d.pn || d.pp || d.pa)); if (!f) return;
    if (patchLocked()) { renderPatch(); return; }
    if (d.pn) f.name = t.value.slice(0, 30);
    if (d.pp) f.prof = t.value;
    if (d.pa) f.addr = clamp(Math.round(+t.value || 1), 1, 512);
    save(); renderPatch(); renderAllPult();
  });
  $('#patchRows').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pd]'); if (!b || patchLocked()) return;
    const f = show.fixtures.find((x) => x.id === b.dataset.pd);
    if (!confirmSoft(`${f.name} oʻchirilsinmi?`)) return;
    show.fixtures = show.fixtures.filter((x) => x !== f); sel.delete(f.id); delete prog.vals[f.id];
    save(); renderPatch(); renderAllPult();
  });
  $('#addFix').addEventListener('click', () => {
    if (patchLocked()) return toast('🔒 Patch qulflangan');
    const p = $('#addProf').value, n = clamp(+$('#addCount').value || 1, 1, 64);
    if (isStart() && show.fixtures.length + n > LIMITS.fixtures) { toast(`Start tarifida ${LIMITS.fixtures} tagacha chiroq. PRO’ga oʻting.`); openPaywall(); return; }
    let addr = clamp(+$('#addAddr').value || nextFree(), 1, 512);
    const base = ($('#addName').value.trim() || show.profiles[p].name.split(' (')[0]).slice(0, 24);
    const same = show.fixtures.filter((f) => f.name.startsWith(base)).length;
    for (let i = 1; i <= n; i++) { show.fixtures.push({ id: uid(), name: n === 1 && !same ? base : `${base} ${same + i}`, prof: p, addr }); addr += show.profiles[p].ch.length; }
    save(); renderPatch(); renderAllPult(); toast(`${n} ta chiroq qoʻshildi`);
  });
  $('#autoAddr').addEventListener('click', () => {
    if (patchLocked()) return toast('🔒 Patch qulflangan');
    let a = 1; for (const f of show.fixtures) { f.addr = a; a += prof(f).ch.length; }
    save(); renderPatch(); renderAllPult(); toast(a - 1 > 512 ? 'Diqqat: kanallar 512 dan oshdi' : 'Manzillar ketma-ket qoʻyildi');
  });
  $('#defPatch').addEventListener('click', () => {
    if (patchLocked()) return toast('🔒 Patch qulflangan');
    if (!confirmSoft('Patch Andijon teatrining 35 ta chirogʻiga (FreeStyler) qaytarilsinmi? Cue’lar oʻchmaydi, lekin chiroqlar almashadi.')) return;
    show.profiles = { ...show.profiles, ...DEFAULT_PROFILES() };
    const usedK = new Set(show.fixtures.map((f) => f.prof));
    OLD_DEF_KEYS.forEach((k) => { if (!usedK.has(k)) delete show.profiles[k]; });
    show.fixtures = defaultPatch(); sel.clear(); prog.vals = {};
    save(); renderPatch(); renderAllPult();
  });
  $('#exportBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(show, null, 1)], { type: 'application/json' }));
    a.download = (show.title || 'spektakl').replace(/[^\p{L}\p{N} _-]/gu, '').trim() + '.sahnanuri.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('#importBtn').addEventListener('click', () => { if (patchLocked()) return toast('🔒 Patch qulflangan'); $('#importFile').click(); });
  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      const s = JSON.parse(await file.text());
      if (!s || !Array.isArray(s.fixtures) || !s.profiles || !Array.isArray(s.cues)) throw new Error('Bu SAHNA NURI fayli emas');
      show = { ...newShow(), ...s }; show.stage = { ...newStage(), ...(s.stage || {}) };
      sel.clear(); prog.vals = {}; prog.fx = []; Object.assign(play, { cur: -1, next: 0, from: null, to: null, fx: [] });
      save(true); renderAll(); toast('Ochildi: ' + show.title);
    } catch (err) { toast('Ochib boʻlmadi: ' + err.message); }
  });

  /* ================= PROFILLAR ================= */
  let profSel = Object.keys(show.profiles)[0];
  function renderProfiles() {
    if (!show.profiles[profSel]) profSel = Object.keys(show.profiles)[0];
    const count = (k) => show.fixtures.filter((f) => f.prof === k).length;
    $('#profList').innerHTML = Object.entries(show.profiles).map(([k, p]) => `<button class="btn ${k === profSel ? 'on' : ''}" data-pk="${esc(k)}" type="button"><span>${esc(p.name)}</span><small>${p.ch.length} kanal · ${count(k)} ta</small></button>`).join('');
    const p = show.profiles[profSel];
    if (!p) { $('#profEdit').innerHTML = ''; return; }
    const roleOpts = (cur) => Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');
    const hasWheel = p.ch.some((x) => x.r === 'cwheel');
    $('#profEdit').innerHTML = `
      <div class="ph"><h2>PROFILNI TAHRIRLASH</h2><span class="muted">${count(profSel)} ta chiroq shu profilda</span></div>
      <div class="row2" style="gap:10px">
        <label class="f grow2">Nomi<input data-pf="name" value="${esc(p.name)}"></label>
        <label class="f grow1">Guruh (fader)<input data-pf="group" value="${esc(p.group)}"></label>
      </div>
      ${hasRole(p, 'pan') ? `<div class="row2" style="gap:10px">
        <label class="f grow1">Pan diapazoni (°)<input data-pfn="panRange" type="number" min="90" max="720" value="${p.panRange || 540}"></label>
        <label class="f grow1">Tilt diapazoni (°)<input data-pfn="tiltRange" type="number" min="90" max="360" value="${p.tiltRange || 270}"></label>
      </div><p class="muted small">Qoʻllanmada yozilgan toʻliq burilish burchagi. Sahna boʻlimida nurni aniq yoʻnaltirish shunga bogʻliq.</p>` : ''}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kanal</th><th>Nomi</th><th>Vazifasi</th><th>Standart qiymat</th><th></th></tr></thead><tbody>
      ${p.ch.map((ch, i) => `<tr><td>${i + 1}</td>
        <td><input data-cn="${i}" value="${esc(ch.n)}"></td>
        <td><select data-cr="${i}">${roleOpts(ch.r)}</select></td>
        <td><input class="n" data-cd="${i}" type="number" min="0" max="255" value="${ch.d || 0}" ${ch.r === 'fixed' || ch.r === 'strobe' ? '' : 'disabled'}></td>
        <td><button class="btn x" data-cx="${i}" type="button" aria-label="Kanalni oʻchirish">✕</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="grid3"><button class="btn" id="chAdd" type="button">+ KANAL</button><button class="btn" id="profDup" type="button">NUSXA OLISH</button><button class="btn" id="profDel" type="button">PROFILNI OʻCHIRISH</button></div>
      ${hasWheel ? `<h2>RANG GʻILDIRAGI QIYMATLARI (0–255)</h2><div class="wheel">${COLORS.map((x) => `<label><span class="sw" style="background:${x.hex};border-color:#ccc"></span>${esc(x.n)}<input type="number" min="0" max="255" data-wh="${esc(x.n)}" value="${(p.wheel || DEF_WHEEL)[x.n] ?? 0}"></label>`).join('')}</div>` : ''}
      <p class="muted small">„Shutter / Strob“ uchun standart qiymat — chiroq yorugʻlik chiqaradigan „ochiq“ holat. Chiroq yonmasa, qoʻllanmadan shu qiymatni tekshiring.</p>`;
  }
  $('#profList').addEventListener('click', (e) => { const b = e.target.closest('[data-pk]'); if (b) { profSel = b.dataset.pk; renderProfiles(); } });
  $('#profEdit').addEventListener('change', (e) => {
    const p = show.profiles[profSel], t = e.target, d = t.dataset;
    if (d.pf) p[d.pf] = t.value.slice(0, 40);
    if (d.pfn) p[d.pfn] = clamp(+t.value || 0, 90, 720);
    if (d.cn != null) p.ch[+d.cn].n = t.value.slice(0, 30);
    if (d.cr != null) p.ch[+d.cr].r = t.value;
    if (d.cd != null) p.ch[+d.cd].d = clamp(+t.value || 0, 0, 255);
    if (d.wh != null) { p.wheel = p.wheel || { ...DEF_WHEEL }; p.wheel[d.wh] = clamp(+t.value || 0, 0, 255); }
    save(); renderProfiles(); renderPatch(); renderAllPult();
  });
  $('#profEdit').addEventListener('click', (e) => {
    const p = show.profiles[profSel];
    const x = e.target.closest('[data-cx]');
    if (x) { if (p.ch.length > 1) { p.ch.splice(+x.dataset.cx, 1); save(); renderProfiles(); renderPatch(); } return; }
    if (e.target.id === 'chAdd') { p.ch.push(c('Kanal ' + (p.ch.length + 1), 'fixed', 0)); save(); renderProfiles(); renderPatch(); }
    if (e.target.id === 'profDup') { const k = 'p' + uid(); show.profiles[k] = JSON.parse(JSON.stringify({ ...p, name: p.name + ' (nusxa)' })); profSel = k; save(); renderProfiles(); renderPatch(); }
    if (e.target.id === 'profDel') {
      if (show.fixtures.some((f) => f.prof === profSel)) { toast('Bu profilda chiroqlar bor. Avval ularni boshqa profilga oʻtkazing.'); return; }
      if (!confirmSoft('Profil oʻchirilsinmi?')) return;
      delete show.profiles[profSel]; save(); renderProfiles(); renderPatch();
    }
  });
  $('#newProf').addEventListener('click', () => {
    const k = 'p' + uid();
    show.profiles[k] = { name: 'Yangi profil', group: 'Boshqa', ch: [c('Dimmer', 'dim'), c('Qizil', 'r'), c('Yashil', 'g'), c('Koʻk', 'b')] };
    profSel = k; save(); renderProfiles(); renderPatch();
  });

  /* ================= ULANISH ================= */
  function renderConn() {
    const s = SNDmx.status();
    const pill = $('#connPill');
    pill.classList.toggle('ok', s.ok); pill.classList.toggle('err', !s.ok && !!s.error);
    $('#connText').textContent = s.ok ? `DMX ulangan · ${s.label} · Universe 1` : (s.error ? 'DMX: xato' : 'DMX ulanmagan');
    const box = $('#connStatus');
    box.className = 'conn-status' + (s.ok ? ' ok' : '');
    box.innerHTML = `<span>${s.ok ? '● Ulangan: ' + esc(s.label) : '○ ' + esc(s.label)}</span>${s.error ? `<span class="err">${esc(s.error)}</span>` : ''}
      <span class="muted">Brauzer: USB ${SNDmx.support.usb ? '✓' : '✗'} · Serial ${SNDmx.support.serial ? '✓' : '✗'}</span>`;
    const map = { udmx: '#cUdmx', pro: '#cPro', open: '#cOpen', sim: '#cSim', bridge: '#cBridge' };
    $$('.ccard').forEach((x) => x.classList.remove('on'));
    $$('.ccard .btn').forEach((x) => x.classList.remove('on'));
    if (s.ok && map[s.kind]) { $(map[s.kind]).classList.add('on'); $(map[s.kind]).closest('.ccard').classList.add('on'); }
    $('#footConn').textContent = s.ok ? '● ' + s.label : '○ DMX ulanmagan';
  }
  SNDmx.onStatus(() => { renderConn(); const s = SNDmx.status(); if (s.ok) toast('Ulandi: ' + s.label); else if (s.error) toast(s.error); });
  $('#cUdmx').addEventListener('click', () => SNDmx.connectUDmx());
  $('#cBridge').addEventListener('click', () => SNDmx.connectBridge(false));
  $('#cPro').addEventListener('click', () => SNDmx.connectSerial('pro'));
  $('#cOpen').addEventListener('click', () => SNDmx.connectSerial('open'));
  $('#cSim').addEventListener('click', () => SNDmx.connectSim());
  $('#cOff').addEventListener('click', () => SNDmx.disconnect());
  $('#cTest').addEventListener('click', () => {
    if (!SNDmx.status().ok) { toast('Avval qurilmani ulang'); return; }
    testUntil = performance.now() + 2000; flashBtn($('#cTest')); toast('Sinov: barcha chiroqlar 2 soniya toʻliq yonadi');
  });
  $('#connPill').addEventListener('click', () => setTab('ulanish'));

  /* ================= MONITOR ================= */
  function renderMonitor() {
    const mon = $('#mon');
    if (!mon.children.length) {
      const used = new Set();
      for (const f of show.fixtures) for (let k = 0; k < prof(f).ch.length; k++) used.add(f.addr + k);
      mon.innerHTML = Array.from({ length: 512 }, (_, i) => `<div class="${used.has(i + 1) ? 'used' : ''}"><i></i><span>${i + 1}</span><b>0</b></div>`).join('');
    }
    const kids = mon.children;
    for (let i = 0; i < 512; i++) {
      const v = SNDmx.universe[i];
      const el = kids[i];
      if (el._v === v) continue;
      el._v = v; el.lastChild.textContent = v; el.firstChild.style.height = (v / 2.55) + '%';
    }
  }

  /* ================= KANAL SINOVI ================= */
  const ROLE_TXT = { dim: 'yorqinlik', r: 'qizil', g: 'yashil', b: 'koʻk', w: 'oq', pan: 'pan', tilt: 'tilt', panF: 'pan fine', tiltF: 'tilt fine', strobe: 'strob/shutter', cwheel: 'rang gʻildiragi', gobo: 'gobo', fixed: 'doimiy' };
  function renderChTest() {
    const fs = $('#ctFix'), cur = fs.value;
    fs.innerHTML = show.fixtures.map((f) => `<option value="${f.id}" ${f.id === cur ? 'selected' : ''}>${esc(f.name)} · DMX ${f.addr}</option>`).join('');
    const f = show.fixtures.find((x) => x.id === fs.value); if (!f) { $('#ctRows').innerHTML = ''; return; }
    const pr = prof(f), ov = chTest[f.id] || {};
    $('#ctRows').innerHTML = pr.ch.map((ch, k) => {
      const held = ov[k] != null, v = held ? ov[k] : (SNDmx.universe[f.addr - 1 + k] || 0);
      const canSave = ch.r === 'fixed' || ch.r === 'strobe';
      return `<div class="ct-row ${held ? 'held' : ''}">
        <span class="ct-n"><b>${f.addr + k}</b> ${esc(ch.n)} <small>${ROLE_TXT[ch.r] || ch.r}</small></span>
        <input type="range" min="0" max="255" value="${v}" data-ct="${k}" aria-label="${esc(ch.n)}">
        <input class="n" type="number" min="0" max="255" value="${v}" data-ctn="${k}" aria-label="${esc(ch.n)} qiymati">
        ${canSave ? `<button class="btn sm" data-cts="${k}" type="button" ${held ? '' : 'disabled'} title="Shu qiymatni profilga doimiy yozish">PROFILGA</button>` : '<span></span>'}
        <button class="btn sm x" data-ctr="${k}" type="button" ${held ? '' : 'disabled'} title="Qoʻyib yuborish">↺</button>
      </div>`;
    }).join('');
    const n = Object.values(chTest).reduce((a, o) => a + Object.keys(o).length, 0);
    $('#ctState').textContent = n ? `⚠ ${n} ta kanal qoʻlda ushlab turilibdi` : 'Har bir kanalni alohida surib, sahnada natijani koʻring';
    $('#ctState').classList.toggle('warn-t', !!n);
  }
  function ctSet(k, v) {
    const id = $('#ctFix').value; if (!id) return;
    (chTest[id] = chTest[id] || {})[k] = clamp(Math.round(+v || 0), 0, 255);
  }
  $('#ctFix').addEventListener('change', renderChTest);
  $('#ctRows').addEventListener('input', (e) => {
    const k = e.target.dataset.ct ?? e.target.dataset.ctn; if (k == null) return;
    ctSet(k, e.target.value);
    const row = e.target.closest('.ct-row');
    row.classList.add('held');
    row.querySelectorAll('input').forEach((i) => { if (i !== e.target) i.value = chTest[$('#ctFix').value][k]; });
    row.querySelectorAll('button').forEach((b) => { b.disabled = false; });
  });
  $('#ctRows').addEventListener('change', (e) => { if (e.target.dataset.ct != null || e.target.dataset.ctn != null) renderChTest(); });
  $('#ctRows').addEventListener('click', (e) => {
    const id = $('#ctFix').value, f = show.fixtures.find((x) => x.id === id); if (!f) return;
    const r = e.target.closest('[data-ctr]'), sv = e.target.closest('[data-cts]');
    if (r) { if (chTest[id]) { delete chTest[id][r.dataset.ctr]; if (!Object.keys(chTest[id]).length) delete chTest[id]; } renderChTest(); }
    if (sv) {
      const k = +sv.dataset.cts, v = chTest[id]?.[k]; if (v == null) return;
      const pr = prof(f); pr.ch[k].d = v;
      delete chTest[id][k]; if (!Object.keys(chTest[id]).length) delete chTest[id];
      save(); renderChTest();
      toast(`${pr.name}: „${pr.ch[k].n}“ = ${v} — barcha shu turdagi chiroqlarga yozildi`);
    }
  });
  $('#ctReset').addEventListener('click', () => { for (const k in chTest) delete chTest[k]; renderChTest(); toast('Barcha kanallar qoʻyib yuborildi'); });

  /* ================= SAHNA: plan, chiroq joylashuvi, nur yo'naltirish ================= */
  // Koordinatalar: metr. X — tomoshabin tomondan chapdan o'ngga (0..eni), Y — orqa pardadan zal tomonga (0..chuqurlik).
  const ST = () => {
    const s = show.stage;
    if (!s.front) s.front = { img: null, corners: null, fpos: {}, grid: true, op: 100 };
    if (!s.front.fpos) s.front.fpos = {};
    if (!s.view) s.view = 'plan';
    return s;
  };
  // Ko'rinish: 'plan' — yuqoridan; 'front' — operator joyidan, sahnaga ro'paradan (perspektiva)
  const FRONT = () => ST().view === 'front';
  const curImg = () => (FRONT() ? ST().front.img : ST().img);
  const curCornersRaw = () => (FRONT() ? ST().front.corners : ST().corners);
  let stageMode = 'aim', cornerStep = 0, stageTarget = null, dragFx = null, imgNat = null, aimDrag = false, aimRaf = 0;
  const isMover = (f) => hasRole(prof(f), 'pan') && hasRole(prof(f), 'tilt');

  // 4 nuqtadan gomografiya (rasm pikseli ↔ sahna metri)
  function homog(src, dst) {
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
    }
    const n = 8;
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) < 1e-12) return null;
      [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const k = A[r][c] / A[c][c];
        for (let j = c; j < n; j++) A[r][j] -= k * A[c][j];
        b[r] -= k * b[c];
      }
    }
    const h = b.map((v, i) => v / A[i][i]);
    return [...h, 1];
  }
  const happ = (H, [x, y]) => { const w = H[6] * x + H[7] * y + 1; return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]; };

  // Rasm o'lchami: yuklangan rasm yoki chizilgan "virtual plan"
  function imgSize() {
    const s = ST();
    if (curImg() && imgNat) return imgNat;
    if (FRONT()) return { w: 1000, h: 625 };
    return { w: 1000, h: Math.round(1000 * (s.d + 4) / (s.w + 2)) };
  }
  // Ro'paradan chizilgan sahna (surat yuklanmaganda): pol — perspektivadagi trapetsiya
  const FRONT_VC = [[262, 345], [738, 345], [905, 545], [95, 545]];
  function virtualCorners() {
    if (FRONT()) { const z = imgSize(); return FRONT_VC.map(([x, y]) => [x / 1000 * z.w, y / 625 * z.h]); }
    const s = ST(), z = imgSize();
    const P = (x, y) => [(x + 1) / (s.w + 2) * z.w, (y + 1) / (s.d + 4) * z.h];
    return [P(0, 0), P(s.w, 0), P(s.w, s.d), P(0, s.d)];
  }
  function corners() { const c = curCornersRaw(); return curImg() && c && c.length === 4 ? c : virtualCorners(); }
  function mats() {
    const s = ST(), meters = [[0, 0], [s.w, 0], [s.w, s.d], [0, s.d]], c = corners();
    return { toM: homog(c, meters) || homog(virtualCorners(), meters), toI: homog(meters, c) || homog(meters, virtualCorners()) };
  }

  // Joyi berilmagan chiroqlarga boshlang'ich joy (guruh bo'yicha qatorlar)
  function ensurePositions() {
    const s = ST(), gs = groups();
    const rowY = { Beamlar: [1.1, s.d * 0.52], Panellar: [0.3], PARlar: [s.d - 0.3], Barlar: [s.d * 0.3], Front: [s.d + 2.2], Dimmer: [s.d - 1.2] };
    for (const g of gs) {
      const list = show.fixtures.filter((f) => prof(f).group === g && !s.pos[f.id]);
      if (!list.length) continue;
      const rows = rowY[g] || [Math.min(s.d - 0.5, 1 + gs.indexOf(g) * 0.9)];
      const per = Math.ceil(list.length / rows.length);
      list.forEach((f, i) => {
        const r = Math.floor(i / per), k = i % per, nInRow = Math.min(per, list.length - r * per);
        s.pos[f.id] = { x: +((k + 1) * s.w / (nInRow + 1)).toFixed(2), y: rows[r], z: isMover(f) ? s.h : 0 };
      });
    }
  }

  // ---- Pan/Tilt modeli ----
  function angles(f, X, Y, tz = 0) {
    const p = ST().pos[f.id] || { x: 0, y: 0, z: ST().h };
    const dx = X - p.x, dy = Y - p.y, h = Math.max(0.3, (p.z || ST().h) - tz);
    return { az: Math.atan2(dx, dy) * 180 / Math.PI, el: Math.atan2(Math.hypot(dx, dy), h) * 180 / Math.PI };
  }
  function model(f) {
    const pr = prof(f), c = ST().cal[f.id] || {};
    return { PR: pr.panRange || 540, TR: pr.tiltRange || 270, sp: c.sp ?? 1, st: c.st ?? 1, po: c.po ?? 127.5, to: c.to ?? 127.5 };
  }
  // Nuqta uchun barcha mumkin bo'lgan (pan, tilt) yechimlari
  function solutions(m, az, el) {
    const kp = 255 / m.PR, kt = 255 / m.TR, out = [];
    for (const [a, e] of [[az, el], [az + 180, -el]])
      for (let k = -2; k <= 2; k++) {
        const pan = m.po + m.sp * (a + k * 360) * kp, tilt = m.to + m.st * e * kt;
        if (pan >= -0.5 && pan <= 255.5 && tilt >= -0.5 && tilt <= 255.5) out.push({ pan: clamp(pan, 0, 255), tilt: clamp(tilt, 0, 255) });
      }
    return out;
  }
  function aimValues(f, X, Y, curPan, tz = 0) {
    const { az, el } = angles(f, X, Y, tz), m = model(f);
    const sols = solutions(m, az, el);
    if (!sols.length) return null;
    sols.sort((a, b) => Math.abs(a.pan - curPan) - Math.abs(b.pan - curPan));
    return { ...sols[0], az, el };
  }
  // Kalibrlash: nuqtalar bo'yicha ofset va yo'nalishni topish
  function fitCal(f) {
    const pts = (ST().cal[f.id] && ST().cal[f.id].pts) || [];
    const pr = prof(f), PR = pr.panRange || 540, TR = pr.tiltRange || 270, kp = 255 / PR, kt = 255 / TR;
    const base = { pts };
    if (!pts.length) { ST().cal[f.id] = base; return; }
    let best = null;
    const signs = pts.length >= 2 ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 1]];
    for (const [sp, st] of signs) for (const alt0 of [0, 1]) {
      const ang = pts.map((p) => angles(f, p.x, p.y));
      const a0 = alt0 ? [ang[0].az + 180, -ang[0].el] : [ang[0].az, ang[0].el];
      let po = pts[0].pan - sp * a0[0] * kp, to = pts[0].tilt - st * a0[1] * kt, err = 0;
      for (let it = 0; it < 4; it++) {
        let sPo = 0, sTo = 0; err = 0;
        pts.forEach((p, i) => {
          let bestC = null;
          for (const [a, e] of [[ang[i].az, ang[i].el], [ang[i].az + 180, -ang[i].el]])
            for (let k = -2; k <= 2; k++) {
              const pan = po + sp * (a + k * 360) * kp, tilt = to + st * e * kt;
              const d = (pan - p.pan) ** 2 + (tilt - p.tilt) ** 2;
              if (!bestC || d < bestC.d) bestC = { d, a: a + k * 360, e };
            }
          sPo += p.pan - sp * bestC.a * kp; sTo += p.tilt - st * bestC.e * kt; err += bestC.d;
        });
        po = sPo / pts.length; to = sTo / pts.length;
      }
      if (!best || err < best.err) best = { sp, st, po, to, err };
    }
    ST().cal[f.id] = { ...base, ...best, err: Math.sqrt(best.err / pts.length) };
  }

  // ---- Chizish ----
  const wrap = $('#stageWrap'), svg = $('#stageSvg'), fxLayer = $('#stageFx'), imgEl = $('#stageImg');
  let scale = 1;
  function layoutStage() {
    const z = imgSize();
    const cw = wrap.clientWidth || 800;
    scale = cw / z.w;
    wrap.style.height = Math.round(z.h * scale) + 'px';
    svg.setAttribute('viewBox', `0 0 ${z.w} ${z.h}`);
  }
  // Ro'paradan ko'rinishda chiroq belgisining joyi: qo'lda qo'yilgan bo'lsa — o'sha, aks holda
  // polga tushgan nuqtasidan balandligi bo'yicha yuqoriga ko'tariladi (mahalliy masshtab bilan)
  function frontPos(f) {
    const s = ST(), fp = s.front.fpos[f.id];
    if (fp) return fp;
    const p = s.pos[f.id]; if (!p) return null;
    const { toI } = mats(), z = imgSize();
    const b = happ(toI, [p.x, p.y]), l = happ(toI, [p.x - 0.5, p.y]), r = happ(toI, [p.x + 0.5, p.y]);
    const k = Math.hypot(r[0] - l[0], r[1] - l[1]);
    const h = p.z || (isMover(f) ? s.h : s.h * 0.9);
    return [clamp(b[0], z.w * 0.03, z.w * 0.97), clamp(b[1] - h * k, z.h * 0.05, z.h * 0.95)];
  }
  function toScreen(xm, ym) { const { toI } = mats(); const [u, v] = happ(toI, [xm, ym]); return [u * scale, v * scale, u, v]; }
  function evToImage(e) { const r = wrap.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
  function evToMeters(e) { const { toM } = mats(); return happ(toM, evToImage(e)); }
  const PREFIX = { beam: 'B', panel: 'P', par: 'R', bar: 'L', front: 'F', dimmer: 'D' };
  const short = (f) => { const m = f.name.match(/^(\S+)\s*(\d+)?/); if (!m) return f.name.slice(0, 2); const k = PREFIX[m[1].toLowerCase()] || m[1][0].toUpperCase(); return k + (m[2] || ''); };

  function renderStageSvg() {
    const s = ST(), z = imgSize(), { toI } = mats();
    const I = (x, y) => happ(toI, [x, y]);
    const sw = Math.max(1.5, z.w / 500);
    let g = '';
    if (FRONT()) { renderFrontSvg(); return; }
    if (!s.img) {
      // chizilgan plan: zal zonasi, metr to'ri, sahna chegarasi
      const a = I(0, s.d), b = I(s.w, s.d + 3);
      g += `<rect x="${a[0]}" y="${a[1]}" width="${b[0] - a[0]}" height="${b[1] - a[1]}" fill="#e4e4e7"/>`;
      const zl = I(s.w / 2, s.d + 2.2);
      g += `<text x="${zl[0]}" y="${zl[1]}" text-anchor="middle" font-size="${z.w / 55}" font-weight="700" fill="#52525b" letter-spacing="2">TOMOSHABINLAR ZALI</text>`;
      for (let x = 0; x <= s.w + 1e-6; x += 1) { const p = I(x, 0), q = I(x, s.d); g += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#e4e4e7" stroke-width="${sw * 0.6}"/>`; }
      for (let y = 0; y <= s.d + 1e-6; y += 1) { const p = I(0, y), q = I(s.w, y); g += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#e4e4e7" stroke-width="${sw * 0.6}"/>`; }
      for (let x = 0; x <= s.w + 1e-6; x += 2) { const p = I(x, -0.35); g += `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" font-size="${z.w / 75}" fill="#71717a">${x} m</text>`; }
      for (let y = 2; y <= s.d + 1e-6; y += 2) { const p = I(-0.45, y); g += `<text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" font-size="${z.w / 75}" fill="#71717a">${y}</text>`; }
      const o = I(0.15, 0.35); g += `<text x="${o[0]}" y="${o[1]}" font-size="${z.w / 80}" font-weight="700" fill="#71717a" letter-spacing="1">ORQA PARDA</text>`;
    }
    const c = corners();
    g += `<polygon points="${c.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${s.img ? '#16a34a' : '#111111'}" stroke-width="${sw * 2}" ${s.img ? `stroke-dasharray="${sw * 6} ${sw * 4}"` : ''}/>`;
    if (s.img || stageMode === 'corners') c.forEach((p, i) => {
      const act = stageMode === 'corners' && i === cornerStep;
      g += `<rect x="${p[0] - z.w / 70}" y="${p[1] - z.w / 70}" width="${z.w / 35}" height="${z.w / 35}" rx="${z.w / 300}" fill="${act ? '#2563eb' : '#ffffff'}" stroke="#2563eb" stroke-width="${sw * 1.5}"/><text x="${p[0]}" y="${p[1] + z.w / 160}" text-anchor="middle" font-size="${z.w / 55}" font-weight="800" fill="${act ? '#ffffff' : '#1d4ed8'}">${i + 1}</text>`;
    });
    // kalibrlash nuqtalari (tanlangan chiroq uchun)
    const one = selMovers();
    if (one.length === 1) ((s.cal[one[0].id] || {}).pts || []).forEach((p, i) => {
      const q = I(p.x, p.y);
      g += `<circle cx="${q[0]}" cy="${q[1]}" r="${z.w / 120}" fill="#f59e0b" stroke="#fff" stroke-width="${sw}"/><text x="${q[0] + z.w / 90}" y="${q[1] - z.w / 120}" font-size="${z.w / 70}" font-weight="800" fill="#b45309">${i + 1}</text>`;
    });
    // nur chiziqlari
    if (stageTarget) {
      const t = I(stageTarget.x, stageTarget.y);
      for (const f of selMovers()) {
        const p = s.pos[f.id]; if (!p) continue;
        const a = I(p.x, p.y);
        g += `<line x1="${a[0]}" y1="${a[1]}" x2="${t[0]}" y2="${t[1]}" stroke="#16a34a" stroke-width="${sw * 1.6}" stroke-dasharray="${sw * 5} ${sw * 3}" opacity=".9"/>`;
      }
      g += `<circle cx="${t[0]}" cy="${t[1]}" r="${z.w / 30}" fill="rgba(21,128,61,.18)" stroke="#15803d" stroke-width="${sw * 2}"/><circle cx="${t[0]}" cy="${t[1]}" r="${z.w / 160}" fill="#15803d"/>`;
    }
    svg.innerHTML = g;
  }
  // ---- Ro'paradan ko'rinish chizmasi ----
  function renderFrontSvg() {
    const s = ST(), z = imgSize(), { toI } = mats(), F = s.front;
    const I = (x, y) => happ(toI, [x, y]);
    const sw = Math.max(1.5, z.w / 500), W = z.w, Hh = z.h;
    const mv0 = selMovers()[0], bc = mv0 ? outHex(mv0) : '#fde68a'; // nur rangi — chiroqqa ketayotgan haqiqiy rang
    let g = `<defs>
      <linearGradient id="fwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1917"/><stop offset="1" stop-color="#292524"/></linearGradient>
      <linearGradient id="ffloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f3a36"/><stop offset="1" stop-color="#57514b"/></linearGradient>
      <linearGradient id="fcur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7f1d1d"/><stop offset=".5" stop-color="#b91c1c"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient>
      <radialGradient id="fpool"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${bc}" stop-opacity=".55"/><stop offset="1" stop-color="${bc}" stop-opacity="0"/></radialGradient>
      <linearGradient id="fcone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bc}" stop-opacity=".55"/><stop offset="1" stop-color="${bc}" stop-opacity=".1"/></linearGradient>
      <filter id="fblur"><feGaussianBlur stdDeviation="${W / 300}"/></filter></defs>`;
    if (!F.img) {
      // chizilgan sahna: devorlar, pol, pardalar, ferma
      const c = virtualCorners(), [bl, br, fr, fl] = c, top = Hh * 0.19;
      g += `<rect width="${W}" height="${Hh}" fill="#0c0a09"/>
        <polygon points="${bl[0]},${top} ${br[0]},${top} ${br[0]},${bl[1]} ${bl[0]},${bl[1]}" fill="url(#fwall)"/>
        <polygon points="${W * 0.09},${Hh * 0.06} ${bl[0]},${top} ${bl[0]},${bl[1]} ${fl[0]},${fl[1]}" fill="#1c1917"/>
        <polygon points="${W * 0.91},${Hh * 0.06} ${br[0]},${top} ${br[0]},${br[1]} ${fr[0]},${fr[1]}" fill="#1c1917"/>
        <polygon points="${c.map((q) => q.join(',')).join(' ')}" fill="url(#ffloor)"/>
        <rect x="0" y="${fl[1]}" width="${W}" height="${Hh - fl[1]}" fill="#18181b"/><rect x="0" y="${fl[1]}" width="${W}" height="${W / 250}" fill="#3f3f46"/>
        <rect x="0" y="0" width="${W * 0.1}" height="${Hh}" fill="url(#fcur)"/><rect x="${W * 0.9}" y="0" width="${W * 0.1}" height="${Hh}" fill="url(#fcur)"/>
        <rect x="${W * 0.12}" y="${Hh * 0.095}" width="${W * 0.76}" height="${Hh * 0.016}" fill="#52525b"/>`;
    }
    // pol to'ri (metr)
    if (F.grid !== false) {
      const col = '#4ade80', op = F.img ? 0.75 : 0.5;
      for (let x = 0; x <= s.w + 1e-6; x += 1) { const a = I(x, 0), b = I(x, s.d); g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${sw * (x % 2 ? 0.5 : 0.9)}" opacity="${op}"/>`; }
      for (let y = 0; y <= s.d + 1e-6; y += 1) { const a = I(0, y), b = I(s.w, y); g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${sw * 0.7}" opacity="${op}"/>`; }
      const ob = I(s.w / 2, s.d - 0.35), oa = I(s.w / 2, 0.45);
      g += `<text x="${ob[0]}" y="${ob[1]}" text-anchor="middle" font-size="${W / 85}" font-weight="800" fill="#bbf7d0" opacity=".85" letter-spacing="3">OLDI</text>
        <text x="${oa[0]}" y="${oa[1]}" text-anchor="middle" font-size="${W / 95}" font-weight="800" fill="#bbf7d0" opacity=".85" letter-spacing="3">ORQA</text>`;
    }
    // burchak belgilari
    const c = corners();
    if (F.img || stageMode === 'corners') {
      g += `<polygon points="${c.map((q) => q.join(',')).join(' ')}" fill="none" stroke="#22c55e" stroke-width="${sw * 1.6}" stroke-dasharray="${sw * 6} ${sw * 4}"/>`;
      c.forEach((q, i) => {
        const act = stageMode === 'corners' && i === cornerStep;
        g += `<circle cx="${q[0]}" cy="${q[1]}" r="${W / 75}" fill="${act ? '#2563eb' : '#15803d'}" stroke="#fff" stroke-width="${sw * 1.4}"/><text x="${q[0]}" y="${q[1] + W / 190}" text-anchor="middle" font-size="${W / 70}" font-weight="800" fill="#fff">${i + 1}</text>`;
      });
    }
    // saqlangan nuqtalar
    s.points.forEach((q) => {
      const a = I(q.x, q.y);
      g += `<circle cx="${a[0]}" cy="${a[1]}" r="${W / 170}" fill="#facc15" stroke="#000" stroke-width="${sw * 0.8}"/><text x="${a[0] + W / 110}" y="${a[1] + W / 260}" font-size="${W / 85}" font-weight="700" fill="#fef08a" paint-order="stroke" stroke="#000" stroke-width="${sw * 1.2}">${esc(q.n)}</text>`;
    });
    // nurlar va nishon
    if (stageTarget) {
      const t = I(stageTarget.x, stageTarget.y);
      const l = I(stageTarget.x - 0.5, stageTarget.y), r = I(stageTarget.x + 0.5, stageTarget.y), k = Math.hypot(r[0] - l[0], r[1] - l[1]);
      const tz = stageTarget.z || 0, th = [t[0], t[1] - tz * k];
      const mv = selMovers(), rw = k * 0.55;
      for (const f of mv) {
        const a = frontPos(f); if (!a) continue;
        const dx = th[0] - a[0], dy = th[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        g += `<polygon points="${a[0] + nx * 3},${a[1] + ny * 3} ${a[0] - nx * 3},${a[1] - ny * 3} ${th[0] - nx * rw},${th[1] - ny * rw} ${th[0] + nx * rw},${th[1] + ny * rw}" fill="url(#fcone)"/>`;
      }
      if (mv.length) g += `<ellipse cx="${t[0]}" cy="${t[1]}" rx="${k * 1.1}" ry="${k * 0.35}" fill="url(#fpool)" filter="url(#fblur)"/>`;
      if (tz > 0) g += `<line x1="${t[0]}" y1="${t[1]}" x2="${th[0]}" y2="${th[1]}" stroke="#fff" stroke-width="${sw}" stroke-dasharray="${sw * 3} ${sw * 3}" opacity=".8"/><circle cx="${th[0]}" cy="${th[1]}" r="${W / 200}" fill="#fff"/>`;
      const R0 = W / 60, R1 = W / 38;
      g += `<g stroke="#fff" stroke-width="${sw * 1.6}" fill="none"><circle cx="${t[0]}" cy="${t[1]}" r="${R0}"/><path d="M${t[0] - R1} ${t[1]}H${t[0] - R0 * 0.55}M${t[0] + R0 * 0.55} ${t[1]}H${t[0] + R1}M${t[0]} ${t[1] - R1}V${t[1] - R0 * 0.55}M${t[0]} ${t[1] + R0 * 0.55}V${t[1] + R1}"/></g><circle cx="${t[0]}" cy="${t[1]}" r="${sw * 1.5}" fill="#fff"/>`;
      const lx = t[0] + R1 + 6, ly = t[1] + 6, bw = W / 5.2, bh = W / 26;
      g += `<g transform="translate(${Math.min(lx, W - bw - 6)},${Math.min(ly, Hh - bh - 6)})"><rect width="${bw}" height="${bh}" rx="${W / 120}" fill="rgba(0,0,0,.78)"/>
        <text x="${W / 110}" y="${bh * 0.42}" font-size="${W / 85}" font-weight="800" fill="#fff">NISHON · ${mv.length} ta beam</text>
        <text x="${W / 110}" y="${bh * 0.82}" font-size="${W / 98}" fill="#d4d4d8">${stageTarget.x.toFixed(1)} m chapdan · ${(s.d - stageTarget.y).toFixed(1)} m oldidan${tz ? ` · ${tz} m` : ''}</text></g>`;
    }
    // chap / o'ng (tomoshabin tomondan)
    g += `<text x="${W * 0.11}" y="${Hh - W / 80}" font-size="${W / 90}" font-weight="800" fill="#a1a1aa" letter-spacing="2" paint-order="stroke" stroke="#000" stroke-width="${sw}">◀ TOMOSHABIN CHAPI</text>
      <text x="${W * 0.89}" y="${Hh - W / 80}" text-anchor="end" font-size="${W / 90}" font-weight="800" fill="#a1a1aa" letter-spacing="2" paint-order="stroke" stroke="#000" stroke-width="${sw}">TOMOSHABIN OʻNGI ▶</text>`;
    svg.innerHTML = g;
  }
  function renderStageFx() {
    if (FRONT()) {
      fxLayer.innerHTML = show.fixtures.map((f) => {
        const q = frontPos(f); if (!q) return '';
        return `<button type="button" class="sfx fr ${isMover(f) ? 'mv' : ''} ${sel.has(f.id) ? 'on' : ''}" data-sf="${f.id}" style="left:${(q[0] * scale).toFixed(1)}px;top:${(q[1] * scale).toFixed(1)}px" aria-label="${esc(f.name)}${sel.has(f.id) ? ', tanlangan' : ''}" title="${esc(f.name)}">${iconSvg(iconKey(f))}</button>`;
      }).join('');
      return;
    }
    const s = ST();
    fxLayer.innerHTML = show.fixtures.map((f) => {
      const p = s.pos[f.id]; if (!p) return '';
      const [x, y] = toScreen(p.x, p.y);
      return `<button type="button" class="sfx ${isMover(f) ? 'round' : ''} ${sel.has(f.id) ? 'on' : ''}" data-sf="${f.id}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px" aria-label="${esc(f.name)}${sel.has(f.id) ? ', tanlangan' : ''}" title="${esc(f.name)} · ${p.x.toFixed(1)} × ${p.y.toFixed(1)} m · ${(+p.z || 0).toFixed(1)} m">${esc(short(f))}</button>`;
    }).join('');
  }
  const HINTS = {
    aim: 'Planni bosing — tanlangan moving head’lar oʻsha nuqtaga buriladi. Chiroqni tanlash: belgisini bosing.',
    place: 'Chiroq belgilarini sudrab, sahnadagi haqiqiy joyiga qoʻying. Aniq raqam uchun oʻngda X, Y, balandlikni yozing.',
    corners: '',
    calib: '1) Bitta moving head tanlang. 2) Oʻngdagi Pan/Tilt slayderlari bilan nurni poldagi belgiga aniq tushiring. 3) Planda oʻsha belgini bosing. 3–4 nuqta yetarli.',
  };
  const CORNER_NAMES = ['chap orqa', 'oʻng orqa', 'oʻng old', 'chap old'];
  const FRONT_HINTS = {
    aim: 'Suratdagi sahna poliga bosing — tanlangan moving head’lar shu nuqtaga buriladi. Bosib turib sudrasangiz, nurlar ergashadi. Chiroqni tanlash: belgisini bosing.',
    place: 'Chiroq belgilarini suratdagi haqiqiy joyiga sudrab qoʻying (faqat koʻrinish uchun). Yoʻnaltirish aniqligi uchun chiroqning X, Y va balandligini oʻngda yozing yoki „Tepadan“ planda joylang.',
    calib: '1) Bitta moving head tanlang. 2) Pan/Tilt slayderlari bilan nurni poldagi belgiga tushiring. 3) Suratda oʻsha joyni bosing. 3–4 nuqta yetarli.',
  };
  function renderStageSide() {
    const s = ST();
    $('#stW').value = s.w; $('#stD').value = s.d; $('#stH').value = s.h;
    $$('#stageModes [data-sm]').forEach((b) => b.classList.toggle('on', b.dataset.sm === stageMode));
    $$('#stageViews [data-sv]').forEach((b) => b.classList.toggle('on', b.dataset.sv === s.view));
    $('#stageTools').hidden = !FRONT();
    $('#stGrid').textContent = s.front.grid !== false ? 'TOʻR: YOQIQ' : 'TOʻR: OʻCHIQ';
    $('#stOp').value = s.front.op || 100;
    $$('#tzChips [data-tz]').forEach((b) => b.classList.toggle('on', +b.dataset.tz === (+s.tz || 0)));
    wrap.classList.toggle('place', stageMode === 'place');
    $('#stageHint').textContent = stageMode === 'corners'
      ? (FRONT() ? `${cornerStep + 1}-burchak: suratda sahna POLINING ${CORNER_NAMES[cornerStep]} burchagini bosing.` : `${cornerStep + 1}-burchak: rasmda sahnaning ${CORNER_NAMES[cornerStep]} burchagini bosing (tomoshabin tomondan qaraganda).`)
      : (FRONT() ? FRONT_HINTS[stageMode] : HINTS[stageMode]);
    $('#stageTitle').textContent = FRONT() ? (s.front.img ? 'SAHNA · ROʻPARADAN · SURAT' : 'SAHNA · ROʻPARADAN · NAMUNA (surat yuklang)') : s.img ? 'SAHNA · YUKLANGAN RASM' : `SAHNA PLANI · YUQORIDAN · ${s.w} × ${s.d} m`;
    $('#stClear').disabled = !curImg();
    $('#stUpload').textContent = FRONT() ? 'SAHNA SURATINI YUKLASH' : 'RASM YUKLASH';
    const ids = [...sel], f = ids.length === 1 ? show.fixtures.find((x) => x.id === ids[0]) : null;
    const p = f && s.pos[f.id];
    $('#stSelTitle').textContent = f ? 'TANLANGAN: ' + f.name.toUpperCase() : ids.length ? `TANLANGAN: ${ids.length} TA CHIROQ` : 'TANLANGAN CHIROQ';
    ['#stX', '#stY', '#stZ'].forEach((q) => { $(q).disabled = !p; });
    $('#stX').value = p ? p.x : ''; $('#stY').value = p ? p.y : ''; $('#stZ').value = p ? (p.z ?? 0) : '';
    $('#roSel').textContent = ids.length;
    const mv = selMovers();
    const live = mv[0] ? liveLook(performance.now())[mv[0].id] : null;
    $('#sPan').disabled = $('#sTilt').disabled = !mv.length;
    if (live) {
      $('#sPan').value = live.pan; $('#sTilt').value = live.tilt;
      const m = model(mv[0]);
      $('#sPanV').textContent = Math.round(live.pan / 2.55) + '%'; $('#sTiltV').textContent = Math.round(live.tilt / 2.55) + '%';
      $('#roPan').textContent = Math.round(((live.pan - m.po) / (255 / m.PR)) * m.sp) + '°';
      $('#roTilt').textContent = Math.round(((live.tilt - m.to) / (255 / m.TR)) * m.st) + '°';
    } else { $('#sPanV').textContent = $('#sTiltV').textContent = '—'; $('#roPan').textContent = $('#roTilt').textContent = '—'; }
    const one = mv.length === 1 && ids.length === 1 ? mv[0] : null;
    const cal = one && s.cal[one.id];
    $('#calInfo').textContent = !one ? 'Kalibrlash uchun bitta moving head tanlang.'
      : !cal || !(cal.pts || []).length ? `${one.name}: hali nuqta yoʻq. Kalibrlanmagan chiroq taxminiy yoʻnaltiriladi.`
        : `${one.name}: ${cal.pts.length} ta nuqta saqlangan${cal.pts.length >= 2 ? ` · aniqlik ±${(cal.err || 0).toFixed(1)} DMX` : ' · yana kamida 1 ta nuqta qoʻshing'}.`;
    $('#calClear').disabled = !cal || !(cal.pts || []).length;
    $('#ptList').innerHTML = s.points.map((q, i) => `<button class="btn" data-pt="${i}" type="button" title="${q.x.toFixed(1)} × ${q.y.toFixed(1)} m">${esc(q.n)}</button>`).join('') || '<span class="muted small" style="grid-column:1/-1">Hali nuqta yoʻq. Planda joyni bosing, nom yozib SAQLASH.</span>';
  }
  function renderStageAll() {
    ensurePositions();
    const s = ST(), im = curImg();
    if (im) { if (imgEl.getAttribute('src') !== im) { imgNat = null; imgEl.src = im; } imgEl.hidden = false; }
    else { imgEl.hidden = true; imgEl.removeAttribute('src'); imgNat = null; }
    imgEl.style.opacity = FRONT() ? (s.front.op || 100) / 100 : 1;
    wrap.classList.toggle('front', FRONT());
    layoutStage(); renderStageSvg(); renderStageFx(); renderStageSide();
  }
  imgEl.addEventListener('load', () => { imgNat = { w: imgEl.naturalWidth, h: imgEl.naturalHeight }; if (tab === 'sahna') { layoutStage(); renderStageSvg(); renderStageFx(); } });
  window.addEventListener('resize', () => { if (tab === 'sahna') { layoutStage(); renderStageSvg(); renderStageFx(); } });

  function selMovers() { return show.fixtures.filter((f) => sel.has(f.id) && isMover(f)); }

  // ---- Yo'naltirish ----
  function aimAt(X, Y, quiet) {
    const mv = selMovers(), tz = +ST().tz || 0;
    stageTarget = { x: X, y: Y, z: tz };
    if (!mv.length) { toast('Avval moving head (Beam) tanlang'); renderStageSvg(); return; }
    if (!guardAction()) return;
    const live = liveLook(performance.now());
    let miss = 0;
    for (const f of mv) {
      const v = aimValues(f, X, Y, live[f.id].pan, tz);
      if (!v) { miss++; continue; }
      prog.vals[f.id] = prog.vals[f.id] || {};
      prog.vals[f.id].pan = Math.round(v.pan * 100) / 100;
      prog.vals[f.id].tilt = Math.round(v.tilt * 100) / 100;
    }
    if (miss && !quiet) toast(`${miss} ta chiroq bu nuqtaga yeta olmaydi (burilish chegarasi)`);
    $('#stageCoord').textContent = `${X.toFixed(1)} m × ${Y.toFixed(1)} m`;
    renderStageSvg();
    if (!quiet) { renderStageSide(); renderProgrammer(); }
  }

  // ---- Sichqoncha / barmoq ----
  wrap.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-sf]');
    if (b) {
      e.preventDefault();
      const id = b.dataset.sf;
      if (stageMode === 'place') {
        dragFx = { id, moved: false };
        try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
        if (!(sel.size === 1 && sel.has(id))) { sel.clear(); sel.add(id); renderSel(); renderStageSvg(); renderStageSide(); b.classList.add('on'); fxLayer.querySelectorAll('.sfx.on').forEach((x) => { if (x !== b) x.classList.remove('on'); }); }
        return;
      }
      sel.has(id) ? sel.delete(id) : sel.add(id);
      renderSel(); renderStageSvg(); renderStageFx(); renderStageSide();
      return;
    }
    const [X, Y] = evToMeters(e);
    if (stageMode === 'corners') {
      const s = ST(), cr = curCornersRaw();
      if (!curImg()) { toast('Avval sahna rasmini yuklang'); return; }
      const c = (cr && cr.length === 4) ? cr.map((p) => [...p]) : virtualCorners();
      c[cornerStep] = evToImage(e).map((v) => Math.round(v));
      if (FRONT()) s.front.corners = c; else s.corners = c;
      cornerStep++;
      if (cornerStep >= 4) { cornerStep = 0; stageMode = 'aim'; toast('Sahna burchaklari saqlandi'); }
      save(); renderStageAll();
      return;
    }
    if (stageMode === 'calib') {
      const mv = selMovers();
      if (mv.length !== 1 || sel.size !== 1) { toast('Kalibrlash uchun aynan bitta moving head tanlang'); return; }
      const f = mv[0], live = liveLook(performance.now())[f.id];
      const c = ST().cal[f.id] = ST().cal[f.id] || { pts: [] };
      c.pts = c.pts || [];
      c.pts.push({ x: +X.toFixed(2), y: +Y.toFixed(2), pan: +live.pan.toFixed(2), tilt: +live.tilt.toFixed(2) });
      fitCal(f); save(); renderStageSvg(); renderStageSide();
      toast(`${f.name}: ${c.pts.length}-nuqta saqlandi`);
      return;
    }
    if (stageMode === 'place') return;
    aimAt(X, Y);
    if (selMovers().length) { aimDrag = true; try { wrap.setPointerCapture(e.pointerId); } catch (_) {} }
  });
  wrap.addEventListener('pointermove', (e) => {
    if (aimDrag) {
      const [X, Y] = evToMeters(e), s = ST();
      if (!aimRaf) aimRaf = requestAnimationFrame(() => { aimRaf = 0; aimAt(clamp(X, -1, s.w + 1), clamp(Y, -1, s.d + 1), true); });
      return;
    }
    if (dragFx && FRONT()) {
      const q = evToImage(e), z = imgSize();
      ST().front.fpos[dragFx.id] = [Math.round(clamp(q[0], 0, z.w)), Math.round(clamp(q[1], 0, z.h))];
      dragFx.moved = true;
      const el = fxLayer.querySelector(`[data-sf="${dragFx.id}"]`);
      if (el) { el.style.left = ST().front.fpos[dragFx.id][0] * scale + 'px'; el.style.top = ST().front.fpos[dragFx.id][1] * scale + 'px'; }
      return;
    }
    if (!dragFx) {
      if (e.pointerType === 'mouse') { const [X, Y] = evToMeters(e); $('#stageCoord').textContent = `${X.toFixed(1)} m × ${Y.toFixed(1)} m`; }
      return;
    }
    const [X, Y] = evToMeters(e), s = ST();
    const p = s.pos[dragFx.id] || { z: 0 };
    s.pos[dragFx.id] = { ...p, x: +clamp(X, -2, s.w + 2).toFixed(2), y: +clamp(Y, -2, s.d + 4).toFixed(2) };
    dragFx.moved = true;
    const el = fxLayer.querySelector(`[data-sf="${dragFx.id}"]`);
    if (el) { const [sx, sy] = toScreen(s.pos[dragFx.id].x, s.pos[dragFx.id].y); el.style.left = sx + 'px'; el.style.top = sy + 'px'; }
    $('#stageCoord').textContent = `${s.pos[dragFx.id].x.toFixed(1)} m × ${s.pos[dragFx.id].y.toFixed(1)} m`;
  });
  const endDrag = () => {
    if (aimDrag) { aimDrag = false; renderStageSide(); renderProgrammer(); return; }
    if (!dragFx) return;
    const f = show.fixtures.find((x) => x.id === dragFx.id);
    if (dragFx.moved && f && ST().cal[f.id] && (ST().cal[f.id].pts || []).length) fitCal(f);
    dragFx = null; save(); renderStageSvg(); renderStageSide();
  };
  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);

  // ---- Boshqaruv elementlari ----
  $('#stageModes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sm]'); if (!b) return;
    stageMode = b.dataset.sm;
    if (stageMode === 'corners') {
      cornerStep = 0;
      if (!ST().img) { toast('4 burchak faqat yuklangan rasm uchun kerak'); stageMode = 'aim'; }
    }
    renderStageAll();
  });
  $('#stageViews').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sv]'); if (!b) return;
    const s = ST(); if (s.view === b.dataset.sv) return;
    s.view = b.dataset.sv; stageMode = 'aim'; cornerStep = 0; imgNat = null;
    save(); renderStageAll();
  });
  $('#stGrid').addEventListener('click', () => { const F = ST().front; F.grid = F.grid === false; save(); renderStageSvg(); renderStageSide(); });
  $('#stOp').addEventListener('input', (e) => { ST().front.op = +e.target.value; imgEl.style.opacity = e.target.value / 100; });
  $('#stOp').addEventListener('change', () => save());
  $('#tzChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tz]'); if (!b) return;
    ST().tz = +b.dataset.tz; save(); renderStageSide();
    if (stageTarget) aimAt(stageTarget.x, stageTarget.y);
  });
  $('#stUpload').addEventListener('click', () => $('#stFile').click());
  $('#stFile').addEventListener('change', async (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
      const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Rasm ochilmadi')); i.src = url; });
      const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
      const cv = document.createElement('canvas');
      cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      const s = ST();
      const data = cv.toDataURL('image/jpeg', 0.82);
      const w = cv.width, h = cv.height;
      if (FRONT()) {
        s.front.img = data;
        s.front.corners = FRONT_VC.map(([x, y]) => [Math.round(x / 1000 * w), Math.round(y / 625 * h)]);
        s.front.fpos = {};
      } else {
        s.img = data;
        s.corners = [[w * 0.1, h * 0.12], [w * 0.9, h * 0.12], [w * 0.9, h * 0.85], [w * 0.1, h * 0.85]].map((p) => p.map(Math.round));
      }
      imgNat = { w, h };
      stageMode = 'corners'; cornerStep = 0;
      save(true); renderStageAll();
      toast(FRONT() ? 'Surat yuklandi. Endi sahna POLINING 4 burchagini belgilang.' : 'Rasm yuklandi. Endi sahnaning 4 burchagini belgilang.');
    } catch (err) { toast('Rasmni yuklab boʻlmadi: ' + err.message); }
  });
  $('#stClear').addEventListener('click', () => {
    if (!confirmSoft('Sahna rasmi olib tashlansinmi? Chiroqlar joyi saqlanadi.')) return;
    const s = ST();
    if (FRONT()) { s.front.img = null; s.front.corners = null; s.front.fpos = {}; } else { s.img = null; s.corners = null; }
    stageMode = 'aim'; save(); renderStageAll();
  });
  const dimChange = () => {
    const s = ST();
    s.w = clamp(+$('#stW').value || s.w, 2, 60); s.d = clamp(+$('#stD').value || s.d, 2, 60); s.h = clamp(+$('#stH').value || s.h, 1, 30);
    save(); renderStageAll();
  };
  ['#stW', '#stD', '#stH'].forEach((q) => $(q).addEventListener('change', dimChange));
  $('#stHAll').addEventListener('click', () => {
    const s = ST(); let n = 0;
    for (const f of show.fixtures) if (isMover(f)) { s.pos[f.id] = { ...(s.pos[f.id] || { x: 0, y: 0 }), z: s.h }; n++; if ((s.cal[f.id] || {}).pts?.length) fitCal(f); }
    save(); renderStageAll(); toast(`${n} ta moving head balandligi ${s.h} m`);
  });
  const posChange = () => {
    const ids = [...sel]; if (ids.length !== 1) return;
    const s = ST(), p = s.pos[ids[0]] || {};
    s.pos[ids[0]] = { x: +(+$('#stX').value || 0).toFixed(2), y: +(+$('#stY').value || 0).toFixed(2), z: +clamp(+$('#stZ').value || 0, 0, 30).toFixed(2) };
    const f = show.fixtures.find((x) => x.id === ids[0]);
    if (f && (s.cal[f.id] || {}).pts?.length) fitCal(f);
    save(); renderStageSvg(); renderStageFx(); renderStageSide();
    void p;
  };
  ['#stX', '#stY', '#stZ'].forEach((q) => $(q).addEventListener('change', posChange));
  const manual = (param, el) => {
    const mv = selMovers(); if (!mv.length || !guardAction()) return;
    for (const f of mv) { prog.vals[f.id] = prog.vals[f.id] || {}; prog.vals[f.id][param] = +el.value; }
    $(param === 'pan' ? '#sPanV' : '#sTiltV').textContent = Math.round(el.value / 2.55) + '%';
  };
  $('#sPan').addEventListener('input', (e) => manual('pan', e.target));
  $('#sTilt').addEventListener('input', (e) => manual('tilt', e.target));
  ['#sPan', '#sTilt'].forEach((q) => $(q).addEventListener('change', () => renderStageSide()));
  $('#stBeams').addEventListener('click', () => {
    sel.clear(); show.fixtures.filter(isMover).forEach((f) => sel.add(f.id));
    renderSel(); renderStageAll();
  });
  $('#stDim').addEventListener('click', () => {
    const mv = selMovers(); if (!mv.length) { toast('Avval moving head tanlang'); return; }
    if (!guardAction()) return;
    mv.forEach((f) => { prog.vals[f.id] = prog.vals[f.id] || {}; prog.vals[f.id].dim = 255; });
    renderProgrammer(); flashBtn($('#stDim'));
  });
  $('#calClear').addEventListener('click', () => {
    const mv = selMovers(); if (mv.length !== 1) return;
    if (!confirmSoft(`${mv[0].name} kalibrlash nuqtalari oʻchirilsinmi?`)) return;
    delete ST().cal[mv[0].id]; save(); renderStageSvg(); renderStageSide();
  });
  $('#ptSave').addEventListener('click', () => {
    if (!stageTarget) { toast('Avval planda nuqtani bosing'); return; }
    const n = $('#ptName').value.trim() || ('Nuqta ' + (ST().points.length + 1));
    ST().points.push({ n: n.slice(0, 24), x: +stageTarget.x.toFixed(2), y: +stageTarget.y.toFixed(2), z: +(stageTarget.z || 0) });
    $('#ptName').value = ''; save(); renderStageSide(); toast(`„${n}“ saqlandi`);
  });
  $('#ptList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pt]'); if (!b) return;
    const q = ST().points[+b.dataset.pt];
    if (q.z != null) ST().tz = q.z;
    aimAt(q.x, q.y); flashBtn(b);
  });
  $('#ptList').addEventListener('contextmenu', (e) => {
    const b = e.target.closest('[data-pt]'); if (!b) return;
    e.preventDefault();
    const i = +b.dataset.pt;
    if (!confirmSoft(`„${ST().points[i].n}“ nuqtasi oʻchirilsinmi?`)) return;
    ST().points.splice(i, 1); save(); renderStageSide();
  });

  /* ================= Bo'limlar ================= */
  let tab = 'pult';
  function setTab(t) {
    // Monitordan chiqilganda qo'lda ushlab turilgan sinov qiymatlari avtomatik qo'yib yuboriladi
    if (t !== 'monitor' && Object.keys(chTest).length) { for (const k in chTest) delete chTest[k]; toast('Kanal sinovi tugadi — qiymatlar qoʻyib yuborildi'); }
    tab = t;
    $$('#tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    $$('.tab').forEach((s) => { s.hidden = s.id !== 'tab-' + t; });
    if (t === 'pult') requestAnimationFrame(fitFixtures);
    if (t === 'patch') renderPatch();
    if (t === 'profil') renderProfiles();
    if (t === 'ulanish') renderConn();
    if (t === 'monitor') { $('#mon').innerHTML = ''; renderMonitor(); renderChTest(); }
    if (t === 'sahna') renderStageAll();
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  $$('[data-tab-go]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tabGo)));

  /* ================= Klaviatura ================= */
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea') || !$('#paywall').hidden) return;
    if (e.code === 'Space') { e.preventDefault(); go(); }
    else if (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И') toggleBlackout();
    else if (e.key === 'Escape') release();
  });

  /* ================= Litsenziya va to'lov oynasi (ARENA mexanizmi) ================= */
  let selPlan = 0, pwOpen = false;
  function updateLicenseUI() {
    const s = L().state;
    const b = $('#licBadge');
    if (s.license) {
      b.className = 'pill lic pro';
      b.textContent = (isStart() ? 'START' : 'PRO') + (s.license.expiresAt ? ' · ' + Math.max(0, Math.ceil((s.license.expiresAt - Date.now()) / 864e5)) + ' kun qoldi' : ' · cheksiz');
    } else if (s.remainingSec == null) {
      b.className = 'pill lic'; b.textContent = 'Tekshirilmoqda…';
    } else {
      b.className = 'pill lic' + (s.remainingSec < 180 ? ' low' : '');
      b.textContent = s.remainingSec > 0 ? 'Bepul sinov: ' + mmss(s.remainingSec) : 'Sinov tugadi · Tarif tanlash';
    }
    $('#stServer').innerHTML = s.online ? '<span style="color:var(--on)">●</span> Server ulangan' : '<span style="color:var(--red)">●</span> Server bilan aloqa yoʻq';
    const lk = locked();
    $('#goBtn').disabled = lk; $('#go2Btn').disabled = lk;
    if (lk && !pwOpen) openPaywall();
    if (pwOpen) renderPaywall();
  }
  function renderPaywall() {
    const s = L().state;
    const cfg = s.config || { tariffs: [], card: {}, trialMinutes: 20 };
    const lk = locked();
    const tariffs = cfg.tariffs || [];
    if (selPlan >= tariffs.length) selPlan = 0;
    $('#pwTitle').textContent = s.license ? 'Tarif faol' : lk ? `${cfg.trialMinutes} daqiqalik bepul sinov tugadi` : 'Tarifni tanlang';
    $('#pwSub').textContent = s.license
      ? `Tarif: ${s.license.plan}${s.license.expiresAt ? ', ' + new Date(s.license.expiresAt).toLocaleDateString('ru-RU') + ' gacha' : ''}. Uzaytirish uchun yangi kod olib, pastga kiriting.`
      : lk ? 'Davom etish uchun tarif tanlang. Chiroqlar oxirgi holatda qoladi, cue’laringiz saqlangan: faollashtirgach shu joydan davom etasiz.'
        : `Bepul sinovda ${mmss(s.remainingSec || 0)} qoldi. Hoziroq tarif olib, cheklovsiz ishlashingiz mumkin.`;
    $('#pwTimer').textContent = s.license ? 'FAOL' : `Sinov: ${mmss(s.remainingSec || 0)}`;
    $('#pwClose').hidden = lk;
    $('#plans').innerHTML = tariffs.length ? tariffs.map((t, i) => {
      const note = /^ST/i.test(t.id) ? `${LIMITS.fixtures} tagacha chiroq · ${LIMITS.cues} cue` : t.days >= 60 ? `${t.days} kun · oyiga ~${sum(Math.round(t.price / (t.days / 30) / 1000) * 1000)}` : t.days ? `${t.days} kun · cheksiz chiroq va cue` : 'Cheksiz muddat';
      return `<button class="plan ${i === selPlan ? 'on' : ''}" data-plan="${i}" aria-pressed="${i === selPlan}" type="button"><span class="pn">${esc(t.name.toUpperCase())}</span><span class="pp">${sum(t.price).replace(" so'm", '')} <small>soʻm</small></span><span class="pd">${esc(note)}</span></button>`;
    }).join('') : '<p class="muted">Tariflar yuklanmadi. Internet aloqasini tekshiring.</p>';
    const t = tariffs[selPlan];
    $$('.pw-amount').forEach((el) => { el.textContent = t ? sum(t.price) : '—'; });
    const card = cfg.card || {};
    $('#pcNum').textContent = card.number || 'Karta hali sozlanmagan';
    $('#pcHolder').textContent = card.holder || '—';
    $('#pcSys').textContent = card.system || '';
    $('#pcId').textContent = s.shortId || '—';
    const tg = $('#tgBtn');
    if (cfg.botUsername) { tg.href = `https://t.me/${cfg.botUsername}?start=${encodeURIComponent(s.shortId || '')}`; tg.classList.remove('off'); }
    else { tg.removeAttribute('href'); tg.classList.add('off'); }
  }
  function openPaywall() { pwOpen = true; $('#paywall').hidden = false; L().refreshConfig(); renderPaywall(); payStatus(); chatLoad(true); }
  function closePaywall() { if (locked()) return; pwOpen = false; $('#paywall').hidden = true; }
  $('#plans').addEventListener('click', (e) => { const b = e.target.closest('[data-plan]'); if (b) { selPlan = +b.dataset.plan; renderPaywall(); } });
  $('#pwClose').addEventListener('click', closePaywall);
  $('#licBadge').addEventListener('click', openPaywall);
  $('#copyCard').addEventListener('click', async () => {
    const n = (L().state.config || {}).card?.number; if (!n) return;
    try { await navigator.clipboard.writeText(n.replace(/\s/g, '')); $('#copyCard').textContent = 'NUSXALANDI'; $('#copyCard').classList.add('on'); setTimeout(() => { $('#copyCard').textContent = 'NUSXA'; $('#copyCard').classList.remove('on'); }, 1500); } catch (_) {}
  });
  $('#codeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#codeMsg'), code = $('#codeInput').value.trim();
    if (!code) { msg.style.color = 'var(--red)'; msg.textContent = 'Kodni kiriting'; return; }
    msg.style.color = 'var(--muted)'; msg.textContent = 'Tekshirilmoqda…';
    try {
      const lic = await L().activate(code);
      msg.style.color = 'var(--on)'; msg.textContent = `Faollashtirildi: ${lic.plan}. Rahmat!`;
      $('#codeInput').value = '';
      setTimeout(() => { closePaywall(); msg.textContent = ''; }, 1500);
    } catch (err) { msg.style.color = 'var(--red)'; msg.textContent = err.message; }
  });

  /* ================= Chekni dasturdan yuborish (Sahna Ovozi bilan bir xil) ================= */
  let pfImg = null;
  const pfMsg = (t, c) => { const m = $('#pfMsg'); m.style.color = c || 'var(--muted)'; m.textContent = t; };
  async function shrinkImg(file) {
    // katta rasmni 1600 px gacha kichraytirib JPEG qilamiz — server chegarasi ~800 KB
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      for (const q of [0.82, 0.7, 0.55]) { const d = cv.toDataURL('image/jpeg', q); if (d.length < 1000000) return d; }
      throw new Error('big');
    } finally { URL.revokeObjectURL(url); }
  }
  $('#pfImg').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0]; const lab = $('#pfImg').parentElement;
    pfImg = null; lab.classList.remove('has'); $('#pfImgName').textContent = 'Chek rasmini tanlash';
    if (!f) return;
    try { pfImg = await shrinkImg(f); lab.classList.add('has'); $('#pfImgName').textContent = '✓ ' + f.name.slice(0, 40); pfMsg(''); }
    catch (_) { pfMsg('Rasm oʻqilmadi — boshqa rasm tanlang', 'var(--red)'); }
  });
  const PST = { pending: 'Chekingiz tekshirilmoqda — tasdiqlangach oʻzi faollashadi', approved: 'Oxirgi toʻlov tasdiqlangan', rejected: 'Oxirgi toʻlov rad etilgan — admin bilan yozishmada soʻrang' };
  async function payStatus() {
    try { const r = await fetch('/api/pay?deviceId=' + encodeURIComponent(L().deviceId)); const j = await r.json(); if (j.payment && PST[j.payment.status] && !L().state.license) pfMsg(PST[j.payment.status], j.payment.status === 'rejected' ? 'var(--red)' : 'var(--muted)'); } catch (_) {}
  }
  $('#payForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = ((L().state.config || {}).tariffs || [])[selPlan];
    if (!t) return pfMsg('Avval tarifni tanlang', 'var(--red)');
    const name = $('#pfName').value.trim(), phone = $('#pfPhone').value.trim();
    if (!pfImg && !name && !phone) return pfMsg('Chek rasmini tanlang yoki ism va telefoningizni yozing', 'var(--red)');
    const b = $('#pfSend'); b.disabled = true; pfMsg('Yuborilmoqda…');
    try {
      const r = await fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: L().deviceId, plan: t.id, name, phone, note: $('#pfNote').value.trim(), img: pfImg || '' }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Server xatosi');
      pfMsg('Yuborildi ✓ Admin tasdiqlagach tarif shu yerda oʻzi faollashadi.', 'var(--on)');
      pfImg = null; $('#pfImg').value = ''; $('#pfImg').parentElement.classList.remove('has'); $('#pfImgName').textContent = 'Chek rasmini tanlash'; $('#pfNote').value = '';
      try { localStorage.setItem('sn_pf', JSON.stringify({ name, phone })); } catch (_) {}
    } catch (err) { pfMsg(err.message, 'var(--red)'); }
    b.disabled = false;
  });
  try { const v = JSON.parse(localStorage.getItem('sn_pf') || 'null'); if (v) { $('#pfName').value = v.name || ''; $('#pfPhone').value = v.phone || ''; } } catch (_) {}

  /* ================= Admin bilan yozishma ================= */
  let chatN = -1;
  async function chatLoad(markRead) {
    if (!L()) return;
    try {
      const r = await fetch('/api/msg?deviceId=' + encodeURIComponent(L().deviceId)); const j = await r.json();
      const ms = j.msgs || [];
      if (ms.length !== chatN) {
        chatN = ms.length;
        $('#chatLog').innerHTML = ms.length ? ms.map((m) => `<div class="m ${m.who === 'a' ? 'a' : 'u'}">${esc(m.text)}<small>${m.who === 'a' ? 'Admin · ' : ''}${new Date(m.created).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small></div>`).join('') : '<span class="empty">Hozircha xabar yoʻq</span>';
        $('#chatLog').scrollTop = 1e9;
      }
      let unread = j.unread || 0;
      if (unread && markRead) { fetch('/api/msg', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: L().deviceId, action: 'read' }) }).catch(() => {}); unread = 0; }
      $('#msgCount').hidden = !unread; $('#msgCount').textContent = unread; $('#msgBadge').classList.toggle('new', !!unread);
    } catch (_) {}
  }
  $('#chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inp = $('#chatInput'), text = inp.value.trim(); if (!text) return;
    inp.disabled = true;
    try {
      const r = await fetch('/api/msg', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: L().deviceId, text, name: $('#pfName').value.trim() }) });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Server xatosi');
      inp.value = ''; await chatLoad(true);
    } catch (err) { toast(err.message); }
    inp.disabled = false; inp.focus();
  });
  $('#msgBadge').addEventListener('click', () => { openPaywall(); chatLoad(true); setTimeout(() => { $('#chatBox').scrollIntoView({ block: 'center', behavior: 'smooth' }); $('#chatInput').focus(); }, 80); });
  setInterval(() => chatLoad(pwOpen), 45000);
  setTimeout(() => chatLoad(false), 2500);

  /* ================= Boshlash ================= */
  function renderAllPult() { renderGroups(); renderFixtures(); renderSel(); renderCues(); renderFaders(); renderAutoBtn(); renderMib(); }
  function renderAll() { $('#showTitle').value = show.title; document.title = show.title + ' — SAHNA NURI'; renderAllPult(); renderConn(); if (tab !== 'pult') setTab(tab); }
  renderAll();
  // Sahifa qayta ochilsa yoki kompyuter qayta yonsa: oxirgi ijro etilgan cue fade'siz tiklanadi
  (function resumeLastCue() {
    const i = show.lastCue;
    if (typeof i !== 'number' || i < 0 || i >= show.cues.length) return;
    const q = show.cues[i];
    play.to = cueLook(q); play.from = null; play.dur = 0; play.fadeMs = 0; play.start = performance.now();
    play.fx = (q.fx || []).map((x) => ({ type: x.type, fids: x.fids.filter((id) => show.fixtures.some((f) => f.id === id)) }));
    play.cur = i; play.next = i + 1 < show.cues.length ? i + 1 : i; play.autoFired = true;
    renderCues(); renderProgrammer();
    setTimeout(() => toast(`Oxirgi sahna tiklandi: Cue ${q.num} · ${q.name}`), 600);
  })();
  requestAnimationFrame(frame);
  if (patchMigrated) setTimeout(() => toast('Patch FreeStyler’dagi 35 ta chiroqqa yangilandi'), 800);
  SNDmx.autoConnect();
  if (L()) { L().onChange(updateLicenseUI); L().start(); }
  window.addEventListener('beforeunload', () => save(true));
  // Til almashganda hamma narsani qayta chizish (matnlar i18n.js orqali o'giriladi)
  if (window.SNI18N) {
    SNI18N.onChange(() => { renderAll(); if (L()) updateLicenseUI(); if (pwOpen) renderPaywall(); });
    SNI18N.applyHtml(); SNI18N.refresh();
  }
})();
