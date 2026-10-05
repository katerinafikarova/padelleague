/* PadelLeague – klikací prototyp (vanilla JS, bez build kroku).
   Obrazovky = routy v URL hashi (#/p-event). Stav drží objekt S, panel vlevo umí nastavit ukázkové stavy. */
(function () {
  'use strict';

  var IMG = 'assets/img/';
  var NAMES = ['Tomáš Novák', 'Petr Svoboda', 'Lukáš Dvořák', 'Martin Černý', 'Tereza Hájková', 'Eliška Králová',
    'Anna Jelínková', 'Klára Růžičková', 'Ondřej Procházka', 'Lucie Benešová', 'Jan Kučera', 'Kateřina Veselá',
    'David Veselý', 'Petra Malá', 'Filip Horák', 'Veronika Zemanová', 'Michal Doležal', 'Barbora Pokorná', 'Jakub Marek'];
  var PAYS = ['paid', 'paid', 'paid', 'paid', 'unpaid', 'paid', 'site', 'paid', 'paid', 'paid', 'paid', 'unpaid', 'paid', 'paid', 'paid', 'site'];

  var S;
  function fresh() {
    return {
      ev: { name: 'Friday Americano', date: 'Fri 30 Oct', dateLong: 'Friday 30 October', time: '18:00 – 20:00', start: '18:00',
        venue: 'Padel Klub Novosedlice', address: 'Trnovanská 123, Teplice', courts: 4, format: 'Americano',
        level: 'All levels', price: 200, cap: 16, slug: 'friday-americano', photo: 'court-orange-close.jpg', week: 0 },
      players: mkPlayers(9), waitlist: [],
      me: { name: 'Jana Malá', contact: '+420 777 123 456', status: null },
      method: 'apple', stripe: 'active', community: 'Kuba komunity', city: 'Teplice',
      draft: null, more: false, acc: false, allNames: false,
      sched: null, play: { round: 0, scores: [] }, last: null, invitePrev: true,
      sheet: null, ctx: 'player', scoreTarget: null, toast: null, stripeStep: 0, posted: false
    };
  }
  function mkPlayers(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push({ n: NAMES[i], pay: PAYS[i % PAYS.length] });
    return a;
  }
  S = fresh();

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function short(n) { var p = n.split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); }
  function kc(n) { return n === 0 ? 'Free' : n.toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč'; }
  function going() { return S.players.length + (S.me.status === 'in' ? 1 : 0); }
  function left() { return Math.max(0, S.ev.cap - going()); }
  function evState() {
    if (S.me.status === 'in') return 'in';
    if (S.me.status === 'wait') return 'wait';
    var l = left();
    if (l === 0) return 'full';
    if (l <= 2) return 'last';
    return 'open';
  }
  function pct() { return Math.round(going() / S.ev.cap * 100); }
  function status(dark) { return '<div class="status"' + (dark ? '' : '') + '><span>18:42</span><span>●●● 5G</span></div>'; }
  function top(left, title, right) { return '<div class="top">' + (left || '<span class="ib ghost"></span>') + '<div class="ttl">' + (title || '') + '</div>' + (right || '<span class="ib ghost"></span>') + '</div>'; }
  function ib(sym, attrs, label) { return '<button class="ib" ' + attrs + ' aria-label="' + label + '">' + sym + '</button>'; }
  var LOGO = '<span class="logo"><i></i>Padel League</span>';
  function glassKV(pairs) { return pairs.map(function (p) { return '<div class="kv' + (p[2] ? ' full' : '') + '"><div class="l">' + p[0] + '</div><div class="v">' + esc(p[1]) + '</div></div>'; }).join(''); }
  function screen(cls, inner) { return '<div class="screen ' + (cls || '') + '">' + inner + '</div>'; }
  function go(r) { if (location.hash === '#/' + r) render(); else location.hash = '/' + r; }
  function toast(t) { S.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(function () { S.toast = null; render(); }, 2400); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function addDays(label, w) { var d = 30 + 7 * w; return d > 31 ? 'Fri ' + (d - 31) + ' Nov' : 'Fri ' + d + ' Oct'; }

  /* ---------- PLAYER ---------- */
  var R = {};

  R.start = function () {
    return screen('dark', status() +
      '<div class="scroll" style="padding-top:30px;gap:18px">' +
      '<span class="logo"><i></i>Padel League</span>' +
      '<h1 class="h-caps">Send the link.<br>The rest happens.</h1>' +
      '<p class="p muted">Clickable prototype of the three journeys from the design brief. Pick where to start.</p>' +
      '<button class="row" data-go="p-chat"><span><b>Player</b><br><span class="r">WhatsApp link → sign up &amp; pay → you\'re in</span></span><span class="r">→</span></button>' +
      '<button class="row" data-go="o-home"><span><b>Organizer</b><br><span class="r">New event → share → players → after the event</span></span><span class="r">→</span></button>' +
      '<a class="row" href="landing.html" style="color:inherit;text-decoration:none"><span><b>Landing page</b><br><span class="r">Instagram → Create your community</span></span><span class="r">↗</span></a>' +
      '</div>');
  };

  R['p-chat'] = function () {
    return screen('wa', '<div class="status"><span>18:40</span><span>●●● 5G</span></div>' +
      '<div class="top">' + ib('←', 'data-go="start"', 'Back') + '<div class="ttl" style="text-align:left;text-transform:none;letter-spacing:0;font:700 15px/1.2 var(--f-body)">Padel Teplice 🎾<br><span style="font:400 11.5px/1 var(--f-body);opacity:.8">Kuba, Tomáš, Petr, Klára + 34</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px">' +
      '<div class="sysmsg">Today</div>' +
      '<div class="bubble in"><div class="who">Kuba (organizer)</div>' +
      '<button class="prev" data-go="p-event"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(S.ev.name) + '</b>' + S.ev.date + ' · ' + kc(S.ev.price) + ' · ' + going() + '/' + S.ev.cap + ' going</div></button>' +
      '🎾 ' + esc(S.ev.format) + ' on ' + S.ev.date + ' at ' + S.ev.start + ', ' + esc(S.ev.venue) + '. ' + S.ev.cap + ' spots, ' + kc(S.ev.price) + '. Sign up &amp; pay here 👇<br>' +
      '<button class="wa-link" data-go="p-event">padelleague.eu/e/' + S.ev.slug + '</button><div class="time">18:31</div></div>' +
      '<div class="bubble in"><div class="who">Klára</div>In! 🙌<div class="time">18:35</div></div>' +
      '<div class="bubble in"><div class="who">Tomáš</div>Paid, see you there<div class="time">18:38</div></div>' +
      '<p class="fine" style="margin-top:auto">Tap the link preview to open the event.</p>' +
      '</div>');
  };

  function namesBlock(dark) {
    var list = S.players.map(function (p) { return p.n; });
    if (S.me.status === 'in') list.unshift(S.me.name);
    var show = S.allNames ? list : list.slice(0, 8);
    var chips = show.map(function (n) { return '<span class="chip' + (n === S.me.name && S.me.status === 'in' ? ' me' : '') + '">' + esc(short(n)) + '</span>'; }).join('');
    if (!S.allNames && list.length > 8) chips += '<button class="chip" data-act="allNames">+' + (list.length - 8) + ' more</button>';
    return '<div class="names">' + chips + '</div>';
  }

  R['p-event'] = function () {
    var st = evState(), l = left(), n = going();
    var badge = { open: '<span class="pill glassy">Open</span>', last: '<span class="pill hot">Only ' + l + ' left</span>', full: '<span class="pill glassy">Full</span>',
      'in': '<span class="pill ok">You\'re in</span>', wait: '<span class="pill wait">Waitlist #' + (S.waitlist.indexOf(S.me.name) + 1) + '</span>' }[st];
    var avatars = S.players.slice(0, 5).map(function (p) { return '<span class="av">' + initials(p.n) + '</span>'; }).join('') + (n > 5 ? '<span class="av">+' + (n - 5) + '</span>' : '');
    var line = st === 'full' || (st === 'wait') ? 'Full · ' + S.waitlist.length + ' waiting' : (st === 'in' ? n + ' going · ' + l + ' spots left' : n + ' going · ' + l + (l === 1 ? ' spot left' : ' spots left'));
    var dock;
    if (st === 'open' || st === 'last') {
      dock = '<button class="cta" data-act="sheet" data-arg="register">' + (S.ev.price ? (st === 'last' ? 'Grab a spot · ' : 'Register &amp; pay · ') + kc(S.ev.price) : 'Join for free') + '</button>';
    } else if (st === 'full') {
      dock = '<button class="cta navy" data-act="sheet" data-arg="waitlist">Join the waitlist</button><p class="fine">You only pay if a spot opens up.</p>';
    } else if (st === 'in') {
      dock = '<button class="cta" data-act="share" data-arg="player">Invite a friend</button><button class="link" data-act="sheet" data-arg="cancel">I can\'t come</button>';
    } else {
      dock = '<button class="cta" data-act="share" data-arg="player">Invite a friend</button><button class="link" data-act="leaveWait">Leave the waitlist</button>';
    }
    return screen('', status() + top(LOGO, '', ib('☰', 'data-act="sheet" data-arg="pmenu"', 'Menu')) +
      '<div class="scroll">' +
      '<div class="photo grain"><img src="' + IMG + S.ev.photo + '" alt="Padel player hitting the ball"><div class="badge">' + badge + '</div>' +
      '<div class="over-title">' + esc(S.ev.name) + '</div>' +
      '<div class="glass">' + glassKV([['Date &amp; time', S.ev.date + ' · ' + S.ev.start], ['Entry', kc(S.ev.price)], ['Location', S.ev.venue, 1], ['Format', S.ev.format], ['Level', S.ev.level]]) + '</div></div>' +
      '<div class="going"><div class="ring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div><div><div class="t">' + line + '</div><div class="avatars">' + avatars + '</div></div></div>' +
      '<div><div class="lbl" style="margin:2px 2px 8px">Who\'s playing</div>' + namesBlock() + '</div>' +
      '<div class="acc' + (S.acc ? ' open' : '') + '"><button data-act="acc"><span>Event details</span><span class="chev">▾</span></button><div class="inner"><dl class="dl">' +
      '<dt>Organizer</dt><dd>' + esc(S.community) + '</dd><dt>Address</dt><dd>' + esc(S.ev.address) + '</dd><dt>Time</dt><dd>' + S.ev.dateLong + ', ' + S.ev.time + '</dd>' +
      '<dt>Format</dt><dd>Americano: you play solo with a new partner every round. Most points wins.</dd><dt>Sign-up closes</dt><dd>Thu 29 Oct, 18:00</dd><dt>Cancellation</dt><dd>Free until 24 h before. Later, your spot goes to the waitlist.</dd></dl>' +
      '<button class="link" style="text-align:left" data-act="toast" data-arg="Added to your calendar">Add to calendar</button></div></div>' +
      '</div><div class="dock">' + dock + '</div>');
  };

  R['p-in'] = function () {
    var list = [S.me.name].concat(S.players.slice(-2).reverse().map(function (p) { return p.n; }));
    var n = going();
    return screen('dark', status() + top(ib('✕', 'data-go="p-event"', 'Close')) +
      '<div class="scroll" style="gap:18px;padding-top:6px">' +
      '<div class="check" aria-hidden="true">✓</div>' +
      '<h1 class="h-caps">You\'re in,<br>' + esc(S.me.name.split(' ')[0]) + '!</h1>' +
      '<div class="glass" style="background:rgba(255,255,255,.08)">' + glassKV([['Event', S.ev.name], ['Paid', S.ev.price ? kc(S.ev.price) : 'Free'], ['When &amp; where', S.ev.date + ' · ' + S.ev.start + ' · ' + S.ev.venue, 1]]) + '</div>' +
      '<div><div class="lbl" style="margin-bottom:8px">Who\'s playing · ' + n + '/' + S.ev.cap + '</div><div style="display:flex;flex-direction:column;gap:6px">' +
      list.map(function (nm, i) { return '<div class="ln' + (i === 0 ? ' me' : '') + '"><span>' + (n - i) + ' · ' + esc(nm) + '</span><span>' + (i === 0 ? 'You' : '') + '</span></div>'; }).join('') + '</div></div>' +
      '<p class="p muted" style="font-size:13.5px">We\'ll message you the day before. No account needed.</p>' +
      '</div><div class="dock"><button class="cta" data-act="share" data-arg="player">Invite a friend</button><button class="link" data-act="toast" data-arg="Added to your calendar">Add to calendar</button></div>');
  };

  R['p-reminder'] = function () {
    var inn = S.me.status === 'in';
    return screen('wa', '<div class="status"><span>17:00</span><span>●●● 5G</span></div>' +
      '<div class="top">' + ib('←', 'data-go="p-event"', 'Back') + '<div class="ttl" style="text-align:left;text-transform:none;letter-spacing:0;font:700 15px/1.2 var(--f-body)">PadelLeague<br><span style="font:400 11.5px/1 var(--f-body);opacity:.8">Business account</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px"><div class="sysmsg">Thursday</div>' +
      (inn ? '<div class="bubble in"><button class="prev" data-go="p-event"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(S.ev.name) + '</b>Tomorrow ' + S.ev.start + ' · ' + going() + '/' + S.ev.cap + ' going</div></button>' +
        'Hi ' + esc(S.me.name.split(' ')[0]) + ', see you <b>tomorrow at ' + S.ev.start + '</b> at ' + esc(S.ev.venue) + ' (' + esc(S.ev.address) + '). ' + going() + ' of ' + S.ev.cap + ' are in.' + (left() ? ' Bring a friend for the last ' + (left() === 1 ? 'spot' : left() + ' spots') + ' →' : '') +
        '<br><button class="wa-link" data-go="p-event">padelleague.eu/e/' + S.ev.slug + '</button><div class="time">17:00</div></div>' +
        '<div class="bubble in"><b>Can\'t make it?</b> <button class="wa-link" data-act="sheet" data-arg="cancel">Tap here</button> and your spot goes to the next person on the waitlist.<div class="time">17:00</div></div>'
        : '<div class="empty"><p>You are not signed up for ' + esc(S.ev.name) + ' yet, so there is no reminder.</p><button class="cta" style="max-width:240px" data-go="p-event">Open the event</button></div>') +
      '</div>');
  };

  /* ---------- ORGANIZER ---------- */
  R['o-signup'] = function () {
    return screen('', status() + top(ib('←', 'data-go="start"', 'Back'), '', '') +
      '<div class="scroll" style="gap:16px;padding-top:10px">' + LOGO +
      '<h1 class="h-caps" style="font-size:30px">Stop chasing names and money.</h1>' +
      '<p class="p muted">Create a free account. Your first event is ready in about two minutes.</p>' +
      '<button class="row" data-act="signup" style="justify-content:center;background:#000;color:#fff;border-color:#000"><b> Continue with Apple</b></button>' +
      '<button class="row" data-act="signup" style="justify-content:center"><b>G&nbsp; Continue with Google</b></button>' +
      '<div class="lbl" style="text-align:center">or with e-mail</div>' +
      '<label class="field"><span class="lbl">E-mail</span><input id="su-email" type="email" value="kuba@padelteplice.cz"></label>' +
      '<label class="field"><span class="lbl">Password</span><input id="su-pass" type="password" value="prototype"></label>' +
      '<p class="fine">By continuing you agree to the Terms and Privacy policy.</p>' +
      '</div><div class="dock"><button class="cta" data-act="signup">Create account</button><button class="link" data-act="toast" data-arg="Log in works like today">I already have an account</button></div>');
  };

  R['o-community'] = function () {
    return screen('', status() + top(ib('←', 'data-go="o-signup"', 'Back'), 'Step 1 of 2') +
      '<div class="scroll" style="gap:14px;padding-top:6px">' +
      '<h1 class="h-mid" style="font-size:26px">What do your players call your group?</h1>' +
      '<label class="field"><span class="lbl">Community name</span><input id="c-name" value="' + esc(S.community) + '"></label>' +
      '<label class="field"><span class="lbl">City</span><input id="c-city" value="' + esc(S.city) + '"></label>' +
      '<p class="fine" style="text-align:left">Home club, photo and description can wait. You\'ll find them in Settings.</p>' +
      '</div><div class="dock"><button class="cta" data-act="community">Next: your first event</button></div>');
  };

  R['o-home'] = function () {
    var n = going();
    var lastRow = S.last ? '<button class="row" data-go="o-after"><span><b>' + kc(S.last.collected) + '</b> · ' + S.last.showed + ' played · winner ' + esc(short(S.last.winner)) + '</span><span class="r">▸</span></button>'
      : '<button class="row" data-act="toast" data-arg="Finish an event to see the summary here"><span><b>3 200 Kč</b> · 15 played · winner Lukáš D.</span><span class="r">▸</span></button>';
    return screen('', status() + top('<span class="logo"><i></i>' + esc(S.community) + '</span>', '', ib('☰', 'data-act="sheet" data-arg="omenu"', 'Menu')) +
      '<div class="scroll" style="gap:12px">' +
      '<div class="lbl">Next event</div>' +
      '<button class="card-ev grain" data-go="o-manage"><img src="' + IMG + S.ev.photo + '" alt=""><div class="glass"><div class="sring" style="--p:' + pct() + '"><span>' + n + '/' + S.ev.cap + '</span></div>' +
      '<div class="kv"><div class="v">' + esc(S.ev.name) + '</div><div class="l" style="margin-top:4px">' + S.ev.date + ' · ' + (left() ? left() + ' spots left' : 'Full') + '</div></div></div></button>' +
      '<button class="row" data-act="share" data-arg="org"><span>Share the link</span><span class="r">⤴</span></button>' +
      '<div class="lbl" style="margin-top:6px">Last event</div>' + lastRow +
      '<button class="row" data-act="sheet" data-arg="omenu"><span>Analytics · payments · settings</span><span class="r">▸</span></button>' +
      '</div><div class="dock"><button class="cta" data-act="newEvent">+ New event</button></div>');
  };

  var FORMATS = [['Americano', 'Solo · rotating partners'], ['Mexicano', 'Solo · ranking decides'], ['Round Robin', 'Fixed pairs · all vs all'], ['Playoff', 'Fixed pairs · knockout']];
  R['o-new'] = function () {
    var d = S.draft || (S.draft = { name: 'Friday Americano', format: 'Americano', date: addDays('', S.ev.week), start: '18:00', venue: S.ev.venue, courts: 4, cap: 16, price: 200 });
    var paidBlocked = d.price > 0 && S.stripe !== 'active';
    var stripeBlock = d.price > 0 ? (S.stripe === 'active' ? '<div class="row"><span>Card payments</span><span class="pill ok">Active</span></div>'
      : '<div class="stripe-card"><span class="lbl">Get paid by card</span><div class="h-mid">No more chasing payments</div><p class="p" style="font-size:13px;opacity:.88">Players pay when they sign up. Money goes to your bank account. One-time setup with Stripe, about 5 minutes.</p>' +
        '<button class="cta" data-act="connectStripe">' + (S.stripe === 'pending' ? 'Finish Stripe setup' : 'Connect Stripe') + '</button>' +
        '<button class="link" style="color:#C7DAE4" data-act="paySite">Or let players pay on site</button></div>') : '';
    var more = S.more ? '<div class="acc open"><button data-act="more"><span>More options</span><span class="chev">▾</span></button><div class="inner">' +
      '<label class="field"><span class="lbl">Event name</span><input id="d-name" value="' + esc(d.name) + '"></label>' +
      '<div><div class="lbl" style="margin-bottom:6px">Type</div><div class="choice"><button class="on">Social</button><button>Competitive</button><button>Training</button></div></div>' +
      '<div><div class="lbl" style="margin-bottom:6px">Who can see it</div><div class="choice"><button class="on">Anyone with the link</button><button>Public</button><button>Community</button></div></div>' +
      '<div class="two"><label class="field"><span class="lbl">Level</span><select><option>All levels</option><option>1–3</option><option>3–5</option><option>5–7</option></select></label><label class="field"><span class="lbl">Players</span><select><option>Mixed</option><option>Men</option><option>Women</option></select></label></div>' +
      '<label class="field"><span class="lbl">Sign-up closes</span><select><option>24 h before</option><option>No deadline</option><option>3 days before</option></select></label>' +
      '<label class="field"><span class="lbl">Description</span><textarea rows="2" placeholder="Rules, prizes, what to bring…"></textarea></label>' +
      '<label class="field"><span class="lbl">Cancellation</span><input value="Free until 24 h before"></label>' +
      '<button class="row" data-act="toast" data-arg="Banner upload works like today"><span>Banner photo</span><span class="r">From your photos ▸</span></button>' +
      '</div></div>' : '<button class="row" data-act="more"><span>More options</span><span class="r">Name, level, visibility, deadline…  ▸</span></button>';
    return screen('', status() + top(ib('✕', 'data-go="o-home"', 'Close'), S.draft.edit ? 'Edit event' : 'New event', '<button class="link" style="color:var(--orange-ink);font-weight:700;text-decoration:none" data-act="sheet" data-arg="preview">Preview</button>') +
      '<div class="scroll" style="gap:12px">' +
      '<div class="lbl">Format</div><div class="formats">' + FORMATS.map(function (f) { return '<button class="fm' + (d.format === f[0] ? ' on' : '') + '" data-act="format" data-arg="' + f[0] + '"><b>' + f[0] + '</b><span>' + f[1] + '</span></button>'; }).join('') + '</div>' +
      '<label class="field"><span class="lbl">When</span><select id="d-date">' + [0, 1, 2].map(function (w) { var v = addDays('', S.ev.week + w); return '<option' + (v === d.date ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>' +
      '<div class="two"><label class="field"><span class="lbl">Start</span><select id="d-start"><option>18:00</option><option>19:00</option><option>20:00</option></select></label><div class="field"><span class="lbl">Courts</span><div class="stepper"><button data-act="step" data-arg="courts:-1" aria-label="Fewer courts">−</button><b>' + d.courts + '</b><button data-act="step" data-arg="courts:1" aria-label="More courts">+</button></div></div></div>' +
      '<label class="field"><span class="lbl">Where</span><input id="d-venue" value="' + esc(d.venue) + '"></label>' +
      '<div class="two"><div class="field"><span class="lbl">Players</span><div class="stepper"><button data-act="step" data-arg="cap:-4" aria-label="Fewer players">−</button><b>' + d.cap + '</b><button data-act="step" data-arg="cap:4" aria-label="More players">+</button></div></div>' +
      '<div class="field"><span class="lbl">Entry</span><div class="stepper"><button data-act="step" data-arg="price:-50" aria-label="Lower price">−</button><b>' + kc(d.price) + '</b><button data-act="step" data-arg="price:50" aria-label="Higher price">+</button></div></div></div>' +
      stripeBlock + more +
      '</div><div class="dock">' + (paidBlocked ? '<p class="fine">Connect Stripe or set the entry to Free to publish.</p>' : '') +
      '<button class="cta" data-act="publish"' + (paidBlocked ? ' disabled' : '') + '>' + (S.draft.edit ? 'Save changes' : 'Publish event') + '</button></div>');
  };

  R['o-stripe'] = function () {
    var steps = [
      ['Your details', '<label class="field"><span class="lbl">Legal name</span><input value="Jakub Líbal"></label><label class="field"><span class="lbl">Date of birth</span><input value="12 / 04 / 1990"></label><label class="field"><span class="lbl">Address</span><input value="Pražská 12, Teplice"></label>'],
      ['Where should we send money?', '<label class="field"><span class="lbl">IBAN</span><input value="CZ65 0800 0000 1920 0014 5399"></label><p class="fine" style="text-align:left">Stripe pays out every week. Their fee is 1.5 % + €0.25 per card payment.</p>']
    ];
    var s = steps[S.stripeStep];
    return screen('', '<div class="status" style="background:#635BFF;color:#fff"><span>12:11</span><span>●●● 5G</span></div>' +
      '<div class="top" style="background:#635BFF;color:#fff">' + ib('✕', 'data-go="o-new"', 'Close') + '<div class="ttl">stripe · step ' + (S.stripeStep + 1) + ' of 2</div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:16px;gap:12px"><p class="fine" style="text-align:left">Mock of Stripe\'s own screens. In the real app Stripe opens and sends the organizer back here.</p>' +
      '<h1 class="h-mid">' + s[0] + '</h1>' + s[1] + '</div>' +
      '<div class="dock"><button class="cta" style="background:#635BFF;box-shadow:none" data-act="stripeNext">' + (S.stripeStep ? 'Submit' : 'Continue') + '</button></div>');
  };

  R['o-live'] = function () {
    return screen('dark', status() + top(ib('✕', 'data-go="o-manage"', 'Close')) +
      '<div class="scroll" style="gap:16px;padding-top:6px">' +
      '<div class="check" aria-hidden="true">✓</div>' +
      '<h1 class="h-caps">' + esc(S.ev.name) + '<br>is live</h1>' +
      '<p class="p" style="opacity:.92">Want players to sign up and pay themselves? Send the link to your group.</p>' +
      '<div class="bubble"><div class="prev"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(S.ev.name) + '</b>' + S.ev.date + ' · ' + kc(S.ev.price) + ' · ' + going() + '/' + S.ev.cap + ' going</div></div>' +
      '🎾 ' + esc(S.ev.format) + ' on ' + S.ev.date + ' at ' + S.ev.start + ', ' + esc(S.ev.venue) + '. ' + S.ev.cap + ' spots, ' + kc(S.ev.price) + '. Sign up &amp; pay here 👇</div>' +
      '</div><div class="dock"><button class="cta" data-act="sendWA">Send to WhatsApp</button><button class="link" data-act="share" data-arg="org">Copy link or share elsewhere</button></div>');
  };

  R['o-wa'] = function () {
    return screen('wa', '<div class="status"><span>12:13</span><span>●●● 5G</span></div>' +
      '<div class="top">' + ib('←', 'data-go="o-live"', 'Back') + '<div class="ttl" style="text-align:left;text-transform:none;letter-spacing:0;font:700 15px/1.2 var(--f-body)">Padel Teplice 🎾<br><span style="font:400 11.5px/1 var(--f-body);opacity:.8">38 members</span></div><span class="ib ghost"></span></div>' +
      '<div class="scroll" style="padding-top:14px;gap:10px"><div class="sysmsg">Today</div>' +
      '<div class="bubble out"><div class="prev"><img src="' + IMG + S.ev.photo + '" alt=""><div><b>' + esc(S.ev.name) + '</b>' + S.ev.date + ' · ' + kc(S.ev.price) + '</div></div>🎾 ' + esc(S.ev.format) + ' on ' + S.ev.date + ' at ' + S.ev.start + '. Sign up &amp; pay here 👇<br><span class="wa-link">padelleague.eu/e/' + S.ev.slug + '</span><div class="time">12:13 ✓✓</div></div>' +
      (S.posted ? '<div class="bubble in"><div class="who">Klára</div>In and paid 🙌<div class="time">12:20</div></div><div class="bubble in"><div class="who">Petr</div>Done. Can I bring Filip?<div class="time">12:41</div></div><div class="bubble in"><div class="who">Filip</div>Signed up myself 👍<div class="time">13:02</div></div>' : '') +
      '</div><div class="dock">' + (S.posted ? '<button class="cta" data-go="o-manage">Back to PadelLeague</button>' : '<button class="cta white" data-act="fastForward">Fast-forward 2 days ⏩</button><p class="fine">Prototype shortcut: players sign up through the link.</p>') + '</div>');
  };

  var PAYLBL = { paid: 'Paid', unpaid: 'Unpaid', site: 'On site' };
  R['o-manage'] = function () {
    var paid = S.players.filter(function (p) { return p.pay !== 'unpaid'; }).length;
    var rows = S.players.map(function (p, i) {
      return '<div class="row"><span>' + esc(p.n) + '</span><span style="display:flex;gap:8px;align-items:center">' +
        (p.pay === 'unpaid' ? '<button class="r" style="text-decoration:underline" data-act="remind" data-arg="' + i + '">Remind</button>' : '') +
        '<button class="pill ' + p.pay + '" data-act="cyclePay" data-arg="' + i + '" aria-label="Change payment status">' + PAYLBL[p.pay] + '</button></span></div>';
    }).join('') || '<div class="empty"><p>No players yet. Share the link and they\'ll appear here as they sign up.</p></div>';
    var wl = S.waitlist.map(function (n, i) { return '<div class="row"><span>' + (i + 1) + ' · ' + esc(n) + '</span><button class="r" style="color:var(--orange-ink);font-weight:700" data-act="moveIn" data-arg="' + i + '">Move in</button></div>'; }).join('');
    var closed = !!S.sched;
    return screen('', status() + top(ib('←', 'data-go="o-home"', 'Back'), esc(S.ev.name) + '<br><span class="muted" style="font:500 11px/1 var(--f-body);letter-spacing:0;text-transform:none">' + S.ev.date + ' · ' + S.ev.start + '</span>', ib('⋯', 'data-act="sheet" data-arg="evmenu"', 'More')) +
      '<div class="scroll" style="gap:10px">' +
      '<div class="seg3"><div><b>' + S.players.length + '/' + S.ev.cap + '</b><span>Going</span></div><div><b>' + paid + '</b><span>Paid</span></div><div><b>' + S.waitlist.length + '</b><span>Waitlist</span></div></div>' +
      '<button class="row" data-act="share" data-arg="org"><span>Share the link</span><span class="r">⤴</span></button>' +
      '<div class="lbl" style="margin-top:4px">Players · tap a status to change it</div>' + rows +
      (wl ? '<div class="lbl" style="margin-top:6px">Waitlist</div>' + wl : '') +
      '</div><div class="dock">' + (S.players.length < 4 ? '<button class="cta" data-act="share" data-arg="org">Share the link</button>' :
        '<button class="cta" data-act="buildSchedule">' + (closed ? 'Open schedule' : 'Close sign-up &amp; build schedule') + '</button>') + '</div>');
  };

  function rng(seed) { return function () { seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function buildSched() {
    var ps = S.players.map(function (p) { return p.n; });
    var courts = Math.min(S.ev.courts, Math.floor(ps.length / 4)), rounds = 4, out = [];
    var rand = rng(hash(ps.join('|')) + (S.shuffle || 0) * 7919), seen = {}, rested = {};
    function key(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
    for (var r = 0; r < rounds; r++) {
      var best = null, bestCost = 1e9;
      for (var k = 0; k < 200; k++) {
        var arr = ps.slice();
        for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
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
    var rds = S.sched.map(function (rd, r) {
      return '<div class="round"><h4><span>Round ' + (r + 1) + '</span><span class="muted" style="font:500 11px/1 var(--f-body)">' + rd.m.length + ' courts</span></h4>' +
        rd.m.map(function (mt, c) { return '<div class="match"><span>' + esc(short(mt.a[0])) + '<br>' + esc(short(mt.a[1])) + '</span><span class="vs">Court ' + (c + 1) + '</span><span class="b">' + esc(short(mt.b[0])) + '<br>' + esc(short(mt.b[1])) + '</span></div>'; }).join('') +
        (rd.rest.length ? '<div class="rest">Resting: ' + rd.rest.map(short).map(esc).join(', ') + '</div>' : '') + '</div>';
    }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-manage"', 'Back'), 'Schedule', ib('↻', 'data-act="reshuffle"', 'Shuffle again')) +
      '<div class="scroll" style="gap:10px"><p class="p muted" style="font-size:13.5px">' + S.players.length + ' players · ' + S.sched[0].m.length + ' courts · 4 rounds · 24 points per match. New partner every round, rest is shared fairly.</p>' + rds +
      '</div><div class="dock"><button class="cta" data-act="startPlay">Start the event</button></div>');
  };

  function roundDone(r) { return S.play.scores[r].every(function (x) { return x; }); }
  function allDone() { return S.play.scores.every(function (rd) { return rd.every(function (x) { return x; }); }); }
  R['o-play'] = function () {
    var r = S.play.round, rd = S.sched[r];
    var tabs = S.sched.map(function (_, i) { return '<button class="' + (i === r ? 'on' : (roundDone(i) ? 'done' : '')) + '" data-act="round" data-arg="' + i + '">Round ' + (i + 1) + (roundDone(i) ? ' ✓' : '') + '</button>'; }).join('');
    var courts = rd.m.map(function (mt, c) {
      var sc = S.play.scores[r][c];
      return '<div class="court"><div style="display:flex;justify-content:space-between"><span class="lbl">Court ' + (c + 1) + '</span>' + (sc ? '<span class="pill ok">Saved</span>' : '') + '</div>' +
        '<div class="teams"><div class="team">' + esc(short(mt.a[0])) + '<br>' + esc(short(mt.a[1])) + '</div>' +
        (sc ? '<span class="score-big">' + sc[0] + ':' + sc[1] + '</span>' : '<button class="pill hot" data-act="score" data-arg="' + r + ':' + c + '">Enter score</button>') +
        '<div class="team b">' + esc(short(mt.b[0])) + '<br>' + esc(short(mt.b[1])) + '</div></div>' +
        (sc ? '<button class="link" style="text-align:right" data-act="score" data-arg="' + r + ':' + c + '">Fix score</button>' : '') + '</div>';
    }).join('');
    var done = allDone();
    var stand = standings().slice(0, 5).map(function (p, i) { return '<div><span>' + (i + 1) + ' · ' + esc(p.n) + '</span><b>' + p.pts + '</b></div>'; }).join('');
    return screen('', status() + top(ib('←', 'data-go="o-schedule"', 'Back'), '<span class="pill ok" style="margin-right:6px">Live</span>' + esc(S.ev.name), ib('⋯', 'data-act="toast" data-arg="Pause, fix and settings work like today"', 'More')) +
      '<div class="scroll" style="gap:12px"><div class="tabs">' + tabs + '</div>' + courts +
      '<div class="lbl" style="margin-top:4px">Live standings</div><div class="stand">' + stand + '</div>' +
      '</div><div class="dock">' + (done ? '<button class="cta" data-act="finish">Finish the event</button>' :
        '<button class="cta" disabled>Round ' + (r + 1) + ' of 4 · ' + (function (k) { return k + (k === 1 ? ' court' : ' courts'); })(S.play.scores[r].filter(function (x) { return !x; }).length) + ' to score</button><button class="link" data-act="autofill">Fill remaining scores (demo)</button>') + '</div>');
  };

  function fillScores() {
    S.play.scores.forEach(function (rd, r) { rd.forEach(function (x, c) { if (!x) { var a = 8 + (hash(r + ':' + c + S.ev.name) % 9); rd[c] = [a, 24 - a]; } }); });
    S.play.round = S.sched.length - 1;
  }
  function standings() {
    var pts = {};
    S.players.forEach(function (p) { pts[p.n] = 0; });
    if (S.sched) S.sched.forEach(function (rd, r) {
      rd.m.forEach(function (mt, c) { var sc = S.play.scores[r][c]; if (!sc) return; mt.a.forEach(function (n) { pts[n] += sc[0]; }); mt.b.forEach(function (n) { pts[n] += sc[1]; }); });
    });
    return Object.keys(pts).map(function (n) { return { n: n, pts: pts[n] }; }).sort(function (a, b) { return b.pts - a.pts || a.n.localeCompare(b.n); });
  }

  R['o-after'] = function () {
    var L = S.last;
    if (!L) return R['o-home']();
    var st = L.stand;
    return screen('dark', status() + top(ib('←', 'data-go="o-home"', 'Back'), esc(L.name) + ' · done', ib('⋯', 'data-act="toast" data-arg="Fix results and all matches are in this menu"', 'More')) +
      '<div class="scroll" style="gap:14px">' +
      '<div><div class="lbl">Collected</div><div class="money" style="margin-top:6px">' + kc(L.collected) + '</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill ok">' + L.paid + '/' + L.total + ' paid</span><span class="pill site">' + L.showed + ' played</span>' + (L.unpaid ? '<span class="pill wait">' + L.unpaid + ' to collect</span>' : '') + '</div>' +
      '<div class="podium" style="margin-top:6px">' +
      '<div class="pod s"><span class="m">2</span><b>' + esc(short(st[1].n)) + '</b><span>' + st[1].pts + ' pts</span></div>' +
      '<div class="pod g"><span class="m">1</span><b>' + esc(short(st[0].n)) + '</b><span>' + st[0].pts + ' pts</span></div>' +
      '<div class="pod b3"><span class="m">3</span><b>' + esc(short(st[2].n)) + '</b><span>' + st[2].pts + ' pts</span></div></div>' +
      '<div class="stand">' + st.slice(3, 8).map(function (p, i) { return '<div><span>' + (i + 4) + ' · ' + esc(p.n) + '</span><b>' + p.pts + '</b></div>'; }).join('') + '</div>' +
      '</div><div class="dock"><button class="cta" data-act="nextEvent">Create next event<small>' + addDays('', S.ev.week + 1) + ' · same setup</small></button><button class="link" data-go="o-card">Share the results card</button></div>');
  };

  R['o-card'] = function () {
    var L = S.last; if (!L) return R['o-home']();
    var w = L.stand[0];
    return screen('', status() + top(ib('←', 'data-go="o-after"', 'Back'), 'Results card') +
      '<div class="scroll"><div class="somecard grain"><img src="' + IMG + 'court-blue-orange.jpg" alt="">' +
      '<div class="glass">' + glassKV([['Name', w.n], ['Event', L.name + ' · ' + S.community], ['Event details', L.date + ' 2026 · ' + S.city]]) +
      '<div class="kv"><div class="l">Points</div><div class="v" style="font-size:36px;line-height:1">' + w.pts + '</div></div><div class="kv"><div class="l">Result</div><div class="v" style="font-size:34px;line-height:1">Winner!</div></div></div>' +
      '<div class="won">#1<small>of ' + L.showed + '</small></div><div class="some-foot">Run your own event<br>padelleague.eu</div></div></div>' +
      '<div class="dock"><button class="cta" data-act="toast" data-arg="Opening Instagram stories…">Share to Instagram</button><button class="link" data-act="toast" data-arg="Card sent to all ' + L.showed + ' players">Send to all players</button></div>');
  };

  R['o-next'] = function () {
    var d = addDays('', S.ev.week + 1);
    function row(l, v, ch) { return '<button class="row" data-act="editNext"><span><span class="lbl">' + l + '</span><br>' + (ch ? '<span class="changed">' + v + '</span>' : v) + '</span><span class="r">Edit</span></button>'; }
    return screen('', status() + top(ib('✕', 'data-go="o-after"', 'Close'), 'Next event') +
      '<div class="scroll" style="gap:10px"><h1 class="h-mid" style="font-size:24px">Same as last ' + S.ev.date.split(' ')[0] + 'day?</h1>' +
      row('Date', d + ' · ' + S.ev.time, 1) + row('Format', S.ev.format + ' · ' + S.ev.cap + ' players') + row('Where', S.ev.venue + ' · ' + S.ev.courts + ' courts') + row('Entry', kc(S.ev.price) + (S.ev.price ? ' · card' : '')) +
      '<button class="row" style="background:var(--warn-bg);border-color:#FDD3B0" data-act="invitePrev"><span>Send the link to last week\'s ' + (S.last ? S.last.total : 16) + ' players first</span><span class="sw' + (S.invitePrev ? ' on' : '') + '"></span></button>' +
      '</div><div class="dock"><button class="cta" data-act="publishNext">Publish &amp; send link</button></div>');
  };

  /* ---------- SHEETS ---------- */
  var SH = {};
  SH.register = function () {
    var free = !S.ev.price;
    return '<div class="grab"></div><h2 class="h-mid">Join ' + esc(S.ev.name) + '</h2><p class="fine" style="text-align:left;margin-top:-6px">' + S.ev.date + ' · ' + S.ev.start + ' · ' + esc(S.ev.venue) + '</p>' +
      '<label class="field"><span class="lbl">Your name</span><input id="f-name" autocomplete="name" value="' + esc(S.me.name) + '"></label>' +
      '<label class="field"><span class="lbl">Phone or e-mail</span><input id="f-contact" autocomplete="tel" value="' + esc(S.me.contact) + '"></label>' +
      (free ? '' : '<div class="methods">' + [['apple', ' Pay'], ['google', 'G Pay'], ['card', 'Card']].map(function (m) { return '<button class="' + (S.method === m[0] ? 'on' : '') + '" data-act="method" data-arg="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        (S.method === 'card' ? '<label class="field"><span class="lbl">Card number</span><input value="4242 4242 4242 4242"></label><div class="two"><label class="field"><span class="lbl">Expiry</span><input value="12 / 28"></label><label class="field"><span class="lbl">CVC</span><input value="123"></label></div>' : '')) +
      '<button class="cta" data-act="' + (free ? 'joinFree' : 'pay') + '">' + (free ? 'Join for free' : 'Pay ' + kc(S.ev.price) + ' &amp; join') + '</button>' +
      '<p class="fine">No account, no password. We\'ll message you the day before.</p>';
  };
  SH.paying = function () {
    return '<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px"> Pay</b><span class="fine">Cancel</span></div>' +
      '<div class="row" style="background:#fff"><span>PADELLEAGUE · ' + esc(S.ev.name) + '</span><b>' + kc(S.ev.price) + '</b></div>' +
      '<div class="spinner" aria-hidden="true"></div><p class="fine">Confirm with Face ID</p>';
  };
  SH.waitlist = function () {
    return '<div class="grab"></div><h2 class="h-mid">Join the waitlist</h2><p class="p muted" style="font-size:14px">' + esc(S.ev.name) + ' is full. If someone drops out, the first person on the list gets the spot and a payment link.</p>' +
      '<label class="field"><span class="lbl">Your name</span><input id="f-name" value="' + esc(S.me.name) + '"></label>' +
      '<label class="field"><span class="lbl">Phone or e-mail</span><input id="f-contact" value="' + esc(S.me.contact) + '"></label>' +
      '<button class="cta navy" data-act="joinWait">Join the waitlist · you\'d be #' + (S.waitlist.length + 1) + '</button><p class="fine">Nothing to pay now.</p>';
  };
  SH.cancel = function () {
    return '<div class="grab"></div><h2 class="h-mid">Can\'t make it?</h2><p class="p muted" style="font-size:14px">Your spot goes to ' + (S.waitlist[0] ? esc(S.waitlist[0]) + ', first on the waitlist' : 'the next person who signs up') + '. You get your ' + kc(S.ev.price) + ' back because it is more than 24 h before the start.</p>' +
      '<button class="cta navy" data-act="cancelMe">Give up my spot</button><button class="link" data-act="close">Keep my spot</button>';
  };
  SH.share = function () {
    var org = S.ctx === 'org';
    var msg = org ? '🎾 ' + S.ev.format + ' on ' + S.ev.date + ' at ' + S.ev.start + '. Sign up & pay here 👇' : 'I\'m in for ' + S.ev.name + ' on ' + S.ev.date.split(' ')[0] + '. ' + left() + ' spots left 👇';
    return '<div class="grab"></div><h2 class="h-mid">' + (org ? 'Share the link' : 'Invite a friend') + '</h2>' +
      '<div class="bubble out" style="max-width:100%;align-self:stretch">' + esc(msg) + '<br><span class="wa-link">padelleague.eu/e/' + S.ev.slug + '</span></div>' +
      '<div class="share-grid"><button class="w" data-act="shareTo" data-arg="wa"><i>✆</i>WhatsApp</button><button class="ig" data-act="shareTo" data-arg="ig"><i>◎</i>Stories</button><button data-act="shareTo" data-arg="copy"><i>⧉</i>Copy link</button><button data-act="shareTo" data-arg="qr"><i>▦</i>QR code</button></div>' +
      '<button class="link" data-act="close">Close</button>';
  };
  SH.pmenu = function () {
    return '<div class="grab"></div>' +
      '<button class="row" data-act="toast" data-arg="Players never need an account. Log in stays here for those who have one."><span>Log in</span><span class="r">Optional</span></button>' +
      '<button class="row" data-go="p-reminder"><span>See the reminder message</span><span class="r">Prototype</span></button>' +
      '<button class="row" data-act="toast" data-arg="Thanks, we got it"><span>Report a problem</span><span class="r">▸</span></button>' +
      '<button class="link" data-act="close">Close</button>';
  };
  SH.omenu = function () {
    var items = ['Analytics', 'Payments', 'Players & members', 'Moderation', 'Settings', 'View as player'];
    return '<div class="grab"></div><div class="lbl">' + esc(S.community) + '</div>' +
      items.map(function (t) { return t === 'View as player' ? '<button class="row" data-go="p-event"><span>' + t + '</span><span class="r">▸</span></button>' : t === 'Payments' ? '<button class="row" data-act="toast" data-arg="Stripe: ' + (S.stripe === 'active' ? 'Active' : S.stripe === 'pending' ? 'Pending check' : 'Not connected') + '. Management stays as today."><span>Payments</span><span class="pill ' + (S.stripe === 'active' ? 'ok' : 'wait') + '">' + (S.stripe === 'active' ? 'Active' : 'Not connected') + '</span></button>' : '<button class="row" data-act="toast" data-arg="' + t + ' stays as it is in the app today"><span>' + t + '</span><span class="r">▸</span></button>'; }).join('') +
      '<button class="link" data-act="close">Close</button>';
  };
  SH.evmenu = function () {
    return '<div class="grab"></div>' +
      '<button class="row" data-act="editEvent"><span>Edit event</span><span class="r">▸</span></button>' +
      '<button class="row" data-act="addPlayer"><span>Add a player yourself</span><span class="r">+</span></button>' +
      '<button class="row" data-go="p-event"><span>View as player</span><span class="r">▸</span></button>' +
      '<button class="row" data-act="toast" data-arg="Attendance, roster check and cancel event stay in this menu"><span>Attendance · cancel event</span><span class="r">▸</span></button>' +
      '<button class="link" data-act="close">Close</button>';
  };
  SH.preview = function () {
    var d = S.draft;
    return '<div class="grab"></div><div class="lbl">What players will see</div><div class="photo grain" style="min-height:260px"><img src="' + IMG + S.ev.photo + '" alt=""><div class="over-title">' + esc(d.name) + '</div>' +
      '<div class="glass">' + glassKV([['Date &amp; time', d.date + ' · ' + d.start], ['Entry', kc(d.price)], ['Location', d.venue, 1], ['Format', d.format], ['Spots', d.cap + ' players']]) + '</div></div><button class="cta" data-act="close">Back to editing</button>';
  };
  SH.score = function () {
    var t = S.scoreTarget, mt = S.sched[t[0]].m[t[1]], b = '';
    for (var i = 0; i <= 24; i++) b += '<button data-act="setScore" data-arg="' + i + '">' + i + ':' + (24 - i) + '</button>';
    return '<div class="grab"></div><h2 class="h-mid">Court ' + (t[1] + 1) + ' · round ' + (t[0] + 1) + '</h2><p class="fine" style="text-align:left">' + esc(short(mt.a[0])) + ' &amp; ' + esc(short(mt.a[1])) + ' vs ' + esc(short(mt.b[0])) + ' &amp; ' + esc(short(mt.b[1])) + '. Tap the result, it saves straight away.</p><div class="scores">' + b + '</div><button class="link" data-act="close">Cancel</button>';
  };

  /* ---------- ACTIONS ---------- */
  function val(id, d) { var el = document.getElementById(id); return el && el.value.trim() ? el.value.trim() : d; }
  function closeSheet() { S.sheet = null; render(); }
  var A = {
    sheet: function (a) { S.sheet = a; render(); },
    close: closeSheet,
    acc: function () { S.acc = !S.acc; render(); },
    allNames: function () { S.allNames = true; render(); },
    toast: function (a) { S.sheet = null; toast(a); },
    method: function (a) { S.method = a; render(); },
    pay: function () {
      S.me.name = val('f-name', S.me.name); S.me.contact = val('f-contact', S.me.contact);
      if (S.method === 'card') { S.me.status = 'in'; S.sheet = null; go('p-in'); return; }
      S.sheet = 'paying'; render();
      setTimeout(function () { S.me.status = 'in'; S.sheet = null; go('p-in'); }, 1400);
    },
    joinFree: function () { S.me.name = val('f-name', S.me.name); S.me.contact = val('f-contact', S.me.contact); S.me.status = 'in'; S.sheet = null; go('p-in'); },
    joinWait: function () { S.me.name = val('f-name', S.me.name); S.waitlist.push(S.me.name); S.me.status = 'wait'; S.sheet = null; toast('You\'re #' + S.waitlist.length + ' on the waitlist'); },
    leaveWait: function () { S.waitlist = S.waitlist.filter(function (n) { return n !== S.me.name; }); S.me.status = null; toast('You left the waitlist'); },
    cancelMe: function () {
      S.me.status = null; S.sheet = null;
      if (S.waitlist.length) { var n = S.waitlist.shift(); S.players.push({ n: n, pay: 'unpaid' }); toast('Spot given to ' + n + '. Refund on its way.'); }
      else toast('Your spot is free again. Refund on its way.');
      go('p-event');
    },
    share: function (a) { S.ctx = a; S.sheet = 'share'; render(); },
    shareTo: function (a) {
      var url = location.origin + location.pathname + '#/p-event';
      if (a === 'copy') { try { if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {}); } catch (e) { /* prototyp */ } S.sheet = null; toast('Link copied'); return; }
      if (a === 'wa' && S.ctx === 'org') { S.sheet = null; A.sendWA(); return; }
      S.sheet = null; toast({ wa: 'Opening WhatsApp…', ig: 'Opening Instagram stories…', qr: 'QR code ready to show on your phone' }[a]);
    },
    signup: function () { go('o-community'); },
    community: function () { S.community = val('c-name', S.community); S.city = val('c-city', S.city); S.draft = null; S.players = []; S.waitlist = []; S.last = null; S.sched = null; S.stripe = 'none'; go('o-new'); },
    newEvent: function () { S.draft = null; go('o-new'); },
    format: function (a) { readDraft(); S.draft.format = a; S.draft.name = S.draft.date.split(' ')[0] + 'day ' + a; render(); },
    step: function (a) {
      readDraft();
      var p = a.split(':'), k = p[0], v = +p[1], d = S.draft;
      d[k] = Math.max(k === 'cap' ? 4 : k === 'courts' ? 1 : 0, Math.min(k === 'cap' ? 48 : k === 'courts' ? 8 : 1000, d[k] + v));
      render();
    },
    more: function () { readDraft(); S.more = !S.more; render(); },
    connectStripe: function () { readDraft(); S.stripeStep = 0; go('o-stripe'); },
    stripeNext: function () { if (S.stripeStep === 0) { S.stripeStep = 1; render(); } else { S.stripe = 'active'; go('o-new'); toast('Card payments are on'); } },
    paySite: function () { readDraft(); S.stripe = 'active'; toast('Players will pay you on site. You can switch to card later.'); },
    publish: function () {
      readDraft();
      var d = S.draft;
      if (d.price > 0 && S.stripe !== 'active') return;
      var edit = d.edit;
      Object.assign(S.ev, { name: d.name, format: d.format, date: d.date, start: d.start, time: d.start + ' – ' + (parseInt(d.start, 10) + 2) + ':00', venue: d.venue, courts: d.courts, cap: d.cap, price: d.price,
        slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      S.ev.dateLong = S.ev.date.replace('Fri', 'Friday').replace('Oct', 'October').replace('Nov', 'November');
      S.draft = null; S.more = false;
      if (edit) { toast('Changes saved'); go('o-manage'); return; }
      S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live');
    },
    sendWA: function () { go('o-wa'); },
    fastForward: function () {
      var n = Math.max(0, S.ev.cap - 2), start = S.ev.week % 3;
      S.players = [];
      for (var i = 0; i < n; i++) S.players.push({ n: NAMES[(i + start) % NAMES.length], pay: PAYS[i % PAYS.length] });
      S.posted = true; render();
    },
    cyclePay: function (a) { var p = S.players[+a], order = ['unpaid', 'paid', 'site']; p.pay = order[(order.indexOf(p.pay) + 1) % 3]; render(); },
    remind: function (a) { toast('Payment reminder sent to ' + S.players[+a].n.split(' ')[0]); },
    moveIn: function (a) {
      if (S.players.length >= S.ev.cap) { toast('The event is full. Raise the capacity in Edit event.'); return; }
      var n = S.waitlist.splice(+a, 1)[0]; S.players.push({ n: n, pay: 'unpaid' }); toast(n.split(' ')[0] + ' is in and got a payment link');
    },
    addPlayer: function () {
      if (S.players.length >= S.ev.cap) { S.sheet = null; toast('The event is full'); return; }
      S.players.push({ n: NAMES[(S.players.length + 3) % NAMES.length].split(' ')[0] + ' (added by you)', pay: 'site' }); S.sheet = null; toast('Player added, paying on site');
    },
    editEvent: function () { S.sheet = null; S.draft = { edit: true, name: S.ev.name, format: S.ev.format, date: S.ev.date, start: S.ev.start, venue: S.ev.venue, courts: S.ev.courts, cap: S.ev.cap, price: S.ev.price }; go('o-new'); },
    buildSchedule: function () { if (!S.sched) buildSched(); go('o-schedule'); },
    reshuffle: function () { S.shuffle = (S.shuffle || 0) + 1; buildSched(); toast('New schedule'); },
    startPlay: function () { go('o-play'); },
    round: function (a) { S.play.round = +a; render(); },
    score: function (a) { var p = a.split(':'); S.scoreTarget = [+p[0], +p[1]]; S.sheet = 'score'; render(); },
    setScore: function (a) {
      var t = S.scoreTarget; S.play.scores[t[0]][t[1]] = [+a, 24 - a]; S.sheet = null;
      if (roundDone(t[0]) && t[0] === S.play.round && t[0] < S.sched.length - 1) { S.play.round++; toast('Round ' + (S.play.round + 1) + ' is on'); } else render();
    },
    autofill: function () { fillScores(); render(); },
    finish: function () {
      var st = standings();
      var paid = S.players.filter(function (p) { return p.pay !== 'unpaid'; }).length;
      S.last = { name: S.ev.name, date: S.ev.date.replace('Fri ', ''), stand: st, winner: st[0].n, total: S.players.length, paid: paid, unpaid: S.players.length - paid, showed: S.players.length, collected: paid * S.ev.price };
      go('o-after');
    },
    nextEvent: function () { go('o-next'); },
    editNext: function () { S.ev.week += 1; S.draft = { name: S.ev.name, format: S.ev.format, date: addDays('', S.ev.week), start: S.ev.start, venue: S.ev.venue, courts: S.ev.courts, cap: S.ev.cap, price: S.ev.price }; S.ev.week -= 1; go('o-new'); },
    invitePrev: function () { S.invitePrev = !S.invitePrev; render(); },
    publishNext: function () {
      S.ev.week += 1; S.ev.date = addDays('', S.ev.week); S.ev.dateLong = S.ev.date.replace('Fri', 'Friday').replace('Oct', 'October').replace('Nov', 'November');
      S.players = []; S.waitlist = []; S.sched = null; S.posted = false; S.me.status = null;
      go('o-live'); if (S.invitePrev) toast('Link sent to last week\'s players');
    }
  };
  function readDraft() {
    if (!S.draft) return;
    S.draft.date = val('d-date', S.draft.date); S.draft.start = val('d-start', S.draft.start); S.draft.venue = val('d-venue', S.draft.venue); S.draft.name = val('d-name', S.draft.name);
  }

  /* ---------- PRESETS (panel) ---------- */
  var PRESETS = {
    open: function () { S.players = mkPlayers(9); S.waitlist = []; S.me.status = null; },
    last: function () { S.players = mkPlayers(14); S.waitlist = []; S.me.status = null; },
    full: function () { S.players = mkPlayers(16); S.waitlist = [NAMES[16], NAMES[17], NAMES[18]]; S.me.status = null; },
    in: function () { if (S.players.length >= S.ev.cap) S.players = mkPlayers(9); S.me.status = 'in'; },
    paid: function () { S.ev.price = 200; }, free: function () { S.ev.price = 0; },
    stripeOn: function () { S.stripe = 'active'; }, stripeOff: function () { S.stripe = 'none'; },
    reset: function () { S = fresh(); }
  };

  /* ---------- RENDER ---------- */
  var app = document.getElementById('app');
  function route() { var h = location.hash.replace(/^#\/?/, ''); return R[h] ? h : 'start'; }
  function render() {
    var r = route();
    if (r === 'o-after' && !S.last) { demoFinished(); }
    if ((r === 'o-schedule' || r === 'o-play') && !S.sched) { if (S.players.length < 4) S.players = mkPlayers(14); buildSched(); }
    if (r === 'o-card' && !S.last) demoFinished();
    var html = R[r]();
    if (S.sheet && SH[S.sheet]) html += '<div class="overlay" data-act="' + (S.sheet === 'paying' ? '' : 'close') + '"></div><div class="sheet' + (S.sheet === 'paying' ? ' paysheet' : '') + '" role="dialog" aria-modal="true">' + SH[S.sheet]() + '</div>';
    if (S.toast) html += '<div class="toast" role="status"><span>✓</span><span>' + esc(S.toast) + '</span></div>';
    app.innerHTML = html;
    document.querySelectorAll('[data-route]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-route') === r); });
    document.querySelectorAll('[data-preset-grp]').forEach(syncPresetButtons);
  }
  function demoFinished() {
    if (S.players.length < 8) S.players = mkPlayers(16);
    buildSched(); fillScores(); var st = standings(); var paid = S.players.filter(function (p) { return p.pay !== 'unpaid'; }).length;
    S.last = { name: S.ev.name, date: S.ev.date.replace('Fri ', ''), stand: st, winner: st[0].n, total: S.players.length, paid: paid, unpaid: S.players.length - paid, showed: S.players.length, collected: paid * S.ev.price };
  }
  function syncPresetButtons(grp) {
    var g = grp.getAttribute('data-preset-grp'), cur;
    if (g === 'fill') cur = S.me.status === 'in' ? 'in' : (left() === 0 ? 'full' : left() <= 2 ? 'last' : 'open');
    if (g === 'price') cur = S.ev.price ? 'paid' : 'free';
    if (g === 'stripe') cur = S.stripe === 'active' ? 'stripeOn' : 'stripeOff';
    grp.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-preset') === cur); });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go],[data-act],[data-preset],[data-panel]');
    if (!el) return;
    if (el.hasAttribute('data-panel')) { document.querySelector('.panel').classList.toggle('open'); return; }
    if (el.hasAttribute('data-preset')) { PRESETS[el.getAttribute('data-preset')](); render(); return; }
    if (el.hasAttribute('data-go')) { e.preventDefault(); S.sheet = null; go(el.getAttribute('data-go')); return; }
    var a = el.getAttribute('data-act');
    if (a && A[a]) { e.preventDefault(); A[a](el.getAttribute('data-arg')); }
  });
  document.querySelectorAll('.panel a[data-route]').forEach(function (a) { a.addEventListener('click', function () { document.querySelector('.panel').classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet && S.sheet !== 'paying') closeSheet(); });
  window.addEventListener('hashchange', function () { S.sheet = null; render(); var sc = app.querySelector('.scroll'); if (sc) sc.scrollTop = 0; });
  render();
})();
