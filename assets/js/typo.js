/* Česká typografie: jednopísmenná slova (v, k, s, z, o, u, a, i) nikdy nezůstanou na konci řádku.
   Za ně se vkládá nezlomitelná mezera. Běží na celé stránce i na textu, který přibude po kliknutí. */
(function () {
  var RE = /(^|[\s(„“"'‚])([AIKOSUVZaikosuvz]) +/g;
  /* Datum se nedělí: „3. 11.“, „pá 30. 10.“ */
  var DATE = /(\d\.) (?=\d)/g;
  /* Samostatné číslo drží se slovem za sebou: „3 místa“, „12 hráčů“ */
  var NUM = /(^|[\s(„])(\d+) (?=[A-Za-zÀ-ž])/g;
  function fix(s) { return s.replace(RE, '$1$2\u00a0').replace(RE, '$1$2\u00a0').replace(NUM, '$1$2\u00a0').replace(DATE, '$1\u00a0'); }
  function skip(n) { var p = n.parentNode; return !p || /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(p.nodeName); }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!skip(root)) { var o = fix(root.data); if (o !== root.data) root.data = o; } return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (skip(n)) continue; var o = fix(n.data); if (o !== n.data) n.data = o; }
  }
  window.plSingles = walk;
  function start() {
    walk(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') walk(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
