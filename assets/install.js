// SAHNA NURI — kompyuter yoki telefonga ilova (PWA) sifatida o'rnatish.
// Chrome/Edge/Android: brauzerning o'z "O'rnatish" oynasi ochiladi.
// iPhone/iPad (Safari) va boshqalar: qadamma-qadam ko'rsatma oynasi.
(() => {
  const btn = document.getElementById('installBtn');
  const modal = document.getElementById('installModal');
  const nowBtn = document.getElementById('instNow');
  if (!btn || !modal) return;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const os = isIOS ? 'ios' : isAndroid ? 'android' : 'pc';

  let deferred = null;

  function refresh() {
    btn.hidden = isStandalone();
    btn.classList.toggle('ready', !!deferred);
    if (nowBtn) nowBtn.hidden = !deferred;
  }

  function open() {
    modal.dataset.os = os; // til almashsa ham saqlanadi (karta HTML qayta chiziladi)
    refresh();
    modal.hidden = false;
  }
  function close() { modal.hidden = true; }

  async function promptInstall() {
    if (!deferred) return false;
    const ev = deferred;
    deferred = null;
    ev.prompt();
    try { await ev.userChoice; } catch (_) {}
    refresh();
    return true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    close();
    btn.hidden = true;
  });

  btn.addEventListener('click', async () => {
    if (!(await promptInstall())) open();
  });
  if (nowBtn) nowBtn.addEventListener('click', async () => { if (await promptInstall()) close(); });
  document.getElementById('instClose')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  // Oyna ochiq paytda pult tugmalari (Probel — GO, Esc — Release) ishlamasin
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  }, true);

  refresh();
})();
