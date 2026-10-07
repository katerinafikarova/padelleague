# PadelLeague – klikací prototyp

Klikací prototyp PadelLeague, kolo 2 podle připomínek z října 2026: **landing pro organizátory**, **organizátor na mobilu**, **hráč**, **Instagram**.

**Vstupenka je event, ne komunita.** Organizátor začíná na „Vytvoř event“, účet zakládá až při zveřejnění, komunita, platby kartou a žebříček se odemknou po prvním odehraném eventu. Flow (kroky, pořadí, pravidla) je z aplikace, prototyp řeší vizuál. Pravidla: slovo „event“, ne „turnaj“; bílé pozadí a fotky, navy jen hlavičky, oranžová jen tlačítka a akce; Rozpis a Průběh čitelné na kurtu jednou rukou.
Vizuál podle JVS Princová & Fikarová (navy #034867, oranžová #F97316, Satoshi, fotografie s grainem a rozmazáním).

Aplikace i landing jsou **česky**, angličtina je druhá jazyková verze (přepínač CZ / EN v aplikaci, v mapě vlevo i na landingu; nebo `?lang=en` v adrese).

**Dvě zobrazení:** výchozí je **počítač** (okno prohlížeče: homepage s eventy a stránka eventu jako web, WhatsApp jako WhatsApp Web). Organizátor se i v tomto režimu ukazuje v telefonu, protože PC verze je hotová v aplikaci. Nahoře nad oknem se přepíná na **mobil** (telefon). Volba se pamatuje, odkaz `?mode=mobile` nebo `?mode=desktop` ji vynutí. Na telefonu se vždy ukáže mobilní verze.

Čisté HTML, CSS a JavaScript. Žádná instalace ani build, funguje jako statický web (GitHub Pages, Netlify, Vercel nebo dvojklik na `index.html`).

## Co v něm je

| Soubor | Obsah |
|---|---|
| `index.html` | Aplikace v okně prohlížeče (počítač) nebo v telefonu (mobil) + mapa prototypu vlevo (na skutečném telefonu přes celou obrazovku, mapa pod oranžovým štítkem „Mapa“) |
| `vizualni-vrstva.html` | Návrh vizuální vrstvy nad enginem: stavy, karty, rozpis, tabulky, pavouk |
| `landing.html` | Landing page pro organizátora, desktop i mobil. Tlačítka vedou do registrace v prototypu. |
| `assets/css/app.css` | Styly a design tokeny |
| `assets/js/app.js` | Obrazovky, stavy a navigace |
| `assets/js/i18n.js` | Všechny texty aplikace v češtině a angličtině |
| `assets/fonts/` | Satoshi (Fontshare) 400 / 500 / 700 / 900 |
| `assets/img/` | Fotografie z JVS |

### Cesta hráče
Dva vstupy: **homepage s výběrem eventů** (`#/p-home`: jen nadcházející eventy podle data, filtr město / tento týden / víkend / zdarma, plné eventy vedou na čekací listinu, proběhlé eventy sbalené dole) nebo WhatsApp skupina s odkazem. Pak stránka eventu (odkaz „← Všechny eventy“ vede zpět) → panel přihlášení (se Stripe Apple Pay / Google Pay / karta, bez Stripe „platíš na místě“, event zdarma bez platby) → „Jsi ve hře“ (světlá obrazovka s fotkou) → Pozvat kamaráda → připomínka den předem → „Nemůžu přijít“ (místo jde prvnímu na čekací listině).
Stavy stránky: **Otevřeno, Poslední místa, Plno + čekací listina, Přihlášen**. Přepínají se v mapě vlevo.

### Cesta organizátora (mobil)
Vytvoř event, průvodce ve 4 krocích jako v aplikaci (Typ a formát → Termín a místo → Hráči a platba → Prezentace) → účet až při zveřejnění → event je zveřejněný: seznam přihlášených, rozpis až po uzávěrce → sdílení do WhatsAppu (aplikace jen předá text) → hráči a platby → **Rozpis** → **Průběh a zadání skóre** → **Po eventu** (vybráno, nezaplatili, docházka, pořadí, „Co dál“: komunita, Stripe, žebříček) → Další event se stejným nastavením → karta výsledku.

Zveřejnit není nikdy šedé: platba na místě je výchozí, Stripe jde připojit kdykoli. Rozpis a Průběh mají velké písmo, číslo kurtu ve čtverci, celou kartu kurtu jako tlačítko a skóre přes velká tlačítka (tým B dostane zbytek do 24).

Pole průvodce i kroky enginu (Soupiska → Nastavení → Rozpis → Spuštění → Průběh → Dokončeno) odpovídají testovací verzi ze 7. 10. 2026, převedené na telefon.

### Vizuální vrstva
`vizualni-vrstva.html`: návrh vzhledu nad enginem (bod 3 zadání). Sjednocené stavy eventu, karta eventu ve 4 stavech, rozpis, karta kurtu naživo, zadání skóre, tabulka pořadí, pavouk a skupiny. U každé sekce je, co se liší od testovací verze.

U každé cesty je v mapě vlevo rozbalovací poznámka „Co se změnilo“.

Každá obrazovka jde otevřít přímo odkazem, např. `index.html#/p-event`, `index.html#/o-play`.

### Instagram profil
Složka `instagram/`: klikací prototyp IG profilu PadelLeague (mřížka 12 příspěvků v rytmu navy / fotka / oranžová / bílá, 6 barevně střídaných highlights, stories, označené karty hráčů) a systém šablon s živou úpravou a exportem PNG. Podrobnosti v `instagram/README.md`, otevřené otázky v `instagram/OTAZKY.md`.

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
