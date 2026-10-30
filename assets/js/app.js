/* PadelLeague – klikací prototyp (vanilla JS, bez build kroku).
   Obrazovky = routy v URL hashi (#/p-event). Stav drží objekt S. Texty jsou v i18n.js (cs výchozí, en sekundární). */
(function () {
  'use strict';

  var IMG = 'assets/img/';
  var D = window.PL_TEXT;
  var NAMES = ['Tomáš Novák', 'Petr Svoboda', 'Lukáš Dvořák', 'Martin Černý', 'Tereza Hájková', 'Eliška Králová',
    'Anna Jelínková', 'Klára Růžičková', 'Ondřej Procházka', 'Lucie Benešová', 'Jan Kučera', 'Kateřina Veselá',
    'David Veselý', 'Petra Malá', 'Filip Horák', 'Veronika Zemanová', 'Michal Doležal', 'Barbora Pokorná', 'Jakub Marek'];
  var PAYS = ['paid', 'paid', 'paid', 'paid', 'unpaid', 'paid', 'site', 'paid', 'paid', 'paid', 'paid', 'unpaid', 'paid', 'paid', 'paid', 'site'];

  /* ---------- jazyk ---------- */
  var lang = 'cs';
  try { var q = new URLSearchParams(location.search).get('lang'); lang = q === 'en' || q === 'cs' ? q : (localStorage.getItem('pl-lang') || 'cs'); } catch (e) { /* bez úložiště */ }
  if (!D[lang]) lang = 'cs';
  function setLang(l) { lang = l; try { localStorage.setItem('pl-lang', l); } catch (e) { /* */ } document.documentElement.lang = l; render(); }
  function t(k, o) {
    var s = D[lang][k]; if (s === undefined) s = D.cs[k]; if (s === undefined) return k;
    if (o) Object.keys(o).forEach(function (x) { s = s.split('{' + x + '}').join(o[x]); });
    return glue(s);
  }
  function glue(s) { return String(s).replace(/(\d\.?) (?=[\dA-Za-zÀ-ž])/g, '$1\u00a0').replace(/ (\d)/g, function (m, d, i, str) { return /[A-Za-zÀ-ž]$/.test(str.slice(0, i)) ? '\u00a0' + d : m; }).replace(/ · /g, '\u00a0· ').replace(/([eE])-mail/g, '$1\u2011mail'); }
  function P(k, n) { var f = D[lang][k], i = lang === 'cs' ? (n === 1 ? 0 : (n >= 2 && n <= 4 ? 1 : 2)) : (n === 1 ? 0 : 1); return glue(f[i].split('{n}').join(n)); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- datum ---------- */
  function dm(w) { var d = 30 + 7 * w, m = 10; if (d > 31) { d -= 31; m = 11; } return { d: d, m: m }; }
  function fDate(w) { return nb(fDate0(w)); }
  function fDate0(w) { var x = dm(w); return lang === 'cs' ? t('day_short') + ' ' + x.d + '. ' + x.m + '.' : t('day_short') + ' ' + x.d + ' ' + (x.m === 10 ? 'Oct' : 'Nov'); }
  function fLong(w) { var x = dm(w); return lang === 'cs' ? t('day_long') + ' ' + x.d + '. ' + D.cs.months_long[x.m] : t('day_long') + ' ' + x.d + ' ' + D.en.months_long[x.m]; }
  function fClose(w) { var x = dm(w), d = x.d - 1, m = x.m; if (d < 1) { d = 31; m = 10; } return lang === 'cs' ? t('day_close') + ' ' + d + '. ' + m + '., 18:00' : t('day_close') + ' ' + d + ' ' + (m === 10 ? 'Oct' : 'Nov') + ', 18:00'; }
  function fCard(w) { var x = dm(w); return lang === 'cs' ? x.d + '. ' + x.m + '. 2026' : x.d + ' ' + (x.m === 10 ? 'Oct' : 'Nov') + ' 2026'; }

  /* ---------- stav ---------- */
  var S;
  function fresh() {
    return {
      ev: { custom: null, format: 'Americano', week: 0, start: '18:00', venue: 'Padel Klub Novosedlice', address: 'Trnovanská 123, Teplice',
        courts: 4, cap: 16, price: 200, slug: 'patecni-americano', photo: 'court-orange-close.jpg', pay: 'card', type: 'social' },
      players: mkPlayers(9), waitlist: [],
      me: { name: 'Jana Malá', contact: 'jana.mala@example.com', status: null },
      method: 'apple', stripe: 'active', orgName: 'Jakub', cfg: { courts: 4, mode: 'free', rounds: 4, pts: 24 }, hasComm: false, account: false, orgMode: false, wz: 0, pendingPub: false, stripeBack: 'o-new', community: 'Jakubova komunita', city: 'Teplice',
      draft: null, more: false, acc: false, allNames: false, shuffle: 0,
      sched: null, play: { round: 0, scores: [] }, last: null,
      sheet: null, ctx: 'player', pick: 'pa', hf: { city: 'all', when: 'all', free: false }, scoreTarget: null, toast: null, stripeStep: 0, posted: false
    };
  }
  function mkPlayers(n) { var a = []; for (var i = 0; i < n; i++) a.push({ n: NAMES[i], pay: PAYS[i % PAYS.length], noshow: false }); return a; }
  S = fresh();

  /* ---------- pomocné ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function short(n) { var p = n.split(' '); return p[0] + (p[1] && p[1][0] !== '(' ? ' ' + p[1][0] + '.' : ''); }
  function kc(n) { return n === 0 ? t('free') : n.toLocaleString('cs-CZ').replace(/\s/g, '\u00a0') + '\u00a0Kč'; }
  function nb(s) { return String(s).replace(/(\d\.?) (?=[\dA-Za-zÁ-ž])/g, '$1\u00a0').replace(/ (\d)/g, '\u00a0$1'); }
  function evName() { return S.ev.nm ? S.ev.nm[lang] : S.ev.custom || t('evName', { f: S.ev.format }); }
  function evDate() { return S.ev.when ? wShort(S.ev.when) : fDate(S.ev.week); }
  function wShort(w) { return nb(D[lang].dows_short[w.dow] + ' ' + (lang === 'cs' ? w.d + '. ' + w.m + '.' : w.d + ' ' + (w.m === 10 ? 'Oct' : 'Nov'))); }
  function wLong(w) { return D[lang].dows_long[w.dow] + ' ' + (lang === 'cs' ? w.d + '. ' : w.d + ' ') + D[lang].months_long[w.m]; }
  function wPrev(w) { return w.d > 1 ? { d: w.d - 1, m: w.m, dow: (w.dow + 6) % 7 } : { d: 31, m: 10, dow: (w.dow + 6) % 7 }; }
  function endTime() { var p = S.ev.start.split(':'); return ('0' + ((+p[0] + 2) % 24)).slice(-2) + ':' + p[1]; }
  function evLong() { return S.ev.when ? wLong(S.ev.when) : fLong(S.ev.week); }
  function evClose() { if (S.ev.deadline === 'none') return t('dl_none_txt'); return S.ev.when ? wShort(wPrev(S.ev.when)) + (lang === 'cs' ? ', 18:00' : ', 6 pm') : fClose(S.ev.week); }
  function present(p) { return !p.noshow; }
  function going() { return S.players.length + (S.me.status === 'in' ? 1 : 0); }
  function left() { return Math.max(0, S.ev.cap - going()); }
  function evState() {
    if (S.me.status === 'in') return 'in';
    if (S.me.status === 'wait') return 'wait';
    var l = left(); if (l === 0) return 'full'; if (l <= 2) return 'last'; return 'open';
  }
  function pct() { return Math.round(going() / S.ev.cap * 100); }
  function status(time) { return '<div class="status"><span>' + (time || '18:42') + '</span><span>●●● 5G</span></div>'; }
  function top(l, title, r) { return '<div class="top">' + (l || '<span class="ib ghost"></span>') + '<div class="ttl">' + (title || '') + '</div>' + (r || '<span class="ib ghost"></span>') + '</div>'; }
  function ib(sym, attrs, label) { return '<button class="ib" ' + attrs + ' aria-label="' + t(label) + '">' + sym + '</button>'; }
  var LOGO = '<span class="logo svg" aria-label="PadelLeague">' + (window.PL_LOGO ? window.PL_LOGO.full : 'Padel League') + '</span>';
  var WA_IC = '<svg class="wa-ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>';
  function glassKV(pairs) { return pairs.map(function (p) { return '<div class="kv' + (p[2] ? ' full' : '') + '"><div class="l">' + p[0] + '</div><div class="v">' + esc(p[1]) + '</div></div>'; }).join(''); }
  function screen(cls, inner) { return '<div class="screen ' + (cls || '') + '">' + inner + '</div>'; }
  function go(r) { if (location.hash === '#/' + r) render(); else location.hash = '/' + r; }
  function toast(m) { S.toast = m; render(); clearTimeout(toast.h); toast.h = setTimeout(function () { S.toast = null; render(); }, 2600); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function chatMsg() { return t('chat_msg', { format: S.ev.format, date: evDate(), start: S.ev.start, venue: S.ev.venue, cap: S.ev.cap, price: kc(S.ev.price) }); }

  var R = {};

  /* ---------- START ---------- */
  R.start = function () {
    function row(go, k, ext) { return (ext ? '<a class="row start-row" href="' + go + '" style="text-decoration:none">' : '<button class="row start-row" data-go="' + go + '">') + '<span><b>' + t(k) + '</b><span class="sub">' + t(k + '_sub') + '</span></span><span class="r">' + (ext ? '↗' : '→') + '</span>' + (ext ? '</a>' : '</button>'); }
    return screen('', status() +
      '<div class="scroll" style="padding-top:26px;gap:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' + LOGO + langSwitch() + '</div>' +
      '<h1 class="h-caps" style="color:var(--navy)">' + t('start_title') + '</h1>' +
      '<p class="p muted">' + t('start_sub') + '</p>' +
      row('landing.html?lang=' + lang, 'start_land', 1) + row('o-new', 'start_org') + row('p-home', 'start_player') + row('p-chat', 'start_wa') + row('instagram/index.html', 'start_ig', 1) +
      '</div>');
  };
  function langSwitch() {
    return '<span class="lang-sw" role="group" aria-label="' + t('lang_label') + '"><button class="' + (lang === 'cs' ? 'on' : '') + '" data-act="lang" data-arg="cs">CZ</button><button class="' + (lang === 'en' ? 'on' : '') + '" data-act="lang" data-arg="en">EN</button></span>';
  }

  /* ---------- HRÁČ ---------- */

  /* ---------- HRÁČ: homepage s výběrem turnajů ---------- */
  var HE = [
    { id: 'pa', nm: null, format: 'Americano', when: null, start: '18:00', venue: 'Padel Klub Novosedlice', city: 'Teplice', address: 'Trnovanská 123, Teplice', price: 200, cap: 16, n: 9, vibe: 'social', level: 'all', photo: 'court-orange-close.jpg', slug: 'patecni-americano', org: null },
    { id: 'mx', nm: { cs: 'Sobotní Mexicano', en: 'Saturday Mexicano' }, format: 'Mexicano', when: { d: 31, m: 10, dow: 5 }, start: '10:00', venue: 'Padel Písečná', city: 'Teplice', address: 'Písečná 5, Teplice', price: 250, cap: 16, n: 14, vibe: 'comp', level: 'mid', photo: 'court-serve.jpg', slug: 'sobotni-mexicano', org: 'Padel Písečná' },
    { id: 'ho', nm: { cs: 'Holky na kurt', en: 'Girls on court' }, format: 'Americano', when: { d: 1, m: 11, dow: 6 }, start: '17:00', venue: 'Padel Arena Ústí', city: 'Ústí n. L.', address: 'Masarykova 40, Ústí nad Labem', price: 0, cap: 12, n: 6, vibe: 'social', level: 'beg', photo: 'court-reach.jpg', slug: 'holky-na-kurt', org: 'Padel Holky Ústí' },
    { id: 'tm', nm: { cs: 'Středeční liga', en: 'Wednesday league' }, format: 'Round Robin', when: { d: 4, m: 11, dow: 2 }, start: '19:00', venue: 'Padel Klub Novosedlice', city: 'Teplice', address: 'Trnovanská 123, Teplice', price: 300, cap: 16, n: 16, vibe: 'comp', level: 'adv', photo: 'court-dark-run.jpg', slug: 'stredecni-liga', org: 'Jakubova komunita' },
    { id: 'ra', nm: { cs: 'Ranní Americano', en: 'Morning Americano' }, format: 'Americano', when: { d: 5, m: 11, dow: 3 }, start: '07:00', venue: 'Padel Club Hostivař', city: 'Praha', address: 'Švehlova 32, Praha 10', price: 180, cap: 8, n: 4, vibe: 'social', level: 'all', photo: 'court-blur-run.jpg', slug: 'ranni-americano', org: 'Ranní padel Praha' },
    { id: 'pl', nm: { cs: 'Pardubická liga · 3. kolo', en: 'Pardubice league · round 3' }, format: 'Round Robin', when: { d: 7, m: 11, dow: 5 }, start: '09:00', venue: 'Padel Park Pardubice', city: 'Pardubice', address: 'Hlaváčova 12, Pardubice', price: 350, cap: 16, n: 10, vibe: 'comp', level: 'mid', photo: 'court-blue-orange.jpg', slug: 'pardubicka-liga', org: 'Padel liga Pardubice' }
  ];
  var HE_PAST = [
    { nm: 'Mixy Americano', when: { d: 23, m: 10, dow: 4 }, win: 'Tereza H. & Ondřej P.' },
    { nm: 'Libiks Americano', when: { d: 6, m: 10, dow: 1 }, win: 'Lukáš D. & Klára R.' }
  ];
  var CITIES = ['Teplice', 'Ústí n. L.', 'Praha', 'Pardubice'];
  function heWhen(e) { return e.when || { d: dm(S.ev.week).d, m: dm(S.ev.week).m, dow: 4 }; }
  function heGoing(e) { return e.id === S.pick ? going() : e.n; }
  function heShow(e) {
    var f = S.hf, w = heWhen(e), day = w.m === 10 ? w.d : 31 + w.d;
    if (f.city !== 'all' && e.city !== f.city) return false;
    if (f.when === 'week' && day > 32) return false;
    if (f.when === 'wkend' && w.dow < 5) return false;
    if (f.free && (e.id === S.pick ? S.ev.price : e.price) > 0) return false;
    return true;
  }
  function heCard(e) {
    var cur = e.id === S.pick, n = heGoing(e), cap = cur ? S.ev.cap : e.cap, l = Math.max(0, cap - n), price = cur ? S.ev.price : e.price;
    var nm = cur ? evName() : (e.nm ? e.nm[lang] : t('evName', { f: e.format }));
    var mine = cur && S.me.status === 'in';
    var foot = mine ? '<span class="hc-st ok">' + t('b_in') + '</span>' : l === 0 ? '<span class="hc-st">' + t('h_full') + '</span>' : '<span class="hc-st' + (l <= 2 ? ' hot' : '') + '">' + n + '/' + cap + '\u00a0· ' + P('spotsLeft', l) + '</span>';
    return '<button class="hcard" data-act="pick" data-arg="' + e.id + '"><div class="hc-img"><img src="' + IMG + e.photo + '" alt="" loading="lazy"><span class="pill glassy">' + t('v_' + e.vibe) + '</span><span class="hc-price">' + kc(price) + '</span></div>' +
      '<div class="hc-b"><div class="hc-date">' + cap1(wShort(heWhen(e))) + '\u00a0· ' + (cur ? S.ev.start : e.start) + '</div><b class="hc-t">' + esc(nm) + '</b><div class="hc-m">' + esc(cur ? S.ev.venue : e.venue) + '\u00a0· ' + esc(e.city) + '</div>' +
      '<div class="hc-tags"><span>' + esc(e.format) + '</span><span>' + t('lv_' + e.level) + '</span></div>' +
      '<div class="hc-cap"><i style="width:' + Math.round(n / cap * 100) + '%"></i></div>' +
      '<div class="hc-f">' + foot + '<span class="hc-go">' + t(mine ? 'h_detail' : l === 0 ? 'h_go_wait' : 'h_go') + ' ›</span></div></div></button>';
  }
  function hChip(k, v, label) { var on = S.hf[k] === v; return '<button class="hchip' + (on ? ' on' : '') + '" data-act="hf" data-arg="' + k + ':' + v + '" aria-pressed="' + on + '">' + label + '</button>'; }
  R['p-home'] = function () {
    var list = HE.filter(heShow);
    list.sort(function (a, b) { var x = heWhen(a), y = heWhen(b); return (x.m * 40 + x.d) - (y.m * 40 + y.d); });
    var f = S.hf, filtered = f.city !== 'all' || f.when !== 'all' || f.free;
    return screen('', status() + top(LOGO, '', ib('☰', 'data-act="sheet" data-arg="pmenu"', 'menu')) +
      '<div class="scroll">' +
      '<div class="h-hero"><h1 class="h-caps">' + t('h_title') + '</h1><p class="p muted">' + t('h_sub') + '</p></div>' +
      '<div class="h-filters"><div class="hchips" role="group" aria-label="' + t('h_city') + '">' + hChip('city', 'all', t('h_all')) + CITIES.map(function (c) { return hChip('city', c, c); }).join('') + '</div>' +
      '<div class="hchips" role="group" aria-label="' + t('h_when') + '">' + hChip('when', 'all', t('h_any')) + hChip('when', 'week', t('h_week')) + hChip('when', 'wkend', t('h_wkend')) +
      '<button class="hchip' + (f.free ? ' on' : '') + '" data-act="hf" data-arg="free:1" aria-pressed="' + f.free + '">' + t('h_free') + '</button></div></div>' +
      '<div class="h-sec"><div class="lbl">' + t('h_upcoming') + '\u00a0· ' + P('h_count', list.length) + '</div>' + (filtered ? '<button class="link" data-act="hf" data-arg="reset">' + t('h_reset') + '</button>' : '') + '</div>' +
      (list.length ? '<div class="hgrid">' + list.map(heCard).join('') + '</div>' : '<div class="empty"><p>' + t('h_none') + '</p><button class="link" data-act="hf" data-arg="reset">' + t('h_reset') + '</button></div>') +
      '<div class="acc' + (S.pastOpen ? ' open' : '') + '"><button data-act="pastOpen"><span>' + t('h_past') + '</span><span class="chev">▾</span></button><div class="inner">' +
      HE_PAST.map(function (p) { return '<button class="row" data-act="toast" data-arg="h_res_t"><span><b>' + esc(p.nm) + '</b><span class="sub">' + cap1(wShort(p.when)) + '\u00a0· ' + t('h_won', { w: esc(p.win) }) + '</span></span><span class="r">' + t('h_res') + ' ▸</span></button>'; }).join('') + '</div></div>' +
      '<button class="row h-org" data-go="o-new"><span><b>' + t('h_org') + '</b><span class="sub">' + t('h_org_sub') + '</span></span><span class="r">→</span></button>' +
      '</div>');
  };

  /* Náhled odkazu ve WhatsAppu = Open Graph eventu: obrázek 1200 × 630 (fotka, název, termín, obsazenost, logo), titulek, popis, doména */
  function ogImage() {
    var l = left();
    return '<div class="og-img"><img src="' + IMG + S.ev.photo + '" alt=""><span class="og-logo">' + (window.PL_LOGO ? window.PL_LOGO.full : '') + '</span>' +
      '<div class="og-txt"><b>' + esc(evName()) + '</b><span>' + evDate() + '\u00a0· ' + S.ev.start + '\u00a0· ' + esc(S.ev.venue) + '</span></div>' +
      '<span class="og-pill' + (l <= 2 ? ' hot' : '') + '">' + (l ? t('og_left', { n: going(), cap: S.ev.cap, left: P('spotsLeft', l) }) : t('og_full')) + '</span></div>';
  }
  R['p-chat'] = function () {
    return screen('wa', status('18:40') +
      '<div class="top">' + ib('←', 'data-go="start"', 'back') + '<div class="ttl wa-ttl">Padel Teplice 🎾<br><span>' + t('chat_members') + '</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px">' +
      '<div class="sysmsg">' + t('today') + '</div>' +
      '<div class="bubble in og-bubble"><div class="who">' + t('chat_org') + '</div>' +
      '<button class="og" data-go="p-event" aria-label="' + esc(evName()) + '">' + ogImage() +
      '<span class="og-meta"><b>' + t('og_title', { name: esc(evName()), date: evDate(), start: S.ev.start }) + '</b><span>' + t('og_desc', { n: going(), cap: S.ev.cap, price: kc(S.ev.price), venue: esc(S.ev.venue) }) + '</span><em>padelleague.eu</em></span></button>' +
      esc(chatMsg()) + '<br><button class="wa-link" data-go="p-event">padelleague.eu/e/' + S.ev.slug + '</button><div class="time">18:31</div></div>' +
      '<div class="bubble in"><div class="who">Klára</div>' + t('chat_r1') + '<div class="time">18:35</div></div>' +
      '<div class="bubble in"><div class="who">Tomáš</div>' + t('chat_r2') + '<div class="time">18:38</div></div>' +
      '<p class="fine" style="margin-top:auto">' + t('chat_hint') + '</p>' +
      '</div>');
  };


  function namesBlock() {
    var list = S.players.map(function (p) { return p.n; });
    if (S.me.status === 'in') list.unshift(S.me.name);
    var show = S.allNames ? list : list.slice(0, 8);
    var chips = show.map(function (n) { return '<span class="chip' + (n === S.me.name && S.me.status === 'in' ? ' me' : '') + '">' + esc(short(n)) + '</span>'; }).join('');
    if (!S.allNames && list.length > 8) chips += '<button class="chip" data-act="allNames">' + t('more_names', { n: list.length - 8 }) + '</button>';
    return '<div class="names">' + chips + '</div>';
  }

  R['p-event'] = function () {
    var st = evState(), l = left(), n = going();
    var badge = { open: '<span class="pill glassy">' + t('b_open') + '</span>', last: '<span class="pill glassy"><b>' + t('b_last', { n: l }) + '</b></span>', full: '<span class="pill glassy">' + t('b_full') + '</span>',
      'in': '<span class="pill ok">' + t('b_in') + '</span>', wait: '<span class="pill wait">' + t('b_wait', { n: S.waitlist.indexOf(S.me.name) + 1 }) + '</span>' }[st];
    var who = S.players.slice(0, 5).map(function (p) { return '<span class="av">' + initials(p.n) + '</span>'; }).join('') + (n > 5 ? '<span class="av">+' + (n - 5) + '</span>' : '');
    var line = (st === 'full' || st === 'wait') ? t('full_waiting', { w: S.waitlist.length }) : t('going', { n: n }) + '\u00a0· ' + P('spotsLeft', l);
    var dock;
    if (st === 'open' || st === 'last') dock = '<button class="cta" data-act="sheet" data-arg="register">' + (!S.ev.price ? t('cta_free') : cardPay() ? t(st === 'last' ? 'cta_last' : 'cta_pay', { price: kc(S.ev.price) }) : t('cta_site', { price: kc(S.ev.price) })) + '</button>' + (S.ev.price && !cardPay() ? '<p class="fine">' + t('dock_site') + '</p>' : '');
    else if (st === 'full') dock = '<button class="cta navy" data-act="sheet" data-arg="waitlist">' + t('cta_wait') + '</button><p class="fine">' + t('wait_fine') + '</p>';
    else if (st === 'in') dock = '<button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="sheet" data-arg="cancel">' + t('cant_come') + '</button>';
    else dock = '<button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="leaveWait">' + t('leave_wait') + '</button>';
    return screen('', status() + top('<button class="logo svg" data-go="p-home" aria-label="' + t('all_events') + '">' + (window.PL_LOGO ? window.PL_LOGO.full : 'Padel League') + '</button>', '', ib('☰', 'data-act="sheet" data-arg="pmenu"', 'menu')) +
      '<div class="scroll">' +
      '<button class="back-all" data-go="p-home">← ' + t('all_events') + '</button>' +
      '<div class="photo grain ev-hero"><img src="' + IMG + S.ev.photo + '" alt=""><div class="badge">' + badge + '</div>' +
      '<div class="over-title">' + esc(evName()) + '</div><span class="spacer"></span>' +
      '<div class="glass">' + glassKV([[t('k_datetime'), evDate() + '\u00a0· ' + S.ev.start, 1], [t('k_entry'), kc(S.ev.price)], [t('k_format'), S.ev.format], [t('k_location'), S.ev.venue], [t('k_level'), S.ev.level && S.ev.level !== 'all' ? t('lv_' + S.ev.level) : t('all_levels')]]) + '</div></div>' +
      '<div class="going"><div class="ring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div><div><div class="t">' + line + '</div><div class="avatars">' + who + '</div></div></div>' +
      '<div class="acc acc-names' + (S.accNames ? ' open' : '') + '"><button data-act="accNames"><span>' + t('who_playing') + '</span><span class="chev">▾</span></button><div class="inner">' + namesBlock() + '</div></div>' +
      '<div class="acc' + (S.acc ? ' open' : '') + '"><button data-act="acc"><span>' + t('details') + '</span><span class="chev">▾</span></button><div class="inner"><dl class="dl">' +
      '<dt>' + t('d_org') + '</dt><dd>' + esc(S.ev.org || orgLabel()) + '</dd><dt>' + t('d_addr') + '</dt><dd>' + esc(S.ev.address) + '</dd><dt>' + t('d_time') + '</dt><dd>' + evLong() + ', ' + S.ev.start + '–' + endTime() + '</dd>' +
      '<dt>' + t('d_format') + '</dt><dd>' + t({ Mexicano: 'd_format_mx', 'Round Robin': 'd_format_rr' }[S.ev.format] || 'd_format_txt') + '</dd><dt>' + t('d_close') + '</dt><dd>' + evClose() + '</dd><dt>' + t('d_cancel') + '</dt><dd>' + t('d_cancel_txt') + '</dd></dl>' +
      '<button class="link" style="text-align:left" data-act="toast" data-arg="added_cal">' + t('add_cal') + '</button></div></div>' +
      '</div><div class="dock">' + dock + '</div>');
  };

  R['p-in'] = function () {
    var list = [S.me.name].concat(S.players.slice(-2).reverse().map(function (p) { return p.n; }));
    var n = going();
    return screen('', status() + top(ib('✕', 'data-go="p-event"', 'close')) +
      '<div class="scroll" style="gap:16px;padding-top:6px">' +
      '<div style="display:flex;align-items:center;gap:14px"><div class="check" aria-hidden="true">✓</div><h1 class="h-caps" style="color:var(--navy)">' + t('in_title', { name: esc(S.me.name.split(' ')[0]) }) + '</h1></div>' +
      '<div class="photo grain" style="min-height:230px"><img src="' + IMG + S.ev.photo + '" alt=""><div class="glass">' + glassKV([[t('k_event'), evName()], cardPay() || !S.ev.price ? [t('k_paid'), kc(S.ev.price)] : [t('k_pay'), t('pay_onsite_v', { price: kc(S.ev.price) }), 1], [t('k_when'), evDate() + '\u00a0· ' + S.ev.start + '\u00a0· ' + S.ev.venue, 1]]) + '</div></div>' +
      '<div><div class="lbl" style="margin-bottom:8px">' + t('who_count', { n: n, cap: S.ev.cap }) + '</div><div style="display:flex;flex-direction:column;gap:6px">' +
      list.map(function (nm, i) { return '<div class="ln' + (i === 0 ? ' me' : '') + '"><span>' + (n - i) + '\u00a0· ' + esc(nm) + '</span><span>' + (i === 0 ? t('you') : '') + '</span></div>'; }).join('') + '</div></div>' +
      '<p class="p muted" style="font-size:14.5px">' + t('in_note') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="toast" data-arg="added_cal">' + t('add_cal') + '</button></div>');
  };

  /* Připomínka den předem chodí e-mailem. PadelLeague do WhatsAppu nic neposílá. */
  R['p-reminder'] = function () {
    var inn = S.me.status === 'in', l = left();
    return screen('mail', status('17:00') +
      '<div class="top">' + ib('←', 'data-go="p-event"', 'back') + '<div class="ttl">' + t('mail_inbox') + '</div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:8px;gap:12px">' +
      (inn ? '<div class="mail-h"><span class="av" style="margin:0">PL</span><div><b>PadelLeague</b><small>' + t('mail_to', { mail: esc(S.me.contact) }) + '\u00a0· ' + t('thursday') + ' 17:00</small></div></div>' +
        '<h1 class="h-mid" style="font-size:22px">' + t('mail_subj', { name: esc(evName()) }) + '</h1>' +
        '<div class="photo grain" style="min-height:180px"><img src="' + IMG + S.ev.photo + '" alt=""><div class="glass">' + glassKV([[t('k_datetime'), t('tomorrow') + '\u00a0· ' + S.ev.start], [t('k_location'), S.ev.venue], [t('d_addr'), S.ev.address, 1]]) + '</div></div>' +
        '<p class="p" style="font-size:15px">' + t('mail_msg', { name: esc(S.me.name.split(' ')[0]), n: going(), cap: S.ev.cap }) + (l ? ' ' + t('mail_more', { left: P('spotsLeft', l) }) : '') + '</p>' +
        '<button class="cta" data-go="p-event">' + t('open_event') + '</button>' +
        '<div class="note-box"><b>' + t('mail_cant') + '</b> ' + t('mail_cant_t') + ' <button class="link" style="display:inline;padding:0" data-act="sheet" data-arg="cancel">' + t('cant_come') + '</button></div>'
        : '<div class="empty"><p>' + t('rem_none', { name: esc(evName()) }) + '</p><button class="cta" style="max-width:240px" data-go="p-event">' + t('open_event') + '</button></div>') +
      '</div>');
  };


  /* ---------- ORGANIZÁTOR ----------
     Vstupenka je event, ne komunita: první obrazovka je Vytvoř event (průvodce ve 4 krocích jako v aplikaci),
     účet až při zveřejnění, komunita, Stripe a žebříček až po prvním odehraném eventu. */
  function orgLabel() { return S.hasComm ? S.community : S.orgName; }
  function draftName() { var d = S.draft; return d ? (d.custom || t('evName', { f: d.format })) : evName(); }
  function doneLbl() { return t(S.ev.type === 'comp' ? 'st_done' : 'st_held'); }
  function cardPay() { return S.ev.price > 0 && S.ev.pay === 'card' && S.stripe === 'active'; }
  function orgReset() {
    S.orgMode = true; S.account = false; S.hasComm = false; S.stripe = 'none'; S.ev.pay = 'site';
    S.last = null; S.draft = null; S.wz = 0;
    /* Přímý odkaz na krok průvodce z výčtu zadání: index.html?wz=2&pay=card#/o-new */
    if (DL) { S.wz = DL.wz; if (DL.pay) S.ev.pay = DL.pay; DL = null; }
  }
  var DL = (function () { try { var u = new URLSearchParams(location.search), w = u.get('wz'); return w ? { wz: Math.max(0, Math.min(3, +w)), pay: u.get('pay') } : null; } catch (e) { return null; } })();

  R['o-signup'] = function () {
    var d = S.draft || { photo: S.ev.photo, week: S.ev.week, start: S.ev.start };
    return screen('', status() + top(ib('←', 'data-go="o-new"', 'back'), '', langSwitch()) +
      '<div class="scroll" style="gap:16px;padding-top:6px">' +
      '<div class="mini-ev"><img src="' + IMG + d.photo + '" alt=""><span><b>' + esc(draftName()) + '</b><small>' + fDate(d.week) + '\u00a0· ' + d.start + '</small><span class="pill ok" style="margin-top:6px">' + t('su_ready') + '</span></span></div>' +
      '<h1 class="h-caps" style="font-size:30px">' + t('su_title') + '</h1>' +
      '<p class="p muted">' + t('su_sub') + '</p>' +
      '<button class="row" data-act="signup" style="justify-content:center;background:#000;color:#fff;border-color:#000"><b>' + t('su_apple') + '</b></button>' +
      '<button class="row" data-act="signup" style="justify-content:center"><b>G&nbsp; ' + t('su_google') + '</b></button>' +
      '<div class="lbl" style="text-align:center">' + t('su_or') + '</div>' +
      '<label class="field"><span class="lbl">E-mail</span><input id="su-email" type="email" value="jakub@padelteplice.cz"></label>' +
      '<label class="field"><span class="lbl">' + t('su_pass') + '</span><input id="su-pass" type="password" value="prototyp"></label>' +
      '<p class="fine">' + t('su_fine') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="signup">' + t('su_cta') + '</button><button class="link" data-act="signup">' + t('su_have') + '</button></div>');
  };

  /* Komunita přichází až po prvním odehraném eventu */
  R['o-community'] = function () {
    var n = S.last ? S.last.showed : Math.max(S.players.length, 12);
    return screen('', status() + top(ib('←', 'data-go="o-after"', 'back'), t('co_step')) +
      '<div class="scroll" style="gap:14px;padding-top:6px">' +
      '<div class="photo grain" style="min-height:170px"><img src="' + IMG + 'court-blur-run.jpg" alt=""><div class="badge"><span class="pill glassy">' + P('co_players', n) + '</span></div></div>' +
      '<h1 class="h-mid" style="font-size:26px">' + t('co_title') + '</h1>' +
      '<ul class="ticks"><li>' + t('co_b1') + '</li><li>' + t('co_b2') + '</li><li>' + t('co_b3') + '</li></ul>' +
      '<label class="field"><span class="lbl">' + t('co_name') + '</span><input id="c-name" value="' + esc(S.community) + '"></label>' +
      '<label class="field"><span class="lbl">' + t('co_city') + '</span><input id="c-city" value="' + esc(S.city) + '"></label>' +
      '<p class="fine" style="text-align:left">' + t('co_fine') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="community">' + t('co_cta') + '</button><button class="link" data-go="o-after">' + t('co_later') + '</button></div>');
  };

  /* Co dál po prvním eventu: komunita, platby kartou, žebříček */
  function nextSteps() {
    var out = '';
    if (!S.hasComm) out += '<button class="step-card" data-go="o-community"><i>◎</i><span><b>' + t('ns_comm') + '</b><small>' + t('ns_comm_s') + '</small></span><em>→</em></button>';
    if (S.stripe !== 'active') out += '<button class="step-card" data-act="connectStripe" data-arg="' + route() + '"><i>Kč</i><span><b>' + t('ns_stripe') + '</b><small>' + t('ns_stripe_s') + '</small></span><em>→</em></button>';
    out += '<button class="step-card" data-act="toast" data-arg="ns_lead_t"><i>▲</i><span><b>' + t('ns_lead') + '</b><small>' + t('ns_lead_s') + '</small></span><em>→</em></button>';
    return out;
  }

  R['o-home'] = function () {
    var n = going();
    var last = S.last ? '<div class="lbl" style="margin-top:6px">' + t('h_last') + '</div><button class="row" data-go="o-after"><span>' + t('h_last_row', { money: kc(S.last.collected), s: S.last.showed, w: esc(short(S.last.winner)) }) + '</span><span class="r">▸</span></button>' +
      '<div class="lbl" style="margin-top:6px">' + t('nx_steps') + '</div>' + nextSteps() : (S.stripe !== 'active' ? '<button class="step-card" data-act="connectStripe" data-arg="o-home"><i>Kč</i><span><b>' + t('ns_stripe_any') + '</b><small>' + t('ns_stripe_any_s') + '</small></span><em>→</em></button>' : '') + '<p class="fine" style="text-align:left">' + t('h_first') + '</p>';
    return screen('', status() + top((S.hasComm ? '<span class="logo"><i></i>' + esc(S.community) + '</span>' : LOGO), '', ib('☰', 'data-act="sheet" data-arg="omenu"', 'menu')) +
      '<div class="scroll" style="gap:12px">' +
      '<div class="lbl">' + t('h_next') + '</div>' +
      '<button class="card-ev grain" data-go="o-manage"><img src="' + IMG + S.ev.photo + '" alt=""><div class="glass"><div class="sring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div>' +
      '<div class="kv"><div class="v">' + esc(evName()) + '</div><div class="l" style="margin-top:4px">' + evDate() + '\u00a0· ' + (left() ? P('spotsLeft', left()) : t('b_full')) + '</div></div></div></button>' +
      '<button class="row" data-act="share" data-arg="org"><span>' + t('h_share') + '</span><span class="r">⤴</span></button>' + last +
      '</div><div class="dock"><button class="cta" data-act="newEvent">' + t('h_new') + '</button></div>');
  };

  /* Průvodce Vytvoř event: kroky, pořadí a pole jako v aplikaci, převedené na telefon.
     Kolo 3: vybraná volba plně vybarvená, písmo min. 16 px, krátké popisky, skutečné ikony, méně polí na obrazovce. */
  var IC = (function () {
    function s(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
    return {
      comp: s('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3"/>'),
      social: s('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>'),
      train: s('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
      'Americano': s('<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/>'),
      'Mexicano': s('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
      'Round Robin': s('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
      'Turnaj': s('<path d="M3 5h5v4H3zM3 15h5v4H3zM8 7h3v10H8M11 12h4M15 9h6v6h-6z"/>'),
      'Playoff': s('<path d="M3 4h4v4M3 16h4v4M7 6h3v12H7M10 12h4M14 10h7v4h-7z"/>'),
      'Bez herního systému': s('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
      more: s('<path d="M6 9l6 6 6-6"/>')
    };
  })();
  var FMT = {
    'Americano': ['fs_am', 'fx_am'],
    'Mexicano': ['fs_mx', 'fx_mx'],
    'Round Robin': ['fs_rr', 'fx_rr'],
    'Turnaj': ['fs_tn', 'fx_tn'],
    'Playoff': ['fs_po', 'fx_po'],
    'Bez herního systému': ['fs_nx', 'fx_nx']
  };
  function fmtList(type) { return type === 'comp' ? ['Americano', 'Mexicano', 'Round Robin', 'Turnaj', 'Playoff'] : ['Americano', 'Mexicano', 'Round Robin', 'Bez herního systému']; }
  var WZ = ['wz1', 'wz2', 'wz3', 'wz4'];
  var PHOTOS = ['court-orange-close.jpg', 'court-serve.jpg', 'court-reach.jpg', 'court-blue-orange.jpg'];
  var CLUBS = ['Padel Klub Novosedlice', 'Padel Písečná', 'Padel Arena Ústí'];
  /* Poplatky u platby kartou: 6 % PadelLeague + Stripe 1,5 % + 6,50 Kč (běžná evropská karta). Na místě bez poplatků. */
  function feeOf(p) { return p > 0 ? Math.round(p * 0.06 + p * 0.015 + 6.5) : 0; }
  function newDraft(w) {
    return { custom: S.ev.custom, format: S.ev.format, variant: 'Classic', week: w, start: S.ev.start, deadline: '1d', venue: S.ev.venue, place: 'club', courts: S.ev.courts, cap: S.ev.cap, min: 4, dur: '2 h',
      price: S.ev.price, pay: S.ev.pay || 'site', type: S.ev.type || 'social', photo: S.ev.photo, gender: 'mix', vis: 'pub', force: false };
  }
  function chipRow(act, items, cur) { return '<div class="choice">' + items.map(function (x) { return '<button class="' + (cur === x[0] ? 'on' : '') + '" data-act="' + act + '" data-arg="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'; }
  function stepper(k, v, label) { return '<div class="stepper"><button data-act="step" data-arg="' + k + ':-' + (k === 'cap' ? 4 : k === 'price' ? 10 : 1) + '" aria-label="−">−</button>' + ((k === 'cap' || k === 'price') ? '<button class="stepv" data-act="numpad" data-arg="' + k + '" aria-label="' + t('np_edit') + ': ' + label + '"><b>' + label + '</b><i aria-hidden="true">✎</i></button>' : '<b>' + label + '</b>') + '<button data-act="step" data-arg="' + k + ':' + (k === 'cap' ? 4 : k === 'price' ? 10 : 1) + '" aria-label="+">+</button></div>'; }
  function waText(d) { return t('wa_tpl', { name: d.custom || t('evName', { f: d.format }), date: fDate(d.week), start: d.start, venue: d.venue, cap: d.cap, format: d.format }); }
  function sec(title, inner, extra) { return '<section class="wz-sec"><h2 class="wz-q">' + title + (extra || '') + '</h2>' + inner + '</section>'; }
  R['o-new'] = function () {
    var d = S.draft || (S.draft = newDraft(S.ev.week)), st = S.wz;
    if (fmtList(d.type).indexOf(d.format) < 0) d.format = 'Americano';
    var bar = '<div class="wz" role="list">' + WZ.map(function (k, i) { return '<button role="listitem" class="' + (i === st ? 'on' : i < st ? 'done' : '') + '" data-act="wz" data-arg="' + i + '"' + (i === st ? ' aria-current="step"' : '') + '><i>' + (i < st ? '✓' : i + 1) + '</i><span>' + t(k) + '</span></button>'; }).join('') + '</div>';
    function opt(k, h, s, tag) { return '<button class="tile row-t' + (d.pay === k ? ' on' : '') + '" data-act="dpay" data-arg="' + k + '" aria-pressed="' + (d.pay === k) + '"><span class="tt"><b>' + h + (tag ? ' <em>' + tag + '</em>' : '') + '</b><small>' + s + '</small></span></button>'; }
    var body;
    if (st === 0) body =
      sec(t('n_type'), '<div class="tiles1">' + [['comp', 'v_comp', 'vt_comp'], ['social', 'v_social', 'vt_social'], ['train', 'v_train', 'vt_train']].map(function (x) {
        var on = d.type === x[0];
        return '<button class="tile row-t' + (on ? ' on' : '') + '" data-act="dtype" data-arg="' + x[0] + '" aria-pressed="' + on + '"><span class="ic">' + IC[x[0]] + '</span><span class="tt"><b>' + t(x[1]) + '</b><small>' + t(x[2]) + '</small></span></button>'; }).join('') + '</div>') +
      sec(t('k_format'), '<div class="tiles2">' + fmtList(d.type).map(function (k) {
        var on = d.format === k;
        return '<button class="tile' + (on ? ' on' : '') + '" data-act="format" data-arg="' + k + '" aria-pressed="' + on + '"><span class="ic">' + IC[k] + '</span><b>' + t('fmt_' + k.replace(/ /g, '_')) + '</b><small>' + t(FMT[k][0]) + '</small></button>'; }).join('') + '</div>' +
        '<p class="wz-hint">' + t(FMT[d.format][1]) + '</p>') +
      (d.format === 'Americano' ? sec(t('n_variant'), '<div class="seg-f">' + [['Classic', 'var_classic'], ['Team', 'var_team'], ['Mixed', 'var_mixed']].map(function (x) { return '<button class="' + (d.variant === x[0] ? 'on' : '') + '" data-act="dvar" data-arg="' + x[0] + '" aria-pressed="' + (d.variant === x[0]) + '">' + t(x[1]) + '</button>'; }).join('') + '</div>') : '');
    else if (st === 1) {
      var rest = d.cap - d.courts * 4;
      var dlTxt = { none: t('dl_none'), '1d': t('dl_1d'), '3d': t('dl_3d'), '1w': t('dl_1w'), '2w': t('dl_2w') }[d.deadline];
      body =
        sec(t('n_when'), '<div class="two"><label class="field big"><span class="lbl">' + t('n_date') + '</span><select id="d-week">' + [0, 1, 2].map(function (o) { var w = S.ev.week + o; return '<option value="' + w + '"' + (w === d.week ? ' selected' : '') + '>' + fDate(w) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field big"><span class="lbl">' + t('n_start') + '</span><select id="d-start">' + ['17:00', '18:00', '19:00', '20:00'].map(function (v) { return '<option' + (v === d.start ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label></div>') +
        sec(t('n_players'), '<div class="field big">' + stepper('cap', d.cap, P('players', d.cap)) + '<div class="choice mini">' + [8, 12, 16, 24, 32].map(function (n) { return '<button class="' + (d.cap === n ? 'on' : '') + '" data-act="dcap" data-arg="' + n + '">' + n + '</button>'; }).join('') + '</div></div>') +
        sec(t('n_where'), '<div class="seg-f">' + ['club', 'own'].map(function (k) { return '<button class="' + (d.place === k ? 'on' : '') + '" data-act="dplace" data-arg="' + k + '">' + t('pl_' + k) + '</button>'; }).join('') + '</div>' +
          (d.place === 'club' ? '<label class="field big"><span class="lbl">' + t('n_club') + '</span><select id="d-venue">' + CLUBS.map(function (c) { return '<option' + (c === d.venue ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>'
            : '<label class="field big"><span class="lbl">' + t('n_place') + '</span><input id="d-venue" value="' + esc(d.venue) + '"></label>')) +
        '<div class="acc wz-more' + (S.more2 ? ' open' : '') + '"><button data-act="more2" aria-expanded="' + !!S.more2 + '"><span><b>' + t('n_more2') + '</b><small>' + t('n_more2_s', { dl: dlTxt, min: d.min, c: P('courts', d.courts), dur: d.dur === 'all' ? t('dur_all') : d.dur }) + '</small></span><span class="chev">' + IC.more + '</span></button><div class="inner">' +
          '<div class="lbl">' + t('n_dead') + '</div>' + chipRow('ddead', [['none', t('dl_none')], ['1d', t('dl_1d')], ['3d', t('dl_3d')], ['1w', t('dl_1w')]], d.deadline) +
          '<div class="two"><div class="field"><span class="lbl">' + t('n_min') + '</span>' + stepper('min', d.min, d.min) + '</div><div class="field"><span class="lbl">' + t('n_courts') + '</span>' + stepper('courts', d.courts, d.courts) + '</div></div>' +
          '<div class="lbl">' + t('n_dur') + '</div>' + chipRow('ddur', [['1,5 h', '1,5 h'], ['2 h', '2 h'], ['3 h', '3 h'], ['all', t('dur_all')]], d.dur) +
          '<p class="fine" style="text-align:left">' + (rest > 0 ? t('rest_n', { n: P('players', rest) }) : t('rest_none')) + '</p></div></div>';
    } else if (st === 2) {
      var fee = feeOf(d.price);
      body =
        sec(t('n_entry'), '<div class="seg-f">' + [['paid', t('paid')], ['free', t('free')]].map(function (x) { var on = (d.price > 0 ? 'paid' : 'free') === x[0]; return '<button class="' + (on ? 'on' : '') + '" data-act="dpaid" data-arg="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
          (d.price > 0 ? '<div class="field big"><span class="lbl">' + t('n_price') + '</span>' + stepper('price', d.price, kc(d.price)) + '</div>' : '')) +
        (d.price > 0 ? sec(t('n_pay'), '<div class="tiles1">' + opt('site', t('pay_site_h'), t('pay_site_s'), t('default')) + opt('card', t('pay_card_h'), t(S.stripe === 'active' ? 'pay_card_on' : 'pay_card_s')) + '</div>' +
          (d.pay === 'card' ? '<div class="fee-box" aria-live="polite"><div><span>' + t('fee_player') + '</span><b>' + kc(d.price) + '</b></div><div><span>' + t('fee_fees') + '</span><b>−' + kc(fee) + '</b></div><div class="net"><span>' + t('fee_you') + '</span><b>' + kc(d.price - fee) + '</b></div><small>' + t('fee_how') + '</small></div>' +
            (S.stripe !== 'active' ? '<div class="note-box">' + t('n_card_note') + ' <button class="link" style="display:inline;padding:0" data-act="connectStripe" data-arg="o-new">' + t('st_btn') + ' →</button></div>' : '')
            : '<div class="fee-box site"><div class="net"><span>' + t('fee_you_site') + '</span><b>' + kc(d.price) + '</b></div><small>' + t('fee_site') + '</small></div>')) : '') +
        sec(t('n_who'), '<div class="lbl">' + t('n_gender') + '</div>' + chipRow('dgen', [['mix', t('g_mix')], ['m', t('g_m')], ['w', t('g_w')]], d.gender) +
          '<div class="lbl" style="margin-top:6px">' + t('n_vis') + '</div>' + chipRow('dvis', [['pub', t('v_pub')], ['link', t('v_link')], ['com', t('v_com')]], d.vis) +
          '<div class="two" style="margin-top:6px"><label class="field"><span class="lbl">' + t('lv_from') + '</span><select><option>' + t('no_limit') + '</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return '<option>' + t('lv_n', { n: n }) + '</option>'; }).join('') + '</select></label>' +
          '<label class="field"><span class="lbl">' + t('lv_to') + '</span><select><option>' + t('no_limit') + '</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return '<option>' + t('lv_n', { n: n }) + '</option>'; }).join('') + '</select></label></div>');
    } else body =
      sec(t('n_name'), '<label class="field big"><input id="d-name" aria-label="' + t('n_name') + '" value="' + esc(d.custom || '') + '" placeholder="' + esc(t('evName', { f: d.format })) + '"></label>') +
      sec(t('n_banner'), '<div class="pics">' + PHOTOS.map(function (p) { return '<button class="' + (d.photo === p ? 'on' : '') + '" data-act="dphoto" data-arg="' + p + '" aria-label="' + t('n_banner') + '"><img src="' + IMG + p + '" alt=""></button>'; }).join('') + '</div>') +
      sec(t('n_wa'), '<p class="wz-hint" style="margin-top:0">' + t('n_wa_s') + '</p><div class="wa-prev"><div class="bubble out">' + esc(waText(d)).replace(/\n/g, '<br>') + '<div class="time">20:51</div></div></div>') +
      '<div class="acc wz-more' + (S.more3 ? ' open' : '') + '"><button data-act="more3" aria-expanded="' + !!S.more3 + '"><span><b>' + t('n_desc') + ' · ' + t('n_cancel') + '</b><small>' + t('optional') + '</small></span><span class="chev">' + IC.more + '</span></button><div class="inner"><label class="field"><span class="lbl">' + t('n_desc') + '</span><textarea rows="3" placeholder="' + t('n_desc_ph') + '"></textarea></label><label class="field"><span class="lbl">' + t('n_cancel') + '</span><input value="' + t('n_cancel_v') + '"></label></div></div>' +
      '<button class="row" data-act="sheet" data-arg="preview"><span>' + t('n_preview_row') + '</span><span class="r">▸</span></button>';
    var dock = d.edit ? '<button class="cta" data-act="publish">' + t('n_save') + '</button>' + (st < 3 ? '<button class="link" data-act="wzNext">' + t('wz_next', { s: t(WZ[st + 1]) }) + '</button>' : '')
      : st < 3 ? '<button class="cta" data-act="wzNext">' + t('wz_next', { s: t(WZ[st + 1]) }) + '</button>' + (st ? '<button class="link" data-act="wz" data-arg="' + (st - 1) + '">' + t('back') + '</button>' : (S.account ? '' : '<button class="link" data-act="demoTry">' + t('demo_try') + '</button>'))
      : '<button class="cta" data-act="publish">' + t('n_publish') + '</button><button class="link" data-act="toast" data-arg="draft_t">' + t('n_draft') + '</button>';
    return screen('', status() + top(ib('✕', 'data-go="' + (S.account ? 'o-home' : 'start') + '"', 'close'), d.edit ? t('n_edit') : t('n_title'), '<button class="link" style="color:var(--navy);font-weight:700;text-decoration:none" data-act="sheet" data-arg="preview">' + t('n_preview') + '</button>') +
      bar + '<div class="scroll wz-body">' + body + '</div><div class="dock">' + dock + '</div>');
  };

  R['o-stripe'] = function () {
    var steps = [
      [t('sp1'), '<label class="field"><span class="lbl">' + t('sp_name') + '</span><input value="Jakub Novák"></label><label class="field"><span class="lbl">' + t('sp_dob') + '</span><input value="12. 4. 1990"></label><label class="field"><span class="lbl">' + t('sp_addr') + '</span><input value="Pražská 12, Teplice"></label>'],
      [t('sp2'), '<label class="field"><span class="lbl">IBAN</span><input value="CZ65 0800 0000 1920 0014 5399"></label><p class="fine" style="text-align:left">' + t('sp_note2') + '</p>']
    ];
    var s = steps[S.stripeStep];
    return screen('', '<div class="status" style="background:#635BFF;color:#fff"><span>12:11</span><span>●●● 5G</span></div>' +
      '<div class="top" style="background:#635BFF;color:#fff">' + ib('✕', 'data-go="' + S.stripeBack + '"', 'close') + '<div class="ttl">' + t('sp_step', { n: S.stripeStep + 1 }) + '</div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:16px;gap:12px"><p class="fine" style="text-align:left">' + t('sp_note') + '</p>' +
      '<h1 class="h-mid">' + s[0] + '</h1>' + s[1] + '</div>' +
      '<div class="dock"><button class="cta" style="background:#635BFF;box-shadow:none" data-act="stripeNext">' + t(S.stripeStep ? 'sp_submit' : 'sp_cont') + '</button></div>');
  };

  /* Po zveřejnění: seznam přihlášených, ne prázdný rozpis. Rozpis vznikne až po uzávěrce. */
  var PAYK = { paid: 'pay_paid', unpaid: 'pay_unpaid', site: 'pay_site' };
  R['o-live'] = function () {
    var n = S.players.length;
    var list = n ? S.players.map(function (p, i) { return '<div class="row"><span>' + (i + 1) + '\u00a0· ' + esc(p.n) + '</span><span class="pill ' + p.pay + '">' + t(PAYK[p.pay]) + '</span></div>'; }).join('') +
      '<button class="row" data-go="o-manage"><b>' + t('l_manage') + '</b><span class="r">▸</span></button>'
      : '<div class="empty slim"><p>' + t('l_empty') + '</p><button class="link" data-act="fastForward">' + t('demo_signups') + '</button></div>';
    return screen('', status() + top(ib('✕', 'data-go="o-home"', 'close'), '', '<span class="pill ok">' + t('live') + '</span>') +
      '<div class="scroll" style="gap:12px;padding-top:2px">' +
      '<div class="lbl">' + t('l_eyebrow') + '</div>' +
      '<div class="mini-ev big"><img src="' + IMG + S.ev.photo + '" alt=""><span><b>' + esc(evName()) + '</b><small>' + t('l_meta', { format: S.ev.format, date: evDate(), start: S.ev.start, courts: P('courts', S.ev.courts) }) + '</small></span></div>' +
      '<div class="going"><div class="ring" style="--p:' + Math.round(n / S.ev.cap * 100) + '"><span>' + n + '/' + S.ev.cap + '</span></div><div><div class="t">' + t('l_signed', { n: n }) + '</div><div class="s">' + cap1(P('spotsLeft', Math.max(0, S.ev.cap - n))) + '\u00a0· ' + kc(S.ev.price) + (S.ev.price ? ' ' + t(cardPay() ? 'l_bycard' : 'l_onsite') : '') + '</div></div></div>' +
      '<div class="lbl">' + t('l_list') + '</div>' + list +
      '<div class="note-box">' + t('l_sched', { close: evClose() }) + '</div>' +
      '</div><div class="dock"><button class="cta wa" data-act="shareWA">' + WA_IC + t('l_cta_wa') + '</button><button class="link" data-act="share" data-arg="org">' + t('l_link') + '</button></div>');
  };



  /* Engine na mobilu: stejné 4 kroky jako PC verze (Soupiska → Nastavení → Rozpis → Spuštění) */
  var ENG = ['en1', 'en2', 'en3', 'en4'];
  function engBar(cur) {
    return '<div class="wz eng" role="list">' + ENG.map(function (k, i) { return '<span role="listitem" class="' + (i === cur ? 'on' : i < cur ? 'done' : '') + '"><i>' + (i < cur ? '✓' : i + 1) + '</i><span>' + t(k) + '</span></span>'; }).join('') + '</div>';
  }
  function evHead(state) {
    return '<div class="ev-head"><div class="pills"><span class="pill fmt">' + esc(S.ev.format) + '</span><span class="pill st-' + state + '">' + t('st_' + state) + '</span></div><b>' + esc(evName()) + '</b><small>' + evDate() + '\u00a0· ' + S.ev.start + '\u00a0· ' + esc(S.ev.venue) + '</small></div>';
  }
  function payCounts() { var o = { paid: 0, site: 0, unpaid: 0 }; S.players.forEach(function (p) { o[p.pay]++; }); return o; }

  R['o-manage'] = function () {
    var here = S.players.filter(present), pc = payCounts(), n = S.players.length;
    var rows = S.players.map(function (p, i) {
      return '<div class="pl-row' + (p.noshow ? ' off' : '') + '"><span class="av">' + initials(p.n) + '</span><span class="nm">' + esc(p.n) + '</span>' +
        '<span class="pl-act"><button class="pill ' + p.pay + '" data-act="cyclePay" data-arg="' + i + '">' + t(PAYK[p.pay]) + '</button>' +
        '<button class="pill ns' + (p.noshow ? ' on' : '') + '" data-act="attend" data-arg="' + i + '">' + t(p.noshow ? 'noshow' : 'ns_btn') + '</button></span></div>';
    }).join('') || '<div class="empty"><p>' + t('mg_empty') + '</p></div>';
    var wl = S.waitlist.map(function (nm, i) { return '<div class="row"><span>' + (i + 1) + '\u00a0· ' + esc(nm) + '</span><button class="r" style="color:var(--navy);font-weight:700;text-decoration:underline" data-act="moveIn" data-arg="' + i + '">' + t('move_in') + '</button></div>'; }).join('');
    var restN = Math.max(0, here.length - Math.min(S.cfg.courts, Math.floor(here.length / 4)) * 4);
    var check = [[n >= 4, t('ck_min')], [true, t('ck_pay', { a: pc.paid, b: pc.site, c: pc.unpaid })], [true, t('ck_play', { n: here.length })], [true, restN ? t('ck_rest', { n: restN }) : t('ck_all')]];
    return screen('', status() + top(ib('←', 'data-go="o-live"', 'back'), t('en1'), ib('⋯', 'data-act="sheet" data-arg="evmenu"', 'more')) +
      engBar(0) + '<div class="scroll" style="gap:10px">' + evHead('prep') +
      '<div class="seg3"><div><b>' + n + '/' + S.ev.cap + '</b><span>' + t('mg_going') + '</span></div><div><b>' + (pc.paid + pc.site) + '</b><span>' + t('mg_paid') + '</span></div><div><b>' + S.waitlist.length + '</b><span>' + t('mg_wait') + '</span></div></div>' +
      '<div class="h-sec"><div class="lbl">' + t('mg_lbl') + '</div><button class="link" data-act="addPlayer">+ ' + t('em_add') + '</button></div>' + rows +
      (wl ? '<div class="lbl" style="margin-top:6px">' + t('mg_waitlist') + '</div>' + wl : '') +
      '<div class="check-box"><b>' + t('ck_title') + '</b>' + check.map(function (c) { return '<span class="' + (c[0] ? 'ok' : 'no') + '">' + c[1] + '</span>'; }).join('') + '</div>' +
      '</div><div class="dock">' + (n < 4 ? '<button class="cta" data-act="share" data-arg="org">' + t('h_share') + '</button>' :
        '<button class="cta" data-go="o-setup">' + t('en_confirm') + '</button><p class="fine">' + t('en_confirm_fine') + '</p>') + '</div>');
  };

  function maxRounds() { return Math.max(1, Math.min(7, S.players.filter(present).length - 1)); }
  R['o-setup'] = function () {
    var c = S.cfg, here = S.players.filter(present).length, courts = Math.min(c.courts, Math.floor(here / 4)) || 1, rest = Math.max(0, here - courts * 4);
    return screen('', status() + top(ib('←', 'data-go="o-manage"', 'back'), t('en2')) +
      engBar(1) + '<div class="scroll" style="gap:12px">' +
      '<div class="lbl" style="color:var(--navy)">' + t('es_rec') + '</div><h1 class="h-mid" style="font-size:22px">' + t('es_h') + '</h1>' +
      '<div class="field"><span class="lbl">' + t('n_courts') + ' <span class="opt-l">' + t('reserved', { n: S.ev.courts }) + '</span></span><div class="stepper"><button data-act="cfg" data-arg="courts:-1">−</button><b>' + c.courts + '</b><button data-act="cfg" data-arg="courts:1">+</button></div></div>' +
      '<div class="lbl">' + t('es_time') + '</div>' + chipRow('cfgmode', [['time', t('es_timed')], ['free', t('es_notime')]], c.mode) +
      '<div class="field"><span class="lbl">' + t('es_rounds') + ' <span class="opt-l">' + t('es_max', { n: maxRounds() }) + '</span></span><div class="stepper"><button data-act="cfg" data-arg="rounds:-1">−</button><b>' + P('rounds', c.rounds) + '</b><button data-act="cfg" data-arg="rounds:1">+</button></div></div>' +
      '<div class="lbl">' + t('es_pts') + '</div>' + chipRow('cfgpts', [[16, '16'], [24, '24'], [32, '32']].map(function (x) { return [String(x[0]), x[1]]; }), String(c.pts)) +
      '<div class="est"><b>' + t('es_est') + '</b><div><span>' + t('es_e1') + '</span><b>' + courts + '</b></div><div><span>' + t('es_e2') + '</span><b>' + courts * c.rounds + '</b></div><div><span>' + t('es_e3') + '</span><b>' + rest + '</b></div><div><span>' + t('es_e4') + '</span><b>≈ ' + c.rounds * 10 + ' min</b></div></div>' +
      '</div><div class="dock"><button class="cta" data-act="buildSchedule">' + t('es_cta') + '</button></div>');
  };

  function rng(seed) { return function () { seed = seed + 0x6D2B79F5 | 0; var x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function buildSched() {
    var ps = S.players.filter(present).map(function (p) { return p.n; });
    var courts = Math.max(1, Math.min(S.cfg.courts, Math.floor(ps.length / 4))), rounds = S.cfg.rounds, out = [];
    var rand = rng(hash(ps.join('|')) + S.shuffle * 7919), seen = {}, rested = {};
    function key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
    for (var r = 0; r < rounds; r++) {
      var best = null, bestCost = 1e9;
      for (var k = 0; k < 200; k++) {
        var arr = ps.slice();
        for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
        var cost = 0;
        for (var c = 0; c < courts; c++) { if (seen[key(arr[4 * c], arr[4 * c + 3])]) cost += 2; if (seen[key(arr[4 * c + 1], arr[4 * c + 2])]) cost += 2; }
        arr.slice(courts * 4).forEach(function (n) { if (rested[n]) cost += 1; });
        if (cost < bestCost) { bestCost = cost; best = arr; if (!cost) break; }
      }
      var m = [];
      for (var c2 = 0; c2 < courts; c2++) {
        m.push({ a: [best[4 * c2], best[4 * c2 + 3]], b: [best[4 * c2 + 1], best[4 * c2 + 2]] });
        seen[key(best[4 * c2], best[4 * c2 + 3])] = 1; seen[key(best[4 * c2 + 1], best[4 * c2 + 2])] = 1;
      }
      var rest = best.slice(courts * 4); rest.forEach(function (n) { rested[n] = 1; });
      out.push({ m: m, rest: rest });
    }
    S.sched = out;
    S.play = { round: 0, scores: out.map(function (rd) { return rd.m.map(function () { return null; }); }) };
  }
  function partnerStats() {
    var cnt = {}, rep = false;
    S.sched.forEach(function (rd) { rd.m.forEach(function (mt) { [mt.a, mt.b].forEach(function (tm) { var k = tm.slice().sort().join('|'); cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] > 1) rep = true; }); }); });
    return rep;
  }

  /* Rozpis a Průběh: čitelné na kurtu jednou rukou, vizuál podle PC verze */
  function teamLines(a) { return '<b>' + esc(short(a[0])) + '</b><b>' + esc(short(a[1])) + '</b>'; }
  R['o-schedule'] = function () {
    var matches = S.sched.reduce(function (s, rd) { return s + rd.m.length; }, 0);
    var rds = S.sched.map(function (rd, r) {
      return '<section class="rz"><h3><i>' + (r + 1) + '</i>' + t('round', { n: r + 1 }) + '<small>' + P('matches', rd.m.length) + '</small></h3>' +
        rd.m.map(function (mt, c) { return '<div class="rz-m"><span class="rz-c"><small>' + t('court_s') + '</small>' + (c + 1) + '</span><div class="rz-t">' + teamLines(mt.a) + '</div><span class="rz-vs">vs</span><div class="rz-t b">' + teamLines(mt.b) + '</div></div>'; }).join('') +
        (rd.rest.length ? '<div class="rz-rest">' + t('resting') + rd.rest.map(short).map(esc).join(', ') + '</div>' : '') + '</section>';
    }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-setup"', 'back'), t('en3'), ib('↻', 'data-act="reshuffle"', 'shuffle')) +
      engBar(2) + '<div class="scroll" style="gap:12px">' +
      '<div class="sc-stats"><span>' + P('rounds', S.sched.length) + '\u00a0· ' + P('matches', matches) + '</span><span class="' + (partnerStats() ? 'warn' : 'ok') + '">' + t(partnerStats() ? 'sc_rep' : 'sc_norep') + '</span></div>' +
      '<button class="row" data-act="reshuffle"><span>' + t('sc_regen') + '</span><span class="r">↻</span></button>' + rds +
      '</div><div class="dock"><button class="cta" data-act="sheet" data-arg="launch">' + t('sc_next') + '</button></div>');
  };

  function roundDone(r) { return S.play.scores[r].every(function (x) { return x; }); }
  function allDone() { return S.play.scores.every(function (rd) { return rd.every(function (x) { return x; }); }); }
  function doneCount() { var d = 0, all = 0; S.play.scores.forEach(function (rd) { rd.forEach(function (x) { all++; if (x) d++; }); }); return [d, all]; }
  /* Tabulka jako v PadelMixu: Body a V-R-P, nic navíc. Ve finální verzi ještě rozdíl skóre. */
  function standTable(rows, full) {
    return '<div class="st-tbl mx' + (full ? ' full' : '') + '"><div class="st-h"><span>#</span><span>' + t('d_player') + '</span><span>' + t('d_points') + '</span><span>' + t('vrp') + '</span>' + (full ? '<span>+/−</span>' : '') + '</div>' +
      rows.map(function (p, i) { return '<div class="st-r' + (i < 3 ? ' m' + (i + 1) : '') + '"><span class="pos">' + (i + 1) + '</span><span class="nm">' + esc(short(p.n)) + (i === 0 && p.v >= 3 ? ' 🔥' : '') + '</span><b>' + p.pts + '</b><span class="vrp">' + p.v + '-' + p.r + '-' + p.p + '</span>' + (full ? '<span class="df ' + (p.d >= 0 ? 'up' : 'dn') + '">' + (p.d > 0 ? '+' : '') + p.d + '</span>' : '') + '</div>'; }).join('') + '</div>';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  /* Průběh podle měřítka PadelMix: jedno kolo na obrazovce, velké skóre u každého týmu, klepnutím se zadává */
  R['o-play'] = function () {
    var r = S.play.round, rd = S.sched[r], last = r === S.sched.length - 1;
    var tabs = S.sched.map(function (_, i) { return '<button class="' + (i === r ? 'on' : '') + (roundDone(i) ? ' done' : '') + '" data-act="round" data-arg="' + i + '" aria-label="' + t('round', { n: i + 1 }) + '">' + (i + 1) + (roundDone(i) ? '<i>✓</i>' : '') + '</button>'; }).join('');
    var courts = rd.m.map(function (mt, c) {
      var sc = S.play.scores[r][c];
      function box(side) { var v = sc ? sc[side] : 0, win = sc && sc[side] > sc[1 - side]; return '<button class="sb' + (win ? ' win' : '') + (sc ? '' : ' empty') + '" data-act="score" data-arg="' + r + ':' + c + ':' + side + '" aria-label="' + t('score_for', { a: short(mt[side ? 'b' : 'a'][0]), b: short(mt[side ? 'b' : 'a'][1]) }) + '">' + (sc ? pad2(v) : '–') + '</button>'; }
      return '<div class="mx"><div class="mx-sc">' + box(0) + box(1) + '</div>' +
        '<div class="mx-t"><span>' + esc(short(mt.a[0])) + '<br>' + esc(short(mt.a[1])) + '</span><span class="b">' + esc(short(mt.b[0])) + '<br>' + esc(short(mt.b[1])) + '</span></div>' +
        '<span class="mx-c">' + t('court', { n: c + 1 }) + '</span></div>';
    }).join('');
    var todo = S.play.scores[r].filter(function (x) { return !x; }).length;
    var dock = last ? '<div class="dock-row"><button class="cta sec" data-act="addRound">+ ' + t('add_round') + '</button><button class="cta" data-act="sheet" data-arg="finish">✓ ' + t('finish_s') + '</button></div>'
      : '<button class="cta" data-act="round" data-arg="' + (r + 1) + '">' + t('next_round') + ' →</button>';
    return screen('', status() + top(ib('←', 'data-go="o-schedule"', 'back'), '', '<span class="top-icons">' + ib('⤴', 'data-act="sheet" data-arg="live"', 'share_live') + ib('☰', 'data-act="sheet" data-arg="board"', 'board') + ib('⋯', 'data-act="sheet" data-arg="livemenu"', 'more') + '</span>') +
      '<div class="scroll" style="gap:14px">' +
      '<div class="mx-head"><div><b>' + esc(evName()) + '</b><small>' + esc(S.ev.format) + '\u00a0· ' + evDate() + '</small></div><div class="meta"><span>' + S.cfg.pts + ' ◎</span><span>' + S.players.filter(present).length + ' 👤</span></div></div>' +
      '<div class="rtabs2">' + tabs + '</div><div class="lbl" style="text-align:center;margin-top:-6px">' + t('rounds_lbl') + '</div>' + courts +
      (rd.rest.length ? '<div class="mx-rest"><b>' + t('resting_h') + '</b><span>' + rd.rest.map(short).map(esc).join(', ') + '</span></div>' : '') +
      (todo ? '<p class="fine">' + t('left_score', { k: P('toScore', todo) }) + ' · <button class="link" style="display:inline;padding:0" data-act="autofill">' + t('demo_fill') + '</button></p>' : '') +
      '</div><div class="dock">' + dock + '</div>');
  };

  function fillScores() {
    var pts = S.cfg.pts;
    S.play.scores.forEach(function (rd, r) { rd.forEach(function (x, c) { if (!x) { var a = Math.round(pts / 3) + (hash(r + ':' + c + S.ev.format) % Math.round(pts / 3 + 1)); rd[c] = [a, pts - a]; } }); });
    S.play.round = S.sched.length - 1;
  }
  function standings() {
    var o = {};
    S.players.filter(present).forEach(function (p) { o[p.n] = { n: p.n, z: 0, v: 0, r: 0, p: 0, pts: 0, d: 0 }; });
    if (S.sched) S.sched.forEach(function (rd, r) {
      rd.m.forEach(function (mt, c) {
        var sc = S.play.scores[r][c]; if (!sc) return;
        function add(tm, f, a) { tm.forEach(function (n) { var x = o[n]; if (!x) return; x.z++; x.pts += f; x.d += f - a; if (f > a) x.v++; else if (f < a) x.p++; else x.r++; }); }
        add(mt.a, sc[0], sc[1]); add(mt.b, sc[1], sc[0]);
      });
    });
    return Object.keys(o).map(function (n) { return o[n]; }).sort(function (a, b) { return b.pts - a.pts || b.d - a.d || a.n.localeCompare(b.n); });
  }
  function summary() {
    var st = standings(), card = 0, site = 0, owe = [];
    S.players.forEach(function (p) { if (p.pay === 'paid') card++; else if (p.pay === 'site') site++; else owe.push(p.n); });
    var noshow = S.players.filter(function (p) { return p.noshow; }).map(function (p) { return p.n; });
    var fees = card * feeOf(S.ev.price);
    return { week: S.ev.week, stand: st, winner: st[0].n, total: S.players.length, card: card, site: site, owe: owe, paid: card + site,
      showed: S.players.length - noshow.length, noshow: noshow, collected: (card + site) * S.ev.price, price: S.ev.price,
      cardSum: card * S.ev.price, siteSum: site * S.ev.price, fees: fees, net: card * S.ev.price - fees };
  }
  function demoFinished() {
    if (S.players.length < 8) S.players = mkPlayers(16);
    if (!S.players.some(function (p) { return p.noshow; })) S.players[5].noshow = true;
    buildSched(); fillScores(); S.last = summary();
  }

  /* Obrazovka 3 – po eventu: vítěz, stupně a pořadí jako PC verze + vybráno, nezaplatili, docházka, co dál */
  R['o-after'] = function () {
    var L = S.last, st = L.stand, w = st[0];
    var owe = L.owe.map(function (n) { var i = -1; S.players.forEach(function (p, j) { if (p.n === n) i = j; }); return '<div class="row"><span>' + esc(n) + '</span><button class="r" style="text-decoration:underline" data-act="remind" data-arg="' + i + '">' + t('remind') + '</button></div>'; }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-home"', 'back'), doneLbl(), ib('⋯', 'data-act="toast" data-arg="af_menu_t"', 'more')) +
      '<div class="scroll" style="gap:12px">' +
      '<div class="win-card grain"><img src="' + IMG + S.ev.photo + '" alt=""><div class="in"><div class="pills"><span class="pill fmt">' + esc(S.ev.format) + '</span><span class="pill st-done">' + doneLbl() + '</span></div>' +
      '<i class="cup">🏆</i><span class="lbl">' + t('winner_lbl') + '</span><b>' + esc(w.n) + '</b><small>' + t('win_line', { p: w.pts, v: P('wins', w.v), d: (w.d > 0 ? '+' : '') + w.d }) + '</small></div></div>' +
      podium(st) +
      '<div class="af-money"><div class="lbl">' + t('collected') + '</div><div class="money">' + kc(L.collected) + '</div>' +
      '<div class="af-rows"><div><span>' + t('af_bycard', { n: L.card }) + '</span><b>' + kc(L.cardSum) + '</b></div><div><span>' + t('af_fees') + '</span><b>' + (L.fees ? '−' + kc(L.fees) : kc(0)) + '</b></div>' +
      '<div class="net"><span>' + t('af_net') + '</span><b>' + kc(L.net) + '</b></div><div><span>' + t('af_onsite', { n: L.site }) + '</span><b>' + kc(L.siteSum) + '</b></div><div class="total"><span>' + t('af_total') + '</span><b>' + kc(L.net + L.siteSum) + '</b></div></div>' +
      '<div class="af-pills"><span class="pill ok">' + t('af_paid', { p: L.paid, t: L.total }) + '</span><span class="pill site">' + t('af_showed', { s: L.showed, t: L.total }) + '</span>' + (L.owe.length ? '<span class="pill wait">' + t('af_owe', { u: L.owe.length }) + '</span>' : '') + '</div></div>' +
      (owe ? '<div class="lbl">' + t('d_owe') + '</div>' + owe : '') +
      '<div class="stat4"><div><span>' + t('stats_players') + '</span><b>' + L.showed + '</b></div><div><span>' + t('stats_rounds') + '</span><b>' + S.sched.length + '</b></div><div><span>' + t('stats_matches') + '</span><b>' + S.sched.reduce(function (x, rd) { return x + rd.m.length; }, 0) + '</b></div><div><span>' + t('stats_pts') + '</span><b>' + S.play.scores.reduce(function (x, rd) { return x + rd.reduce(function (y, sc) { return y + (sc ? sc[0] + sc[1] : 0); }, 0); }, 0) + '</b></div></div>' +
      '<div class="h-sec"><div class="lbl">' + t('d_final') + '</div><button class="link" data-act="sheet" data-arg="breakdown">▦ ' + t('breakdown') + '</button></div>' + standTable(st, true) +
      '<div class="lbl" style="margin-top:6px">' + t('hl_title') + '</div><div class="hl-row">' + highlights().map(function (h) { return '<div class="hl"><span>' + h[0] + ' ' + h[1] + '</span><b>' + h[2] + '</b></div>'; }).join('') + '</div>' +
      '<button class="row" data-act="sheet" data-arg="live"><span>⤴ ' + t('share_results') + '</span><span class="r">QR ▸</span></button>' +
      '<div class="lbl" style="margin-top:6px">' + t('nx_steps') + '</div>' + nextSteps() +
      '</div><div class="dock"><button class="cta" data-act="nextEvent">' + t('af_next') + '<small>' + t('af_same', { date: fDate(S.ev.week + 1) }) + '</small></button><button class="link" data-go="o-card">' + t('af_card') + '</button></div>');
  };
  function podium(st) {
    function pod(cls, i) { return '<div class="pod2 ' + cls + '"><i>' + (i + 1) + '</i><span class="av">' + initials(st[i].n) + '</span><b>' + esc(short(st[i].n)) + '</b><small>' + t('pts', { n: st[i].pts }) + '</small></div>'; }
    return '<div class="podium2">' + pod('s', 1) + pod('g', 0) + pod('b', 2) + '</div>';
  }

  /* Obrazovka 3 – desktop (ponecháno pro srovnání, PC verze je v aplikaci) */
  R['o-after-d'] = function () {
    var L = S.last, st = L.stand, nav = D[lang].d_nav;
    var owe = L.owe.length ? L.owe.map(function (n) { var i = -1; S.players.forEach(function (p, j) { if (p.n === n) i = j; }); return '<div class="d-row"><span>' + esc(n) + '</span><button class="r" style="text-decoration:underline" data-act="remind" data-arg="' + i + '">' + t('remind') + '</button></div>'; }).join('')
      : '<div class="d-row"><span>' + t('d_none_owe') + '</span><span class="pill ok">✓</span></div>';
    var table = st.slice(0, 10).map(function (p, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(p.n) + '</td><td class="num">' + p.pts + '</td></tr>'; }).join('');
    return screen('desk', '<div class="d-bar"><span class="logo"><i></i>' + esc(orgLabel()) + '</span><nav>' + nav.map(function (x, i) { return '<span class="' + (i === 1 ? 'on' : '') + '">' + x + '</span>'; }).join('') + '</nav>' + langSwitch() + '</div>' +
      '<div class="d-main"><div class="d-head"><div><div class="lbl">' + fLong(L.week) + '\u00a0· ' + esc(S.ev.venue) + '</div><h1 class="h-caps" style="font-size:34px;margin-top:6px">' + t('af_done', { st: doneLbl().toLowerCase(), name: esc(evName()) }) + '</h1></div>' +
      '<button class="cta d-cta" data-act="nextEvent">' + t('af_next') + '<small>' + t('af_same', { date: fDate(S.ev.week + 1) }) + '</small></button></div>' +
      '<div class="d-grid"><div class="d-col">' +
      '<section class="d-card"><div class="lbl">' + t('collected') + '</div><div class="money">' + kc(L.collected) + '</div>' +
      '<div class="d-row"><span>' + t('d_bycard') + '</span><b>' + L.card + ' × ' + kc(L.price) + '</b></div>' + (L.card ? '<div class="d-row"><span>' + t('af_fees') + '</span><b>−' + kc(L.fees) + '</b></div><div class="d-row net"><span>' + t('af_net') + '</span><b>' + kc(L.net) + '</b></div>' : '') + '<div class="d-row"><span>' + t('d_onsite') + '</span><b>' + L.site + ' × ' + kc(L.price) + '</b></div><div class="d-row net"><span>' + t('af_total') + '</span><b>' + kc(L.net + L.siteSum) + '</b></div></section>' +
      '<section class="d-card"><div class="lbl">' + t('d_owe') + '</div>' + owe + '</section>' +
      '<section class="d-card"><div class="lbl">' + t('d_att') + '</div><div class="d-big">' + t('d_att_txt', { s: L.showed, t: L.total }) + '</div>' +
      (L.noshow.length ? '<div class="d-row"><span>' + t('d_noshow') + '</span><b>' + L.noshow.map(esc).join(', ') + '</b></div>' : '<div class="d-row"><span>' + t('d_all_here') + '</span></div>') + '</section>' +
      '</div><div class="d-col">' +
      '<section class="d-card">' + podium(st) + '</section>' +
      '<section class="d-card"><div class="lbl">' + t('d_final') + '</div><table class="d-table"><thead><tr><th>#</th><th>' + t('d_player') + '</th><th class="num">' + t('d_points') + '</th></tr></thead><tbody>' + table + '</tbody></table>' +
      '<button class="link" style="text-align:left;margin-top:10px" data-go="o-card">' + t('af_card') + '</button></section>' +
      '</div></div><p class="fine" style="text-align:left;margin-top:14px"><button class="link" style="display:inline" data-go="o-after">← ' + t('d_mobile') + '</button></p></div>');
  };

  /* Karta výsledku = instagramová story 9:16. Text a logo jen v ochranné zóně Meta (14 % nahoře, 35 % dole, 6 % po stranách). */
  R['o-card'] = function () {
    var L = S.last, w = L.stand[0];
    return screen('', status() + top(ib('←', 'data-go="o-after"', 'back'), t('cd_title')) +
      '<div class="scroll"><div class="somecard grain"><img src="' + IMG + 'court-blue-orange.jpg" alt=""><div class="sc-safe">' +
      '<span class="sc-logo" role="img" aria-label="PadelLeague">' + (window.PL_LOGO ? window.PL_LOGO.full : 'PadelLeague') + '</span>' +
      '<div class="glass sc-glass">' + glassKV([[t('cd_name'), w.n, 1], [t('k_event'), evName() + '\u00a0· ' + orgLabel(), 1], [t('cd_details'), fCard(L.week) + '\u00a0· ' + S.city, 1]]) +
      '<div class="kv big"><div class="l">' + t('cd_points') + '</div><div class="v">' + w.pts + '</div></div><div class="kv big"><div class="l">' + t('cd_result') + '</div><div class="v">' + t('cd_winner') + '</div></div></div>' +
      '<div class="sc-foot"><div class="some-foot">' + t('cd_foot') + '</div><div class="won">#1<small>' + t('cd_of', { n: L.showed }) + '</small></div></div></div></div>' +
      '<p class="fine">' + t('cd_zone') + '</p></div>' +
      '<div class="dock"><button class="cta" data-act="toast" data-arg="opening_ig">' + t('cd_ig') + '</button><button class="link" data-act="cardAll">' + t('cd_all') + '</button></div>');
  };


  R['o-next'] = function () {
    var w = S.ev.week + 1;
    function row(l, v, ch) { return '<button class="row" data-act="editNext"><span><span class="lbl">' + l + '</span><br>' + (ch ? '<span class="changed">' + v + '</span>' : v) + '</span><span class="r">' + t('edit') + '</span></button>'; }
    return screen('', status() + top(ib('✕', 'data-go="o-after"', 'close'), t('nx_title')) +
      '<div class="scroll" style="gap:10px"><h1 class="h-mid" style="font-size:24px">' + t('nx_h') + '</h1>' +
      row(t('nx_date'), fDate(w) + '\u00a0· ' + S.ev.start + '–' + endTime(), 1) + row(t('nx_format'), S.ev.format + '\u00a0· ' + P('players', S.ev.cap)) + row(t('nx_where'), esc(S.ev.venue) + '\u00a0· ' + P('courts', S.ev.courts)) + row(t('nx_entry'), kc(S.ev.price) + (S.ev.price ? '\u00a0· ' + t(cardPay() ? 'nx_card' : 'nx_site') : '')) +
      '<p class="fine" style="text-align:left">' + t('nx_fine') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="publishNext">' + t('nx_cta') + '</button></div>');
  };

  /* ---------- PANELY (sheets) ---------- */
  var SH = {};
  SH.register = function () {
    var free = !S.ev.price, site = !free && !cardPay();
    return '<div class="grab"></div><h2 class="h-mid">' + t('s_join', { name: esc(evName()) }) + '</h2><p class="fine" style="text-align:left;margin-top:-6px">' + evDate() + '\u00a0· ' + S.ev.start + '\u00a0· ' + esc(S.ev.venue) + '</p>' +
      '<label class="field"><span class="lbl">' + t('your_name') + '</span><input id="f-name" autocomplete="name" value="' + esc(S.me.name) + '"></label>' +
      '<label class="field"><span class="lbl">' + t('contact') + '</span><input id="f-contact" autocomplete="email" type="email" value="' + esc(S.me.contact) + '"></label>' +
      (free || site ? '' : '<div class="methods">' + [['apple', ' Pay'], ['google', 'G Pay'], ['card', t('card')]].map(function (m) { return '<button class="' + (S.method === m[0] ? 'on' : '') + '" data-act="method" data-arg="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        (S.method === 'card' ? '<label class="field"><span class="lbl">' + t('card_no') + '</span><input value="4242 4242 4242 4242"></label><div class="two"><label class="field"><span class="lbl">' + t('card_exp') + '</span><input value="12 / 28"></label><label class="field"><span class="lbl">CVC</span><input value="123"></label></div>' : '')) +
      '<button class="cta" data-act="' + (free || site ? 'joinFree' : 'pay') + '">' + (free ? t('cta_free') : site ? t('cta_site_join') : t('pay_join', { price: kc(S.ev.price) })) + '</button>' +
      '<p class="fine">' + (site ? t('s_fine_site', { price: kc(S.ev.price) }) : t('s_fine')) + '</p>';
  };
  SH.paying = function () {
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px"> Pay</b><span class="fine">' + t('cancel') + '</span></div>' +
      '<div class="row" style="background:#fff"><span>PADELLEAGUE · ' + esc(evName()) + '</span><b>' + kc(S.ev.price) + '</b></div>' +
      '<div class="spinner" aria-hidden="true"></div><p class="fine">' + t('faceid') + '</p>';
  };
  SH.waitlist = function () {
    return '<div class="grab"></div><h2 class="h-mid">' + t('w_title') + '</h2><p class="p muted" style="font-size:14px">' + t('w_text', { name: esc(evName()) }) + '</p>' +
      '<label class="field"><span class="lbl">' + t('your_name') + '</span><input id="f-name" value="' + esc(S.me.name) + '"></label>' +
      '<label class="field"><span class="lbl">' + t('contact') + '</span><input id="f-contact" value="' + esc(S.me.contact) + '"></label>' +
      '<button class="cta navy" data-act="joinWait">' + t('w_cta', { n: S.waitlist.length + 1 }) + '</button><p class="fine">' + t('w_fine') + '</p>';
  };
  SH.cancel = function () {
    var who = S.waitlist[0] ? t('c_first', { n: esc(S.waitlist[0]) }) : t('c_next');
    return '<div class="grab"></div><h2 class="h-mid">' + t('c_title') + '</h2><p class="p muted" style="font-size:14px">' + t('c_text', { who: who, price: kc(S.ev.price) }) + '</p>' +
      '<button class="cta navy" data-act="cancelMe">' + t('c_give') + '</button><button class="link" data-act="close">' + t('c_keep') + '</button>';
  };
  SH.share = function () {
    var org = S.ctx === 'org';
    var msg = org ? chatMsg() : t('sh_pmsg', { name: evName(), date: evDate(), Left: cap1(P('spotsLeft', left())) });
    return '<div class="grab"></div><h2 class="h-mid">' + t(org ? 'sh_org' : 'sh_player') + '</h2>' +
      '<div class="bubble out" style="max-width:100%;align-self:stretch">' + esc(msg) + '<br><span class="wa-link">padelleague.eu/e/' + S.ev.slug + '</span></div>' +
      '<button class="cta wa" data-act="shareTo" data-arg="wa">' + WA_IC + t('sh_wa') + '</button><p class="fine" style="text-align:left">' + t('sh_note') + '</p><div class="share-grid"><button class="w" data-act="shareTo" data-arg="wa"><i>' + WA_IC + '</i>WhatsApp</button><button class="ig" data-act="shareTo" data-arg="ig"><i>◎</i>Stories</button><button data-act="shareTo" data-arg="copy"><i>⧉</i>' + t('copy_link') + '</button><button data-act="shareTo" data-arg="qr"><i>▦</i>' + t('qr') + '</button></div>' +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  SH.pmenu = function () {
    return '<div class="grab"></div>' + '<div style="display:flex;justify-content:flex-end">' + langSwitch() + '</div>' +
      '<button class="row" data-act="toast" data-arg="m_login_t"><span>' + t('m_login') + '</span><span class="r">' + t('m_optional') + '</span></button>' +
      '<button class="row" data-go="p-home"><span>' + t('all_events') + '</span><span class="r">▸</span></button>' +
      '<button class="row" data-go="p-reminder"><span>' + t('m_reminder') + '</span><span class="r">' + t('m_proto') + '</span></button>' +
      '<button class="row" data-act="toast" data-arg="m_thanks"><span>' + t('m_report') + '</span><span class="r">▸</span></button>' +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  function stripeLabel() { return t(S.stripe === 'active' ? 'active' : S.stripe === 'pending' ? 'pending' : 'not_connected'); }
  SH.omenu = function () {
    var it = D[lang].om_items;
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center"><div class="lbl">' + esc(orgLabel()) + '</div>' + langSwitch() + '</div>' +
      it.map(function (x, i) {
        if (i === 5) return '<button class="row" data-go="p-event"><span>' + x + '</span><span class="r">▸</span></button>';
        if (i === 1) return '<button class="row" data-act="toastRaw" data-arg="' + esc(t('om_pay_t', { s: stripeLabel() })) + '"><span>' + x + '</span><span class="pill ' + (S.stripe === 'active' ? 'ok' : 'wait') + '">' + stripeLabel() + '</span></button>';
        return '<button class="row" data-act="toastRaw" data-arg="' + esc(t('om_keep', { x: x })) + '"><span>' + x + '</span><span class="r">▸</span></button>';
      }).join('') + '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  SH.evmenu = function () {
    var here = S.players.filter(present).length;
    return '<div class="grab"></div>' +
      '<button class="row" data-act="editEvent"><span>' + t('em_edit') + '</span><span class="r">▸</span></button>' +
      '<button class="row" data-act="addPlayer"><span>' + t('em_add') + '</span><span class="r">+</span></button>' +
      '<button class="row" data-go="p-event"><span>' + t('em_view') + '</span><span class="r">▸</span></button>' +
      '<button class="row" data-act="sheet" data-arg="attend"><span>' + t('em_att') + '</span><span class="r">' + t('em_att_r', { n: here, t: S.players.length }) + ' ▸</span></button>' +
      '<button class="row" data-act="toast" data-arg="em_cancel_t"><span>' + t('em_cancel') + '</span><span class="r">▸</span></button>' +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  SH.attend = function () {
    return '<div class="grab"></div><h2 class="h-mid">' + t('at_title') + '</h2><p class="fine" style="text-align:left">' + t('at_fine') + '</p>' +
      S.players.map(function (p, i) { return '<button class="row" data-act="attend" data-arg="' + i + '"><span>' + esc(p.n) + '</span><span class="pill ' + (p.noshow ? 'site' : 'ok') + '">' + t(p.noshow ? 'noshow' : 'here') + '</span></button>'; }).join('') +
      '<button class="cta" data-act="close">' + t('at_done', { n: S.players.filter(present).length }) + '</button>';
  };
  SH.preview = function () {
    var d = S.draft, nm = d.custom || t('evName', { f: d.format });
    return '<div class="grab"></div><div class="lbl">' + t('pv_lbl') + '</div><div class="photo grain" style="min-height:260px"><img src="' + IMG + (d.photo || S.ev.photo) + '" alt=""><div class="over-title">' + esc(nm) + '</div>' +
      '<div class="glass">' + glassKV([[t('k_datetime'), fDate(d.week) + '\u00a0· ' + d.start, 1], [t('k_entry'), kc(d.price)], [t('k_spots'), P('players', d.cap)], [t('k_location'), d.venue, 1], [t('k_format'), d.format, 1]]) + '</div></div><button class="cta" data-act="close">' + t('pv_back') + '</button>';
  };
  /* Zadání skóre jako v PadelMixu: klepneš na číslo týmu, vybereš jeho body, druhý tým dostane zbytek */
  SH.score = function () {
    var tg = S.scoreTarget, mt = S.sched[tg[0]].m[tg[1]], side = tg[2] || 0, tm = side ? mt.b : mt.a, pts = S.cfg.pts, cur = S.play.scores[tg[0]][tg[1]], b = '';
    for (var i = 0; i <= pts; i++) b += '<button class="' + (cur && cur[side] === i ? 'on' : '') + '" data-act="setScore" data-arg="' + i + '">' + pad2(i) + '</button>';
    return '<div class="grab"></div><h2 class="h-mid" style="text-align:center">' + t('score_for', { a: esc(short(tm[0])), b: esc(short(tm[1])) }) + '</h2>' +
      '<div class="scores num">' + b + '</div><p class="fine">' + t('score_fine2', { n: pts }) + '</p>' +
      '<button class="link" style="color:var(--navy);font-weight:700;text-decoration:none" data-act="toast" data-arg="custom_t">' + t('custom_score') + '</button>' +
      '<button class="cta white" style="border:1px solid var(--line)" data-act="resetScore">' + t('reset_score') + '</button>';
  };
  /* Zadání čísla: na telefonu systémová číselná klávesnice, v prototypu na počítači napodobenina klávesnice iPhonu */
  var NP = { cap: { min: 4, max: 48, t: 'np_cap', u: function (n) { return P('players', n).replace(/^\S+\s*/, ''); } }, price: { min: 10, max: 2000, t: 'np_price', u: function () { return 'Kč'; } } };
  function touchDev() { return window.matchMedia('(pointer:coarse)').matches; }
  function npState() { var c = NP[S.np.k], n = +S.np.v, ok = S.np.v !== '' && n >= c.min && n <= c.max; return { c: c, n: n, ok: ok }; }
  SH.numpad = function () {
    var z = npState(), c = z.c, keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']];
    var pad = touchDev() ? '' : '<div class="kb" role="group" aria-label="' + t('np_kb') + '">' + keys.map(function (k) { return '<button type="button" data-act="npKey" data-arg="' + k[0] + '"><b>' + k[0] + '</b><small>' + k[1] + '</small></button>'; }).join('') +
      '<span></span><button type="button" data-act="npKey" data-arg="0"><b>0</b></button><button type="button" class="del" data-act="npDel" aria-label="' + t('np_del') + '">⌫</button></div>';
    return '<div class="grab"></div><div class="np-head"><button type="button" class="link" data-act="close">' + t('cancel') + '</button><b id="np-t">' + t(c.t) + '</b><button type="button" class="np-done" data-act="npDone"' + (z.ok ? '' : ' disabled') + '>' + t('np_done') + '</button></div>' +
      '<label class="np-field' + (S.np.v !== '' && !z.ok ? ' bad' : '') + '"><span class="sr">' + t(c.t) + '</span><input id="np-input" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" autocomplete="off" maxlength="4" value="' + esc(S.np.v) + '"' + (touchDev() ? '' : ' readonly') + ' aria-describedby="np-hint"><em>' + c.u(z.n || 0) + '</em></label>' +
      '<p class="np-hint" id="np-hint" role="status">' + (S.np.v !== '' && !z.ok ? '⚠ ' : '') + t('np_range', { a: c.min, b: kc(c.max).replace(/\s*Kč$/, '') }) + '</p>' + pad;
  };
  function npRefresh() {
    var z = npState(), sh = rootEl().querySelector('.sheet'); if (!sh) return;
    var inp = sh.querySelector('#np-input'); if (inp && inp.value !== S.np.v) inp.value = S.np.v;
    sh.querySelector('.np-done').disabled = !z.ok;
    sh.querySelector('.np-field').classList.toggle('bad', S.np.v !== '' && !z.ok);
    sh.querySelector('.np-field em').textContent = z.c.u(z.n || 0);
    sh.querySelector('#np-hint').textContent = (S.np.v !== '' && !z.ok ? '⚠ ' : '') + t('np_range', { a: z.c.min, b: kc(z.c.max).replace(/\s*Kč$/, '') });
  }
  SH.finish = function () {
    return '<div class="grab"></div><h2 class="h-mid">' + t('fin_title') + '</h2><p class="p muted" style="font-size:14.5px">' + t('fin_txt') + '</p>' +
      (allDone() ? '' : '<div class="note-box">' + t('fin_open', { k: P('toScore', doneCount()[1] - doneCount()[0]) }) + '</div>') +
      '<div class="dock-row"><button class="cta white" style="border:1px solid var(--line)" data-act="close">' + t('fin_keep') + '</button><button class="cta" data-act="finish">' + t('finish') + '</button></div>';
  };
  SH.board = function () {
    return '<div class="grab"></div><h2 class="h-mid" style="text-align:center">' + t('board') + '</h2>' + standTable(standings()) +
      '<p class="fine" style="text-align:left">' + t('board_note') + '</p>' +
      '<button class="row" data-act="sheet" data-arg="breakdown"><span>▦ ' + t('breakdown') + '</span><span class="r">▸</span></button><button class="link" data-act="close">' + t('close') + '</button>';
  };
  function roundCell(n, r) {
    var rd = S.sched[r], res = null;
    rd.m.forEach(function (mt, c) { var sc = S.play.scores[r][c]; var side = mt.a.indexOf(n) > -1 ? 0 : mt.b.indexOf(n) > -1 ? 1 : -1; if (side > -1) res = sc ? [sc[side], sc[side] > sc[1 - side] ? 'W' : sc[side] < sc[1 - side] ? 'L' : 'T'] : ['–', '']; });
    if (!res) return '<td class="rest" title="' + t('rest_ic') + '">⏸</td>';
    return '<td><b>' + res[0] + '</b><i class="' + res[1] + '">' + (res[1] ? t('t_' + res[1].toLowerCase()) : '') + '</i></td>';
  }
  SH.breakdown = function () {
    var st = standings();
    return '<div class="grab"></div><h2 class="h-mid" style="text-align:center">' + t('breakdown') + '</h2><div class="bd-wrap"><table class="bd"><thead><tr><th>#</th><th></th>' + S.sched.map(function (_, r) { return '<th>K' + (r + 1) + '</th>'; }).join('') + '<th>' + t('d_points') + '</th></tr></thead><tbody>' +
      st.map(function (p, i) { return '<tr><td>' + (i + 1) + '</td><td class="nm">' + esc(short(p.n)) + '</td>' + S.sched.map(function (_, r) { return roundCell(p.n, r); }).join('') + '<td class="pts">' + p.pts + '</td></tr>'; }).join('') +
      '</tbody></table></div><button class="link" data-act="sheet" data-arg="board">← ' + t('board') + '</button>';
  };
  function fakeQR(seed) {
    function fin(x, y) { var ox = x < 7 ? 0 : x > 13 ? 14 : -1, oy = y < 7 ? 0 : y > 13 ? 14 : -1; if (ox < 0 || oy < 0 || (ox === 14 && oy === 14)) return -1; var dx = x - ox, dy = y - oy; return (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5)) ? 1 : 0; }
    var cells = '';
    for (var y = 0; y < 21; y++) for (var x = 0; x < 21; x++) { var f = fin(x, y), on = f === -1 ? hash(seed + ':' + x + ':' + y) % 2 === 0 : f === 1; cells += '<i' + (on ? ' class="on"' : '') + '></i>'; }
    return '<div class="qr" aria-hidden="true">' + cells + '</div>';
  }
  SH.live = function () {
    var url = 'padelleague.eu/e/' + S.ev.slug + '/live';
    return '<div class="grab"></div><h2 class="h-mid" style="text-align:center">' + t('live_t') + '</h2><p class="fine">' + t('live_txt') + '</p>' + fakeQR(url) +
      '<div class="field"><span class="lbl">' + t('live_link') + '</span><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px">' + url + '</b><button class="link" style="padding:0" data-act="shareTo" data-arg="copy">⧉</button></div></div>' +
      '<button class="cta" data-act="shareTo" data-arg="wa">⤴ ' + t('live_share') + '</button>';
  };
  /* Zajímavosti po eventu (PadelMix: Tournament highlights) */
  function highlights() {
    var streak = { n: '', k: 0 }, big = { d: -1 }, top = { n: '', k: 0 };
    var cur = {};
    S.sched.forEach(function (rd, r) {
      rd.m.forEach(function (mt, c) {
        var sc = S.play.scores[r][c]; if (!sc) return;
        var d = Math.abs(sc[0] - sc[1]); if (d > big.d) big = { d: d, w: sc[0] > sc[1] ? mt.a : mt.b, s: Math.max(sc[0], sc[1]) + ':' + Math.min(sc[0], sc[1]), r: r + 1 };
        [[mt.a, sc[0] > sc[1]], [mt.b, sc[1] > sc[0]]].forEach(function (x) { x[0].forEach(function (n) { cur[n] = x[1] ? (cur[n] || 0) + 1 : 0; if (cur[n] > streak.k) streak = { n: n, k: cur[n] }; }); });
      });
    });
    if (big.d < 0) return [];
    standings().forEach(function (p) { var avg = p.z ? Math.round(p.pts / p.z * 10) / 10 : 0; if (avg > top.k) top = { n: p.n, k: avg }; });
    return [['🔥', t('hl_streak'), t('hl_streak_t', { n: esc(short(streak.n)), k: streak.k })],
      ['◎', t('hl_big'), t('hl_big_t', { a: esc(short(big.w[0])) + ' & ' + esc(short(big.w[1])), s: big.s, r: big.r })],
      ['★', t('hl_top'), t('hl_top_t', { n: esc(short(top.n)), k: String(top.k).replace('.', lang === 'cs' ? ',' : '.') })]];
  }
  SH.launch = function () {
    var here = S.players.filter(present).length, m = S.sched.reduce(function (x, rd) { return x + rd.m.length; }, 0), pc = payCounts();
    return '<div class="grab"></div><div class="check" aria-hidden="true" style="width:52px;height:52px;font-size:24px">✓</div><h2 class="h-mid">' + t('ln_title') + '</h2><p class="p muted" style="font-size:14px">' + t('ln_txt') + '</p>' +
      '<div class="seg3"><div><b>' + here + '</b><span>' + t('ln_players') + '</span></div><div><b>' + m + '</b><span>' + t('ln_matches') + '</span></div><div><b>' + S.sched.length + '</b><span>' + t('ln_rounds') + '</span></div></div>' +
      '<div class="note-box">' + t('ln_warn') + '</div>' +
      '<div class="check-box"><span class="ok">' + t('ln_ck1') + '</span><span class="ok">' + t('ln_ck2') + '</span><span class="ok">' + t('ck_pay', { a: pc.paid, b: pc.site, c: pc.unpaid }) + '</span><span class="ok">' + t('es_e4') + ' ≈ ' + S.sched.length * 10 + ' min</span></div>' +
      '<button class="cta" data-act="startPlay">▶ ' + t('ln_cta') + '</button><button class="link" data-act="close">' + t('back') + '</button>';
  };
  SH.livemenu = function () {
    return '<div class="grab"></div>' + ['lm_pause', 'lm_fix', 'lm_set'].map(function (k) { return '<button class="row" data-act="toast" data-arg="lm_t"><span>' + t(k) + '</span><span class="r">▸</span></button>'; }).join('') +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };



  /* ---------- AKCE ---------- */
  function val(id, d) { var el = document.getElementById(id); return el && el.value.trim() ? el.value.trim() : d; }
  function closeSheet() { S.sheet = null; render(); }
  function readDraft() {
    if (!S.draft) return;
    var w = document.getElementById('d-week'); if (w) S.draft.week = +w.value;
    S.draft.start = val('d-start', S.draft.start); S.draft.venue = val('d-venue', S.draft.venue);
    var nm = document.getElementById('d-name');
    if (nm) { var v = nm.value.trim(); S.draft.custom = v && v !== t('evName', { f: S.draft.format }) ? v : null; }
  }
  var A = {
    lang: function (a) { setLang(a); syncPanelLang(); },
    sheet: function (a) { S.sheet = a; render(); },
    hf: function (a) {
      if (a === 'reset') S.hf = { city: 'all', when: 'all', free: false };
      else if (a === 'free:1') S.hf.free = !S.hf.free;
      else { var p = a.split(':'); S.hf[p[0]] = p[1]; }
      render();
    },
    pastOpen: function () { S.pastOpen = !S.pastOpen; render(); },
    more2: function () { readDraft(); S.more2 = !S.more2; render(); },
    more3: function () { readDraft(); S.more3 = !S.more3; render(); },
    shareWA: function () { S.sheet = null; toast(t('opening_wa')); },
    pick: function (id) {
      if (id !== S.pick) {
        var e = HE.filter(function (x) { return x.id === id; })[0], b = fresh().ev;
        ['format', 'start', 'venue', 'address', 'price', 'cap', 'photo', 'slug', 'level'].forEach(function (k) { S.ev[k] = e[k]; });
        S.ev.nm = e.nm; S.ev.when = e.when; S.ev.org = e.org; S.ev.custom = null;
        if (id === 'pa') { S.ev.week = b.week; S.ev.courts = b.courts; }
        S.players = mkPlayers(Math.min(e.n, e.cap)); S.waitlist = e.n >= e.cap ? [NAMES[16], NAMES[17], NAMES[18]] : [];
        S.me.status = null; S.sched = null; S.pick = id;
      }
      go('p-event');
    },
    close: closeSheet,
    acc: function () { S.acc = !S.acc; render(); },
    accNames: function () { S.accNames = !S.accNames; render(); },
    allNames: function () { S.allNames = true; render(); },
    toast: function (k) { S.sheet = null; toast(t(k)); },
    toastRaw: function (m) { S.sheet = null; toast(m); },
    method: function (a) { S.method = a; render(); },
    pay: function () {
      S.me.name = val('f-name', S.me.name); S.me.contact = val('f-contact', S.me.contact);
      if (S.method === 'card') { S.me.status = 'in'; S.sheet = null; go('p-in'); return; }
      S.sheet = 'paying'; render();
      setTimeout(function () { S.me.status = 'in'; S.sheet = null; go('p-in'); }, 1400);
    },
    joinFree: function () { S.me.name = val('f-name', S.me.name); S.me.contact = val('f-contact', S.me.contact); S.me.status = 'in'; S.sheet = null; go('p-in'); },
    joinWait: function () { S.me.name = val('f-name', S.me.name); S.waitlist.push(S.me.name); S.me.status = 'wait'; S.sheet = null; toast(t('w_toast', { n: S.waitlist.length })); },
    leaveWait: function () { S.waitlist = S.waitlist.filter(function (n) { return n !== S.me.name; }); S.me.status = null; toast(t('w_left')); },
    cancelMe: function () {
      S.me.status = null; S.sheet = null;
      if (S.waitlist.length) { var n = S.waitlist.shift(); S.players.push({ n: n, pay: 'unpaid', noshow: false }); toast(t('c_toast1', { n: n })); }
      else toast(t('c_toast2'));
      go('p-event');
    },
    share: function (a) { S.ctx = a; S.sheet = 'share'; render(); },
    shareTo: function (a) {
      var url = location.origin + location.pathname + '#/p-event';
      if (a === 'copy') { try { if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {}); } catch (e) { /* */ } S.sheet = null; toast(t('copied')); return; }
      S.sheet = null; toast(t({ wa: 'opening_wa', ig: 'opening_ig', qr: 'qr_ready' }[a]));
    },
    signup: function () { S.account = true; if (S.pendingPub) A.publish(); else go('o-home'); },
    wz: function (a) { readDraft(); S.wz = +a; render(); var sc = rootEl().querySelector('.scroll'); if (sc) sc.scrollTop = 0; },
    wzNext: function () { A.wz(Math.min(3, S.wz + 1)); },
    dtype: function (a) { readDraft(); S.draft.type = a; render(); },
    dvar: function (a) { readDraft(); S.draft.variant = a; render(); },
    ddead: function (a) { readDraft(); S.draft.deadline = a; render(); },
    dcap: function (a) { readDraft(); S.draft.cap = +a; render(); },
    ddur: function (a) { readDraft(); S.draft.dur = a; render(); },
    dplace: function (a) { readDraft(); S.draft.place = a; if (a === 'club' && CLUBS.indexOf(S.draft.venue) < 0) S.draft.venue = CLUBS[0]; render(); },
    dgen: function (a) { readDraft(); S.draft.gender = a; render(); },
    dforce: function () { readDraft(); S.draft.force = !S.draft.force; render(); },
    dvis: function (a) { readDraft(); S.draft.vis = a; render(); },
    dpaid: function (a) { readDraft(); S.draft.price = a === 'free' ? 0 : (S.draft.price || 200); render(); },
    cfg: function (a) { var p = a.split(':'), k = p[0], c = S.cfg; c[k] = Math.max(1, Math.min(k === 'rounds' ? maxRounds() : 8, c[k] + (+p[1]))); render(); },
    cfgmode: function (a) { S.cfg.mode = a; render(); },
    cfgpts: function (a) { S.cfg.pts = +a; render(); },
    dpay: function (a) { readDraft(); S.draft.pay = a; render(); },
    dphoto: function (a) { readDraft(); S.draft.photo = a; render(); },
    community: function () {
      S.community = val('c-name', S.community); S.city = val('c-city', S.city); S.hasComm = true;
      toast(t('co_done', { c: S.community })); go('o-home');
    },
    newEvent: function () { S.draft = null; S.wz = 0; go('o-new'); },
    format: function (a) { readDraft(); S.draft.format = a; S.draft.custom = null; render(); },
    numpad: function (a) {
      readDraft(); S.np = { k: a, v: String(S.draft[a]) }; S.sheet = 'numpad'; render();
      var i = rootEl().querySelector('#np-input'); if (i && touchDev()) { i.focus(); i.select(); }
    },
    npKey: function (d) { if (S.np.v.length >= 4) return; S.np.v = (S.np.v === '0' ? '' : S.np.v) + d; npRefresh(); },
    npDel: function () { S.np.v = S.np.v.slice(0, -1); npRefresh(); },
    npDone: function () { var z = npState(); if (!z.ok) return; S.draft[S.np.k] = z.n; if (S.np.k === 'cap' && S.draft.min > z.n) S.draft.min = z.n; S.sheet = null; render(); },
    step: function (a) {
      readDraft();
      var p = a.split(':'), k = p[0], v = +p[1], d = S.draft;
      d[k] = Math.max(k === 'cap' ? 4 : k === 'courts' ? 1 : k === 'min' ? 2 : k === 'price' ? 10 : 0, Math.min(k === 'cap' ? 48 : k === 'courts' ? 8 : k === 'min' ? d.cap : 2000, d[k] + v));
      render();
    },
    connectStripe: function (a) { readDraft(); S.stripeBack = a || 'o-new'; S.stripeStep = 0; go('o-stripe'); },
    stripeNext: function () { if (S.stripeStep === 0) { S.stripeStep = 1; render(); } else { S.stripe = 'active'; go(S.stripeBack); toast(t('stripe_on')); } },
    publish: function () {
      readDraft();
      var d = S.draft;
      if (!d.edit && !S.account) { S.pendingPub = true; go('o-signup'); return; }
      var edit = d.edit;
      ['custom', 'format', 'week', 'start', 'venue', 'courts', 'cap', 'price', 'pay', 'type', 'photo', 'deadline'].forEach(function (k) { S.ev[k] = d[k]; });
      S.cfg.courts = d.courts;
      S.ev.nm = null; S.ev.when = null; S.ev.org = null; S.ev.level = 'all'; S.pick = 'pa';
      S.draft = null; S.pendingPub = false; S.wz = 0;
      if (edit) { if (S.sched && !anyScore()) buildSched(); toast(t('n_saved')); go('o-manage'); return; }
      S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live');
    },
    fastForward: function () {
      var n = Math.max(0, S.ev.cap - 2), off = S.ev.week % 3;
      S.players = [];
      for (var i = 0; i < n; i++) S.players.push({ n: NAMES[(i + off) % NAMES.length], pay: cardPay() ? PAYS[i % PAYS.length] : (i % 5 === 4 ? 'unpaid' : 'site'), noshow: false });
      S.posted = true; toast(t('demo_signups_t', { n: n }));
    },
    cyclePay: function (a) { var p = S.players[+a], order = ['unpaid', 'paid', 'site']; p.pay = order[(order.indexOf(p.pay) + 1) % 3]; if (S.last && location.hash.indexOf('o-after') > -1) S.last = summary(); render(); },
    remind: function (a) { var p = S.players[+a]; toast(t('remind_t', { n: p ? p.n.split(' ')[0] : '' })); },
    moveIn: function (a) {
      if (S.players.length >= S.ev.cap) { toast(t('movein_full')); return; }
      var n = S.waitlist.splice(+a, 1)[0]; S.players.push({ n: n, pay: 'unpaid', noshow: false }); toast(t('movein_t', { n: n.split(' ')[0] }));
    },
    addPlayer: function () {
      if (S.players.length >= S.ev.cap) { S.sheet = null; toast(t('full_t')); return; }
      S.players.push({ n: NAMES[(S.players.length + 3) % NAMES.length].split(' ')[0] + ' ' + t('added_by_you'), pay: 'site', noshow: false }); S.sheet = null; toast(t('added_t'));
    },
    attend: function (a) { var p = S.players[+a]; p.noshow = !p.noshow; if (S.sched && !anyScore()) buildSched(); render(); },
    editEvent: function () { S.sheet = null; S.draft = newDraft(S.ev.week); S.draft.edit = true; S.wz = 0; go('o-new'); },
    buildSchedule: function () { if (!S.sched || !anyScore()) buildSched(); go('o-schedule'); },
    reshuffle: function () { S.shuffle++; buildSched(); toast(t('new_sched')); },
    startPlay: function () { S.sheet = null; go('o-play'); },
    round: function (a) { S.play.round = Math.max(0, Math.min(S.sched.length - 1, +a)); render(); var sc = rootEl().querySelector('.scroll'); if (sc) sc.scrollTop = 0; },
    score: function (a) { var p = a.split(':'); S.scoreTarget = [+p[0], +p[1], +(p[2] || 0)]; S.sheet = 'score'; render(); },
    resetScore: function () { var tg = S.scoreTarget; S.play.scores[tg[0]][tg[1]] = null; S.sheet = null; render(); },
    addRound: function () {
      var old = S.play.scores, cur = S.play.round; S.cfg.rounds++; buildSched();
      old.forEach(function (rd, i) { S.play.scores[i] = rd; }); S.play.round = cur + 1; toast(t('added_round', { n: S.sched.length }));
    },
    demoTry: function () { S.players = mkPlayers(9); S.cfg.courts = 2; S.cfg.rounds = 5; S.sched = null; buildSched(); go('o-play'); },
    setScore: function (a) {
      var tg = S.scoreTarget, v = +a, o = S.cfg.pts - v; S.play.scores[tg[0]][tg[1]] = tg[2] ? [o, v] : [v, o]; S.sheet = null; render();
    },

    autofill: function () { fillScores(); render(); },
    finish: function () { S.sheet = null; S.last = summary(); go('o-after'); },
    nextEvent: function () { go('o-next'); },
    editNext: function () { S.draft = newDraft(S.ev.week + 1); S.wz = 0; go('o-new'); },
    cardAll: function () { toast(t('cd_all_t', { n: S.last.showed })); },
    publishNext: function () {
      S.ev.week += 1; S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live');
    }
  };
  function anyScore() { return S.sched && S.play.scores.some(function (rd) { return rd.some(function (x) { return x; }); }); }

  /* ---------- PRESETY (panel vlevo) ---------- */
  var PRESETS = {
    open: function () { S.players = mkPlayers(9); S.waitlist = []; S.me.status = null; S.sched = null; },
    last: function () { S.players = mkPlayers(14); S.waitlist = []; S.me.status = null; S.sched = null; },
    full: function () { S.players = mkPlayers(16); S.waitlist = [NAMES[16], NAMES[17], NAMES[18]]; S.me.status = null; S.sched = null; },
    'in': function () { if (S.players.length >= S.ev.cap) S.players = mkPlayers(9); S.me.status = 'in'; },
    paid: function () { S.ev.price = 200; }, free: function () { S.ev.price = 0; },
    stripeOn: function () { S.stripe = 'active'; }, stripeOff: function () { S.stripe = 'none'; },
    cs: function () { setLang('cs'); }, en: function () { setLang('en'); },
    reset: function () { S = fresh(); }
  };

  /* ---------- RENDER ---------- */
  var app = document.getElementById('app'), device = document.querySelector('.device');
  var web = document.getElementById('web'), view = web ? web.querySelector('.web-view') : null, urlEl = web ? web.querySelector('.web-url') : null;
  var mode = 'desktop';
  try { var qm = new URLSearchParams(location.search).get('mode'); mode = qm === 'mobile' || qm === 'desktop' ? qm : (localStorage.getItem('pl-app-mode') || 'desktop'); } catch (e) { /* bez úložiště */ }
  function wideDesk() { return mode === 'desktop' && !!view && window.innerWidth > 820; }
  function isDesk(r) { r = r || route(); return wideDesk() && (r === 'start' || r.indexOf('p-') === 0); }
  function rootEl() { return isDesk() ? view : app; }
  function setMode(m) { mode = m; try { localStorage.setItem('pl-app-mode', m); } catch (e) { /* */ } render(); }

  /* ---------- DESKTOP: obal podle typu obrazovky ---------- */
  var ORG_NAV = [['o-home', 'dk_home', '⌂'], ['o-new', 'dk_new', '+'], ['o-manage', 'dk_players', '☰'], ['o-schedule', 'dk_sched', '▦'], ['o-play', 'dk_play', '▶'], ['o-after', 'dk_after', '★'], ['o-next', 'dk_next', '↻'], ['o-card', 'dk_card', '◎']];
  function kind(r) {
    if (r === 'p-reminder') return 'mail';
    if (r === 'p-chat') return 'wa';
    if (r === 'o-signup' || r === 'o-community' || r === 'o-stripe') return 'auth';
    if (r.indexOf('o-') === 0) return 'org';
    return 'site';
  }
  function deskUrl(r) {
    var k = kind(r), slug = S.community.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    if (k === 'wa') return 'web.whatsapp.com';
    if (k === 'mail') return t('mail_url');
    if (r === 'o-stripe') return 'connect.stripe.com/setup';
    if (k === 'auth') return 'app.padelleague.eu/' + (r === 'o-signup' ? 'registrace' : 'nova-komunita');
    if (k === 'org') return 'app.padelleague.eu/' + slug + '/' + ({ 'o-home': '', 'o-new': 'novy-event', 'o-live': 'event/' + S.ev.slug, 'o-manage': 'event/' + S.ev.slug + '/hraci', 'o-schedule': 'event/' + S.ev.slug + '/rozpis', 'o-play': 'event/' + S.ev.slug + '/zive', 'o-after': 'event/' + S.ev.slug + '/souhrn', 'o-after-d': 'event/' + S.ev.slug + '/souhrn', 'o-next': 'dalsi-event', 'o-card': 'event/' + S.ev.slug + '/karta' }[r] || '');
    if (r === 'start') return 'padelleague.eu/prototyp';
    if (r === 'p-home') return 'padelleague.eu';
    return 'padelleague.eu/e/' + S.ev.slug;
  }
  function deskShell(r, inner) {
    var k = kind(r);
    if (k === 'org') {
      var cur = r === 'o-after-d' ? 'o-after' : r;
      return '<div class="dk-org"><aside class="dk-side"><div class="dk-brand">' + (window.PL_LOGO ? window.PL_LOGO.full : 'PadelLeague') + '</div><div class="dk-comm"><b>' + esc(orgLabel()) + '</b><span>' + esc(S.city) + '</span></div><nav>' +
        ORG_NAV.map(function (n) { return '<button class="' + (n[0] === cur ? 'on' : '') + '" data-go="' + n[0] + '"><span>' + n[2] + '</span>' + t(n[1]) + '</button>'; }).join('') +
        '</nav><span class="dk-sp"></span><button class="dk-view" data-go="p-event">' + t('em_view') + ' ↗</button><div class="dk-lang">' + langSwitch() + '</div></aside>' +
        '<div class="dk-main r-' + r + '">' + inner + '</div></div>';
    }
    if (k === 'wa') {
      var chats = [['Padel Teplice 🎾', '18:40', 1], ['Klára', 'út', 0], ['Tomáš Novák', 'po', 0], ['Rodina 🏡', 'ne', 0]];
      return '<div class="dk-wa"><aside class="dk-wa-list"><div class="dk-wa-h"><b>Chaty</b></div><div class="dk-wa-search">Hledat</div>' +
        chats.map(function (c) { return '<div class="dk-wa-chat' + (c[2] ? ' on' : '') + '"><i>' + esc(c[0].charAt(0)) + '</i><span><b>' + esc(c[0]) + '</b><small>' + (c[2] ? '…' : '') + '</small></span><em>' + c[1] + '</em></div>'; }).join('') +
        '</aside><div class="dk-main r-' + r + '">' + inner + '</div></div>';
    }
    if (k === 'mail') return '<div class="dk-mail"><aside class="dk-mail-list"><b>' + t('mail_inbox') + '</b><div class="on"><b>PadelLeague</b><small>' + t('mail_subj', { name: esc(evName()) }) + '</small></div><div><b>Klub Novosedlice</b><small>' + t('mail_other') + '</small></div></aside><div class="dk-main r-' + r + '">' + inner + '</div></div>';
    if (k === 'auth') return '<div class="dk-auth"><div class="dk-main r-' + r + '">' + inner + '</div></div>';
    return '<div class="dk-site"><header class="dk-head"><button class="logo svg" data-go="p-home" aria-label="PadelLeague">' + (window.PL_LOGO ? window.PL_LOGO.full : 'Padel League') + '</button><nav class="dk-nav"><button class="' + (r === 'p-home' ? 'on' : '') + '" data-go="p-home">' + t('nav_events') + '</button><button data-go="o-new">' + t('nav_org') + '</button></nav><span class="dk-head-r">' + langSwitch() + '<button class="dk-login" data-act="toast" data-arg="m_login_t">' + t('m_login') + '</button></span></header><div class="dk-main r-' + r + '">' + inner + '</div></div>';
  }
  function route() { var h = location.hash.replace(/^#\/?/, ''); return R[h] ? h : 'start'; }
  function render() {
    var r = route();
    if (r === 'o-new' && !S.orgMode) orgReset();
    if ((r === 'o-after' || r === 'o-after-d' || r === 'o-card' || r === 'o-community') && !S.last) demoFinished();
    if (r === 'o-setup' && S.players.length < 4) S.players = mkPlayers(14);
    if ((r === 'o-schedule' || r === 'o-play') && !S.sched) { if (S.players.length < 4) S.players = mkPlayers(14); buildSched(); }
    var desk = isDesk(r);
    var note = document.querySelector('.mode-note'); if (note) { note.hidden = !(wideDesk() && !desk); note.textContent = t('org_phone_note'); }
    document.body.classList.toggle('mode-desktop', desk);
    document.body.classList.toggle('mode-mobile', !desk);
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === mode); });
    if (device) device.classList.toggle('wide', !desk && r === 'o-after-d');
    var html = R[r]();
    if (S.sheet && SH[S.sheet]) html += '<div class="overlay" data-act="' + (S.sheet === 'paying' ? '' : 'close') + '"></div><div class="sheet' + (S.sheet === 'paying' ? ' paysheet' : '') + '" role="dialog" aria-modal="true">' + SH[S.sheet]() + '</div>';
    if (S.toast) html += '<div class="toast" role="status"><span>✓</span><span>' + esc(S.toast) + '</span></div>';
    if (desk) {
      app.innerHTML = '';
      view.innerHTML = deskShell(r, html);
      if (urlEl) urlEl.textContent = deskUrl(r);
    } else {
      if (view) view.innerHTML = '';
      app.innerHTML = html;
    }
    document.querySelectorAll('[data-route]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-route') === r); });
    document.querySelectorAll('[data-preset-grp]').forEach(syncPresetButtons);
  }
  function syncPresetButtons(grp) {
    var g = grp.getAttribute('data-preset-grp'), cur;
    if (g === 'fill') cur = S.me.status === 'in' ? 'in' : (left() === 0 ? 'full' : left() <= 2 ? 'last' : 'open');
    if (g === 'price') cur = S.ev.price ? 'paid' : 'free';
    if (g === 'stripe') cur = S.stripe === 'active' ? 'stripeOn' : 'stripeOff';
    if (g === 'lang') cur = lang;
    grp.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-preset') === cur); });
  }
  function syncPanelLang() {
    document.querySelectorAll('a[href^="landing.html"]').forEach(function (a) { a.setAttribute('href', 'landing.html?lang=' + lang); });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go],[data-act],[data-preset],[data-panel],[data-mode]');
    if (!el) return;
    if (el.hasAttribute('data-mode')) { setMode(el.getAttribute('data-mode')); return; }
    if (el.hasAttribute('data-panel')) { document.querySelector('.panel').classList.toggle('open'); return; }
    if (el.hasAttribute('data-preset')) { PRESETS[el.getAttribute('data-preset')](); syncPanelLang(); render(); return; }
    if (el.hasAttribute('data-go')) { e.preventDefault(); S.sheet = null; go(el.getAttribute('data-go')); return; }
    var a = el.getAttribute('data-act');
    if (a && A[a]) { e.preventDefault(); A[a](el.getAttribute('data-arg')); }
  });
  document.querySelectorAll('.panel a[data-route]').forEach(function (a) { a.addEventListener('click', function () { document.querySelector('.panel').classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet && S.sheet !== 'paying') closeSheet(); });
  document.addEventListener('input', function (e) { if (e.target.id === 'np-input' && S.np) { S.np.v = e.target.value.replace(/\D/g, '').slice(0, 4); npRefresh(); } });
  document.addEventListener('keydown', function (e) {
    if (S.sheet !== 'numpad' || !S.np) return;
    if (e.target.id === 'np-input' && !e.target.readOnly) { if (e.key === 'Enter') { e.preventDefault(); A.npDone(); } return; }
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); A.npKey(e.key); } else if (e.key === 'Backspace') { e.preventDefault(); A.npDel(); } else if (e.key === 'Enter') { e.preventDefault(); A.npDone(); }
  });
  window.addEventListener('hashchange', function () { S.sheet = null; render(); var sc = rootEl().querySelector('.scroll,.d-main'); if (sc) sc.scrollTop = 0; });
  var lastDesk = null;
  window.addEventListener('resize', function () { var d = wideDesk(); if (d !== lastDesk) { lastDesk = d; render(); } });
  document.documentElement.lang = lang;
  syncPanelLang();
  render();
})();
