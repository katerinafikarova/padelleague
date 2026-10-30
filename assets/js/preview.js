/* Náhled stránky na počítači i na mobilu.
   Široká obrazovka: dole přepínač „Počítač / Mobil“. V režimu Mobil se stránka ukáže v iPhonu:
   obrazovka má vždy 390 × 844 px jako skutečný telefon a celý telefon se jen zmenší, aby se vešel do okna.
   Úzká obrazovka (telefon): vpravo záložka „PC“, která ukáže verzi pro počítač zmenšenou na šířku displeje.
   Volba na počítači se pamatuje, odkaz ?mode=mobile nebo ?mode=desktop ji vynutí.
   Stránky, které mají vlastní přepínač (aplikace, Instagram profil), načítají skript s data-pv-wide="off".
   Telefon aplikace (.device) má taky pevnou obrazovku 390 × 844 px a zmenšuje se celý. */
(function () {
  var q = new URLSearchParams(location.search);
  var embedded = q.has('embed') || window.self !== window.top;
  if (embedded) {
    /* Uvnitř náhledu se stránka chová jako na telefonu: žádný posuvník, žádné posouvání do strany */
    var es = document.createElement('style');
    es.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}html,body{overflow-x:clip}';
    document.head.appendChild(es);
    return;
  }
  var me = document.currentScript, wideOff = me && me.getAttribute('data-pv-wide') === 'off';
  var KEY = 'pl-preview-mode', mode = 'desktop', narrowDesk = false;
  try { mode = q.get('mode') === 'mobile' || q.get('mode') === 'desktop' ? q.get('mode') : (localStorage.getItem(KEY) || 'desktop'); } catch (e) { /* bez úložiště */ }
  function narrow() { return window.innerWidth <= 820; }
  var PW = 390, PH = 844, BEZ = 12;

  var css = document.createElement('style');
  css.textContent =
    '.pv-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:10px;padding:6px 6px 6px 16px;border-radius:99px;background:rgba(2,47,68,.94);color:#D7E4EB;font:600 13px/1.2 Satoshi,system-ui,sans-serif;box-shadow:0 14px 34px -12px rgba(0,0,0,.55);backdrop-filter:blur(8px)}' +
    '.pv-bar button{font:inherit;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:transparent;color:#D7E4EB;padding:10px 14px;min-height:40px;border-radius:99px}' +
    '.pv-bar button.on{background:#fff;color:#034867;border-color:#fff;font-weight:700}' +
    '.pv-stage{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:20px 20px 84px;background:#022F44;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px}' +
    '.pv-fit{position:relative;flex:none}' +
    '.pv-phone{position:absolute;left:0;top:0;width:' + (PW + 2 * BEZ) + 'px;height:' + (PH + 2 * BEZ) + 'px;transform-origin:0 0;border-radius:62px;padding:' + BEZ + 'px;background:#0A1C26;box-shadow:0 40px 80px -30px rgba(0,0,0,.7),inset 0 0 0 2px #1D3442}' +
    '.pv-screen{position:relative;width:' + PW + 'px;height:' + PH + 'px;border-radius:50px;overflow:hidden;background:#fff;display:flex;flex-direction:column}' +
    '.pv-sb{flex:none;height:50px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0 34px;font:600 16px/1 -apple-system,Satoshi,system-ui,sans-serif;color:#0B2A3A;background:#fff;position:relative}' +
    '.pv-sb .isl{position:absolute;left:50%;top:11px;transform:translateX(-50%);width:120px;height:34px;border-radius:20px;background:#000}' +
    '.pv-sb .sig{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:700}' +
    '.pv-screen iframe{flex:1;width:' + PW + 'px;border:0;display:block;background:#fff}' +
    '.pv-home{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;background:rgba(11,42,58,.35);pointer-events:none}' +
    '.pv-desk{position:fixed;inset:0;z-index:2147482000;background:#022F44;overflow:hidden}' +
    '.pv-desk iframe{border:0;display:block;transform-origin:0 0;background:#fff}' +
    '.pv-tab{position:fixed;right:0;top:56%;z-index:2147483000;writing-mode:vertical-rl;transform:rotate(180deg);background:#034867;color:#fff;font:800 12px/1 Satoshi,system-ui,sans-serif;letter-spacing:.06em;padding:12px 10px;min-width:40px;border-radius:0 12px 12px 0;border:0;box-shadow:0 8px 20px -8px rgba(0,0,0,.5);cursor:pointer}' +
    '.pv-bar[hidden],.pv-tab[hidden],.pv-stage[hidden],.pv-desk[hidden]{display:none!important}' +
    'html.pv-lock,html.pv-lock body{overflow:hidden!important}';
  document.head.appendChild(css);

  function frameUrl(m) {
    var u = new URL(location.href);
    u.searchParams.delete('mode'); u.searchParams.set('embed', '1');
    if (m) u.searchParams.set('mode', m);
    return u.pathname + u.search + u.hash;
  }
  function clock() { var d = new Date(); return d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }

  /* Široká obrazovka: iPhone v okně, pevná obrazovka 390 × 844, zmenšuje se celý */
  var stage = null, bar = null;
  function fitPhone() {
    if (!stage || stage.hidden) return;
    var W = PW + 2 * BEZ, H = PH + 2 * BEZ, k = Math.min(1, (window.innerHeight - 104) / H, (window.innerWidth - 40) / W);
    var fit = stage.querySelector('.pv-fit'); fit.style.width = Math.round(W * k) + 'px'; fit.style.height = Math.round(H * k) + 'px';
    stage.querySelector('.pv-phone').style.transform = 'scale(' + k + ')';
  }
  function applyWide() {
    var mob = mode === 'mobile';
    document.documentElement.classList.toggle('pv-lock', mob);
    if (mob && !stage) {
      stage = document.createElement('div'); stage.className = 'pv-stage';
      stage.innerHTML = '<div class="pv-fit"><div class="pv-phone"><div class="pv-screen"><div class="pv-sb"><span>' + clock() + '</span><i class="isl"></i><span class="sig">●●● 5G</span></div><iframe title="Náhled na mobilu" src="' + frameUrl() + '"></iframe><i class="pv-home"></i></div></div></div>';
      document.body.appendChild(stage);
    }
    if (stage) stage.hidden = !mob;
    fitPhone();
    bar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.pv === mode); });
  }

  /* Úzká obrazovka: verze pro počítač zmenšená na šířku displeje */
  var desk = null, tab = null;
  function fitDesk() {
    if (!desk) return;
    var f = desk.querySelector('iframe'), k = window.innerWidth / 1280;
    f.style.width = '1280px'; f.style.height = Math.ceil(window.innerHeight / k) + 'px'; f.style.transform = 'scale(' + k + ')';
  }
  function applyNarrow() {
    document.documentElement.classList.toggle('pv-lock', narrowDesk);
    if (narrowDesk && !desk) {
      desk = document.createElement('div'); desk.className = 'pv-desk';
      desk.innerHTML = '<iframe title="Náhled na počítači" src="' + frameUrl('desktop') + '"></iframe>';
      document.body.appendChild(desk);
    }
    if (desk) { desk.hidden = !narrowDesk; fitDesk(); }
    tab.textContent = narrowDesk ? '📱 MOBIL' : '💻 PC';
    tab.setAttribute('aria-label', narrowDesk ? 'Zpět na mobilní zobrazení' : 'Zobrazit verzi pro počítač');
  }

  /* Telefon aplikace (index.html): pevná obrazovka 390 × 844, celý telefon se zmenší podle okna */
  function fitDevice() {
    var d = document.querySelector('.device');
    if (!d) return;
    if (narrow() || d.classList.contains('wide') || document.body.classList.contains('mode-desktop')) { d.style.zoom = ''; d.style.width = ''; d.style.height = ''; return; }
    var bar2 = document.querySelector('.modebar'), note = document.querySelector('.mode-note');
    var used = 48 + (bar2 && bar2.offsetParent ? bar2.offsetHeight + 12 : 0) + (note && !note.hidden && note.offsetParent ? note.offsetHeight + 12 : 0);
    var cs = getComputedStyle(d), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var k = Math.min(1, (window.innerHeight - used) / (PH + pad));
    d.style.width = (PW + pad) + 'px'; d.style.height = (PH + pad) + 'px'; d.style.aspectRatio = 'auto'; d.style.zoom = k;
  }

  function layout() {
    var n = narrow();
    if (bar) bar.hidden = n || wideOff;
    if (tab) tab.hidden = !n;
    if (n) {
      if (stage) stage.hidden = true;
      applyNarrow();
    } else {
      if (desk) desk.hidden = true;
      document.documentElement.classList.remove('pv-lock');
      if (!wideOff) applyWide();
    }
    fitDevice();
  }

  function start() {
    if (!wideOff) {
      bar = document.createElement('div');
      bar.className = 'pv-bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Zobrazení');
      bar.innerHTML = 'Zobrazení <button type="button" data-pv="desktop">💻 Počítač</button><button type="button" data-pv="mobile">📱 Mobil</button>';
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        mode = b.dataset.pv;
        try { localStorage.setItem(KEY, mode); } catch (err) { /* */ }
        if (mode === 'mobile' && stage) stage.querySelector('iframe').src = frameUrl();
        applyWide();
      });
      document.body.appendChild(bar);
    }
    tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'pv-tab';
    tab.addEventListener('click', function () { narrowDesk = !narrowDesk; applyNarrow(); });
    document.body.appendChild(tab);
    layout();
    window.addEventListener('resize', function () { layout(); fitDesk(); fitPhone(); });
    /* aplikace přepíná režim a třídy při každém vykreslení */
    new MutationObserver(fitDevice).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    var d = document.querySelector('.device'); if (d) new MutationObserver(fitDevice).observe(d, { attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
