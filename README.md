# PadelLeague – klikací prototyp

Klikací prototyp tří cest ze zadání pro design (říjen 2026): **hráč**, **organizátor**, **landing page**.
Vizuál podle JVS Princová & Fikarová (navy #034867, oranžová #F97316, Satoshi, fotografie s grainem a rozmazáním).

Čisté HTML, CSS a JavaScript. Žádná instalace ani build, funguje jako statický web (GitHub Pages, Netlify, Vercel nebo dvojklik na `index.html`).

## Co v něm je

| Soubor | Obsah |
|---|---|
| `index.html` | Aplikace v rámečku telefonu + mapa prototypu vlevo (na mobilu přes celou obrazovku, mapa pod oranžovým štítkem „Mapa“) |
| `landing.html` | Landing page pro organizátora, desktop i mobil. Tlačítka vedou do registrace v prototypu. |
| `assets/css/app.css` | Styly a design tokeny |
| `assets/js/app.js` | Obrazovky, stavy a navigace |
| `assets/fonts/` | Satoshi (Fontshare) 400 / 500 / 700 / 900 |
| `assets/img/` | Fotografie z JVS |

### Cesta hráče
WhatsApp skupina s odkazem → stránka eventu → panel Register & pay (Apple Pay / Google Pay / karta, event zdarma bez platby) → You're in → Invite a friend → připomínka den předem → „I can't come“ (místo jde prvnímu na čekací listině).
Stavy stránky: **Open, Last spots, Full + waitlist, Registered**. Přepínají se v mapě vlevo.

### Cesta organizátora
Účet → název komunity → nový event na jedné obrazovce (+ More options, náhled, připojení Stripe přímo ve formuláři) → „Event is live“ s jedním nudgem → sdílení do WhatsAppu (tlačítko „Fast-forward“ nasimuluje přihlášky) → správa hráčů (klepnutím na stav Paid / Unpaid / On site, Remind, Move in z čekací listiny) → rozpis a kurty → průběh se zadáváním skóre → po eventu (vybráno, zaplaceno, odehráno, stupně vítězů) → Create next event (předvyplněný) → karta výsledku pro Instagram.

Každá obrazovka jde otevřít přímo odkazem, např. `index.html#/p-event`, `index.html#/o-after`.

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
