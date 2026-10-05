# PadelLeague – klikací prototyp

Klikací prototyp tří cest ze zadání pro design (říjen 2026): **hráč**, **organizátor**, **landing page**.
Vizuál podle JVS Princová & Fikarová (navy #034867, oranžová #F97316, Satoshi, fotografie s grainem a rozmazáním).

Aplikace i landing jsou **česky**, angličtina je druhá jazyková verze (přepínač CZ / EN v aplikaci, v mapě vlevo i na landingu; nebo `?lang=en` v adrese).

Čisté HTML, CSS a JavaScript. Žádná instalace ani build, funguje jako statický web (GitHub Pages, Netlify, Vercel nebo dvojklik na `index.html`).

## Co v něm je

| Soubor | Obsah |
|---|---|
| `index.html` | Aplikace v rámečku telefonu + mapa prototypu vlevo (na mobilu přes celou obrazovku, mapa pod oranžovým štítkem „Mapa“) |
| `landing.html` | Landing page pro organizátora, desktop i mobil. Tlačítka vedou do registrace v prototypu. |
| `assets/css/app.css` | Styly a design tokeny |
| `assets/js/app.js` | Obrazovky, stavy a navigace |
| `assets/js/i18n.js` | Všechny texty aplikace v češtině a angličtině |
| `assets/fonts/` | Satoshi (Fontshare) 400 / 500 / 700 / 900 |
| `assets/img/` | Fotografie z JVS |

### Cesta hráče
WhatsApp skupina s odkazem → stránka eventu → panel „Přihlásit a zaplatit“ (Apple Pay / Google Pay / karta, event zdarma bez platby) → „Jsi ve hře“ → Pozvat kamaráda → připomínka den předem → „Nemůžu přijít“ (místo jde prvnímu na čekací listině).
Stavy stránky: **Otevřeno, Poslední místa, Plno + čekací listina, Přihlášen**. Přepínají se v mapě vlevo.

### Cesta organizátora
Účet → název komunity → nový event na jedné obrazovce (+ Další možnosti, náhled, připojení Stripe přímo ve formuláři) → event je zveřejněný: rozpis s kurty a jedna výzva → sdílení do WhatsAppu (tlačítko „Přetočit o 2 dny“ nasimuluje přihlášky) → správa hráčů (klepnutím na stav Zaplaceno / Nezaplaceno / Na místě, Připomenout, Přesunout z čekací listiny) → docházka a rozpis → průběh se zadáváním skóre → po eventu (vybráno, zaplaceno, přišlo, stupně vítězů) → Založit další event (předvyplněný) → karta výsledku pro Instagram.

Obrazovka 1 ze zadání (`#/o-live`): po zveřejnění je vidět rozpis 1. kola s kurty a volnými místy a jediná výzva poslat odkaz. Obrazovka 3 (po eventu) má mobilní (`#/o-after`) i desktopovou verzi (`#/o-after-d`) s vybranými penězi, docházkou a výsledky. Docházka se odškrtává před startem v rozpisu.

U každé cesty je v mapě vlevo rozbalovací poznámka „Kde váhá a jak jsme to vyřešily“.

Každá obrazovka jde otevřít přímo odkazem, např. `index.html#/p-event`, `index.html#/o-after`.

### Instagram profil
Složka `instagram/`: klikací prototyp IG profilu PadelLeague (mřížka 12 příspěvků, 6 highlights, stories, označené karty hráčů) a systém šablon s živou úpravou a exportem PNG. Podrobnosti v `instagram/README.md`, otevřené otázky v `instagram/OTAZKY.md`.

## Nahrání na GitHub Pages

1. Na github.com vytvoř nový repozitář, například `padelleague-prototyp` (Public).
2. Nahraj obsah této složky. Buď přes web (**Add file → Upload files**, přetáhni všechny soubory a složky včetně `.nojekyll`), nebo v Terminálu:
   ```bash
   cd padelleague-prototyp
   git init
   git add .
   git commit -m "PadelLeague klikací prototyp"
   git branch -M main
   git remote add origin https://github.com/UZIVATEL/padelleague-prototyp.git
   git push -u origin main
   ```
3. V repozitáři **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. Za 1–2 minuty běží na `https://UZIVATEL.github.io/padelleague-prototyp/`.

Landing page pak najdeš na `…/landing.html`.

## Co je simulované

- Platby, Apple Pay a Stripe onboarding jsou makety. Žádná data se nikam neposílají.
- WhatsApp, Instagram a kopírování odkazu jen ukážou potvrzení.
- Jména a čísla jsou ukázková (z testovacích dat aplikace).
- Stav se drží jen v otevřené stránce. Po obnovení stránky nebo tlačítkem „Začít znovu“ se vrátí na výchozí.

## Poznámky k vizuálu

- **DAZZLE Unicase** (Adobe Fonts) nejde volně přibalit, proto ho nahrazuje Satoshi Black ve verzálkách. Pro finální verzi ho přidej přes Adobe Fonts web projekt.
- Logo je zatím textové („• PADEL LEAGUE“). Až bude k dispozici SVG z manuálu, nahraď ho v `.logo`.
- Fotky jsou vyřezané z PDF prezentace JVS, a proto mají nižší rozlišení. Pro finální verzi použij originály.
- Licence Satoshi (ITF Free Font License) dovoluje použití zdarma. Před veřejným spuštěním produktu ji ověř.
