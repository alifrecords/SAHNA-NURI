// SAHNA NURI — DMX chiqishi (universal ulanish).
// Qo'llab-quvvatlanadi:
//   • uDMX (Anyma va klonlari)          — WebUSB, VID 0x16C0 / PID 0x05DC
//   • Enttec DMX USB Pro va mos klonlar — Web Serial, "label 6" paketi
//   • Enttec Open DMX / FTDI kabellar    — Web Serial, 250 000 bod, BREAK signali bilan
//   • Simulyatsiya                       — qurilmasiz, faqat ekranda
window.SNDmx = (() => {
  const universe = new Uint8Array(512);
  let driver = null;          // joriy drayver obyekti
  let status = { kind: 'none', label: 'Ulanmagan', ok: false, error: '' };
  let listeners = [];
  let dirty = true, lastSend = 0, loopTimer = null;
  const emit = () => listeners.forEach((f) => { try { f(status); } catch (_) {} });
  const setStatus = (s) => { status = { ...status, ...s }; emit(); };

  const support = {
    usb: 'usb' in navigator,
    serial: 'serial' in navigator,
  };

  /* ---------- uDMX (WebUSB) ---------- */
  const UDMX_FILTERS = [{ vendorId: 0x16c0, productId: 0x05dc }];
  function uDmxDriver(device) {
    let busy = false;
    return {
      kind: 'udmx',
      label: 'uDMX · ' + (device.productName || 'USB'),
      async open() {
        await device.open();
        if (device.configuration === null) await device.selectConfiguration(1);
        try { await device.claimInterface(0); } catch (_) { /* ba'zi tizimlarda shart emas */ }
      },
      async send(buf) {
        if (busy) return false;
        busy = true;
        try {
          // cmd_SetChannelRange = 2: value = kanallar soni, index = boshlang'ich kanal (0 dan)
          const r = await device.controlTransferOut({ requestType: 'vendor', recipient: 'device', request: 2, value: 512, index: 0 }, buf);
          if (r.status !== 'ok') throw new Error('uDMX javobi: ' + r.status);
          return true;
        } finally { busy = false; }
      },
      refreshMs: 1000,   // uDMX oxirgi qiymatni o'zi ushlab turadi, faqat o'zgarganda yuboramiz
      async close() { try { await device.close(); } catch (_) {} },
      device,
    };
  }

  /* ---------- Enttec Pro (Web Serial) ---------- */
  function enttecProDriver(port) {
    let writer = null, busy = false;
    const pkt = new Uint8Array(5 + 513);
    return {
      kind: 'pro',
      label: 'Enttec DMX USB Pro',
      async open() {
        await port.open({ baudRate: 57600 });
        writer = port.writable.getWriter();
      },
      async send(buf) {
        if (busy) return false;
        busy = true;
        try {
          const n = 513;
          pkt[0] = 0x7e; pkt[1] = 6; pkt[2] = n & 0xff; pkt[3] = n >> 8; pkt[4] = 0; // start code
          pkt.set(buf, 5); pkt[5 + 512] = 0xe7;
          await writer.write(pkt);
          return true;
        } finally { busy = false; }
      },
      refreshMs: 1000,
      async close() { try { writer && writer.releaseLock(); await port.close(); } catch (_) {} },
    };
  }

  /* ---------- Open DMX / FTDI (Web Serial, kompyuter signal vaqtini boshqaradi) ---------- */
  function openDmxDriver(port) {
    let writer = null, busy = false;
    const frame = new Uint8Array(513);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    return {
      kind: 'open',
      label: 'Open DMX (FTDI)',
      async open() {
        await port.open({ baudRate: 250000, dataBits: 8, stopBits: 2, parity: 'none', flowControl: 'none' });
        writer = port.writable.getWriter();
      },
      async send(buf) {
        if (busy) return false;
        busy = true;
        try {
          frame[0] = 0; frame.set(buf, 1);
          await port.setSignals({ break: true });
          await wait(1);
          await port.setSignals({ break: false });
          await writer.write(frame);
          return true;
        } finally { busy = false; }
      },
      refreshMs: 30,     // Open DMX doimiy yangilanib turishi kerak
      async close() { try { writer && writer.releaseLock(); await port.close(); } catch (_) {} },
    };
  }

  function simDriver() {
    return { kind: 'sim', label: 'Simulyatsiya (qurilmasiz)', async open() {}, async send() { return true; }, refreshMs: 1000, async close() {} };
  }

  async function attach(d) {
    await disconnect(true);
    try {
      await d.open();
      driver = d;
      setStatus({ kind: d.kind, label: d.label, ok: true, error: '' });
      dirty = true;
      startLoop();
      return true;
    } catch (e) {
      try { await d.close(); } catch (_) {}
      setStatus({ kind: 'none', label: 'Ulanmagan', ok: false, error: explain(e, d.kind) });
      return false;
    }
  }

  function explain(e, kind) {
    const m = String((e && e.message) || e);
    if (/Access denied|SecurityError|Unable to claim|claimInterface|Failed to open/i.test(m) && kind === 'udmx')
      return "uDMX ochilmadi. Windows'da qurilma drayveri WinUSB bo'lishi kerak (Zadig dasturi bilan almashtiriladi). FreeStyler ochiq bo'lsa, uni yoping.";
    if (/already open|InvalidStateError/i.test(m)) return 'Port band: boshqa dastur (FreeStyler) ishlatyapti. Uni yopib qayta urining.';
    if (/No device selected|NotFoundError/i.test(m)) return 'Qurilma tanlanmadi.';
    return m;
  }

  async function connectUDmx() {
    if (!support.usb) return setStatus({ error: "Bu brauzer USB'ni qo'llamaydi. Kompyuterda Chrome yoki Edge'dan oching." }), false;
    let dev;
    try { dev = await navigator.usb.requestDevice({ filters: UDMX_FILTERS }); }
    catch (e) { setStatus({ error: explain(e, 'udmx') }); return false; }
    return attach(uDmxDriver(dev));
  }
  async function connectSerial(kind) {
    if (!support.serial) return setStatus({ error: "Bu brauzer Serial portni qo'llamaydi. Kompyuterda Chrome yoki Edge'dan oching." }), false;
    let port;
    try { port = await navigator.serial.requestPort({}); }
    catch (e) { setStatus({ error: explain(e, kind) }); return false; }
    return attach(kind === 'pro' ? enttecProDriver(port) : openDmxDriver(port));
  }
  const connectSim = () => attach(simDriver());

  // Avval ruxsat berilgan uDMX bo'lsa, sahifa ochilganda o'zi ulanadi
  async function autoConnect() {
    try {
      if (support.usb) {
        const list = await navigator.usb.getDevices();
        const d = list.find((x) => x.vendorId === 0x16c0 && x.productId === 0x05dc);
        if (d) return attach(uDmxDriver(d));
      }
    } catch (_) {}
    return false;
  }

  async function disconnect(silent) {
    stopLoop();
    if (driver) { const d = driver; driver = null; await d.close(); }
    if (!silent) setStatus({ kind: 'none', label: 'Ulanmagan', ok: false, error: '' });
  }

  function startLoop() {
    stopLoop();
    const tick = async () => {
      if (!driver) return;
      const now = performance.now();
      if (dirty || now - lastSend >= driver.refreshMs) {
        dirty = false;
        try { await driver.send(universe); lastSend = now; }
        catch (e) {
          const msg = explain(e, driver && driver.kind);
          await disconnect(true);
          setStatus({ kind: 'none', label: 'Uzildi', ok: false, error: 'Qurilma bilan aloqa uzildi: ' + msg });
          return;
        }
      }
      loopTimer = setTimeout(tick, driver && driver.kind === 'open' ? 25 : 22);
    };
    tick();
  }
  function stopLoop() { clearTimeout(loopTimer); loopTimer = null; }

  if (support.usb) {
    navigator.usb.addEventListener('disconnect', (e) => {
      if (driver && driver.device === e.device) { driver = null; stopLoop(); setStatus({ kind: 'none', label: 'Uzildi', ok: false, error: 'uDMX kabeli chiqarib olindi.' }); }
    });
    navigator.usb.addEventListener('connect', (e) => {
      if (!driver && e.device.vendorId === 0x16c0 && e.device.productId === 0x05dc) attach(uDmxDriver(e.device));
    });
  }

  // 512 kanalni yangilash (faqat o'zgargan bo'lsa yuboriladi)
  function write(buf) {
    for (let i = 0; i < 512; i++) {
      if (universe[i] !== buf[i]) { universe.set(buf); dirty = true; return; }
    }
  }

  return {
    universe, support, write, connectUDmx, connectSerial, connectSim, autoConnect, disconnect,
    status: () => status, onStatus: (f) => listeners.push(f),
  };
})();
