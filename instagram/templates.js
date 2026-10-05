/* Šablony grafik PadelLeague pro Instagram.
   Každá šablona vrací HTML grafiky ve skutečném rozměru: příspěvek 1080 × 1350, story 1080 × 1920.
   Obsah se bere z window.IG (content.js). Jeden design = libovolně mnoho grafik. */
(function () {
  'use strict';
  var IG = window.IG, LOGO = window.PL_LOGO, IMG = '../assets/img/';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function P(id) { return IG.players[id] || id; }
  function ini(id) { return P(id).replace('.', '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  /* nadpis: řádky odděluje |, řádek začínající ~ je tenký (kontrast váhy podle JVS) */
  function title(s, cls) {
    return '<h2 class="g-title ' + (cls || '') + '">' + String(s).split('|').map(function (l) {
      return l.charAt(0) === '~' ? '<span class="lt">' + esc(l.slice(1)) + '</span>' : '<span>' + esc(l) + '</span>';
    }).join('') + '</h2>';
  }
  function avatars(ids, n) {
    var a = ids.slice(0, n || 5).map(function (id, i) { return '<i class="g-av g-av' + (i % 3) + '">' + ini(id) + '</i>'; }).join('');
    return '<div class="g-avs">' + a + (ids.length > (n || 5) ? '<i class="g-av g-avm">+' + (ids.length - (n || 5)) + '</i>' : '') + '</div>';
  }
  function photo(src, dim) { return '<div class="g-photo"><img src="' + IMG + src + '" alt="" crossorigin="anonymous"><div class="g-shade' + (dim ? ' ' + dim : '') + '"></div><div class="g-grain"></div></div>'; }
  function foot(o, light) {
    var dots = '';
    if (o.n > 1) { for (var i = 0; i < o.n; i++) dots += '<i class="' + (i === o.i ? 'on' : '') + '"></i>'; }
    return '<div class="g-foot"><span class="g-logo">' + LOGO.full + '</span><span class="g-dots">' + dots + '</span></div>';
  }
  function head(d) { return '<div class="g-head"><span class="g-num">' + esc(d.num || '') + '</span><span class="g-tag">' + esc(d.tag || '') + '</span></div>'; }
  function frame(tone, inner, d, o, extraCls) {
    return '<div class="g g-feed tone-' + tone + (extraCls ? ' ' + extraCls : '') + '">' + inner + head(d) + foot(o) + '</div>';
  }
  function sframe(tone, inner, extraCls) {
    return '<div class="g g-story tone-' + tone + (extraCls ? ' ' + extraCls : '') + '">' + inner + '<div class="g-sfoot"><span class="g-logo">' + LOGO.full + '</span></div></div>';
  }
  function going(ev) { return ev.going.length; }
  function leftTxt(n) { return n === 1 ? 'ZBÝVÁ 1 MÍSTO' : (n >= 2 && n <= 4 ? 'ZBÝVAJÍ ' + n + ' MÍSTA' : 'ZBÝVÁ ' + n + ' MÍST'); }

  /* ---------- drobné makety (vložené do slidů) ---------- */
  function mockWA(lines, short) {
    return '<div class="m-wa"><div class="m-wa-top"><b>Padel čtvrtek 🎾</b><span>38 členů · 9 píše…</span></div>' +
      '<div class="m-bubble"><b>Ty</b>Americano ve čtvrtek 19:00! 12 míst, 350 Kč. Pište jména 👇</div>' +
      '<div class="m-bubble m-list">' + lines.map(esc).join('<br>') + '</div>' +
      (short ? '' : '<div class="m-bubble"><b>Hewidy</b>tak jsem tam, nebo ne?? 😅</div>') + '</div>';
  }
  function mockLink(ev) {
    var n = going(ev);
    return '<div class="m-link"><div class="m-og">' + photo('court-orange-close.jpg', 'soft') +
      '<div class="g-glass m-og-glass"><div class="kv"><span>EVENT</span><b>' + esc(ev.name) + '</b></div><div class="kv"><span>KDY</span><b>' + esc(ev.day + ' · ' + ev.time) + '</b></div>' +
      '<div class="kv full"><span>PŘIHLÁŠENO</span><b>' + n + '/' + ev.cap + ' · ' + leftTxt(ev.cap - n).toLowerCase() + '</b></div>' + avatars(ev.going, 4) + '</div></div>' +
      '<div class="m-og-txt"><b>' + esc(ev.name) + ' · ' + esc(IG.community.name) + '</b><span>Přihlas se a zaplať za 30 s. Bez účtu.</span><em>padelleague.eu</em></div></div>';
  }
  function mockPage(ev) {
    var n = going(ev), p = Math.round(n / ev.cap * 100);
    return '<div class="m-page"><div class="m-page-photo">' + photo('court-reach.jpg', 'soft') + '<div class="m-page-title">' + esc(ev.name) + '</div></div>' +
      '<div class="m-going"><div class="m-ring" style="--p:' + p + '"><span>' + n + '/' + ev.cap + '</span></div><div><b>PŘIHLÁŠENO ' + n + ' · ' + leftTxt(ev.cap - n).replace('ZBÝVAJÍ', 'zbývají').replace('ZBÝVÁ', 'zbývá').replace('MÍST', 'míst').replace('MÍSTA', 'místa').replace('MÍSTO', 'místo') + '</b>' + avatars(ev.going, 5) + '</div></div>' +
      '<div class="m-cta">PŘIHLÁSIT A ZAPLATIT · ' + esc(ev.price) + '</div></div>';
  }
  function mockOrg() {
    var rows = [['tereza', 'paid'], ['jakub', 'paid'], ['ondrej', 'paid'], ['klara', 'site']];
    return '<div class="m-org"><span class="m-lbl">VYBRÁNO</span><div class="m-money">4 200 Kč</div><div class="m-pills"><i class="ok">12/12 ZAPLACENO</i><i>0 ČEKÁ</i></div>' +
      rows.map(function (r) { return '<div class="m-row"><span>' + esc(P(r[0])) + '</span><i class="' + r[1] + '">' + (r[1] === 'paid' ? 'ZAPLACENO' : 'NA MÍSTĚ') + '</i></div>'; }).join('') + '</div>';
  }

  /* ---------- rakety, streak, ikony ---------- */
  var TIERS = [
    { n: 'ZÁKLADNÍ RAKETA', c: 'za první výhru', g: ['#FDBA74', '#F97316', '#C2410C'] },
    { n: 'STŘÍBRNÁ RAKETA', c: '3 výhry v řadě', g: ['#F8FAFB', '#C9CFD4', '#8A949B'] },
    { n: 'ZLATÁ RAKETA', c: '5 výher v řadě', g: ['#FBEBB0', '#E4B845', '#A97A12'] },
    { n: 'DIAMANTOVÁ RAKETA', c: '10 výher v řadě', g: ['#FFFFFF', '#D6F0FA', '#8FC9DE'] }
  ];
  var uid = 0;
  function racket(tier) {
    var t = TIERS[tier], id = 'rk' + (uid++), holes = '';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) { var x = 66 + c * 23, y = 58 + r * 23; if ((r === 0 || r === 4) && (c === 0 || c === 3)) continue; holes += '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="rgba(0,0,0,.28)"/>'; }
    return '<svg class="g-racket" viewBox="0 0 200 330" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + t.g[0] + '"/><stop offset=".5" stop-color="' + t.g[1] + '"/><stop offset="1" stop-color="' + t.g[2] + '"/></linearGradient></defs>' +
      '<path d="M100 8c50 0 88 34 88 88 0 46-26 82-60 98l-8 34h-40l-8-34C38 178 12 142 12 96 12 42 50 8 100 8z" fill="url(#' + id + ')"/>' + holes +
      '<path d="M80 226h40l-4 22H84z" fill="url(#' + id + ')" opacity=".85"/><rect x="84" y="246" width="32" height="76" rx="12" fill="url(#' + id + ')"/>' +
      '<path d="M84 262h32M84 280h32M84 298h32" stroke="rgba(0,0,0,.18)" stroke-width="5"/></svg>';
  }
  function bolt() { return '<svg class="g-racket" viewBox="0 0 200 300"><defs><linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDBA74"/><stop offset="1" stop-color="#EA580C"/></linearGradient></defs><path d="M118 6L26 170h62l-20 124 108-178h-66z" fill="url(#bl)"/></svg>'; }

  /* ---------- PŘÍSPĚVKY 1080 × 1350 ---------- */
  var F = {};
  F.slide = function (d, o) {
    var tone = d.tone || 'navy';
    return frame(tone, '<div class="g-body bottom">' + (d.eyebrow ? '<p class="g-eye">' + esc(d.eyebrow) + '</p>' : '') + title(d.title) +
      (d.body ? '<p class="g-txt">' + esc(d.body) + '</p>' : '') + (d.list ? '<ul class="g-list">' + d.list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>', d, o, 'grid');
  };
  F.chat = function (d, o) { return frame('navy', '<div class="g-body top">' + (d.eyebrow ? '<p class="g-eye">' + esc(d.eyebrow) + '</p>' : '') + title(d.title, d.size || 'md') + '</div><div class="g-mock low">' + mockWA(d.lines, true) + '</div>', d, o, 'grid'); };
  F.link = function (d, o) { return frame('navy', '<div class="g-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title, 'md') + '<p class="g-txt">' + esc(d.body) + '</p></div><div class="g-mock low">' + mockLink(IG.event) + '</div>', d, o, 'grid'); };
  F.page = function (d, o) { return frame('white', '<div class="g-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title, 'md') + '<p class="g-txt">' + esc(d.body) + '</p></div><div class="g-mock low">' + mockPage(IG.event) + '</div>', d, o, 'grid'); };
  F.org = function (d, o) { return frame('orange', '<div class="g-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title, 'md') + '<p class="g-txt">' + esc(d.body) + '</p></div><div class="g-mock low">' + mockOrg() + '</div>', d, o, 'grid'); };
  F.cta = function (d, o) {
    var tone = d.tone || 'orange';
    return frame(tone, '<div class="g-mark">' + LOGO.symbol + '</div><div class="g-body bottom"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title) + '<p class="g-txt">' + esc(d.body) + '</p><p class="g-link">padelleague.eu →</p></div>', d, o, 'grid');
  };
  F.stats = function (d, o) {
    var items = d.items || IG.results[d.series].stats;
    return frame(d.tone || 'orange', '<div class="g-body center"><p class="g-eye">' + esc(d.eyebrow) + '</p><div class="g-stats">' +
      items.map(function (x) { return '<div><b>' + esc(x.n) + '</b><span>' + esc(x.l) + '</span></div>'; }).join('') + '</div></div>', d, o, 'grid');
  };
  F.quote = function (d, o) { return frame(d.tone || 'navy', '<div class="g-body center"><div class="g-q">“</div><p class="g-quote">' + esc(d.text) + '</p><p class="g-who">' + esc(d.who) + '</p></div>', d, o, 'grid'); };
  F.photo = function (d, o) { return frame('photo', photo(d.photo) + '<div class="g-body bottom"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title) + '</div>', d, o); };
  F.image = function (d) { return '<div class="g g-feed g-img"><img src="' + esc(d.src) + '" alt="" crossorigin="anonymous"></div>'; };
  F.podium = function (d, o) {
    var R = IG.results[d.series];
    function pod(cls, i) { return '<div class="g-pod ' + cls + '"><span class="m">' + (i + 1) + '</span><b>' + esc(P(R.podium[i])) + '</b><em>' + R.pts[i] + ' b.</em></div>'; }
    return frame(d.tone || 'orange', '<div class="g-body top"><p class="g-eye">' + esc(IG.community.series) + ' · ' + esc(R.date) + '</p>' + title('AMERICANO #' + d.series + '|~VÝSLEDKY') + '</div>' +
      '<div class="g-podium">' + pod('pod-silver', 1) + pod('pod-gold', 0) + pod('pod-bronze', 2) + '</div>', { num: '01.', tag: 'VÝSLEDKY' }, o, 'grid');
  };
  F.awards = function (d, o) {
    var R = IG.results[d.series];
    return frame(d.tone || 'navy', '<div class="g-body center"><div class="g-award"><span class="g-eye">VÍTĚZKA VEČERA</span><b>' + esc(P(R.podium[0])) + '</b><em>' + R.pts[0] + ' bodů</em></div>' +
      '<div class="g-award"><span class="g-eye">SKOKAN VEČERA</span><b>' + esc(P(R.jumper)) + '</b><em>↑ o ' + R.jump + ' míst</em></div></div>', { num: '02.', tag: 'OCENĚNÍ' }, o, 'grid');
  };
  F.card = function (d, o, story) {
    var R = IG.results[d.series], v = d.variant || 'photo';
    var inner = (v === 'photo' ? photo(d.photo || 'court-blue-orange.jpg') : '') +
      '<div class="g-card-sym">' + LOGO.symbol + '</div>' +
      '<div class="g-glass g-cardbox"><div class="kv"><span>JMÉNO</span><b>' + esc(P(d.p)) + '</b></div><div class="kv"><span>EVENT</span><b>' + esc(IG.community.series) + ' #' + d.series + '</b></div>' +
      '<div class="kv"><span>KDY A KDE</span><b>' + esc(R.date) + ' 2026 · PRAHA</b></div><div class="kv"><span>VÝSLEDEK</span><b class="xl">' + esc(d.result || 'VÍTĚZ!') + '</b></div></div>' +
      '<div class="g-won"><b>' + (d.won || 8) + '/' + (d.total || 10) + '</b><span>VYHRANÝCH<br>ZÁPASŮ</span></div>';
    return story ? sframe(v === 'photo' ? 'photo' : v, inner, 'g-card ' + (v !== 'photo' ? 'grid' : '')) : '<div class="g g-feed g-card tone-' + (v === 'photo' ? 'photo' : v) + (v !== 'photo' ? ' grid' : '') + '">' + inner + '</div>';
  };
  F.leader = function (d, o) {
    var L = IG.leaderboard;
    var rows = L.rows.map(function (r, i) {
      var arr = r.d > 0 ? '<i class="up">↑ ' + r.d + '</i>' : r.d < 0 ? '<i class="dn">↓ ' + (-r.d) + '</i>' : '<i class="eq">–</i>';
      return '<div class="g-lrow' + (r.p === L.jumper ? ' jump' : '') + '"><span class="pos">' + (i + 1) + '</span><span class="nm">' + esc(P(r.p)) + '</span>' + arr + '<b>' + r.pts + '</b></div>';
    }).join('');
    return frame('orange', '<div class="g-body top tight"><p class="g-eye">' + esc(IG.community.series) + '</p>' + title('ŽEBŘÍČEK|~' + L.month, 'md') + '</div><div class="g-leader">' + rows + '</div>' +
      '<div class="g-jumper">SKOKAN MĚSÍCE · <b>' + esc(P(L.jumper)) + '</b></div>', { num: '', tag: 'MĚSÍČNÍ ŽEBŘÍČEK' }, o, 'grid');
  };
  F.announce = function (d, o) {
    var ev = IG.event, n = going(ev);
    return frame('photo', photo('court-dark-run.jpg') + '<div class="g-body top"><p class="g-eye">' + esc(ev.day + ' · ' + ev.time) + '</p>' + title(ev.format.toUpperCase() + '|~' + ev.venue.toUpperCase(), 'md') + '</div>' +
      '<div class="g-glass g-live"><div class="g-live-n"><b>' + n + '/' + ev.cap + '</b><span>PŘIHLÁŠENO</span></div><div>' + avatars(ev.going, 6) + '<p class="g-hot">' + leftTxt(ev.cap - n) + '</p></div></div>' +
      '<div class="g-chip">' + esc(ev.price) + ' · přihláška v biu</div>', { num: '', tag: 'POZVÁNKA' }, o);
  };
  F.whatson = function (d, o) {
    var W = IG.whatsOn, ev = W.events.slice(d.part * 3, d.part * 3 + 3);
    return frame('navy', '<div class="g-body top tight"><p class="g-eye">Kde hrát v Praze</p>' + title('CO SE HRAJE|~' + W.month, 'md') + '</div><div class="g-board">' +
      '<div class="g-brow h"><span>KDY</span><span>EVENT</span><span>STAV</span></div>' +
      ev.map(function (e) { return '<div class="g-brow"><span><b>' + esc(e.d) + '</b>' + esc(e.t) + '</span><span><b>' + esc(e.f) + '</b>' + esc(e.who) + ' · ' + esc(e.where) + '</span><span class="g-st' + (e.s === 'PLNO' ? ' g-st-full' : '') + '">' + esc(e.s) + '</span></div>'; }).join('') + '</div>',
      { num: '0' + (d.part + 1) + '.', tag: 'LISTOPAD' }, o, 'grid');
  };
  F.ach = function (d, o) {
    var t = TIERS[d.tier];
    return frame('navy', '<div class="g-body top tight"><p class="g-eye">Achievement ' + (d.tier + 1) + '/4</p>' + title(d.tier === 0 ? 'KTEROU|~MÁŠ TY?' : 'O ÚROVEŇ|~VÝŠ.', 'md') + '</div>' +
      '<div class="g-ach">' + racket(d.tier) + '<b>' + t.n + '</b><span>' + t.c + '</span></div>', { num: '0' + (d.tier + 1) + '.', tag: 'ACHIEVEMENTY' }, o, 'grid');
  };
  F.milestone = function (d, o) {
    return frame('orange', '<div class="g-mark big">' + LOGO.symbol + '</div><div class="g-body center"><div class="g-huge">' + esc(d.n) + '</div><p class="g-lbl">' + esc(d.label) + '</p><p class="g-txt">' + esc(d.sub) + '</p></div>', { num: '', tag: 'MILNÍK' }, o, 'grid');
  };
  F.meme = function () {
    var rows = [['+300 Kč', 'padel'], ['+300 Kč', 'padel'], ['+350 Kč', 'padel 🎾'], ['+300 Kč', 'za čtvrtek']];
    return '<div class="g g-feed tone-white grid g-meme"><div class="g-body top"><h2 class="g-title md"><span>KDYŽ TI 3 LIDI</span><span class="lt">POŠLOU PENÍZE</span><span class="lt">S POZNÁMKOU</span><span>„PADEL“</span></h2></div>' +
      '<div class="m-bank"><div class="m-bank-top">Pohyby na účtu · dnes</div>' + rows.map(function (r) { return '<div class="m-bank-row"><span><b>Příchozí platba</b>Zpráva: ' + esc(r[1]) + '</span><b class="plus">' + r[0] + '</b></div>'; }).join('') + '</div>' +
      '<div class="g-meme-q">…a ty máš 12 jmen 🙃</div><div class="g-foot"><span class="g-logo">' + LOGO.full + '</span><span class="g-dots"></span></div></div>';
  };
  F.vox = function () {
    return '<div class="g g-feed tone-photo">' + photo('court-blur-run.jpg') + '<div class="g-ph-note">SEM VIDEO Z EVENTU</div><div class="g-body center"><p class="g-eye">Vox-pop po čtvrtečním večeru</p>' + title('PROČ CHODÍŠ|~NA AMERICANO?') +
      '<p class="g-sub">„Zahraju si s každým.“</p></div><div class="g-foot"><span class="g-logo">' + LOGO.full + '</span><span class="g-dots"></span></div></div>';
  };

  /* ---------- STORIES 1080 × 1920 (bezpečná zóna: 250 px nahoře, 340 px dole) ---------- */
  var S = {};
  S.st = function (d) {
    var tone = d.photo ? 'photo' : (d.tone || 'navy');
    return sframe(tone, (d.photo ? photo(d.photo) : '') + '<div class="s-body">' + (d.eyebrow ? '<p class="g-eye">' + esc(d.eyebrow) + '</p>' : '') + title(d.title) +
      (d.body ? '<p class="g-txt">' + esc(d.body) + '</p>' : '') + (d.cta ? '<div class="s-sticker">🔗 ' + esc(d.cta) + '</div>' : '') + '</div>', d.photo ? '' : 'grid');
  };
  S.stlink = function (d) { return sframe('navy', '<div class="s-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title) + '</div><div class="s-mock">' + mockLink(IG.event) + '</div>', 'grid'); };
  S.stchat = function (d) { return sframe('white', '<div class="s-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title) + '</div><div class="s-mock">' + mockWA(['1. Petr', '2. Jana', '3. ?', '4. Tomáš (+1?)', '5. Klára ✅', '6. Ondra – zaplatil?']) + '</div>', 'grid'); };
  S.storg = function (d) { return sframe('orange', '<div class="s-body top"><p class="g-eye">' + esc(d.eyebrow) + '</p>' + title(d.title) + '</div><div class="s-mock">' + mockOrg() + '</div>', 'grid'); };
  S.team = function (d) {
    var ev = IG.event;
    return sframe('navy', '<div class="s-body center"><p class="g-eye">' + esc(ev.name) + ' · ' + esc(ev.day) + '</p>' + title('TÝM|~POTVRZEN') +
      '<div class="s-team"><div><i class="g-av g-av0 big">' + ini(d.a) + '</i><b>' + esc(P(d.a)) + '</b></div><span>&amp;</span><div><i class="g-av g-av2 big">' + ini(d.b) + '</i><b>' + esc(P(d.b)) + '</b></div></div>' +
      '<p class="g-txt">Jdou do toho. Přihlášeno ' + going(ev) + '/' + ev.cap + '.</p></div>', 'grid');
  };
  S.spots = function () {
    var ev = IG.event, n = going(ev), p = Math.round(n / ev.cap * 100);
    return sframe('orange', '<div class="s-body center"><p class="g-eye">' + esc(ev.name) + ' · ' + esc(ev.day + ' ' + ev.time) + '</p><div class="s-ring" style="--p:' + p + '"><b>' + n + '/' + ev.cap + '</b></div>' +
      title(leftTxt(ev.cap - n)) + avatars(ev.going, 6) + '<div class="s-sticker light">🔗 Přihlásit se</div></div>', 'grid');
  };
  S.live = function (d) {
    return sframe('navy', '<div class="s-body center"><p class="g-eye"><i class="s-dot"></i>ŽIVĚ · KOLO ' + d.round + '</p>' + title('KURT ' + d.court + '|~JE TO TĚSNÉ') +
      '<div class="s-score"><div><b>' + esc(P(d.a[0])) + '</b><b>' + esc(P(d.a[1])) + '</b></div><strong>' + d.s[0] + ':' + d.s[1] + '</strong><div class="r"><b>' + esc(P(d.b[0])) + '</b><b>' + esc(P(d.b[1])) + '</b></div></div></div>', 'grid');
  };
  S.winners = function (d) {
    var R = IG.results[d.series];
    return sframe('photo', photo('court-blue-orange.jpg', 'strong') + '<div class="s-body top"><p class="g-eye">' + esc(IG.community.series) + ' #' + d.series + '</p><div class="s-date">' + esc(R.date.replace(/\s/g, '')) + '</div>' + title('VÍTĚZOVÉ') + '</div>' +
      '<div class="s-podium">' + [0, 1, 2].map(function (i) { return '<div class="s-prow p' + i + '"><span>' + (i + 1) + '</span><b>' + esc(P(R.podium[i])) + '</b><em>' + R.pts[i] + ' b.</em></div>'; }).join('') + '</div>' +
      (d.last ? '<div class="s-sticker light low">🔗 Další čtvrtek</div>' : ''), '');
  };
  S.storycard = function (d) { return F.card({ p: d.p, series: d.series, variant: d.variant || 'orange', result: d.result || '2. MÍSTO', won: d.won || 7, total: d.total || 10 }, null, true); };
  S.unlock = function (d) {
    var streak = d.tier === 'streak', t = streak ? { n: '4 TÝDNY V KUSE', c: 'hraješ každý týden' } : TIERS[d.tier];
    return sframe('navy', '<div class="s-body center"><p class="g-eye">ODEMČENO</p><div class="s-ach">' + (streak ? bolt() : racket(d.tier)) + '</div>' + title(t.n) + '<p class="g-txt">' + t.c + '</p></div>', 'grid');
  };
  S.faq = function (d) { return sframe('white', '<div class="s-body center"><p class="g-eye">FAQ</p><h2 class="g-title md"><span>' + esc(d.q) + '</span></h2><div class="s-answer">' + esc(d.a) + '</div></div>', 'grid'); };

  window.PLT = {
    feed: function (d, o) { var f = F[d.t] || F.slide; return f(d, o || { i: 0, n: 1 }); },
    story: function (d) { var f = S[d.t] || S.st; return f(d); },
    card: function (d, story) { return F.card(d, null, story); },
    racket: racket, P: P, title: title, TIERS: TIERS,
    icon: function (k) {
      var I = {
        steps: '<path d="M14 40h10V30h10V20h10V10" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="10" r="4"/>',
        court: '<rect x="10" y="12" width="36" height="32" rx="3" fill="none" stroke-width="4"/><path d="M10 28h36M28 12v32" stroke-width="3"/>',
        trophy: '<path d="M18 10h20v12a10 10 0 01-20 0zM18 14h-6a6 6 0 006 8M38 14h6a6 6 0 01-6 8M28 32v6M20 44h16" fill="none" stroke-width="4" stroke-linecap="round"/>',
        podium: '<path d="M8 44V30h12v14M20 44V18h14v26M34 44V26h12v18" fill="none" stroke-width="4" stroke-linejoin="round"/>',
        racket: '<ellipse cx="26" cy="20" rx="13" ry="15" fill="none" stroke-width="4"/><path d="M33 33l9 11" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="10" r="4"/>',
        question: '<path d="M20 18a8 8 0 1116 0c0 6-8 6-8 13" fill="none" stroke-width="4" stroke-linecap="round"/><circle cx="28" cy="42" r="3"/>'
      };
      return '<svg viewBox="0 0 56 56" stroke="#fff" fill="#F97316" aria-hidden="true">' + (I[k] || '') + '</svg>';
    }
  };
})();
