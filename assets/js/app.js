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
    return s;
  }
  function P(k, n) { var f = D[lang][k], i = lang === 'cs' ? (n === 1 ? 0 : (n >= 2 && n <= 4 ? 1 : 2)) : (n === 1 ? 0 : 1); return f[i].split('{n}').join(n); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- datum ---------- */
  function dm(w) { var d = 30 + 7 * w, m = 10; if (d > 31) { d -= 31; m = 11; } return { d: d, m: m }; }
  function fDate(w) { var x = dm(w); return lang === 'cs' ? t('day_short') + ' ' + x.d + '. ' + x.m + '.' : t('day_short') + ' ' + x.d + ' ' + (x.m === 10 ? 'Oct' : 'Nov'); }
  function fLong(w) { var x = dm(w); return lang === 'cs' ? t('day_long') + ' ' + x.d + '. ' + D.cs.months_long[x.m] : t('day_long') + ' ' + x.d + ' ' + D.en.months_long[x.m]; }
  function fClose(w) { var x = dm(w), d = x.d - 1, m = x.m; if (d < 1) { d = 31; m = 10; } return lang === 'cs' ? t('day_close') + ' ' + d + '. ' + m + '., 18:00' : t('day_close') + ' ' + d + ' ' + (m === 10 ? 'Oct' : 'Nov') + ', 18:00'; }
  function fCard(w) { var x = dm(w); return lang === 'cs' ? x.d + '. ' + x.m + '. 2026' : x.d + ' ' + (x.m === 10 ? 'Oct' : 'Nov') + ' 2026'; }

  /* ---------- stav ---------- */
  var S;
  function fresh() {
    return {
      ev: { custom: null, format: 'Americano', week: 0, start: '18:00', venue: 'Padel Klub Novosedlice', address: 'Trnovanská 123, Teplice',
        courts: 4, cap: 16, price: 200, slug: 'patecni-americano', photo: 'court-orange-close.jpg' },
      players: mkPlayers(9), waitlist: [],
      me: { name: 'Jana Malá', contact: '+420 777 123 456', status: null },
      method: 'apple', stripe: 'none', stripeBack: 'o-new', community: 'Kuba komunity', city: 'Teplice',
      draft: null, more: false, acc: false, allNames: false, shuffle: 0,
      sched: null, play: { round: 0, scores: [] }, last: null, invitePrev: true,
      sheet: null, ctx: 'player', scoreTarget: null, toast: null, stripeStep: 0, posted: false
    };
  }
  function mkPlayers(n) { var a = []; for (var i = 0; i < n; i++) a.push({ n: NAMES[i], pay: PAYS[i % PAYS.length], noshow: false }); return a; }
  S = fresh();

  /* ---------- pomocné ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function short(n) { var p = n.split(' '); return p[0] + (p[1] && p[1][0] !== '(' ? ' ' + p[1][0] + '.' : ''); }
  function kc(n) { return n === 0 ? t('free') : n.toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč'; }
  function evName() { return S.ev.custom || t('evName', { f: S.ev.format }); }
  function evDate() { return fDate(S.ev.week); }
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
  var LOGO = '<span class="logo"><i></i>Padel League</span>';
  function glassKV(pairs) { return pairs.map(function (p) { return '<div class="kv' + (p[2] ? ' full' : '') + '"><div class="l">' + p[0] + '</div><div class="v">' + esc(p[1]) + '</div></div>'; }).join(''); }
  function screen(cls, inner) { return '<div class="screen ' + (cls || '') + '">' + inner + '</div>'; }
  function go(r) { if (location.hash === '#/' + r) render(); else location.hash = '/' + r; }
  function toast(m) { S.toast = m; render(); clearTimeout(toast.h); toast.h = setTimeout(function () { S.toast = null; render(); }, 2600); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function chatMsg() { return t('chat_msg', { format: S.ev.format, date: evDate(), start: S.ev.start, venue: S.ev.venue, cap: S.ev.cap, price: kc(S.ev.price) }); }

  var R = {};

  /* ---------- START ---------- */
  R.start = function () {
    return screen('dark', status() +
      '<div class="scroll" style="padding-top:26px;gap:18px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' + LOGO + langSwitch() + '</div>' +
      '<h1 class="h-caps">' + t('start_title') + '</h1>' +
      '<p class="p muted">' + t('start_sub') + '</p>' +
      '<button class="row start-row" data-go="p-chat"><span><b>' + t('start_player') + '</b><span class="sub">' + t('start_player_sub') + '</span></span><span class="r">→</span></button>' +
      '<button class="row start-row" data-go="o-signup"><span><b>' + t('start_org') + '</b><span class="sub">' + t('start_org_sub') + '</span></span><span class="r">→</span></button>' +
      '<a class="row start-row" href="landing.html?lang=' + lang + '" style="text-decoration:none"><span><b>' + t('start_land') + '</b><span class="sub">' + t('start_land_sub') + '</span></span><span class="r">↗</span></a>' +
      '<a class="row start-row" href="instagram/index.html" style="text-decoration:none"><span><b>' + t('start_ig') + '</b><span class="sub">' + t('start_ig_sub') + '</span></span><span class="r">↗</span></a>' +
      '</div>');
  };
  function langSwitch() {
    return '<span class="lang-sw" role="group" aria-label="' + t('lang_label') + '"><button class="' + (lang === 'cs' ? 'on' : '') + '" data-act="lang" data-arg="cs">CZ</button><button class="' + (lang === 'en' ? 'on' : '') + '" data-act="lang" data-arg="en">EN</button></span>';
  }

  /* ---------- HRÁČ ---------- */
  R['p-chat'] = function () {
    return screen('wa', status('18:40') +
      '<div class="top">' + ib('←', 'data-go="start"', 'back') + '<div class="ttl wa-ttl">Padel Teplice 🎾<br><span>' + t('chat_members') + '</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px">' +
      '<div class="sysmsg">' + t('today') + '</div>' +
      '<div class="bubble in"><div class="who">' + t('chat_org') + '</div>' +
      '<button class="prev" data-go="p-event"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(evName()) + '</b>' + t('chat_prev', { date: evDate(), price: kc(S.ev.price), n: going(), cap: S.ev.cap }) + '</div></button>' +
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
    var badge = { open: '<span class="pill glassy">' + t('b_open') + '</span>', last: '<span class="pill hot">' + t('b_last', { n: l }) + '</span>', full: '<span class="pill glassy">' + t('b_full') + '</span>',
      'in': '<span class="pill ok">' + t('b_in') + '</span>', wait: '<span class="pill wait">' + t('b_wait', { n: S.waitlist.indexOf(S.me.name) + 1 }) + '</span>' }[st];
    var who = S.players.slice(0, 5).map(function (p) { return '<span class="av">' + initials(p.n) + '</span>'; }).join('') + (n > 5 ? '<span class="av">+' + (n - 5) + '</span>' : '');
    var line = (st === 'full' || st === 'wait') ? t('full_waiting', { w: S.waitlist.length }) : t('going', { n: n }) + ' · ' + P('spotsLeft', l);
    var dock;
    if (st === 'open' || st === 'last') dock = '<button class="cta" data-act="sheet" data-arg="register">' + (S.ev.price ? t(st === 'last' ? 'cta_last' : 'cta_pay', { price: kc(S.ev.price) }) : t('cta_free')) + '</button>';
    else if (st === 'full') dock = '<button class="cta navy" data-act="sheet" data-arg="waitlist">' + t('cta_wait') + '</button><p class="fine">' + t('wait_fine') + '</p>';
    else if (st === 'in') dock = '<button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="sheet" data-arg="cancel">' + t('cant_come') + '</button>';
    else dock = '<button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="leaveWait">' + t('leave_wait') + '</button>';
    return screen('', status() + top(LOGO, '', ib('☰', 'data-act="sheet" data-arg="pmenu"', 'menu')) +
      '<div class="scroll">' +
      '<div class="photo grain"><img src="' + IMG + S.ev.photo + '" alt=""><div class="badge">' + badge + '</div>' +
      '<div class="over-title">' + esc(evName()) + '</div>' +
      '<div class="glass">' + glassKV([[t('k_datetime'), evDate() + ' · ' + S.ev.start], [t('k_entry'), kc(S.ev.price)], [t('k_location'), S.ev.venue, 1], [t('k_format'), S.ev.format], [t('k_level'), t('all_levels')]]) + '</div></div>' +
      '<div class="going"><div class="ring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div><div><div class="t">' + line + '</div><div class="avatars">' + who + '</div></div></div>' +
      '<div><div class="lbl" style="margin:2px 2px 8px">' + t('who_playing') + '</div>' + namesBlock() + '</div>' +
      '<div class="acc' + (S.acc ? ' open' : '') + '"><button data-act="acc"><span>' + t('details') + '</span><span class="chev">▾</span></button><div class="inner"><dl class="dl">' +
      '<dt>' + t('d_org') + '</dt><dd>' + esc(S.community) + '</dd><dt>' + t('d_addr') + '</dt><dd>' + esc(S.ev.address) + '</dd><dt>' + t('d_time') + '</dt><dd>' + fLong(S.ev.week) + ', ' + S.ev.start + '–20:00</dd>' +
      '<dt>' + t('d_format') + '</dt><dd>' + t('d_format_txt') + '</dd><dt>' + t('d_close') + '</dt><dd>' + fClose(S.ev.week) + '</dd><dt>' + t('d_cancel') + '</dt><dd>' + t('d_cancel_txt') + '</dd></dl>' +
      '<button class="link" style="text-align:left" data-act="toast" data-arg="added_cal">' + t('add_cal') + '</button></div></div>' +
      '</div><div class="dock">' + dock + '</div>');
  };

  R['p-in'] = function () {
    var list = [S.me.name].concat(S.players.slice(-2).reverse().map(function (p) { return p.n; }));
    var n = going();
    return screen('dark', status() + top(ib('✕', 'data-go="p-event"', 'close')) +
      '<div class="scroll" style="gap:18px;padding-top:6px">' +
      '<div class="check" aria-hidden="true">✓</div>' +
      '<h1 class="h-caps">' + t('in_title', { name: esc(S.me.name.split(' ')[0]) }) + '</h1>' +
      '<div class="glass" style="background:rgba(255,255,255,.08)">' + glassKV([[t('k_event'), evName()], [t('k_paid'), kc(S.ev.price)], [t('k_when'), evDate() + ' · ' + S.ev.start + ' · ' + S.ev.venue, 1]]) + '</div>' +
      '<div><div class="lbl" style="margin-bottom:8px">' + t('who_count', { n: n, cap: S.ev.cap }) + '</div><div style="display:flex;flex-direction:column;gap:6px">' +
      list.map(function (nm, i) { return '<div class="ln' + (i === 0 ? ' me' : '') + '"><span>' + (n - i) + ' · ' + esc(nm) + '</span><span>' + (i === 0 ? t('you') : '') + '</span></div>'; }).join('') + '</div></div>' +
      '<p class="p muted" style="font-size:13.5px">' + t('in_note') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="share" data-arg="player">' + t('cta_invite') + '</button><button class="link" data-act="toast" data-arg="added_cal">' + t('add_cal') + '</button></div>');
  };

  R['p-reminder'] = function () {
    var inn = S.me.status === 'in', l = left();
    return screen('wa', status('17:00') +
      '<div class="top">' + ib('←', 'data-go="p-event"', 'back') + '<div class="ttl wa-ttl">PadelLeague<br><span>' + t('biz') + '</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px"><div class="sysmsg">' + t('thursday') + '</div>' +
      (inn ? '<div class="bubble in"><button class="prev" data-go="p-event"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(evName()) + '</b>' + t('rem_prev', { start: S.ev.start, n: going(), cap: S.ev.cap }) + '</div></button>' +
        t('rem_msg', { name: esc(S.me.name.split(' ')[0]), start: S.ev.start, venue: esc(S.ev.venue), address: esc(S.ev.address), n: going(), cap: S.ev.cap }) + (l ? t('rem_more', { left: P('spotsLeft', l) }) : '') +
        '<br><button class="wa-link" data-go="p-event">padelleague.eu/e/' + S.ev.slug + '</button><div class="time">17:00</div></div>' +
        '<div class="bubble in">' + t('rem_cancel', { link: '<button class="wa-link" data-act="sheet" data-arg="cancel">' + t('tap_here') + '</button>' }) + '<div class="time">17:00</div></div>'
        : '<div class="empty"><p>' + t('rem_none', { name: esc(evName()) }) + '</p><button class="cta" style="max-width:240px" data-go="p-event">' + t('open_event') + '</button></div>') +
      '</div>');
  };

  /* ---------- ORGANIZÁTOR ---------- */
  R['o-signup'] = function () {
    return screen('', status() + top(ib('←', 'data-go="start"', 'back'), '', langSwitch()) +
      '<div class="scroll" style="gap:16px;padding-top:10px">' + LOGO +
      '<h1 class="h-caps" style="font-size:30px">' + t('su_title') + '</h1>' +
      '<p class="p muted">' + t('su_sub') + '</p>' +
      '<button class="row" data-act="signup" style="justify-content:center;background:#000;color:#fff;border-color:#000"><b>' + t('su_apple') + '</b></button>' +
      '<button class="row" data-act="signup" style="justify-content:center"><b>G&nbsp; ' + t('su_google') + '</b></button>' +
      '<div class="lbl" style="text-align:center">' + t('su_or') + '</div>' +
      '<label class="field"><span class="lbl">E-mail</span><input id="su-email" type="email" value="kuba@padelteplice.cz"></label>' +
      '<label class="field"><span class="lbl">' + t('su_pass') + '</span><input id="su-pass" type="password" value="prototyp"></label>' +
      '<p class="fine">' + t('su_fine') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="signup">' + t('su_cta') + '</button><button class="link" data-act="toast" data-arg="su_have_t">' + t('su_have') + '</button></div>');
  };

  R['o-community'] = function () {
    return screen('', status() + top(ib('←', 'data-go="o-signup"', 'back'), t('co_step')) +
      '<div class="scroll" style="gap:14px;padding-top:6px">' +
      '<h1 class="h-mid" style="font-size:26px">' + t('co_title') + '</h1>' +
      '<label class="field"><span class="lbl">' + t('co_name') + '</span><input id="c-name" value="' + esc(S.community) + '"></label>' +
      '<label class="field"><span class="lbl">' + t('co_city') + '</span><input id="c-city" value="' + esc(S.city) + '"></label>' +
      '<p class="fine" style="text-align:left">' + t('co_fine') + '</p>' +
      '</div><div class="dock"><button class="cta" data-act="community">' + t('co_cta') + '</button></div>');
  };

  R['o-home'] = function () {
    var n = going();
    var lastRow = S.last ? '<button class="row" data-go="o-after"><span>' + t('h_last_row', { money: kc(S.last.collected), s: S.last.showed, w: esc(short(S.last.winner)) }) + '</span><span class="r">▸</span></button>'
      : '<button class="row" data-act="toast" data-arg="h_last_t"><span>' + t('h_last_row', { money: '3 200 Kč', s: 15, w: 'Lukáš D.' }) + '</span><span class="r">▸</span></button>';
    return screen('', status() + top('<span class="logo"><i></i>' + esc(S.community) + '</span>', '', ib('☰', 'data-act="sheet" data-arg="omenu"', 'menu')) +
      '<div class="scroll" style="gap:12px">' +
      '<div class="lbl">' + t('h_next') + '</div>' +
      '<button class="card-ev grain" data-go="o-manage"><img src="' + IMG + S.ev.photo + '" alt=""><div class="glass"><div class="sring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div>' +
      '<div class="kv"><div class="v">' + esc(evName()) + '</div><div class="l" style="margin-top:4px">' + evDate() + ' · ' + (left() ? P('spotsLeft', left()) : t('b_full')) + '</div></div></div></button>' +
      '<button class="row" data-act="share" data-arg="org"><span>' + t('h_share') + '</span><span class="r">⤴</span></button>' +
      '<div class="lbl" style="margin-top:6px">' + t('h_last') + '</div>' + lastRow +
      (S.stripe !== 'active' ? '<button class="row" data-act="connectStripe" data-arg="o-home"><span>' + t('h_stripe') + '</span><span class="pill wait">' + t('h_connect') + '</span></button>' : '') +
      '<button class="row" data-act="sheet" data-arg="omenu"><span>' + t('h_menu') + '</span><span class="r">▸</span></button>' +
      '</div><div class="dock"><button class="cta" data-act="newEvent">' + t('h_new') + '</button></div>');
  };

  var FORMATS = [['Americano', 'f_am'], ['Mexicano', 'f_mx'], ['Round Robin', 'f_rr'], ['Playoff', 'f_po']];
  function newDraft(w) { return { custom: S.ev.custom, format: S.ev.format, week: w, start: S.ev.start, venue: S.ev.venue, courts: S.ev.courts, cap: S.ev.cap, price: S.ev.price }; }
  R['o-new'] = function () {
    var d = S.draft || (S.draft = newDraft(S.ev.week));
    var paidBlocked = d.price > 0 && S.stripe !== 'active';
    var stripeBlock = d.price > 0 ? (S.stripe === 'active' ? '<div class="row"><span>' + t('n_card_active') + '</span><span class="pill ok">' + t('active') + '</span></div>'
      : '<div class="stripe-card"><span class="lbl">' + t('st_lbl') + '</span><div class="h-mid">' + t('st_h') + '</div><p class="p" style="font-size:13px;opacity:.88">' + t('st_p') + '</p>' +
        '<button class="cta" data-act="connectStripe" data-arg="o-new">' + t(S.stripe === 'pending' ? 'st_btn2' : 'st_btn') + '</button>' +
        '<button class="link" style="color:#C7DAE4" data-act="paySite">' + t('st_site') + '</button></div>') : '';
    var dname = d.custom || t('evName', { f: d.format });
    var more = S.more ? '<div class="acc open"><button data-act="more"><span>' + t('n_more') + '</span><span class="chev">▾</span></button><div class="inner">' +
      '<label class="field"><span class="lbl">' + t('n_name') + '</span><input id="d-name" value="' + esc(dname) + '"></label>' +
      '<div><div class="lbl" style="margin-bottom:6px">' + t('n_type') + '</div><div class="choice"><button class="on">Social</button><button>Competitive</button><button>Training</button></div></div>' +
      '<div><div class="lbl" style="margin-bottom:6px">' + t('n_vis') + '</div><div class="choice"><button class="on">' + t('v_link') + '</button><button>' + t('v_pub') + '</button><button>' + t('v_com') + '</button></div></div>' +
      '<div class="two"><label class="field"><span class="lbl">' + t('k_level') + '</span><select><option>' + t('all_levels') + '</option><option>1–3</option><option>3–5</option><option>5–7</option></select></label><label class="field"><span class="lbl">' + t('n_gender') + '</span><select><option>' + t('g_mix') + '</option><option>' + t('g_m') + '</option><option>' + t('g_w') + '</option></select></label></div>' +
      '<label class="field"><span class="lbl">' + t('n_dead') + '</span><select><option>' + t('dl_24') + '</option><option>' + t('dl_none') + '</option><option>' + t('dl_3') + '</option></select></label>' +
      '<label class="field"><span class="lbl">' + t('n_desc') + '</span><textarea rows="2" placeholder="' + t('n_desc_ph') + '"></textarea></label>' +
      '<label class="field"><span class="lbl">' + t('n_cancel') + '</span><input value="' + t('n_cancel_v') + '"></label>' +
      '<button class="row" data-act="toast" data-arg="n_banner_t"><span>' + t('n_banner') + '</span><span class="r">' + t('n_banner_r') + '</span></button>' +
      '</div></div>' : '<button class="row" data-act="more"><span>' + t('n_more') + '</span><span class="r">' + t('n_more_r') + ' ▸</span></button>';
    return screen('', status() + top(ib('✕', 'data-go="o-home"', 'close'), d.edit ? t('n_edit') : t('n_title'), '<button class="link" style="color:var(--orange-ink);font-weight:700;text-decoration:none" data-act="sheet" data-arg="preview">' + t('n_preview') + '</button>') +
      '<div class="scroll" style="gap:12px">' +
      '<div class="lbl">' + t('k_format') + '</div><div class="formats">' + FORMATS.map(function (f) { return '<button class="fm' + (d.format === f[0] ? ' on' : '') + '" data-act="format" data-arg="' + f[0] + '"><b>' + f[0] + '</b><span>' + t(f[1]) + '</span></button>'; }).join('') + '</div>' +
      '<label class="field"><span class="lbl">' + t('n_when') + '</span><select id="d-week">' + [0, 1, 2].map(function (o) { var w = S.ev.week + o; return '<option value="' + w + '"' + (w === d.week ? ' selected' : '') + '>' + fDate(w) + '</option>'; }).join('') + '</select></label>' +
      '<div class="two"><label class="field"><span class="lbl">' + t('n_start') + '</span><select id="d-start">' + ['18:00', '19:00', '20:00'].map(function (v) { return '<option' + (v === d.start ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label><div class="field"><span class="lbl">' + t('n_courts') + '</span><div class="stepper"><button data-act="step" data-arg="courts:-1" aria-label="−">−</button><b>' + d.courts + '</b><button data-act="step" data-arg="courts:1" aria-label="+">+</button></div></div></div>' +
      '<label class="field"><span class="lbl">' + t('n_where') + '</span><input id="d-venue" value="' + esc(d.venue) + '"></label>' +
      '<div class="two"><div class="field"><span class="lbl">' + t('n_players') + '</span><div class="stepper"><button data-act="step" data-arg="cap:-4" aria-label="−">−</button><b>' + d.cap + '</b><button data-act="step" data-arg="cap:4" aria-label="+">+</button></div></div>' +
      '<div class="field"><span class="lbl">' + t('k_entry') + '</span><div class="stepper"><button data-act="step" data-arg="price:-50" aria-label="−">−</button><b>' + kc(d.price) + '</b><button data-act="step" data-arg="price:50" aria-label="+">+</button></div></div></div>' +
      stripeBlock + more +
      '</div><div class="dock">' + (paidBlocked ? '<p class="fine">' + t('n_blocked') + '</p>' : '') +
      '<button class="cta" data-act="publish"' + (paidBlocked ? ' disabled' : '') + '>' + (d.edit ? t('n_save') : t('n_publish')) + '</button></div>');
  };

  R['o-stripe'] = function () {
    var steps = [
      [t('sp1'), '<label class="field"><span class="lbl">' + t('sp_name') + '</span><input value="Jakub Líbal"></label><label class="field"><span class="lbl">' + t('sp_dob') + '</span><input value="12. 4. 1990"></label><label class="field"><span class="lbl">' + t('sp_addr') + '</span><input value="Pražská 12, Teplice"></label>'],
      [t('sp2'), '<label class="field"><span class="lbl">IBAN</span><input value="CZ65 0800 0000 1920 0014 5399"></label><p class="fine" style="text-align:left">' + t('sp_note2') + '</p>']
    ];
    var s = steps[S.stripeStep];
    return screen('', '<div class="status" style="background:#635BFF;color:#fff"><span>12:11</span><span>●●● 5G</span></div>' +
      '<div class="top" style="background:#635BFF;color:#fff">' + ib('✕', 'data-go="' + S.stripeBack + '"', 'close') + '<div class="ttl">' + t('sp_step', { n: S.stripeStep + 1 }) + '</div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:16px;gap:12px"><p class="fine" style="text-align:left">' + t('sp_note') + '</p>' +
      '<h1 class="h-mid">' + s[0] + '</h1>' + s[1] + '</div>' +
      '<div class="dock"><button class="cta" style="background:#635BFF;box-shadow:none" data-act="stripeNext">' + t(S.stripeStep ? 'sp_submit' : 'sp_cont') + '</button></div>');
  };

  /* Obrazovka 1: event je venku, rozpis 1. kola a kurty jsou vidět, jeden nudge */
  R['o-live'] = function () {
    var courts = Math.max(1, S.ev.courts), names = S.players.filter(present).map(function (p) { return short(p.n); }), k = 0, grid = '';
    function slot() { var n = names[k++]; return n ? '<span class="slot">' + esc(n) + '</span>' : '<span class="slot open">' + t('open_spot') + '</span>'; }
    for (var c = 0; c < courts; c++) grid += '<div class="court-mini"><div class="lbl">' + t('court', { n: c + 1 }) + '</div><div class="pair">' + slot() + slot() + '</div><div class="vs-mini">vs</div><div class="pair">' + slot() + slot() + '</div></div>';
    var open = Math.max(0, courts * 4 - names.length);
    return screen('dark', status() + top(ib('✕', 'data-go="o-manage"', 'close'), '', '<span class="pill ok">' + t('live') + '</span>') +
      '<div class="scroll" style="gap:12px;padding-top:2px">' +
      '<div class="lbl">' + t('l_eyebrow') + '</div>' +
      '<h1 class="h-caps" style="font-size:30px">' + esc(evName()) + '</h1>' +
      '<p class="p muted" style="font-size:13px">' + t('l_meta', { format: S.ev.format, date: evDate(), start: S.ev.start, courts: P('courts', courts) }) + '</p>' +
      '<div class="lbl" style="margin-top:2px">' + t('round', { n: 1 }) + '</div><div class="courts-mini">' + grid + '</div>' +
      '<p class="p muted" style="font-size:12.5px">' + (open ? t('l_open', { open: cap1(P('openSpots', open)) }) : t('l_full')) + '</p>' +
      '</div><div class="dock"><div class="nudge">' + t('l_nudge') + '</div>' +
      '<button class="cta" data-act="sendWA">' + t('l_cta') + '</button><button class="link" data-act="share" data-arg="org">' + t('l_link') + '</button></div>');
  };

  R['o-wa'] = function () {
    return screen('wa', status('12:13') +
      '<div class="top">' + ib('←', 'data-go="o-live"', 'back') + '<div class="ttl wa-ttl">Padel Teplice 🎾<br><span>' + t('wa_members') + '</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px"><div class="sysmsg">' + t('today') + '</div>' +
      '<div class="bubble out"><div class="prev"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(evName()) + '</b>' + evDate() + ' · ' + kc(S.ev.price) + '</div></div>' + esc(chatMsg()) + '<br><span class="wa-link">padelleague.eu/e/' + S.ev.slug + '</span><div class="time">12:13 ✓✓</div></div>' +
      (S.posted ? '<div class="bubble in"><div class="who">Klára</div>' + t('wa_r1') + '<div class="time">12:20</div></div><div class="bubble in"><div class="who">Petr</div>' + t('wa_r2') + '<div class="time">12:41</div></div><div class="bubble in"><div class="who">Filip</div>' + t('wa_r3') + '<div class="time">13:02</div></div>' : '') +
      '</div><div class="dock">' + (S.posted ? '<button class="cta" data-go="o-manage">' + t('wa_back') + '</button>' : '<button class="cta white" data-act="fastForward">' + t('wa_ff') + '</button><p class="fine">' + t('wa_fine') + '</p>') + '</div>');
  };

  var PAYK = { paid: 'pay_paid', unpaid: 'pay_unpaid', site: 'pay_site' };
  R['o-manage'] = function () {
    var paid = S.players.filter(function (p) { return p.pay !== 'unpaid'; }).length;
    var rows = S.players.map(function (p, i) {
      return '<div class="row"' + (p.noshow ? ' style="opacity:.6"' : '') + '><span>' + esc(p.n) + (p.noshow ? ' <span class="pill site">' + t('noshow') + '</span>' : '') + '</span><span style="display:flex;gap:8px;align-items:center">' +
        (p.pay === 'unpaid' ? '<button class="r" style="text-decoration:underline" data-act="remind" data-arg="' + i + '">' + t('remind') + '</button>' : '') +
        '<button class="pill ' + p.pay + '" data-act="cyclePay" data-arg="' + i + '">' + t(PAYK[p.pay]) + '</button></span></div>';
    }).join('') || '<div class="empty"><p>' + t('mg_empty') + '</p></div>';
    var wl = S.waitlist.map(function (n, i) { return '<div class="row"><span>' + (i + 1) + ' · ' + esc(n) + '</span><button class="r" style="color:var(--orange-ink);font-weight:700" data-act="moveIn" data-arg="' + i + '">' + t('move_in') + '</button></div>'; }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-home"', 'back'), esc(evName()) + '<br><span class="muted" style="font:500 11px/1 var(--f-body);letter-spacing:0;text-transform:none">' + evDate() + ' · ' + S.ev.start + '</span>', ib('⋯', 'data-act="sheet" data-arg="evmenu"', 'more')) +
      '<div class="scroll" style="gap:10px">' +
      '<div class="seg3"><div><b>' + S.players.length + '/' + S.ev.cap + '</b><span>' + t('mg_going') + '</span></div><div><b>' + paid + '</b><span>' + t('mg_paid') + '</span></div><div><b>' + S.waitlist.length + '</b><span>' + t('mg_wait') + '</span></div></div>' +
      '<button class="row" data-act="share" data-arg="org"><span>' + t('h_share') + '</span><span class="r">⤴</span></button>' +
      '<div class="lbl" style="margin-top:4px">' + t('mg_lbl') + '</div>' + rows +
      (wl ? '<div class="lbl" style="margin-top:6px">' + t('mg_waitlist') + '</div>' + wl : '') +
      '</div><div class="dock">' + (S.players.length < 4 ? '<button class="cta" data-act="share" data-arg="org">' + t('h_share') + '</button>' :
        '<button class="cta" data-act="buildSchedule">' + t(S.sched ? 'mg_open' : 'mg_build') + '</button>') + '</div>');
  };

  function rng(seed) { return function () { seed = seed + 0x6D2B79F5 | 0; var x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function buildSched() {
    var ps = S.players.filter(present).map(function (p) { return p.n; });
    var courts = Math.min(S.ev.courts, Math.floor(ps.length / 4)), rounds = 4, out = [];
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

  R['o-schedule'] = function () {
    var here = S.players.filter(present).length;
    var rds = S.sched.map(function (rd, r) {
      return '<div class="round"><h4><span>' + t('round', { n: r + 1 }) + '</span><span class="muted" style="font:500 11px/1 var(--f-body);text-transform:none">' + P('courts', rd.m.length) + '</span></h4>' +
        rd.m.map(function (mt, c) { return '<div class="match"><span>' + esc(short(mt.a[0])) + '<br>' + esc(short(mt.a[1])) + '</span><span class="vs">' + t('court', { n: c + 1 }) + '</span><span class="b">' + esc(short(mt.b[0])) + '<br>' + esc(short(mt.b[1])) + '</span></div>'; }).join('') +
        (rd.rest.length ? '<div class="rest">' + t('resting') + rd.rest.map(short).map(esc).join(', ') + '</div>' : '') + '</div>';
    }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-manage"', 'back'), t('sc_title'), ib('↻', 'data-act="reshuffle"', 'shuffle')) +
      '<div class="scroll" style="gap:10px">' +
      '<button class="row" data-act="sheet" data-arg="attend"><span>' + t('sc_att', { n: here, t: S.players.length }) + '</span><span class="r">' + t('sc_check') + '</span></button>' +
      '<p class="p muted" style="font-size:13.5px">' + t('sc_meta', { players: P('players', here), courts: P('courts', S.sched[0].m.length) }) + '</p>' + rds +
      '</div><div class="dock"><button class="cta" data-act="startPlay">' + t('sc_start') + '</button></div>');
  };

  function roundDone(r) { return S.play.scores[r].every(function (x) { return x; }); }
  function allDone() { return S.play.scores.every(function (rd) { return rd.every(function (x) { return x; }); }); }
  R['o-play'] = function () {
    var r = S.play.round, rd = S.sched[r];
    var tabs = S.sched.map(function (_, i) { return '<button class="' + (i === r ? 'on' : (roundDone(i) ? 'done' : '')) + '" data-act="round" data-arg="' + i + '">' + t('round', { n: i + 1 }) + (roundDone(i) ? ' ✓' : '') + '</button>'; }).join('');
    var courts = rd.m.map(function (mt, c) {
      var sc = S.play.scores[r][c];
      return '<div class="court"><div style="display:flex;justify-content:space-between"><span class="lbl">' + t('court', { n: c + 1 }) + '</span>' + (sc ? '<span class="pill ok">' + t('saved') + '</span>' : '') + '</div>' +
        '<div class="teams"><div class="team">' + esc(short(mt.a[0])) + '<br>' + esc(short(mt.a[1])) + '</div>' +
        (sc ? '<span class="score-big">' + sc[0] + ':' + sc[1] + '</span>' : '<button class="pill hot" data-act="score" data-arg="' + r + ':' + c + '">' + t('enter_score') + '</button>') +
        '<div class="team b">' + esc(short(mt.b[0])) + '<br>' + esc(short(mt.b[1])) + '</div></div>' +
        (sc ? '<button class="link" style="text-align:right" data-act="score" data-arg="' + r + ':' + c + '">' + t('fix_score') + '</button>' : '') + '</div>';
    }).join('');
    var todo = S.play.scores[r].filter(function (x) { return !x; }).length;
    var stand = standings().slice(0, 5).map(function (p, i) { return '<div><span>' + (i + 1) + ' · ' + esc(p.n) + '</span><b>' + p.pts + '</b></div>'; }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-schedule"', 'back'), '<span class="pill ok" style="margin-right:6px">' + t('running') + '</span>' + esc(evName()), ib('⋯', 'data-act="toast" data-arg="pl_menu_t"', 'more')) +
      '<div class="scroll" style="gap:12px"><div class="tabs">' + tabs + '</div>' + courts +
      '<div class="lbl" style="margin-top:4px">' + t('standings') + '</div><div class="stand">' + stand + '</div>' +
      '</div><div class="dock">' + (allDone() ? '<button class="cta" data-act="finish">' + t('finish') + '</button>' :
        '<button class="cta" disabled>' + t('pl_progress', { r: r + 1, k: P('toScore', todo) }) + '</button><button class="link" data-act="autofill">' + t('demo_fill') + '</button>') + '</div>');
  };

  function fillScores() {
    S.play.scores.forEach(function (rd, r) { rd.forEach(function (x, c) { if (!x) { var a = 8 + (hash(r + ':' + c + S.ev.format) % 9); rd[c] = [a, 24 - a]; } }); });
    S.play.round = S.sched.length - 1;
  }
  function standings() {
    var pts = {};
    S.players.filter(present).forEach(function (p) { pts[p.n] = 0; });
    if (S.sched) S.sched.forEach(function (rd, r) {
      rd.m.forEach(function (mt, c) { var sc = S.play.scores[r][c]; if (!sc) return; mt.a.forEach(function (n) { pts[n] += sc[0]; }); mt.b.forEach(function (n) { pts[n] += sc[1]; }); });
    });
    return Object.keys(pts).map(function (n) { return { n: n, pts: pts[n] }; }).sort(function (a, b) { return b.pts - a.pts || a.n.localeCompare(b.n); });
  }
  function summary() {
    var st = standings(), card = 0, site = 0, owe = [];
    S.players.forEach(function (p) { if (p.pay === 'paid') card++; else if (p.pay === 'site') site++; else owe.push(p.n); });
    var noshow = S.players.filter(function (p) { return p.noshow; }).map(function (p) { return p.n; });
    return { week: S.ev.week, stand: st, winner: st[0].n, total: S.players.length, card: card, site: site, owe: owe, paid: card + site,
      showed: S.players.length - noshow.length, noshow: noshow, collected: (card + site) * S.ev.price, price: S.ev.price };
  }
  function demoFinished() {
    if (S.players.length < 8) S.players = mkPlayers(16);
    if (!S.players.some(function (p) { return p.noshow; })) S.players[5].noshow = true;
    buildSched(); fillScores(); S.last = summary();
  }

  /* Obrazovka 3 – mobil */
  R['o-after'] = function () {
    var L = S.last, st = L.stand;
    return screen('dark', status() + top(ib('←', 'data-go="o-home"', 'back'), t('af_done', { name: esc(evName()) }), ib('⋯', 'data-act="toast" data-arg="af_menu_t"', 'more')) +
      '<div class="scroll" style="gap:14px">' +
      '<div><div class="lbl">' + t('collected') + '</div><div class="money" style="margin-top:6px">' + kc(L.collected) + '</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill ok">' + t('af_paid', { p: L.paid, t: L.total }) + '</span><span class="pill site">' + t('af_showed', { s: L.showed, t: L.total }) + '</span>' + (L.owe.length ? '<span class="pill wait">' + t('af_owe', { u: L.owe.length }) + '</span>' : '') + '</div>' +
      podium(st) +
      '<div class="stand">' + st.slice(3, 8).map(function (p, i) { return '<div><span>' + (i + 4) + ' · ' + esc(p.n) + '</span><b>' + p.pts + '</b></div>'; }).join('') + '</div>' +
      '</div><div class="dock"><button class="cta" data-act="nextEvent">' + t('af_next') + '<small>' + t('af_same', { date: fDate(S.ev.week + 1) }) + '</small></button><button class="link" data-go="o-card">' + t('af_card') + '</button></div>');
  };
  function podium(st) {
    function pod(cls, i) { return '<div class="pod ' + cls + '"><span class="m">' + (i + 1) + '</span><b>' + esc(short(st[i].n)) + '</b><span>' + t('pts', { n: st[i].pts }) + '</span></div>'; }
    return '<div class="podium" style="margin-top:6px">' + pod('s', 1) + pod('g', 0) + pod('b3', 2) + '</div>';
  }

  /* Obrazovka 3 – desktop */
  R['o-after-d'] = function () {
    var L = S.last, st = L.stand, nav = D[lang].d_nav;
    var owe = L.owe.length ? L.owe.map(function (n) { var i = -1; S.players.forEach(function (p, j) { if (p.n === n) i = j; }); return '<div class="d-row"><span>' + esc(n) + '</span><button class="r" style="text-decoration:underline" data-act="remind" data-arg="' + i + '">' + t('remind') + '</button></div>'; }).join('')
      : '<div class="d-row"><span>' + t('d_none_owe') + '</span><span class="pill ok">✓</span></div>';
    var table = st.slice(0, 10).map(function (p, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(p.n) + '</td><td class="num">' + p.pts + '</td></tr>'; }).join('');
    return screen('desk', '<div class="d-bar"><span class="logo"><i></i>' + esc(S.community) + '</span><nav>' + nav.map(function (x, i) { return '<span class="' + (i === 1 ? 'on' : '') + '">' + x + '</span>'; }).join('') + '</nav>' + langSwitch() + '</div>' +
      '<div class="d-main"><div class="d-head"><div><div class="lbl">' + fLong(L.week) + ' · ' + esc(S.ev.venue) + '</div><h1 class="h-caps" style="font-size:34px;margin-top:6px">' + t('af_done', { name: esc(evName()) }) + '</h1></div>' +
      '<button class="cta d-cta" data-act="nextEvent">' + t('af_next') + '<small>' + t('af_same', { date: fDate(S.ev.week + 1) }) + '</small></button></div>' +
      '<div class="d-grid"><div class="d-col">' +
      '<section class="d-card navy"><div class="lbl">' + t('collected') + '</div><div class="money">' + kc(L.collected) + '</div>' +
      '<div class="d-row"><span>' + t('d_bycard') + '</span><b>' + L.card + ' × ' + kc(L.price) + '</b></div><div class="d-row"><span>' + t('d_onsite') + '</span><b>' + L.site + ' × ' + kc(L.price) + '</b></div></section>' +
      '<section class="d-card"><div class="lbl">' + t('d_owe') + '</div>' + owe + '</section>' +
      '<section class="d-card"><div class="lbl">' + t('d_att') + '</div><div class="d-big">' + t('d_att_txt', { s: L.showed, t: L.total }) + '</div>' +
      (L.noshow.length ? '<div class="d-row"><span>' + t('d_noshow') + '</span><b>' + L.noshow.map(esc).join(', ') + '</b></div>' : '<div class="d-row"><span>' + t('d_all_here') + '</span></div>') + '</section>' +
      '</div><div class="d-col">' +
      '<section class="d-card dark">' + podium(st) + '</section>' +
      '<section class="d-card"><div class="lbl">' + t('d_final') + '</div><table class="d-table"><thead><tr><th>#</th><th>' + t('d_player') + '</th><th class="num">' + t('d_points') + '</th></tr></thead><tbody>' + table + '</tbody></table>' +
      '<button class="link" style="text-align:left;margin-top:10px" data-go="o-card">' + t('af_card') + '</button></section>' +
      '</div></div><p class="fine" style="text-align:left;margin-top:14px"><button class="link" style="display:inline" data-go="o-after">← ' + t('d_mobile') + '</button></p></div>');
  };

  R['o-card'] = function () {
    var L = S.last, w = L.stand[0];
    return screen('', status() + top(ib('←', 'data-go="o-after"', 'back'), t('cd_title')) +
      '<div class="scroll"><div class="somecard grain"><img src="' + IMG + 'court-blue-orange.jpg" alt="">' +
      '<div class="glass">' + glassKV([[t('cd_name'), w.n], [t('k_event'), evName() + ' · ' + S.community], [t('cd_details'), fCard(L.week) + ' · ' + S.city]]) +
      '<div class="kv"><div class="l">' + t('cd_points') + '</div><div class="v" style="font-size:36px;line-height:1">' + w.pts + '</div></div><div class="kv"><div class="l">' + t('cd_result') + '</div><div class="v" style="font-size:32px;line-height:1">' + t('cd_winner') + '</div></div></div>' +
      '<div class="won">#1<small>' + t('cd_of', { n: L.showed }) + '</small></div><div class="some-foot">' + t('cd_foot') + '</div></div></div>' +
      '<div class="dock"><button class="cta" data-act="toast" data-arg="opening_ig">' + t('cd_ig') + '</button><button class="link" data-act="cardAll">' + t('cd_all') + '</button></div>');
  };

  R['o-next'] = function () {
    var w = S.ev.week + 1;
    function row(l, v, ch) { return '<button class="row" data-act="editNext"><span><span class="lbl">' + l + '</span><br>' + (ch ? '<span class="changed">' + v + '</span>' : v) + '</span><span class="r">' + t('edit') + '</span></button>'; }
    return screen('', status() + top(ib('✕', 'data-go="o-after"', 'close'), t('nx_title')) +
      '<div class="scroll" style="gap:10px"><h1 class="h-mid" style="font-size:24px">' + t('nx_h') + '</h1>' +
      row(t('nx_date'), fDate(w) + ' · ' + S.ev.start + '–20:00', 1) + row(t('nx_format'), S.ev.format + ' · ' + P('players', S.ev.cap)) + row(t('nx_where'), esc(S.ev.venue) + ' · ' + P('courts', S.ev.courts)) + row(t('nx_entry'), kc(S.ev.price) + (S.ev.price ? ' · ' + t('nx_card') : '')) +
      '<button class="row" style="background:var(--warn-bg);border-color:#FDD3B0" data-act="invitePrev"><span>' + t('nx_invite', { n: S.last ? S.last.total : 16 }) + '</span><span class="sw' + (S.invitePrev ? ' on' : '') + '"></span></button>' +
      '</div><div class="dock"><button class="cta" data-act="publishNext">' + t('nx_cta') + '</button></div>');
  };

  /* ---------- PANELY (sheets) ---------- */
  var SH = {};
  SH.register = function () {
    var free = !S.ev.price;
    return '<div class="grab"></div><h2 class="h-mid">' + t('s_join', { name: esc(evName()) }) + '</h2><p class="fine" style="text-align:left;margin-top:-6px">' + evDate() + ' · ' + S.ev.start + ' · ' + esc(S.ev.venue) + '</p>' +
      '<label class="field"><span class="lbl">' + t('your_name') + '</span><input id="f-name" autocomplete="name" value="' + esc(S.me.name) + '"></label>' +
      '<label class="field"><span class="lbl">' + t('contact') + '</span><input id="f-contact" autocomplete="tel" value="' + esc(S.me.contact) + '"></label>' +
      (free ? '' : '<div class="methods">' + [['apple', ' Pay'], ['google', 'G Pay'], ['card', t('card')]].map(function (m) { return '<button class="' + (S.method === m[0] ? 'on' : '') + '" data-act="method" data-arg="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        (S.method === 'card' ? '<label class="field"><span class="lbl">' + t('card_no') + '</span><input value="4242 4242 4242 4242"></label><div class="two"><label class="field"><span class="lbl">' + t('card_exp') + '</span><input value="12 / 28"></label><label class="field"><span class="lbl">CVC</span><input value="123"></label></div>' : '')) +
      '<button class="cta" data-act="' + (free ? 'joinFree' : 'pay') + '">' + (free ? t('cta_free') : t('pay_join', { price: kc(S.ev.price) })) + '</button>' +
      '<p class="fine">' + t('s_fine') + '</p>';
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
      '<div class="share-grid"><button class="w" data-act="shareTo" data-arg="wa"><i>✆</i>WhatsApp</button><button class="ig" data-act="shareTo" data-arg="ig"><i>◎</i>Stories</button><button data-act="shareTo" data-arg="copy"><i>⧉</i>' + t('copy_link') + '</button><button data-act="shareTo" data-arg="qr"><i>▦</i>' + t('qr') + '</button></div>' +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  SH.pmenu = function () {
    return '<div class="grab"></div>' + '<div style="display:flex;justify-content:flex-end">' + langSwitch() + '</div>' +
      '<button class="row" data-act="toast" data-arg="m_login_t"><span>' + t('m_login') + '</span><span class="r">' + t('m_optional') + '</span></button>' +
      '<button class="row" data-go="p-reminder"><span>' + t('m_reminder') + '</span><span class="r">' + t('m_proto') + '</span></button>' +
      '<button class="row" data-act="toast" data-arg="m_thanks"><span>' + t('m_report') + '</span><span class="r">▸</span></button>' +
      '<button class="link" data-act="close">' + t('close') + '</button>';
  };
  function stripeLabel() { return t(S.stripe === 'active' ? 'active' : S.stripe === 'pending' ? 'pending' : 'not_connected'); }
  SH.omenu = function () {
    var it = D[lang].om_items;
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center"><div class="lbl">' + esc(S.community) + '</div>' + langSwitch() + '</div>' +
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
    return '<div class="grab"></div><div class="lbl">' + t('pv_lbl') + '</div><div class="photo grain" style="min-height:260px"><img src="' + IMG + S.ev.photo + '" alt=""><div class="over-title">' + esc(nm) + '</div>' +
      '<div class="glass">' + glassKV([[t('k_datetime'), fDate(d.week) + ' · ' + d.start], [t('k_entry'), kc(d.price)], [t('k_location'), d.venue, 1], [t('k_format'), d.format], [t('k_spots'), P('players', d.cap)]]) + '</div></div><button class="cta" data-act="close">' + t('pv_back') + '</button>';
  };
  SH.score = function () {
    var tg = S.scoreTarget, mt = S.sched[tg[0]].m[tg[1]], b = '';
    for (var i = 0; i <= 24; i++) b += '<button data-act="setScore" data-arg="' + i + '">' + i + ':' + (24 - i) + '</button>';
    return '<div class="grab"></div><h2 class="h-mid">' + t('score_title', { c: tg[1] + 1, r: tg[0] + 1 }) + '</h2><p class="fine" style="text-align:left">' + t('score_txt', { a: esc(short(mt.a[0])), b: esc(short(mt.a[1])), c: esc(short(mt.b[0])), d: esc(short(mt.b[1])) }) + '</p><div class="scores">' + b + '</div><button class="link" data-act="close">' + t('cancel') + '</button>';
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
    close: closeSheet,
    acc: function () { S.acc = !S.acc; render(); },
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
      if (a === 'wa' && S.ctx === 'org') { S.sheet = null; go('o-wa'); return; }
      S.sheet = null; toast(t({ wa: 'opening_wa', ig: 'opening_ig', qr: 'qr_ready' }[a]));
    },
    signup: function () { go('o-community'); },
    community: function () {
      S.community = val('c-name', S.community); S.city = val('c-city', S.city);
      S.draft = null; S.players = []; S.waitlist = []; S.last = null; S.sched = null; S.stripe = 'none'; go('o-new');
    },
    newEvent: function () { S.draft = null; go('o-new'); },
    format: function (a) { readDraft(); S.draft.format = a; S.draft.custom = null; render(); },
    step: function (a) {
      readDraft();
      var p = a.split(':'), k = p[0], v = +p[1], d = S.draft;
      d[k] = Math.max(k === 'cap' ? 4 : k === 'courts' ? 1 : 0, Math.min(k === 'cap' ? 48 : k === 'courts' ? 8 : 1000, d[k] + v));
      render();
    },
    more: function () { readDraft(); S.more = !S.more; render(); },
    connectStripe: function (a) { readDraft(); S.stripeBack = a || 'o-new'; S.stripeStep = 0; go('o-stripe'); },
    stripeNext: function () { if (S.stripeStep === 0) { S.stripeStep = 1; render(); } else { S.stripe = 'active'; go(S.stripeBack); toast(t('stripe_on')); } },
    paySite: function () { readDraft(); S.stripe = 'active'; toast(t('paysite_t')); },
    publish: function () {
      readDraft();
      var d = S.draft;
      if (d.price > 0 && S.stripe !== 'active') return;
      var edit = d.edit;
      ['custom', 'format', 'week', 'start', 'venue', 'courts', 'cap', 'price'].forEach(function (k) { S.ev[k] = d[k]; });
      S.draft = null; S.more = false;
      if (edit) { if (S.sched && !anyScore()) buildSched(); toast(t('n_saved')); go('o-manage'); return; }
      S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live');
    },
    sendWA: function () { go('o-wa'); },
    fastForward: function () {
      var n = Math.max(0, S.ev.cap - 2), off = S.ev.week % 3;
      S.players = [];
      for (var i = 0; i < n; i++) S.players.push({ n: NAMES[(i + off) % NAMES.length], pay: PAYS[i % PAYS.length], noshow: false });
      S.posted = true; render();
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
    editEvent: function () { S.sheet = null; S.draft = newDraft(S.ev.week); S.draft.edit = true; go('o-new'); },
    buildSchedule: function () { if (!S.sched) buildSched(); go('o-schedule'); },
    reshuffle: function () { S.shuffle++; buildSched(); toast(t('new_sched')); },
    startPlay: function () { go('o-play'); },
    round: function (a) { S.play.round = +a; render(); },
    score: function (a) { var p = a.split(':'); S.scoreTarget = [+p[0], +p[1]]; S.sheet = 'score'; render(); },
    setScore: function (a) {
      var tg = S.scoreTarget; S.play.scores[tg[0]][tg[1]] = [+a, 24 - a]; S.sheet = null;
      if (roundDone(tg[0]) && tg[0] === S.play.round && tg[0] < S.sched.length - 1) { S.play.round++; toast(t('round_on', { n: S.play.round + 1 })); } else render();
    },
    autofill: function () { fillScores(); render(); },
    finish: function () { S.last = summary(); go('o-after'); },
    nextEvent: function () { go('o-next'); },
    editNext: function () { S.draft = newDraft(S.ev.week + 1); go('o-new'); },
    invitePrev: function () { S.invitePrev = !S.invitePrev; render(); },
    cardAll: function () { toast(t('cd_all_t', { n: S.last.showed })); },
    publishNext: function () {
      S.ev.week += 1; S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live'); if (S.invitePrev) toast(t('nx_sent'));
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
  function isDesk() { return mode === 'desktop' && !!view && window.innerWidth > 820; }
  function rootEl() { return isDesk() ? view : app; }
  function setMode(m) { mode = m; try { localStorage.setItem('pl-app-mode', m); } catch (e) { /* */ } render(); }

  /* ---------- DESKTOP: obal podle typu obrazovky ---------- */
  var ORG_NAV = [['o-home', 'dk_home', '⌂'], ['o-new', 'dk_new', '+'], ['o-manage', 'dk_players', '☰'], ['o-schedule', 'dk_sched', '▦'], ['o-play', 'dk_play', '▶'], ['o-after', 'dk_after', '★'], ['o-next', 'dk_next', '↻'], ['o-card', 'dk_card', '◎']];
  function kind(r) {
    if (r === 'p-chat' || r === 'p-reminder' || r === 'o-wa') return 'wa';
    if (r === 'o-signup' || r === 'o-community' || r === 'o-stripe') return 'auth';
    if (r.indexOf('o-') === 0) return 'org';
    return 'site';
  }
  function deskUrl(r) {
    var k = kind(r), slug = S.community.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    if (k === 'wa') return 'web.whatsapp.com';
    if (r === 'o-stripe') return 'connect.stripe.com/setup';
    if (k === 'auth') return 'app.padelleague.eu/' + (r === 'o-signup' ? 'registrace' : 'nova-komunita');
    if (k === 'org') return 'app.padelleague.eu/' + slug + '/' + ({ 'o-home': '', 'o-new': 'novy-event', 'o-live': 'event/' + S.ev.slug, 'o-manage': 'event/' + S.ev.slug + '/hraci', 'o-schedule': 'event/' + S.ev.slug + '/rozpis', 'o-play': 'event/' + S.ev.slug + '/zive', 'o-after': 'event/' + S.ev.slug + '/souhrn', 'o-after-d': 'event/' + S.ev.slug + '/souhrn', 'o-next': 'dalsi-event', 'o-card': 'event/' + S.ev.slug + '/karta' }[r] || '');
    if (r === 'start') return 'padelleague.eu/prototyp';
    return 'padelleague.eu/e/' + S.ev.slug;
  }
  function deskShell(r, inner) {
    var k = kind(r);
    if (k === 'org') {
      var cur = r === 'o-after-d' ? 'o-after' : r;
      return '<div class="dk-org"><aside class="dk-side"><div class="dk-brand"><i></i>Padel League</div><div class="dk-comm"><b>' + esc(S.community) + '</b><span>' + esc(S.city) + '</span></div><nav>' +
        ORG_NAV.map(function (n) { return '<button class="' + (n[0] === cur ? 'on' : '') + '" data-go="' + n[0] + '"><span>' + n[2] + '</span>' + t(n[1]) + '</button>'; }).join('') +
        '</nav><span class="dk-sp"></span><button class="dk-view" data-go="p-event">' + t('em_view') + ' ↗</button><div class="dk-lang">' + langSwitch() + '</div></aside>' +
        '<div class="dk-main r-' + r + '">' + inner + '</div></div>';
    }
    if (k === 'wa') {
      var chats = r === 'o-wa' ? [['Padel Teplice 🎾', '12:13', 1], ['PadelLeague', 'včera', 0], ['Tomáš Novák', 'po', 0], ['Rodina 🏡', 'ne', 0]] :
        r === 'p-reminder' ? [['PadelLeague', '17:00', 1], ['Padel Teplice 🎾', '18:40', 0], ['Klára', 'út', 0], ['Rodina 🏡', 'ne', 0]] : [['Padel Teplice 🎾', '18:40', 1], ['PadelLeague', 'čt', 0], ['Klára', 'út', 0], ['Rodina 🏡', 'ne', 0]];
      return '<div class="dk-wa"><aside class="dk-wa-list"><div class="dk-wa-h"><b>Chaty</b></div><div class="dk-wa-search">Hledat</div>' +
        chats.map(function (c) { return '<div class="dk-wa-chat' + (c[2] ? ' on' : '') + '"><i>' + esc(c[0].charAt(0)) + '</i><span><b>' + esc(c[0]) + '</b><small>' + (c[2] ? '…' : '') + '</small></span><em>' + c[1] + '</em></div>'; }).join('') +
        '</aside><div class="dk-main r-' + r + '">' + inner + '</div></div>';
    }
    if (k === 'auth') return '<div class="dk-auth"><div class="dk-main r-' + r + '">' + inner + '</div></div>';
    return '<div class="dk-site"><header class="dk-head"><span class="logo"><i></i>Padel League</span><span class="dk-head-r">' + langSwitch() + '<button class="dk-login" data-act="toast" data-arg="m_login_t">' + t('m_login') + '</button></span></header><div class="dk-main r-' + r + '">' + inner + '</div></div>';
  }
  function route() { var h = location.hash.replace(/^#\/?/, ''); return R[h] ? h : 'start'; }
  function render() {
    var r = route();
    if ((r === 'o-after' || r === 'o-after-d' || r === 'o-card') && !S.last) demoFinished();
    if ((r === 'o-schedule' || r === 'o-play') && !S.sched) { if (S.players.length < 4) S.players = mkPlayers(14); buildSched(); }
    var desk = isDesk();
    document.body.classList.toggle('mode-desktop', desk);
    document.body.classList.toggle('mode-mobile', !desk);
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === mode); });
    if (device) device.classList.toggle('wide', !desk && r === 'o-after-d');
    var html = desk && r === 'o-after' ? R['o-after-d']() : R[r]();
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
  window.addEventListener('hashchange', function () { S.sheet = null; render(); var sc = rootEl().querySelector('.scroll,.d-main'); if (sc) sc.scrollTop = 0; });
  var lastDesk = null;
  window.addEventListener('resize', function () { var d = isDesk(); if (d !== lastDesk) { lastDesk = d; render(); } });
  document.documentElement.lang = lang;
  syncPanelLang();
  render();
})();
