/* Prototyp Instagram profilu PadelLeague: profil, mřížka, detail příspěvku, prohlížeč stories, panel „Proč takhle“, export PNG. */
(function () {
  'use strict';
  var IG = window.IG, T = window.PLT, LOGO = window.PL_LOGO;
  var app = document.getElementById('app'), why = document.getElementById('why'), web = document.getElementById('web');
  var view = web ? web.querySelector('.web-view') : null, urlEl = web ? web.querySelector('.web-url') : null;
  var LABELS = { explainer: 'Explainer pro organizátora', 'case': 'Případová studie (collab)', card: 'Hráčská karta', recap: 'Recap Americano #12', meme: 'Meme reel', whatson: 'Co se hraje v listopadu',
    leader: 'Měsíční žebříček', announce: 'Pozvánka se živým stavem', vox: 'Vox-pop reel', ach: 'Achievementy', milestone: 'Milník', brand: 'Představení značky' };
  var KIND = { carousel: 'Karusel', single: 'Příspěvek', reel: 'Reel (titulní obrázek)' };

  var startMode = 'desktop';
  try { var qm = new URLSearchParams(location.search).get('mode'); startMode = qm === 'mobile' || qm === 'desktop' ? qm : (localStorage.getItem('pl-ig-mode') || 'desktop'); } catch (e) { /* bez úložiště */ }
  var S = { mode: startMode, view: 'profile', tab: 'grid', post: null, slide: 0, story: null, liked: {}, capOpen: false, allComments: false, bio: 0, seen: false, toast: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function postById(id) { for (var i = 0; i < IG.posts.length; i++) if (IG.posts[i].id === id) return IG.posts[i]; return tagPost(id); }
  function tagPost(id) {
    var m = /^tag-(\d+)$/.exec(id || ''); if (!m) return null;
    var c = IG.tagged[+m[1]];
    return { id: id, by: c.by, kind: 'single', ago: 'před 5 d', likes: 23 + (+m[1]) * 7, slides: [{ t: 'card', p: c.p, series: c.series, variant: c.variant, result: c.result, won: c.won, total: c.total }],
      caption: 'Americano #' + c.series + ' ✔️ díky za skvělý večer @' + IG.community.handle + ' 🧡 karta od @' + IG.brand.handle, tags: [], comments: [{ u: 'padelleague.app', t: 'Gratulujeme! 🏆' }], why: IG.taggedWhy, tagged: true };
  }

  /* ---------- ikony (vlastní obrysové, podobné IG) ---------- */
  var I = {
    down: '<path d="M6 9l6 6 6-6"/>', plus: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    heart: '<path d="M12 20s-7-4.4-9-8.6C1.6 8.4 3.4 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.4 0 5.2 3.4 3.8 6.4C19 15.6 12 20 12 20z"/>',
    comment: '<path d="M20.5 12a8.5 8.5 0 01-12.7 7.4L3.5 20.5l1.2-4.1A8.5 8.5 0 1120.5 12z"/>', send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    save: '<path d="M6 3h12v18l-6-5-6 5z"/>', back: '<path d="M15 5l-7 7 7 7"/>', grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    reels: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 8h18M8 3l3 5M14 3l3 5"/><path d="M10 11.5v5l4.5-2.5z" fill="currentColor"/>', tag: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19a6 6 0 0111 0"/>',
    pin: '<path d="M14 3l7 7-3 1-4 4 1 4-2 2-4-4-5 5M10 13l-4-4 2-2 4 1 4-4z" />', car: '<rect x="7" y="3" width="14" height="14" rx="2"/><path d="M17 21H5a2 2 0 01-2-2V7"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>', home: '<path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>', addp: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0114 0M19 8v6M16 11h6"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>', dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', dots: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>'
  };
  function ic(k, cls) { return '<svg class="ig-ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; }
  var AV = '<span class="in">' + LOGO.symbol + '</span>';

  /* ---------- grafiky ve škálovaném obalu ---------- */
  function gw(html, w, h, fit, extra) { return '<div class="gw" data-w="' + w + '" data-h="' + h + '" data-fit="' + (fit || 'width') + '"' + (extra || '') + '><div class="gi">' + html + '</div></div>'; }
  function fitAll(root) {
    (root || rootEl()).querySelectorAll('.gw').forEach(function (el) {
      var w = +el.dataset.w, h = +el.dataset.h, cw = el.clientWidth, ch = el.clientHeight || cw * h / w, fit = el.dataset.fit, s, x = 0, y = 0;
      if (fit === 'cover') { s = Math.max(cw / w, ch / h); x = (cw - w * s) / 2; y = (ch - h * s) / 2; }
      else if (fit === 'contain') { s = Math.min(cw / w, ch / h); x = (cw - w * s) / 2; y = (ch - h * s) / 2; }
      else { s = cw / w; }
      el.firstChild.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    });
  }
  function feedHTML(post, i) { return T.feed(post.slides[i], { i: i, n: post.slides.length }); }

  /* ---------- PROFIL ---------- */
  function profile() {
    var B = IG.brand, bio = S.bio === 0 ? B.bio : B.bioAlt[S.bio - 1];
    var hl = IG.highlights.map(function (h) { return '<button data-hl="' + h.id + '"><span class="c"><span>' + T.icon(h.icon) + '</span></span>' + esc(h.name) + '</button>'; }).join('');
    return '<div class="ig">' + status() +
      '<div class="ig-top"><div class="h">' + esc(B.handle) + ' ' + ic('down') + '</div><div class="ico">' + ic('plus') + ic('menu') + '</div></div>' +
      '<div class="ig-scroll">' +
      '<div class="ig-head"><button class="ig-avatar ' + (S.seen ? 'seen' : 'ring') + '" data-act="active" aria-label="Aktivní story">' + AV + '</button>' +
      '<div class="ig-stats"><div><b>' + B.posts + '</b><span>příspěvků</span></div><div><b>' + B.followers + '</b><span>sledujících</span></div><div><b>' + B.following + '</b><span>sledovaných</span></div></div></div>' +
      '<div class="ig-bio"><div class="nm">' + esc(B.name) + '</div><div class="cat">' + esc(B.category) + '</div>' + bio.map(esc).join('<br>') +
      '<div class="lnk">' + ic('link') + esc(B.link) + ' <span style="font-weight:400;color:#737373">' + esc(B.linkMore) + '</span></div></div>' +
      '<div class="ig-btns"><button class="follow">Sledovat</button><button>Poslat zprávu</button><button>Kontakt</button><button class="icn" aria-label="Navrhnout">' + ic('addp') + '</button></div>' +
      '<div class="ig-hl">' + hl + '</div>' +
      '<div class="ig-tabs"><button class="' + (S.tab === 'grid' ? 'on' : '') + '" data-tab="grid" aria-label="Příspěvky">' + ic('grid') + '</button><button class="' + (S.tab === 'reels' ? 'on' : '') + '" data-tab="reels" aria-label="Reels">' + ic('reels') + '</button><button class="' + (S.tab === 'tagged' ? 'on' : '') + '" data-tab="tagged" aria-label="Označené">' + ic('tag') + '</button></div>' +
      tabContent() + '</div>' + navbar() + '</div>';
  }
  function status() { return '<div class="ig-status"><span>9:41</span><span>●●● 5G ▮</span></div>'; }
  function navbar() { return '<div class="ig-nav">' + ic('home') + ic('search') + ic('plus') + ic('reels') + '<span class="me">' + LOGO.symbol + '</span></div>'; }
  function tile(p) {
    var badge = p.pinned ? ic('pin', 'badge') : p.kind === 'carousel' ? ic('car', 'badge') : p.kind === 'reel' ? ic('reels', 'badge') : '';
    return '<button class="ig-tile" data-post="' + p.id + '" aria-label="' + esc(LABELS[p.id] || '') + '">' + gw(feedHTML(p, 0), 1080, 1350, 'cover') + badge + '</button>';
  }
  function tabContent() {
    if (S.tab === 'grid') return '<div class="ig-grid">' + IG.gridOrder.map(function (id) { return tile(postById(id)); }).join('') + '</div>';
    if (S.tab === 'reels') return '<div class="ig-grid">' + IG.posts.filter(function (p) { return p.kind === 'reel'; }).map(function (p) {
      return '<button class="ig-tile" data-post="' + p.id + '">' + gw(feedHTML(p, 0), 1080, 1350, 'cover') + '<span class="views">' + ic('play') + esc(p.views) + '</span></button>'; }).join('') + '</div>';
    return '<div class="ig-grid">' + IG.tagged.map(function (c, i) {
      return '<button class="ig-tile" data-post="tag-' + i + '">' + gw(T.feed({ t: 'card', p: c.p, series: c.series, variant: c.variant, result: c.result, won: c.won, total: c.total }), 1080, 1350, 'cover') + '<span class="by">@' + esc(c.by) + '</span></button>'; }).join('') + '</div>';
  }

  /* ---------- DETAIL PŘÍSPĚVKU ---------- */
  function postView() {
    var p = postById(S.post), n = p.slides.length, B = IG.brand;
    var media = '<div class="ig-media"><div class="ig-car" id="car">' + p.slides.map(function (_, i) { return gw(feedHTML(p, i), 1080, 1350, 'width'); }).join('') + '</div>' +
      (n > 1 ? '<span class="ig-count" id="cnt">' + (S.slide + 1) + '/' + n + '</span>' : '') +
      (p.kind === 'reel' ? '<span class="ig-play">' + ic('play') + '</span><span class="ig-reel-tag">' + ic('reels') + 'Reel · ' + esc(p.views) + ' zhlédnutí</span>' : '') + '</div>';
    var dots = n > 1 ? '<span class="dots" id="dots">' + p.slides.map(function (_, i) { return '<i class="' + (i === S.slide ? 'on' : '') + '"></i>'; }).join('') + '</span>' : '';
    var liked = S.liked[p.id], likes = p.likes + (liked ? 1 : 0);
    var first = p.caption.split('\n')[0], rest = p.caption.slice(first.length);
    var cap = '<div class="cap"><b>' + esc(p.by || B.handle) + '</b> ' + esc(first) + (S.capOpen ? esc(rest) + (p.tags.length ? '\n<span class="tags">' + p.tags.map(esc).join(' ') + '</span>' : '') : '') + '</div>' + (S.capOpen ? '' : '<button class="more" data-act="cap">… více</button>');
    var cms = (S.allComments ? p.comments : p.comments.slice(0, 1));
    return '<div class="ig">' + status() +
      '<div class="ig-top"><button data-act="back" aria-label="Zpět">' + ic('back') + '</button><div class="h" style="font-size:16px">Příspěvky</div><span style="width:24px"></span></div>' +
      '<div class="ig-scroll">' +
      '<div class="ig-post-h"><span class="av">' + LOGO.symbol + '</span><div class="who"><b>' + esc(p.by || B.handle) + '</b>' + (p.collab ? ' a <b>' + esc(p.collab) + '</b>' : '') + (p.tagged ? '<span>označil(a) @' + esc(B.handle) + '</span>' : '<span>Praha</span>') + '</div>' + ic('dots') + '</div>' +
      media +
      '<div class="ig-actions" style="position:relative"><button class="ig-like' + (liked ? ' on' : '') + '" data-act="like" aria-label="To se mi líbí">' + ic('heart') + '</button>' + ic('comment') + ic('send') + dots + '<span class="sp"></span>' + ic('save') + '</div>' +
      '<div class="ig-meta"><div class="lk">' + likes + ' označení To se mi líbí</div>' + cap +
      (p.comments.length > 1 && !S.allComments ? '<button class="allc" data-act="allc">Zobrazit všechny komentáře (' + p.comments.length + ')</button>' : '') +
      cms.map(function (c) { return '<div class="cm' + (c.u === B.handle ? ' reply' : '') + '"><b>' + esc(c.u) + '</b> ' + esc(c.t) + '</div>'; }).join('') +
      '<div class="date">' + esc(p.ago) + '</div></div>' +
      '</div>' + navbar() + '</div>';
  }

  /* ---------- STORIES ---------- */
  var DUR = 5000, raf = null;
  function openStories(list, name, why, ctx) { S.story = { list: list, i: 0, name: name, why: why, ctx: ctx, t: 0, paused: false, last: performance.now() }; render(); tick(); }
  function storyView(desk) {
    var st = S.story, d = st.list[st.i];
    var bars = st.list.map(function (_, i) { return '<i><b style="width:' + (i < st.i ? 100 : 0) + '%"></b></i>'; }).join('');
    return '<div class="st" id="st"><div class="st-frame">' + gw(T.story(d), 1080, 1920, 'cover') +
      '<div class="st-bars" id="bars">' + bars + '</div>' +
      '<div class="st-head"><span class="av">' + LOGO.symbol + '</span><span>' + esc(IG.brand.handle) + '</span><span class="t">' + esc(st.name) + '</span><span class="sp"></span>' +
      '<button data-act="stdl" aria-label="Stáhnout PNG">' + ic('dl') + '</button><button data-act="stclose" aria-label="Zavřít">' + ic('close') + '</button></div>' +
      '<div class="st-tap l" data-tap="prev"></div><div class="st-tap r" data-tap="next"></div>' +
      (desk ? '<div class="st-foot in">' + '<span class="inp">Odpovědět uživateli ' + esc(IG.brand.handle) + '…</span>' + ic('heart') + ic('send') + '</div>' : '') + '</div>' +
      (desk ? '<button class="dst-arrow l" data-act="stprev" aria-label="Předchozí">‹</button><button class="dst-arrow r" data-act="stnext" aria-label="Další">›</button>' +
        '<div class="dst-logo">Instagram</div><button class="dst-close" data-act="stclose" aria-label="Zavřít">' + ic('close') + '</button>'
        : '<div class="st-foot"><span class="inp">Odeslat zprávu…</span>' + ic('heart') + ic('send') + '</div>') + '</div>';
  }
  function tick() {
    cancelAnimationFrame(raf);
    var step = function (now) {
      var st = S.story; if (!st) return;
      if (!st.paused) st.t += now - st.last;
      st.last = now;
      var bar = document.querySelectorAll('#bars i b')[st.i];
      if (bar) bar.style.width = Math.min(100, st.t / DUR * 100) + '%';
      if (st.t >= DUR) { storyNav(1); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function storyNav(dir) {
    var st = S.story; if (!st) return;
    st.i += dir; st.t = 0;
    if (st.i < 0) st.i = 0;
    if (st.i >= st.list.length) { closeStory(); return; }
    render(); tick();
  }
  function closeStory() { cancelAnimationFrame(raf); if (S.story && S.story.ctx === 'active') S.seen = true; S.story = null; render(); }

  /* ---------- PANEL „PROČ TAKHLE“ ---------- */
  function practiceMap() {
    var map = {};
    function add(ids, label, act) { (ids || []).forEach(function (n) { (map[n] = map[n] || []).push({ label: label, act: act }); }); }
    add(IG.profileWhy.practices, 'Profil a bio', 'profile');
    IG.posts.forEach(function (p) { add(p.why.practices, LABELS[p.id], 'post:' + p.id); });
    IG.highlights.forEach(function (h) { add(h.why.practices, 'Highlight ' + h.name, 'hl:' + h.id); });
    add(IG.activeStory.why.practices, 'Aktivní story', 'active');
    add(IG.taggedWhy.practices, 'Označené (UGC)', 'tab:tagged');
    return map;
  }
  function whyBlock(w) {
    return '<div class="pills"><span class="pill aud">Pro: ' + esc(w.audience) + '</span>' + (w.practices || []).map(function (n) { return '<span class="pill bp">' + n + ' · ' + esc(IG.practices[n]) + '</span>'; }).join('') + '</div>' +
      '<p>' + esc(w.text).replace(/\[PŘEDPOKLAD\]/g, '<b style="color:#FFB37A">[PŘEDPOKLAD]</b>') + '</p>' +
      (w.data && w.data.length ? '<h3>Data z aplikace, která šablonu plní</h3><p>' + w.data.map(function (x) { return '<code>' + esc(x) + '</code>'; }).join(' ') + '</p>' : '') +
      (w.sources && w.sources.length ? '<h3>Zdroj inspirace z analýzy</h3><ul>' + w.sources.map(function (s) { return '<li>' + (s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>' : esc(s.t)) + '</li>'; }).join('') + '</ul>' : '');
  }
  function panel() {
    var h = '<button class="info-close" data-act="info" aria-label="Zavřít panel">✕</button>';
    if (S.story) {
      h += '<div class="ctx">Story · ' + esc(S.story.name) + ' · ' + (S.story.i + 1) + '/' + S.story.list.length + '</div><h2>Proč takhle</h2>' + whyBlock(S.story.why) +
        '<p class="note">Ovládání: klepnutí vpravo / vlevo, podržení = pauza, šipky ← → na klávesnici, Esc zavře. Bezpečná zóna 1080 × 1920: horních 250 px a spodních 340 px je bez klíčového obsahu.</p>' +
        '<button class="btn" data-act="stdl">Stáhnout story jako PNG (1080 × 1920)</button>';
    } else if (S.view === 'post') {
      var p = postById(S.post);
      h += '<div class="ctx">' + (p.tagged ? 'Označený příspěvek od @' + esc(p.by) : esc(KIND[p.kind]) + (p.slides.length > 1 ? ' · ' + p.slides.length + ' slidů' : '') + (p.pinned ? ' · připnuto' : '')) + '</div><h2>' + esc(LABELS[p.id] || 'Hráčská karta (UGC)') + '</h2>' + whyBlock(p.why) +
        '<button class="btn" data-act="dl">Stáhnout ' + (p.slides.length > 1 ? 'slide ' + (S.slide + 1) + ' ' : '') + 'jako PNG (1080 × 1350)</button>' +
        (p.slides.length > 1 ? '<button class="btn ghost" data-act="dlall">Stáhnout všech ' + p.slides.length + ' slidů</button>' : '') +
        '<p class="note">Export funguje na GitHub Pages nebo na lokálním serveru. Při otevření dvojklikem prohlížeč obrázky z disku do PNG nepustí.</p>';
    } else {
      var map = practiceMap();
      h += '<div class="ctx">Profil · ' + (S.tab === 'grid' ? 'mřížka 12 příspěvků' : S.tab === 'reels' ? 'reels' : 'označené') + '</div><h2>Proč takhle</h2>' + whyBlock(S.tab === 'tagged' ? IG.taggedWhy : IG.profileWhy) +
        '<h3>Varianty bia (klepni a vyzkoušej)</h3>' + [IG.brand.bio].concat(IG.brand.bioAlt).map(function (b, i) { return '<button class="biov' + (S.bio === i ? ' on' : '') + '" data-bio="' + i + '">' + b.map(esc).join('<br>') + '</button>'; }).join('') +
        '<h3>Kde najdeš všech 11 best practices</h3><div class="bp-map">' + Object.keys(IG.practices).map(function (n) {
          var it = map[n] || [];
          return '<div><b>' + n + ' · ' + esc(IG.practices[n]) + '</b>' + it.map(function (x) { return '<button data-open="' + x.act + '"><span>→</span>' + esc(x.label) + '</button>'; }).join('') + '</div>';
        }).join('') + '</div>' +
        '<p class="note">Lidé, komunity a místa jsou fiktivní. Reálné účty jsou uvedené jen jako zdroj inspirace. Otevřené otázky jsou v OTAZKY.md.</p>';
    }
    why.innerHTML = h;
  }

  /* ---------- EXPORT PNG ---------- */
  function loadH2C(cb) {
    if (window.html2canvas) return cb();
    var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = cb; s.onerror = function () { toast('Knihovnu pro export se nepodařilo načíst. Zkontroluj připojení k internetu.'); }; document.head.appendChild(s);
  }
  function exportPNG(html, w, h, name, done) {
    toast('Připravuji PNG ' + w + ' × ' + h + '…');
    loadH2C(function () {
      var box = document.createElement('div');
      box.style.cssText = 'position:fixed;left:-30000px;top:0;width:' + w + 'px;height:' + h + 'px;';
      box.innerHTML = html; document.body.appendChild(box);
      var imgs = [].slice.call(box.querySelectorAll('img'));
      Promise.all(imgs.map(function (im) { return im.complete ? 1 : new Promise(function (r) { im.onload = im.onerror = r; }); })).then(function () { return document.fonts ? document.fonts.ready : 1; }).then(function () {
        return window.html2canvas(box.firstChild, { width: w, height: h, scale: 1, useCORS: true, backgroundColor: null, logging: false });
      }).then(function (cv) {
        cv.toBlob(function (b) {
          var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name + '.png'; document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
          box.remove(); toast('Staženo: ' + name + '.png'); if (done) done();
        }, 'image/png');
      }).catch(function () { box.remove(); toast('Export se nepovedl. Otevři prototyp přes GitHub Pages nebo lokální server.'); });
    });
  }
  function toast(m) { S.toast = m; renderToast(); clearTimeout(toast.h); toast.h = setTimeout(function () { S.toast = null; renderToast(); }, 2600); }
  function renderToast() { var r = rootEl(), t = document.querySelector('.toast'); if (t) t.remove(); if (S.toast) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = S.toast; r.appendChild(d); } }

  /* ---------- DESKTOP (instagram.com) ---------- */
  function isDesk() { return S.mode === 'desktop' && window.innerWidth > 820 && !!view; }
  function rootEl() { return isDesk() ? view : app; }
  function rail() {
    var items = [['home', 'Domů'], ['search', 'Hledat'], ['reels', 'Reels'], ['send', 'Zprávy'], ['heart', 'Upozornění'], ['plus', 'Vytvořit']];
    return '<nav class="dw-rail" aria-label="Instagram"><div class="dw-glyph">' + ic('car') + '</div>' + items.map(function (x) { return '<span class="dw-ri" title="' + x[1] + '">' + ic(x[0]) + '</span>'; }).join('') +
      '<span class="dw-ri me" title="Profil"><span class="me">' + LOGO.symbol + '</span></span><span class="dw-sp"></span><span class="dw-ri" title="Další">' + ic('menu') + '</span></nav>';
  }
  function deskTile(p, id, extra) {
    var badge = p.pinned ? ic('pin', 'badge') : p.kind === 'carousel' ? ic('car', 'badge') : p.kind === 'reel' ? ic('reels', 'badge') : '';
    return '<button class="ig-tile dw-tile" data-post="' + id + '">' + gw(p.html || feedHTML(p, 0), 1080, 1350, 'cover') + badge + (extra || '') +
      '<span class="dw-hover"><b>' + ic('heart') + p.likes + '</b><b>' + ic('comment') + p.comments.length + '</b></span></button>';
  }
  function deskProfile() {
    var B = IG.brand, bio = S.bio === 0 ? B.bio : B.bioAlt[S.bio - 1], grid;
    if (S.tab === 'grid') grid = IG.gridOrder.map(function (id) { return deskTile(postById(id), id); }).join('');
    else if (S.tab === 'reels') grid = IG.posts.filter(function (p) { return p.kind === 'reel'; }).map(function (p) { return deskTile(p, p.id, '<span class="views">' + ic('play') + esc(p.views) + '</span>'); }).join('');
    else grid = IG.tagged.map(function (c, i) { var p = postById('tag-' + i); p.html = T.feed(p.slides[0]); return deskTile(p, 'tag-' + i, '<span class="by">@' + esc(c.by) + '</span>'); }).join('');
    var hl = IG.highlights.map(function (h) { return '<button class="dw-hl" data-hl="' + h.id + '"><span class="c"><span>' + T.icon(h.icon) + '</span></span>' + esc(h.name) + '</button>'; }).join('');
    return rail() + '<main class="dw-main"><div class="dw-in">' +
      '<header class="dw-head"><div class="dw-avcol"><button class="ig-avatar dw-av ' + (S.seen ? 'seen' : 'ring') + '" data-act="active" aria-label="Aktivní story">' + AV + '</button></div>' +
      '<section class="dw-info"><div class="dw-row1"><h2>' + esc(B.handle) + '</h2><button class="dw-btn blue">Sledovat</button><button class="dw-btn">Poslat zprávu</button><button class="dw-btn icn" aria-label="Navrhnout">' + ic('addp') + '</button><span class="dw-more">' + ic('dots') + '</span></div>' +
      '<ul class="dw-stats"><li><b>' + B.posts + '</b> příspěvků</li><li><b>' + B.followers + '</b> sledujících</li><li><b>' + B.following + '</b> sledovaných</li></ul>' +
      '<div class="dw-bio"><b>' + esc(B.name) + '</b><span class="cat">' + esc(B.category) + '</span>' + bio.map(esc).join('<br>') +
      '<a class="lnk" href="#" onclick="return false">' + ic('link') + esc(B.link) + ' <span>' + esc(B.linkMore) + '</span></a></div></section></header>' +
      '<div class="dw-hls">' + hl + '</div>' +
      '<div class="dw-tabs"><button class="' + (S.tab === 'grid' ? 'on' : '') + '" data-tab="grid">' + ic('grid') + 'PŘÍSPĚVKY</button><button class="' + (S.tab === 'reels' ? 'on' : '') + '" data-tab="reels">' + ic('reels') + 'REELS</button><button class="' + (S.tab === 'tagged' ? 'on' : '') + '" data-tab="tagged">' + ic('tag') + 'OZNAČENÍ</button></div>' +
      '<div class="dw-grid">' + grid + '</div>' +
      '<footer class="dw-foot">Meta · Informace · Blog · Pracovní příležitosti · Nápověda · API · Soukromí · Podmínky<br>Čeština · © 2026 Instagram from Meta · <b>prototyp PadelLeague, ne skutečný profil</b></footer>' +
      '</div></main>';
  }
  function siblings() {
    if (/^tag-/.test(S.post)) return IG.tagged.map(function (_, i) { return 'tag-' + i; });
    if (S.tab === 'reels') return IG.posts.filter(function (p) { return p.kind === 'reel'; }).map(function (p) { return p.id; });
    return IG.gridOrder;
  }
  function deskPost() {
    var p = postById(S.post), n = p.slides.length, B = IG.brand, sib = siblings(), k = sib.indexOf(S.post);
    var liked = S.liked[p.id], likes = p.likes + (liked ? 1 : 0);
    var media = '<div class="dw-media"><div class="ig-car" id="car">' + p.slides.map(function (_, i) { return gw(feedHTML(p, i), 1080, 1350, 'width'); }).join('') + '</div>' +
      (n > 1 ? '<button class="dw-cbtn l" data-act="cprev" aria-label="Předchozí slide">‹</button><button class="dw-cbtn r" data-act="cnext" aria-label="Další slide">›</button><span class="dw-cdots" id="dots">' + p.slides.map(function (_, i) { return '<i class="' + (i === S.slide ? 'on' : '') + '"></i>'; }).join('') + '</span>' : '') +
      (p.kind === 'reel' ? '<span class="ig-play">' + ic('play') + '</span><span class="ig-reel-tag">' + ic('reels') + 'Reel · ' + esc(p.views) + ' zhlédnutí</span>' : '') + '</div>';
    var who = '<b>' + esc(p.by || B.handle) + '</b>' + (p.collab ? ' a <b>' + esc(p.collab) + '</b>' : '');
    var cap = '<div class="dw-c"><span class="av">' + LOGO.symbol + '</span><div><div class="cap">' + who.replace(/<\/b> a <b>[^<]*<\/b>/, '</b>') + ' ' + esc(p.caption) + (p.tags.length ? '\n<span class="tags">' + p.tags.map(esc).join(' ') + '</span>' : '') + '</div><span class="t">' + esc(p.ago) + '</span></div></div>';
    var cms = p.comments.map(function (c) { return '<div class="dw-c"><span class="av' + (c.u === B.handle ? '' : ' u') + '">' + (c.u === B.handle ? LOGO.symbol : esc(c.u.charAt(0).toUpperCase())) + '</span><div><b>' + esc(c.u) + '</b> ' + esc(c.t) + '<span class="t">' + esc(p.ago) + ' · To se mi líbí · Odpovědět</span></div></div>'; }).join('');
    return '<div class="dw-modal" data-act="back"><button class="dw-x" data-act="back" aria-label="Zavřít">' + ic('close') + '</button>' +
      (k > 0 ? '<button class="dw-pnav l" data-act="pprev" aria-label="Předchozí příspěvek">‹</button>' : '') + (k > -1 && k < sib.length - 1 ? '<button class="dw-pnav r" data-act="pnext" aria-label="Další příspěvek">›</button>' : '') +
      '<div class="dw-dialog" data-stop>' + media +
      '<aside class="dw-side"><div class="ig-post-h"><span class="av">' + LOGO.symbol + '</span><div class="who">' + who + (p.tagged ? '<span>označil(a) @' + esc(B.handle) + '</span>' : '<span>Praha</span>') + '</div>' + ic('dots') + '</div>' +
      '<div class="dw-scroll">' + cap + cms + '</div>' +
      '<div class="ig-actions"><button class="ig-like' + (liked ? ' on' : '') + '" data-act="like" aria-label="To se mi líbí">' + ic('heart') + '</button>' + ic('comment') + ic('send') + '<span class="sp"></span>' + ic('save') + '</div>' +
      '<div class="dw-likes"><b>' + likes + ' označení To se mi líbí</b><span>' + esc(p.ago) + '</span></div>' +
      '<div class="dw-add">' + '<span>Přidat komentář…</span><b>Zveřejnit</b></div></aside></div></div>';
  }

  /* ---------- RENDER + UDÁLOSTI ---------- */
  function render() {
    var desk = isDesk();
    document.body.classList.toggle('mode-desktop', desk);
    document.body.classList.toggle('mode-mobile', !desk);
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === S.mode); });
    if (desk) {
      app.innerHTML = '';
      var keep = view.querySelector('.dw-main'), top = keep ? keep.scrollTop : 0;
      view.innerHTML = deskProfile() + (S.view === 'post' ? deskPost() : '') + (S.story ? storyView(true) : '');
      var nm = view.querySelector('.dw-main'); if (nm) nm.scrollTop = top;
      if (urlEl) urlEl.textContent = 'instagram.com/' + (S.view === 'post' ? 'p/' + S.post + '/' : S.story ? 'stories/' + IG.brand.handle + '/' : IG.brand.handle + '/' + (S.tab === 'reels' ? 'reels/' : S.tab === 'tagged' ? 'tagged/' : ''));
    } else {
      if (view) view.innerHTML = '';
      app.innerHTML = (S.view === 'post' ? postView() : profile()) + (S.story ? storyView() : '');
    }
    requestAnimationFrame(function () { fitAll(); bindCarousel(); });
    renderToast(); panel();
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === (S.view === 'post' ? 'post' : S.tab)); });
  }
  function bindCarousel() {
    var car = document.getElementById('car'); if (!car) return;
    car.scrollLeft = S.slide * car.clientWidth;
    car.addEventListener('scroll', function () {
      var i = Math.round(car.scrollLeft / car.clientWidth);
      if (i !== S.slide) { S.slide = i; var c = document.getElementById('cnt'); if (c) c.textContent = (i + 1) + '/' + car.children.length; document.querySelectorAll('#dots i').forEach(function (d, k) { d.classList.toggle('on', k === i); }); panel(); }
    }, { passive: true });
  }
  function openPost(id) { S.view = 'post'; S.post = id; S.slide = 0; S.capOpen = false; S.allComments = false; render(); var sc = rootEl().querySelector('.ig-scroll'); if (sc) sc.scrollTop = 0; }
  function openTarget(a) {
    if (a === 'profile') { S.view = 'profile'; S.tab = 'grid'; render(); return; }
    if (a === 'active') { act.active(); return; }
    var p = a.split(':');
    if (p[0] === 'post') openPost(p[1]);
    else if (p[0] === 'hl') openHL(p[1]);
    else if (p[0] === 'tab') { S.view = 'profile'; S.tab = p[1]; render(); }
  }
  function openHL(id) { var h = IG.highlights.filter(function (x) { return x.id === id; })[0]; openStories(h.stories, h.name, h.why, 'hl'); }
  var act = {
    active: function () { openStories(IG.activeStory.stories, 'Tento týden', IG.activeStory.why, 'active'); },
    back: function () { S.view = 'profile'; render(); },
    like: function () { S.liked[S.post] = !S.liked[S.post]; render(); },
    cap: function () { S.capOpen = true; render(); },
    allc: function () { S.allComments = true; render(); },
    stclose: closeStory,
    stdl: function () { var st = S.story; st.paused = true; exportPNG(T.story(st.list[st.i]), 1080, 1920, 'padelleague-story-' + (st.name || '').toLowerCase().replace(/[^a-z0-9]+/gi, '-') + '-' + (st.i + 1), function () { if (S.story) S.story.paused = false; }); },
    dl: function () { var p = postById(S.post); exportPNG(feedHTML(p, S.slide), 1080, 1350, 'padelleague-' + p.id + '-' + (S.slide + 1)); },
    dlall: function () { var p = postById(S.post), i = 0; (function next() { if (i >= p.slides.length) return; exportPNG(feedHTML(p, i), 1080, 1350, 'padelleague-' + p.id + '-' + (i + 1), function () { i++; setTimeout(next, 400); }); })(); },
    info: function () { why.classList.toggle('open'); },
    stprev: function () { storyNav(-1); }, stnext: function () { storyNav(1); },
    cprev: function () { var c = document.getElementById('car'); if (c) c.scrollBy({ left: -c.clientWidth, behavior: 'smooth' }); },
    cnext: function () { var c = document.getElementById('car'); if (c) c.scrollBy({ left: c.clientWidth, behavior: 'smooth' }); },
    pprev: function () { var sib = siblings(), k = sib.indexOf(S.post); if (k > 0) openPost(sib[k - 1]); },
    pnext: function () { var sib = siblings(), k = sib.indexOf(S.post); if (k < sib.length - 1) openPost(sib[k + 1]); }
  };
  function setMode(m) { S.mode = m; try { localStorage.setItem('pl-ig-mode', m); } catch (e) { /* */ } render(); }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-post],[data-hl],[data-tab],[data-act],[data-bio],[data-open],[data-tap],[data-nav],[data-mode]');
    if (!el) return;
    if (el.classList.contains('dw-modal') && e.target.closest('[data-stop]')) return;
    if (el.dataset.mode) return setMode(el.dataset.mode);
    if (el.dataset.post) return openPost(el.dataset.post);
    if (el.dataset.hl) return openHL(el.dataset.hl);
    if (el.dataset.tab) { S.tab = el.dataset.tab; render(); return; }
    if (el.dataset.bio) { S.bio = +el.dataset.bio; render(); return; }
    if (el.dataset.open) { why.classList.remove('open'); if (S.story) closeStory(); return openTarget(el.dataset.open); }
    if (el.dataset.nav) { e.preventDefault(); if (S.story) closeStory(); if (el.dataset.nav === 'post') return; S.view = 'profile'; S.tab = el.dataset.nav; render(); return; }
    if (el.dataset.act && act[el.dataset.act]) act[el.dataset.act]();
  });
  /* stories: klepnutí vs. podržení */
  var holdT = null, held = false;
  document.addEventListener('pointerdown', function (e) {
    var z = e.target.closest('[data-tap]'); if (!z || !S.story) return;
    held = false; holdT = setTimeout(function () { held = true; S.story.paused = true; }, 220);
  });
  document.addEventListener('pointerup', function (e) {
    var z = e.target.closest('[data-tap]'); clearTimeout(holdT); if (!S.story) return;
    if (held) { S.story.paused = false; held = false; return; }
    if (z) storyNav(z.dataset.tap === 'next' ? 1 : -1);
  });
  document.addEventListener('keydown', function (e) {
    if (S.story) {
      if (e.key === 'ArrowRight') storyNav(1);
      else if (e.key === 'ArrowLeft') storyNav(-1);
      else if (e.key === 'Escape') closeStory();
      else if (e.key === ' ') { e.preventDefault(); S.story.paused = !S.story.paused; }
    } else if (S.view === 'post') {
      var car = document.getElementById('car');
      if (car && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) car.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * car.clientWidth, behavior: 'smooth' });
      if (e.key === 'Escape') act.back();
      if (isDesk() && !car) { if (e.key === 'ArrowRight') act.pnext(); if (e.key === 'ArrowLeft') act.pprev(); }
    }
  });
  var lastDesk = null;
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { var d = isDesk(); if (d !== lastDesk) { lastDesk = d; render(); } else fitAll(); }); ro.observe(app); if (view) ro.observe(view); ro.observe(document.body); }
  var m = /post=([\w-]+)/.exec(location.hash); if (m && postById(m[1])) { S.view = 'post'; S.post = m[1]; }
  render();
  if (document.fonts) document.fonts.ready.then(function () { fitAll(); });
})();
