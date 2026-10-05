# Instagram profil PadelLeague – klikací prototyp

Profil po zhruba 3 měsících provozu: hlavička a bio, 6 highlights, aktivní story, mřížka 12 příspěvků (karusely, single, reels), označené karty hráčů, detail příspěvku s popiskem a komentáři a prohlížeč stories. Vpravo panel **„Proč takhle“** vysvětluje každé rozhodnutí odkazem na best practice z `analyza-instagram.md`.

Celé česky, písmo Satoshi, barvy a grid podle JVS.

## Jak otevřít

- Online: `…/padelleague/instagram/` (stejný GitHub Pages web jako prototyp aplikace).
- Lokálně: dvojklik na `index.html`. Vše funguje kromě exportu PNG (prohlížeč z disku nepustí obrázky do plátna). Pro export použij online verzi nebo lokální server.

## Co kde je

| Soubor | Obsah |
|---|---|
| `index.html` | Profil v telefonu, navigace vlevo, panel „Proč takhle“ vpravo (na mobilu pod tlačítkem ⓘ) |
| `templates.html` | Systém šablon: 8 šablon, formulář vlevo živě přepisuje grafiku, export PNG |
| `content.js` | **Veškerý obsah**: hráči, event, výsledky, žebříček, 12 příspěvků s popisky a komentáři, highlights, stories, vysvětlení do panelu |
| `templates.js` | Šablony grafik (příspěvek 1080 × 1350, story 1080 × 1920) |
| `graphics.css` | Vzhled grafik (tokeny převzaté z `../assets/css/app.css`) |
| `ig.js`, `ig.css` | Rozhraní Instagramu, prohlížeč stories, panel, export |
| `logos.js` | Logo a symbol z `logo_padelleague_svg` |
| `OTAZKY.md` | Placeholdery k rozhodnutí |

## Jak upravit obsah

Všechno se mění v `content.js`, grafiky se překreslí samy:

- **Jméno hráče:** `players.tereza = 'Tereza M.'` → změní se v recapu, žebříčku, stories, kartě i v označených.
- **Event:** `event` (název, den, čas, místo, kapacita, kdo jde) → pozvánka, náhled odkazu, story „zbývají 3 místa“.
- **Výsledky série:** `results[12]` → podium, ocenění, statistika, story „Vítězové“.
- **Popisky a komentáře:** `posts[].caption`, `posts[].comments`.
- **Bio:** `brand.bio` (+ 2 alternativy v `brand.bioAlt`, přepínají se v panelu).
- **Handle:** `brand.handle` (zatím placeholder `padelleague.app`).

## Ovládání

- Mřížka: klepni na příspěvek. Karusel se posouvá swipem nebo šipkami ← →.
- Stories: klepni na avatar (aktivní story) nebo na highlight. Klepnutí vpravo/vlevo = další/předchozí, podržení = pauza, šipky a Esc na klávesnici.
- Export: tlačítko v panelu „Proč takhle“ nebo ikona ↓ v prohlížeči stories. Šablony na `templates.html` mají tlačítko u každé grafiky.

Lidé, komunity a místa jsou fiktivní. Reálné účty z analýzy jsou jen v panelu jako zdroj inspirace.
