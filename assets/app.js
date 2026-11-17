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
  const c = (n, r, d = 0) => ({ n, r, d });

  const DEFAULT_PROFILES = () => ({
    beam16: {
      name: 'Led Beam 300W (16 kanal)', group: 'Beamlar', wheel: { ...DEF_WHEEL }, panRange: 540, tiltRange: 270,
      ch: [c('Pan', 'pan', 128), c('Pan fine', 'panF'), c('Tilt', 'tilt', 128), c('Tilt fine', 'tiltF'), c('Pan/Tilt tezligi', 'fixed', 0),
        c('Dimmer', 'dim'), c('Shutter / Strob', 'strobe', 255), c('Rang gʻildiragi', 'cwheel'), c('Gobo', 'gobo'), c('Prizma', 'fixed', 0),
        c('Prizma aylanishi', 'fixed', 0), c('Fokus', 'fixed', 128), c('Frost', 'fixed', 0), c('Reset / funksiya', 'fixed', 0), c('Zaxira', 'fixed', 0), c('Zaxira', 'fixed', 0)],
    },
    panel8: {
      name: 'Evro Led 5RC (8 kanal)', group: 'Panellar',
      ch: [c('Dimmer', 'dim'), c('Qizil', 'r'), c('Yashil', 'g'), c('Koʻk', 'b'), c('Oq', 'w'), c('Strob', 'strobe', 0), c('Rejim', 'fixed', 0), c('Tezlik', 'fixed', 0)],
    },
    par7: {
      name: 'ProPar (7 kanal)', group: 'PARlar',
      ch: [c('Dimmer', 'dim'), c('Qizil', 'r'), c('Yashil', 'g'), c('Koʻk', 'b'), c('Strob', 'strobe', 0), c('Rejim', 'fixed', 0), c('Tezlik', 'fixed', 0)],
    },
    bar6: {
      name: 'Led2Lin bar (6 kanal)', group: 'Barlar',
      ch: [c('Dimmer', 'dim'), c('Qizil', 'r'), c('Yashil', 'g'), c('Koʻk', 'b'), c('Strob', 'strobe', 0), c('Rejim', 'fixed', 0)],
    },
    front1: { name: 'Front Light (1 kanal)', group: 'Front', ch: [c('Dimmer', 'dim')] },
    dim12: { name: 'Dimmer blok (12 kanal)', group: 'Dimmer', ch: Array.from({ length: 12 }, (_, i) => c('Kanal ' + (i + 1), 'dim')) },
  });

  function defaultPatch(profiles) {
    const plan = [['beam16', 'Beam', 12], ['panel8', 'Panel', 6], ['par7', 'PAR', 6], ['bar6', 'Bar', 4], ['front1', 'Front', 2], ['dim12', 'Dimmer', 2]];
    const out = []; let addr = 1;
    for (const [p, name, n] of plan) for (let i = 1; i <= n; i++) { out.push({ id: uid(), name: name + ' ' + i, prof: p, addr }); addr += profiles[p].ch.length; }
    return out;
  }

  function newStage() { return { w: 12, d: 7, h: 6, img: null, corners: null, pos: {}, cal: {}, points: [] }; }
  function newShow() {
    const profiles = DEFAULT_PROFILES();
    return { v: 1, title: 'Yangi spektakl', profiles, fixtures: defaultPatch(profiles), cues: [], levels: {}, fxDepth: 100, fxSpeed: 40, master: 100, stage: newStage() };
  }

  const SHOW_KEY = 'sn_show_v1';
  let show;
  try { show = JSON.parse(localStorage.getItem(SHOW_KEY)); } catch (_) { show = null; }
  if (!show || !Array.isArray(show.fixtures) || !show.profiles) show = newShow();
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
  let blackout = false;
  const play = { cur: -1, next: 0, from: null, to: null, start: 0, dur: 0, paused: false, pausedAt: 0, fx: [] };

  const prof = (f) => show.profiles[f.prof] || { name: '?', group: 'Boshqa', ch: [] };
  const hasRole = (p, r) => p.ch.some((x) => x.r === r);
  const defParams = () => ({ dim: 0, r: 255, g: 255, b: 255, w: 0, pan: 128, tilt: 128, col: 'Oq', gobo: 0 });
  const groups = () => [...new Set(show.fixtures.map((f) => prof(f).group))];

  function emptyLook() { const l = {}; for (const f of show.fixtures) l[f.id] = defParams(); return l; }
  function cueLook(cue) {
    const l = emptyLook();
    for (const f of show.fixtures) if (cue.look[f.id]) Object.assign(l[f.id], cue.look[f.id]);
    return l;
  }

  // Joriy (fade bilan) bazaviy holat
  function baseLook(now) {
    if (!play.to) return emptyLook();
    let k = 1;
    if (play.dur > 0) {
      const t = (play.paused ? play.pausedAt : now) - play.start;
      k = clamp(t / play.dur, 0, 1);
    }
    if (k >= 1 || !play.from) return play.to;
    const out = {};
    for (const id in play.to) {
      const a = play.from[id] || defParams(), b = play.to[id], o = {};
      for (const key in b) o[key] = typeof b[key] === 'number' ? a[key] + (b[key] - a[key]) * k : (k < 0.5 ? a[key] : b[key]);
      out[id] = o;
    }
    return out;
  }
  function fadeProgress(now) {
    if (!play.to || play.dur <= 0) return play.to ? 1 : 0;
    return clamp(((play.paused ? play.pausedAt : now) - play.start) / play.dur, 0, 1);
  }

  // Programmer qo'shilgan "jonli" holat (cue yozish uchun ham shu ishlatiladi)
  function liveLook(now) {
    const base = baseLook(now), out = {};
    for (const f of show.fixtures) out[f.id] = { ...(base[f.id] || defParams()), ...(prog.vals[f.id] || {}) };
    return out;
  }

  function hsv(h) {
    const i = Math.floor(h * 6), f = h * 6 - i, q = 1 - f;
    const m = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][i % 6];
    return m.map((x) => Math.round(x * 255));
  }

  /* ================= DMX hisoblash ================= */
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
        buf[a] = clamp(Math.round(v), 0, 255);
      });
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
    if (frameN++ % 6 === 0) { updateFixtureLevels(); if (tab === 'monitor') renderMonitor(); }
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
  function renderFixtures() {
    $('#fixtureBtns').innerHTML = show.fixtures.map((f) => `<button class="btn ${sel.has(f.id) ? 'on' : ''}" data-f="${f.id}" type="button" aria-pressed="${sel.has(f.id)}"><span>${esc(f.name)}</span><small>DMX ${String(f.addr).padStart(3, '0')}</small><span class="lvl"><i data-lv="${f.id}"></i></span></button>`).join('')
      || '<div class="empty" style="grid-column:1/-1">Chiroqlar yoʻq. Patch boʻlimida qoʻshing.</div>';
  }
  $('#fixtureBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-f]'); if (!el) return;
    const id = el.dataset.f;
    sel.has(id) ? sel.delete(id) : sel.add(id);
    renderSel();
  });
  function updateFixtureLevels() {
    for (const f of show.fixtures) {
      const el = document.querySelector(`[data-lv="${f.id}"]`); if (!el) continue;
      const pr = prof(f); const k = pr.ch.findIndex((x) => x.r === 'dim');
      let v = 0;
      if (k >= 0) v = buf[f.addr - 1 + k] || 0;
      else { const ks = ['r', 'g', 'b', 'w'].map((r) => pr.ch.findIndex((x) => x.r === r)).filter((x) => x >= 0); v = Math.max(0, ...ks.map((x) => buf[f.addr - 1 + x] || 0)); }
      el.style.width = (v / 2.55).toFixed(0) + '%';
    }
  }
  function renderSel() {
    $$('#fixtureBtns [data-f]').forEach((b) => { const on = sel.has(b.dataset.f); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    renderGroups();
    $('#selInfo').textContent = `${show.fixtures.length} ta chiroq · ${sel.size} ta tanlangan`;
    renderProgrammer();
  }

  /* ================= PULT: programmer ================= */
  function setProg(param, value, ids = [...sel]) {
    if (!ids.length) { toast('Avval chiroq tanlang'); return false; }
    if (!guardAction()) return false;
    for (const id of ids) { prog.vals[id] = prog.vals[id] || {}; prog.vals[id][param] = value; }
    return true;
  }
  function firstSelParams() {
    const id = [...sel][0]; if (!id) return null;
    // maqsad holat (fade tugagandagi qiymat) + programmer
    return { ...defParams(), ...((play.to && play.to[id]) || {}), ...(prog.vals[id] || {}) };
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
  }
  $('#dimR').addEventListener('input', (e) => { if (setProg('dim', +e.target.value * 2.55)) $('#dimV').textContent = e.target.value + '%'; else e.target.value = 0; });
  $$('[data-dim]').forEach((b) => b.addEventListener('click', () => { if (setProg('dim', +b.dataset.dim * 2.55)) renderProgrammer(); }));
  $('#panR').addEventListener('input', (e) => { if (setProg('pan', +e.target.value)) $('#panV').textContent = Math.round(e.target.value / 2.55) + '%'; });
  $('#tiltR').addEventListener('input', (e) => { if (setProg('tilt', +e.target.value)) $('#tiltV').textContent = Math.round(e.target.value / 2.55) + '%'; });
  $('#colorBtns').addEventListener('click', (e) => {
    const el = e.target.closest('[data-c]'); if (!el) return;
    const x = COLORS[+el.dataset.c];
    const ids = [...sel];
    if (!setProg('col', x.n, ids)) return;
    ids.forEach((id) => { const [r, g, b, w] = x.rgbw; Object.assign(prog.vals[id], { r, g, b, w }); });
    renderProgrammer();
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
        const st = i === play.cur ? (play.paused ? 'PAUZA' : 'IJRODA') : i === play.next ? 'KEYINGI' : '';
        return `<div class="cue ${cls}" data-i="${i}" role="button" tabindex="0" aria-label="Cue ${esc(q.num)} ${esc(q.name)}">
          <b>${esc(q.num)}</b>
          <input data-name="${i}" value="${esc(q.name)}" aria-label="Cue nomi">
          <input data-fade="${i}" type="number" min="0" max="600" step="0.5" value="${q.fade}" aria-label="Fade soniya">
          <span class="st">${st}</span></div>`;
      }).join('');
    }
    const cur = show.cues[play.cur];
    $('#cueInfo').textContent = cur ? `Joriy: ${cur.num} · ${cur.name}` : `${show.cues.length} ta cue`;
  }
  $('#cueList').addEventListener('click', (e) => {
    if (e.target.closest('input')) return;
    const row = e.target.closest('[data-i]'); if (!row) return;
    play.next = +row.dataset.i; renderCues();
  });
  $('#cueList').addEventListener('dblclick', (e) => {
    if (e.target.closest('input')) return;
    const row = e.target.closest('[data-i]'); if (row) goTo(+row.dataset.i);
  });
  $('#cueList').addEventListener('keydown', (e) => {
    const row = e.target.closest('.cue[data-i]');
    if (row && e.target === row && (e.key === 'Enter')) { play.next = +row.dataset.i; renderCues(); }
  });
  $('#cueList').addEventListener('change', (e) => {
    const n = e.target.dataset.name, f = e.target.dataset.fade;
    if (n != null) { show.cues[+n].name = e.target.value.slice(0, 60); save(); }
    if (f != null) { show.cues[+f].fade = clamp(+e.target.value || 0, 0, 600); save(); }
  });

  function goTo(i) {
    if (!guardAction()) return;
    if (i < 0 || i >= show.cues.length) { toast(show.cues.length ? 'Roʻyxat oxiri' : 'Avval cue yozing'); return; }
    const now = performance.now();
    play.from = baseLook(now);
    play.to = cueLook(show.cues[i]);
    play.dur = (show.cues[i].fade || 0) * 1000;
    play.start = now; play.paused = false;
    play.fx = (show.cues[i].fx || []).map((x) => ({ type: x.type, fids: x.fids.filter((id) => show.fixtures.some((f) => f.id === id)) }));
    play.cur = i; play.next = i + 1 < show.cues.length ? i + 1 : i;
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

  function nextNum() {
    const last = show.cues[show.cues.length - 1];
    const n = last ? Math.floor(parseFloat(last.num) || show.cues.length) + 1 : 1;
    return String(n);
  }
  function snapshot() {
    const live = liveLook(performance.now()), look = {};
    for (const id in live) { const p = live[id]; look[id] = { ...p, dim: Math.round(p.dim), pan: Math.round(p.pan * 100) / 100, tilt: Math.round(p.tilt * 100) / 100, r: Math.round(p.r), g: Math.round(p.g), b: Math.round(p.b), w: Math.round(p.w) }; }
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
    play.cur = at; play.to = cueLook(q); play.from = null; play.dur = 0; play.fx = q.fx.map((x) => ({ ...x, fids: [...x.fids] }));
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
    play.to = cueLook(show.cues[i]); play.from = null; play.dur = 0; play.fx = show.cues[i].fx.map((x) => ({ ...x, fids: [...x.fids] }));
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
    play.from = baseLook(now); play.to = emptyLook(); play.dur = 2000; play.start = now; play.paused = false; play.fx = []; play.cur = -1;
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
    $('#addProf').innerHTML = opts($('#addProf').value || 'beam16');
    $('#addAddr').value = nextFree();
  }
  function nextFree() { let m = 0; for (const f of show.fixtures) m = Math.max(m, f.addr + prof(f).ch.length - 1); return Math.min(512, m + 1); }
  $('#patchRows').addEventListener('change', (e) => {
    const t = e.target, d = t.dataset;
    const f = show.fixtures.find((x) => x.id === (d.pn || d.pp || d.pa)); if (!f) return;
    if (d.pn) f.name = t.value.slice(0, 30);
    if (d.pp) f.prof = t.value;
    if (d.pa) f.addr = clamp(Math.round(+t.value || 1), 1, 512);
    save(); renderPatch(); renderAllPult();
  });
  $('#patchRows').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pd]'); if (!b) return;
    const f = show.fixtures.find((x) => x.id === b.dataset.pd);
    if (!confirmSoft(`${f.name} oʻchirilsinmi?`)) return;
    show.fixtures = show.fixtures.filter((x) => x !== f); sel.delete(f.id); delete prog.vals[f.id];
    save(); renderPatch(); renderAllPult();
  });
  $('#addFix').addEventListener('click', () => {
    const p = $('#addProf').value, n = clamp(+$('#addCount').value || 1, 1, 64);
    if (isStart() && show.fixtures.length + n > LIMITS.fixtures) { toast(`Start tarifida ${LIMITS.fixtures} tagacha chiroq. PRO’ga oʻting.`); openPaywall(); return; }
    let addr = clamp(+$('#addAddr').value || nextFree(), 1, 512);
    const base = ($('#addName').value.trim() || show.profiles[p].name.split(' (')[0]).slice(0, 24);
    const same = show.fixtures.filter((f) => f.name.startsWith(base)).length;
    for (let i = 1; i <= n; i++) { show.fixtures.push({ id: uid(), name: n === 1 && !same ? base : `${base} ${same + i}`, prof: p, addr }); addr += show.profiles[p].ch.length; }
    save(); renderPatch(); renderAllPult(); toast(`${n} ta chiroq qoʻshildi`);
  });
  $('#autoAddr').addEventListener('click', () => {
    let a = 1; for (const f of show.fixtures) { f.addr = a; a += prof(f).ch.length; }
    save(); renderPatch(); renderAllPult(); toast(a - 1 > 512 ? 'Diqqat: kanallar 512 dan oshdi' : 'Manzillar ketma-ket qoʻyildi');
  });
  $('#defPatch').addEventListener('click', () => {
    if (!confirmSoft('Patch standart 32 ta chiroqqa qaytarilsinmi? Cue’lar oʻchmaydi, lekin chiroqlar almashadi.')) return;
    show.profiles = { ...DEFAULT_PROFILES(), ...show.profiles };
    show.fixtures = defaultPatch(show.profiles); sel.clear(); prog.vals = {};
    save(); renderPatch(); renderAllPult();
  });
  $('#exportBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(show, null, 1)], { type: 'application/json' }));
    a.download = (show.title || 'spektakl').replace(/[^\p{L}\p{N} _-]/gu, '').trim() + '.sahnanuri.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
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
    const map = { udmx: '#cUdmx', pro: '#cPro', open: '#cOpen', sim: '#cSim' };
    $$('.ccard').forEach((x) => x.classList.remove('on'));
    $$('.ccard .btn').forEach((x) => x.classList.remove('on'));
    if (s.ok && map[s.kind]) { $(map[s.kind]).classList.add('on'); $(map[s.kind]).closest('.ccard').classList.add('on'); }
    $('#footConn').textContent = s.ok ? '● ' + s.label : '○ DMX ulanmagan';
  }
  SNDmx.onStatus(() => { renderConn(); const s = SNDmx.status(); if (s.ok) toast('Ulandi: ' + s.label); else if (s.error) toast(s.error); });
  $('#cUdmx').addEventListener('click', () => SNDmx.connectUDmx());
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

  /* ================= SAHNA: plan, chiroq joylashuvi, nur yo'naltirish ================= */
  // Koordinatalar: metr. X — tomoshabin tomondan chapdan o'ngga (0..eni), Y — orqa pardadan zal tomonga (0..chuqurlik).
  const ST = () => show.stage;
  let stageMode = 'aim', cornerStep = 0, stageTarget = null, dragFx = null, imgNat = null;
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
    if (s.img && imgNat) return imgNat;
    return { w: 1000, h: Math.round(1000 * (s.d + 4) / (s.w + 2)) };
  }
  function virtualCorners() {
    const s = ST(), z = imgSize();
    const P = (x, y) => [(x + 1) / (s.w + 2) * z.w, (y + 1) / (s.d + 4) * z.h];
    return [P(0, 0), P(s.w, 0), P(s.w, s.d), P(0, s.d)];
  }
  function corners() { const s = ST(); return s.img && s.corners && s.corners.length === 4 ? s.corners : virtualCorners(); }
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
  function angles(f, X, Y) {
    const p = ST().pos[f.id] || { x: 0, y: 0, z: ST().h };
    const dx = X - p.x, dy = Y - p.y, h = Math.max(0.3, p.z || ST().h);
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
  function aimValues(f, X, Y, curPan) {
    const { az, el } = angles(f, X, Y), m = model(f);
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
  function renderStageFx() {
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
  function renderStageSide() {
    const s = ST();
    $('#stW').value = s.w; $('#stD').value = s.d; $('#stH').value = s.h;
    $$('#stageModes [data-sm]').forEach((b) => b.classList.toggle('on', b.dataset.sm === stageMode));
    wrap.classList.toggle('place', stageMode === 'place');
    $('#stageHint').textContent = stageMode === 'corners'
      ? `${cornerStep + 1}-burchak: rasmda sahnaning ${CORNER_NAMES[cornerStep]} burchagini bosing (tomoshabin tomondan qaraganda).`
      : HINTS[stageMode];
    $('#stageTitle').textContent = s.img ? 'SAHNA · YUKLANGAN RASM' : `SAHNA PLANI · YUQORIDAN · ${s.w} × ${s.d} m`;
    $('#stClear').disabled = !s.img;
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
    const s = ST();
    if (s.img) { if (imgEl.getAttribute('src') !== s.img) { imgNat = null; imgEl.src = s.img; } imgEl.hidden = false; }
    else { imgEl.hidden = true; imgEl.removeAttribute('src'); imgNat = null; }
    layoutStage(); renderStageSvg(); renderStageFx(); renderStageSide();
  }
  imgEl.addEventListener('load', () => { imgNat = { w: imgEl.naturalWidth, h: imgEl.naturalHeight }; if (tab === 'sahna') { layoutStage(); renderStageSvg(); renderStageFx(); } });
  window.addEventListener('resize', () => { if (tab === 'sahna') { layoutStage(); renderStageSvg(); renderStageFx(); } });

  function selMovers() { return show.fixtures.filter((f) => sel.has(f.id) && isMover(f)); }

  // ---- Yo'naltirish ----
  function aimAt(X, Y) {
    const mv = selMovers();
    stageTarget = { x: X, y: Y };
    if (!mv.length) { toast('Avval moving head (Beam) tanlang'); renderStageSvg(); return; }
    if (!guardAction()) return;
    const live = liveLook(performance.now());
    let miss = 0;
    for (const f of mv) {
      const v = aimValues(f, X, Y, live[f.id].pan);
      if (!v) { miss++; continue; }
      prog.vals[f.id] = prog.vals[f.id] || {};
      prog.vals[f.id].pan = Math.round(v.pan * 100) / 100;
      prog.vals[f.id].tilt = Math.round(v.tilt * 100) / 100;
    }
    if (miss) toast(`${miss} ta chiroq bu nuqtaga yeta olmaydi (burilish chegarasi)`);
    $('#stageCoord').textContent = `${X.toFixed(1)} m × ${Y.toFixed(1)} m`;
    renderStageSvg(); renderStageSide(); renderProgrammer();
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
      const s = ST();
      if (!s.img) { toast('Avval sahna rasmini yuklang'); return; }
      const c = (s.corners && s.corners.length === 4) ? s.corners.map((p) => [...p]) : virtualCorners();
      c[cornerStep] = evToImage(e).map((v) => Math.round(v));
      s.corners = c;
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
  });
  wrap.addEventListener('pointermove', (e) => {
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
      s.img = cv.toDataURL('image/jpeg', 0.82);
      const w = cv.width, h = cv.height;
      s.corners = [[w * 0.1, h * 0.12], [w * 0.9, h * 0.12], [w * 0.9, h * 0.85], [w * 0.1, h * 0.85]].map((p) => p.map(Math.round));
      imgNat = { w, h };
      stageMode = 'corners'; cornerStep = 0;
      save(true); renderStageAll();
      toast('Rasm yuklandi. Endi sahnaning 4 burchagini belgilang.');
    } catch (err) { toast('Rasmni yuklab boʻlmadi: ' + err.message); }
  });
  $('#stClear').addEventListener('click', () => {
    if (!confirmSoft('Sahna rasmi olib tashlansinmi? Chiroqlar joyi saqlanadi.')) return;
    const s = ST(); s.img = null; s.corners = null; stageMode = 'aim'; save(); renderStageAll();
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
    ST().points.push({ n: n.slice(0, 24), x: +stageTarget.x.toFixed(2), y: +stageTarget.y.toFixed(2) });
    $('#ptName').value = ''; save(); renderStageSide(); toast(`„${n}“ saqlandi`);
  });
  $('#ptList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pt]'); if (!b) return;
    const q = ST().points[+b.dataset.pt];
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
    tab = t;
    $$('#tabs [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    $$('.tab').forEach((s) => { s.hidden = s.id !== 'tab-' + t; });
    if (t === 'patch') renderPatch();
    if (t === 'profil') renderProfiles();
    if (t === 'ulanish') renderConn();
    if (t === 'monitor') { $('#mon').innerHTML = ''; renderMonitor(); }
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
  function openPaywall() { pwOpen = true; $('#paywall').hidden = false; L().refreshConfig(); renderPaywall(); setTimeout(() => $('#codeInput').focus(), 50); }
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

  /* ================= Boshlash ================= */
  function renderAllPult() { renderGroups(); renderFixtures(); renderSel(); renderCues(); renderFaders(); }
  function renderAll() { $('#showTitle').value = show.title; document.title = show.title + ' — SAHNA NURI'; renderAllPult(); renderConn(); if (tab !== 'pult') setTab(tab); }
  renderAll();
  requestAnimationFrame(frame);
  SNDmx.autoConnect();
  if (L()) { L().onChange(updateLicenseUI); L().start(); }
  window.addEventListener('beforeunload', () => save(true));
  // Til almashganda hamma narsani qayta chizish (matnlar i18n.js orqali o'giriladi)
  if (window.SNI18N) {
    SNI18N.onChange(() => { renderAll(); if (L()) updateLicenseUI(); if (pwOpen) renderPaywall(); });
    SNI18N.applyHtml(); SNI18N.refresh();
  }
})();
