/* Obsah IG prototypu PadelLeague. Všechny grafiky vznikají z těchto dat přes šablony (templates.js).
   Změň jméno hráče v `players` a propíše se do všech postů, stories i karet.
   Lidé, komunity a místa jsou fiktivní. Reálné účty jsou jen v `why.sources` jako zdroj inspirace. */
window.IG = {
  brand: {
    handle: 'padelleague.app',            /* PLACEHOLDER: @padelleague je obsazený, viz OTAZKY.md */
    name: 'PadelLeague · Padel events made easy',
    category: 'Aplikace',
    bio: ['Pořádáš Americano? 🎾', 'Jeden odkaz → přihlášky, platby, výsledky.', 'Bez WhatsApp chaosu ↓'],
    bioAlt: [
      ['Pro ty, kdo pořádají padel 🎾', 'Hráči se přihlásí a zaplatí sami.', 'Ty už jen hraješ ↓'],
      ['Pošli odkaz, zbytek se stane sám.', 'Americano · Mexicano · turnaje', 'Pro organizátory, zdarma na start ↓']
    ],
    link: 'padelleague.eu', linkMore: 'a 1 další',
    posts: 48, followers: '1 240', following: 186,
    footer: 'PADELLEAGUE'
  },

  players: {
    jakub: 'Jakub L.', tereza: 'Tereza M.', ondrej: 'Ondřej P.', klara: 'Klára R.', martin: 'Martin Č.', eliska: 'Eliška K.',
    lukas: 'Lukáš D.', anna: 'Anna J.', petr: 'Petr S.', lucie: 'Lucie B.', filip: 'Filip H.', veronika: 'Veronika Z.'
  },

  community: { name: 'Smíchov Padel Crew', handle: 'smichovpadelcrew', venue: 'Padel Dock Smíchov', series: 'Americano Night League' },

  event: {
    name: 'Čtvrteční Americano', format: 'Americano', day: 'ČT 6. 11.', time: '19:00', venue: 'Padel Dock Smíchov',
    cap: 12, price: '350 Kč', going: ['tereza', 'jakub', 'ondrej', 'klara', 'martin', 'eliska', 'lukas', 'anna', 'petr']
  },

  results: {
    10: { date: '16. 10.', podium: ['ondrej', 'tereza', 'filip'], pts: [118, 112, 104] },
    11: { date: '23. 10.', podium: ['klara', 'jakub', 'lucie'], pts: [121, 115, 109] },
    12: { date: '30. 10.', podium: ['tereza', 'martin', 'jakub'], pts: [125, 119, 111], jumper: 'martin', jump: 6,
      stats: [{ n: '24', l: 'hráčů' }, { n: '66', l: 'zápasů' }, { n: '3 h', l: 'padelu' }] }
  },

  leaderboard: {
    month: 'ŘÍJEN', jumper: 'martin',
    rows: [
      { p: 'tereza', pts: 486, d: 2 }, { p: 'jakub', pts: 471, d: -1 }, { p: 'klara', pts: 455, d: 1 }, { p: 'martin', pts: 449, d: 6 },
      { p: 'ondrej', pts: 438, d: -2 }, { p: 'lucie', pts: 420, d: 0 }, { p: 'filip', pts: 413, d: 3 }, { p: 'eliska', pts: 401, d: -1 },
      { p: 'lukas', pts: 392, d: -3 }, { p: 'anna', pts: 380, d: 1 }
    ]
  },

  whatsOn: {
    month: 'LISTOPAD',
    events: [
      { d: 'ČT 6. 11.', t: '19:00', f: 'Americano', who: 'Smíchov Padel Crew', where: 'Padel Dock Smíchov', s: '9/12' },
      { d: 'SO 8. 11.', t: '10:00', f: 'Mexicano', who: 'Libeňská parta', where: 'Courtyard Libeň', s: '14/16' },
      { d: 'ÚT 11. 11.', t: '18:30', f: 'Round Robin', who: 'Vltava Social', where: 'Hala U Přístavu', s: '6/10' },
      { d: 'ČT 13. 11.', t: '19:00', f: 'Americano', who: 'Smíchov Padel Crew', where: 'Padel Dock Smíchov', s: '4/12' },
      { d: 'NE 16. 11.', t: '09:00', f: 'Playoff', who: 'Ostrov Open', where: 'Ostrov Padel Arena', s: 'PLNO' },
      { d: 'ČT 20. 11.', t: '19:00', f: 'Americano', who: 'Smíchov Padel Crew', where: 'Padel Dock Smíchov', s: '1/12' }
    ]
  },

  /* Best practices z analyza-instagram.md (číslování podle zadání) */
  practices: {
    1: 'Posty po eventu s lidmi porážejí plakáty',
    2: 'Ukaž, kdo jde',
    3: 'Opakovaná šablona vítězů',
    4: 'Rytmus a sezóna',
    5: 'Collab posty s organizátorem',
    6: 'Vzácnost jako číslo',
    7: 'Lidé místo grafiky',
    8: 'Stories nesou celý příběh eventu',
    9: 'UGC: obsah od hráčů',
    10: 'Humor o bolesti organizátora',
    11: 'Highlights podle publika'
  },

  profileWhy: {
    audience: 'organizátor',
    practices: [11, 4],
    text: 'Bio mluví k organizátorovi a v prvním řádku mu položí otázku, ve které se pozná. Připnuté posty míří na organizátora: co to dělá, kdo to už používá, co dostanou hráči. Highlights jsou rozdělené podle publika (Jak to funguje a Pro kluby pro organizátora, Výsledky a Achievementy pro hráče), aby organizátor do 3 sekund našel „to je pro mě“. Mřížka střídá navy, foto, oranžovou a světlou plochu.',
    data: ['brand.bio', 'brand.handle', 'posts[].pinned'],
    sources: [{ t: 'Tournated: highlights For Clubs / For Tournaments', u: 'https://www.instagram.com/tournated/' }]
  },

  /* ---------- MŘÍŽKA: 12 příspěvků, od nejnovějšího ---------- */
  posts: [
    {
      id: 'explainer', pinned: true, kind: 'carousel', ago: 'před 2 týdny', likes: 64, tone: 'navy',
      slides: [
        { t: 'chat', num: '01.', tag: 'PRO ORGANIZÁTORY', eyebrow: 'Pozvánka na Americano', title: '~POŘÁD|PŘEPISUJEŠ|JMÉNA?', size: 'sm', lines: ['1. Petr', '2. Jana', '3. ?', '4. Tomáš (+1?)', '5. Klára ✅', '6. Ondra – zaplatil?'] },
        { t: 'link', num: '02.', tag: 'JAK TO FUNGUJE', eyebrow: 'Krok 1', title: 'POŠLI|~JEDEN ODKAZ.', body: 'Náhled ve WhatsAppu sám ukazuje, kolik lidí už jde.' },
        { t: 'page', num: '03.', tag: 'JAK TO FUNGUJE', eyebrow: 'Krok 2', title: 'HRÁČI SE|~PŘIHLÁSÍ SAMI.', body: 'Jméno, kontakt, Apple Pay. Žádný účet.' },
        { t: 'org', num: '04.', tag: 'JAK TO FUNGUJE', eyebrow: 'Krok 3', title: 'TY JEN|~SLEDUJEŠ ČÍSLA.', body: 'Kdo zaplatil, kdo čeká, kolik je vybráno.' },
        { t: 'cta', num: '05.', tag: 'ZAČNI', eyebrow: 'Po posledním zápase', title: 'KARTA VÝSLEDKŮ|~ZA MINUTU.', body: 'Založ první turnaj zdarma. Odkaz je v biu.' }
      ],
      caption: 'Pořádáš Americano? Pak víš, že nejtěžší není hra, ale všechno okolo.\n\nJména, platby, rozpis. Každý týden znovu. PadelLeague to udělá za tebe: pošleš jeden odkaz, hráči se přihlásí a zaplatí sami, výsledky máš minutu po posledním zápase.\n\nPrvní turnaj založíš zdarma, odkaz je v biu.',
      tags: ['#padel', '#americano', '#padelpraha', '#padelcz'],
      comments: [
        { u: 'ondra.organizuje', t: 'Tohle potřebuju 🙏 jak to funguje s platbami?' },
        { u: 'padelleague.app', t: '@ondra.organizuje Hráči platí kartou nebo Apple Pay rovnou při přihlášení, peníze jdou přes Stripe k tobě. Napiš nám do DM, ukážeme ti to.' },
        { u: 'klara.padel', t: 'Konečně konec „zaplatil už Petr?“ 😅' }
      ],
      why: { audience: 'organizátor', practices: [10, 2], data: ['event.going', 'event.cap', 'event.price'],
        text: 'Mezera z analýzy: nikdo na českém IG nemluví přímo k organizátorovi. První slide je situace z jeho telefonu (ruční seznam jmen jako v podkladech Padel Radotín). Slidy 2–4 ukazují tři kroky a živý stav „8/12“, který jinde nikdo nemá. Návrh vychází z kapitoly 5.2 analýzy.',
        sources: [{ t: 'Analýza 5.2: návrh prvního postu', u: '' }] }
    },
    {
      id: 'case', pinned: true, kind: 'carousel', ago: 'před 3 týdny', likes: 88, tone: 'white', collab: 'smichovpadelcrew',
      slides: [
        { t: 'slide', tone: 'white', num: '01.', tag: 'PŘÍBĚH ORGANIZÁTORA', eyebrow: 'Smíchov Padel Crew', title: 'Z CHATU|~NA JEDEN ODKAZ.', body: 'Jak jedna parta přestala přepisovat seznam a začala hrát.' },
        { t: 'slide', tone: 'navy', num: '02.', tag: 'PŘEDTÍM', eyebrow: 'Každý čtvrtek', title: '3 HODINY|~ADMINISTRATIVY.', list: ['Seznam jmen ve WhatsAppu', 'Platby po jednom převodem', 'Rozpis na papíře u kurtu'] },
        { t: 'stats', tone: 'orange', num: '03.', tag: 'TEĎ', eyebrow: 'Po 6 týdnech', items: [{ n: '10 min', l: 'příprava eventu' }, { n: '0', l: 'nezaplacených' }, { n: '12/12', l: 'plno do úterka' }] },
        { t: 'quote', tone: 'navy', num: '04.', tag: 'ORGANIZÁTOR', text: 'Pošlu odkaz v pondělí a ve čtvrtek jen přijdu hrát. Nikoho nehoním.', who: 'Organizátor, Smíchov Padel Crew' },
        { t: 'photo', photo: 'court-blur-run.jpg', num: '05.', tag: 'ČTVRTEK', eyebrow: 'Padel Dock Smíchov', title: 'VÍC ČASU|~NA HRU.' },
        { t: 'cta', tone: 'white', num: '06.', tag: 'TVOJE PARTA', eyebrow: 'Chceš to zkusit?', title: 'PRVNÍ EVENT|~ZDARMA.', body: 'Odkaz v biu. Nastavení zabere minutu.' }
      ],
      caption: 'Jak Smíchov Padel Crew skončila s ručním seznamem.\n\nKaždý čtvrtek 12 lidí, 3 kurty a tři hodiny psaní, převodů a přepisování. Teď pošlou jeden odkaz v pondělí a ve čtvrtek jen hrají. Díky, že jste do toho šli s námi 🧡\n\nPostujeme společně se @smichovpadelcrew.',
      tags: ['#padel', '#americano', '#padelpraha', '#padelcz'],
      comments: [
        { u: 'smichovpadelcrew', t: 'Nejlepší rozhodnutí sezóny 🙌' },
        { u: 'libenska.parta', t: 'Funguje to i na Mexicano?' },
        { u: 'padelleague.app', t: '@libenska.parta Ano, Americano, Mexicano, Round Robin i Playoff.' }
      ],
      why: { audience: 'organizátor', practices: [5, 7], data: ['community.name', 'community.handle'],
        text: 'Collab post se zobrazí ve feedu PadelLeague i organizátora. Pro nový účet bez sledujících je to hlavní organický kanál (Bogotá × Las Cabras, Asia Padel Events, Padel Powers × CUPRA). Čísla před a po jsou social proof. [PŘEDPOKLAD] Čísla jsou ilustrativní, ve skutečnosti je dodá první reálný organizátor.',
        sources: [{ t: 'Pádel Shot Bogotá × Las Cabras (collab, 116 lajků)', u: 'https://www.instagram.com/p/Dc60MyRj8v9/' }] }
    },
    {
      id: 'card', pinned: true, kind: 'single', ago: 'před měsícem', likes: 71, tone: 'photo',
      slides: [{ t: 'card', variant: 'photo', p: 'tereza', series: 12, result: 'VÍTĚZKA!', won: 8, total: 10 }],
      caption: 'Tohle dostane každý hráč minutu po posledním zápase.\n\nJméno, event, výsledek a kolik zápasů vyhrál. Hotové do stories, bez Canvy. Organizátor nic nedělá, hráči to sdílí sami.',
      tags: ['#padel', '#americano', '#padelcz'],
      comments: [{ u: 'tereza.m.padel', t: 'Už visí na stories 😎' }, { u: 'jakub.l', t: 'Příště je moje 🏆' }],
      why: { audience: 'hráč', practices: [9, 1], data: ['players.tereza', 'results.12', 'card.won'],
        text: 'Hráčská karta je podle design briefu PRIORITA #1. Každý, kdo ji uvidí na stories hráče, se zeptá, co je PadelLeague. Karta s fotkou, grain a rozmazáním přesně podle JVS (SoMe karta). Mezera z analýzy: kartu výsledků, kterou jde hned sdílet, nemá nikdo.',
        sources: [{ t: 'JVS: SoMe karta hráče', u: '' }] }
    },
    {
      id: 'recap', kind: 'carousel', ago: 'před 1 d', likes: 92, tone: 'orange',
      slides: [
        { t: 'podium', series: 12, tone: 'orange' },
        { t: 'awards', series: 12, tone: 'navy' },
        { t: 'stats', series: 12, tone: 'white', num: '03.', tag: 'STATISTIKA VEČERA', eyebrow: 'Americano #12' },
        { t: 'photo', photo: 'court-serve.jpg', num: '04.', tag: 'ATMOSFÉRA', eyebrow: 'Padel Dock Smíchov', title: 'DÍKY,|~ŽE JSTE PŘIŠLI.' }
      ],
      caption: 'Americano #12 je za námi. Kdo vyskočil nejvýš?\n\n24 hráčů, 66 zápasů a skokan večera, který si polepšil o 6 míst. Označ spoluhráče, se kterým jsi hrál nejlepší kolo 👇\n\nDalší Americano: ČT 6. 11. v 19:00, přihlášky v biu.',
      tags: ['#padel', '#americano', '#padelpraha', '#padelleague'],
      comments: [{ u: 'martin.c', t: 'Skokan večera, beru 🚀' }, { u: 'tereza.m.padel', t: 'Díky všem, bylo to šílené kolo!' }],
      why: { audience: 'oba', practices: [1, 3], data: ['results.12.podium', 'results.12.jumper', 'results.12.stats'],
        text: 'Post po eventu se jmény má víc než dvojnásobek lajků oproti pozvánce: Padel Praha vítězové 80 vs. pozvánka 45, výročí 151. Číslovaná série (#12) dělá z večera seriál jako „MP#20“ v Marbelle. Titul „skokan večera“ zná komunita Padel Praha.',
        sources: [{ t: 'Padel Praha: vítězové výročního turnaje (80 lajků)', u: 'https://www.instagram.com/p/DcN-Lv6iPym/' }, { t: 'Marbella Padel: série MP#20', u: 'https://www.instagram.com/p/DVly9FWguQK/' }] }
    },
    {
      id: 'meme', kind: 'reel', ago: 'před 4 d', likes: 118, views: '4 812', tone: 'white',
      slides: [{ t: 'meme' }],
      caption: 'Když ti 3 lidi pošlou peníze s poznámkou „padel“.\n\nA ty máš 12 jmen a žádnou představu, kdo to byl 🙃 Označ organizátora, který to zná.',
      tags: ['#padel', '#padelmeme', '#padelcz'],
      comments: [{ u: 'ondra.organizuje', t: 'Tohle je můj život každý čtvrtek 😂' }, { u: 'vltava.social', t: 'A jeden pošle 350 Kč místo 300 a nikdo neví proč' }, { u: 'padelleague.app', t: '@vltava.social 😅 u nás vidíš u každého jména, jestli zaplatil.' }],
      why: { audience: 'organizátor', practices: [10], data: [],
        text: 'Klubové memy mají na českém IG nejlepší engagement (Radotín 82 lajků, Ostrava 122 lajků a 24 komentářů). Tady je vtip o bolesti organizátora, takže se v něm pozná přesně cílová skupina a označí kolegy. Reel má nejvíc zhlédnutí, protože se šíří mimo sledující.',
        sources: [{ t: 'Padel Club Ostrava: meme (122 lajků / 24 kom.)', u: 'https://www.instagram.com/padelclubostrava/' }] }
    },
    {
      id: 'whatson', kind: 'carousel', ago: 'před 6 d', likes: 47, tone: 'navy',
      slides: [{ t: 'whatson', part: 0 }, { t: 'whatson', part: 1 }, { t: 'cta', tone: 'orange', num: '03.', tag: 'PŘIHLAŠ SE', eyebrow: 'Všechny eventy', title: 'JEDEN ODKAZ,|~ŽÁDNÉ DM.', body: 'Přihláška i platba přímo z odkazu v biu.' }],
      caption: 'Kde si zahrát v listopadu. Uložit, ať to máš po ruce 📌\n\nAmericano, Mexicano i Playoff od partiček po celé Praze. U každého vidíš, kolik lidí už jde.',
      tags: ['#padel', '#padelpraha', '#americano', '#padelcz'],
      comments: [{ u: 'anna.j', t: 'Sobotní Mexicano beru!' }],
      why: { audience: 'hráč', practices: [4, 6], data: ['whatsOn.events[]', 'events[].going/cap'],
        text: 'Měsíční přehled jako „What\'s On… in October“ u Padel Social Club (34,6 tis. sledujících) dává důvod se vracet. Forma letištní tabule je inspirovaná „Upcoming Departures“ od Asia Padel Events. Navíc u každého eventu živý stav místo textu „poslední místa“.',
        sources: [{ t: 'Padel Social Club: What\'s On', u: 'https://www.instagram.com/p/Dd9XN0pDl-9/' }, { t: 'Asia Padel Events: Upcoming Departures', u: 'https://www.instagram.com/p/DdqRxTzEisj/' }] }
    },
    {
      id: 'leader', kind: 'single', ago: 'před 1 týdnem', likes: 76, tone: 'orange',
      slides: [{ t: 'leader' }],
      caption: 'Říjen je spočítaný. Jsi v top 10?\n\nBody ze čtyř čtvrtečních American. Skokan měsíce si polepšil o 6 míst. Listopad začíná ve čtvrtek, každý zápas se počítá 👀',
      tags: ['#padel', '#americano', '#padelpraha', '#padelleague'],
      comments: [{ u: 'jakub.l', t: 'O jeden bod. O JEDEN BOD.' }, { u: 'lucie.b', t: 'Listopad je můj' }],
      why: { audience: 'hráč', practices: [4, 1], data: ['leaderboard.rows[]', 'leaderboard.jumper'],
        text: 'Padel Club Ostrava dělá měsíční žebříček se šipkami ručně v tabulce. Tady se poskládá z výsledků sám. Šipky ↑↓ a „skokan měsíce“ dávají lidem důvod přijít příště.',
        sources: [{ t: 'Padel Club Ostrava: žebříček SRPEN', u: 'https://www.instagram.com/p/Db5Sg9vCMkL/' }] }
    },
    {
      id: 'announce', kind: 'single', ago: 'před 1 týdnem', likes: 39, tone: 'photo',
      slides: [{ t: 'announce' }],
      caption: 'Čtvrtek, 19:00. Zbývají 3 místa.\n\nAmericano na Padel Dock Smíchov, 350 Kč. Uvidíš, kdo už jde, přihlásíš se a zaplatíš za 30 vteřin. Odkaz v biu.',
      tags: ['#padel', '#americano', '#padelpraha'],
      comments: [{ u: 'filip.h', t: 'Jdu, beru i Vercu' }],
      why: { audience: 'hráč', practices: [2, 6], data: ['event.going[]', 'event.cap', 'event.day/time'],
        text: 'Není to plakát. Plakáty bez lidí mají 5–16 lajků i u účtů s tisíci sledujícími (Zličín, Padel Powers). Pozvánka ukazuje „9/12“ a kolečka jmen, tedy to, co Padel Praha dělá ručně sérií „první tým potvrzen“.',
        sources: [{ t: 'Antipříklad: One Padel Zličín, plakát (5 lajků)', u: 'https://www.instagram.com/p/DdZa-5csWC2/' }] }
    },
    {
      id: 'vox', kind: 'reel', ago: 'před 2 týdny', likes: 84, views: '3 260', tone: 'photo',
      slides: [{ t: 'vox' }],
      caption: 'Proč chodíš na Americano? Zeptali jsme se po čtvrtečním večeru.\n\n„Zahraju si s každým.“ „Nikdo nesedí dlouho.“ „Kvůli pivu potom.“ Co bys řekl ty?',
      tags: ['#padel', '#americano', '#padelcz'],
      comments: [{ u: 'eliska.k', t: 'To pivo potom je důležitá součást turnaje 😄' }],
      why: { audience: 'hráč', practices: [7], data: [],
        text: 'Vox-pop „Jak se vám hraje v Ostravě?“ má u Padel Powers 3,5× víc lajků než jejich plakát Tour s cenami za 500 000 Kč. Skuteční lidé místo grafiky. V prototypu je místo videa placeholder: natočit na dalším eventu.',
        sources: [{ t: 'Padel Powers: vox-pop (57 lajků)', u: 'https://www.instagram.com/reel/Dd9g5BxzNIE/' }] }
    },
    {
      id: 'ach', kind: 'carousel', ago: 'před 3 týdny', likes: 58, tone: 'navy',
      slides: [{ t: 'ach', tier: 0 }, { t: 'ach', tier: 1 }, { t: 'ach', tier: 2 }, { t: 'ach', tier: 3 }],
      caption: 'Kterou raketu máš ty?\n\nZákladní za první výhru, stříbrná za 3 výhry v řadě, zlatá za 5, diamantová za 10. Napiš do komentářů, kde jsi 👇',
      tags: ['#padel', '#padelcz', '#padelleague'],
      comments: [{ u: 'ondrej.p', t: 'Stříbrná. Zatím.' }, { u: 'klara.padel', t: 'Diamantová je realita nebo legenda?' }],
      why: { audience: 'hráč', practices: [9], data: ['player.achievements[]'],
        text: 'Gamifikace z researchu JVS (achievementy, odznaky). Otázka „Kterou máš ty?“ vede ke komentářům a sdílení vlastní karty s achievementem, tedy k UGC.',
        sources: [{ t: 'JVS: achievementy (výkon, streak, aktivita, social)', u: '' }] }
    },
    {
      id: 'milestone', kind: 'single', ago: 'před měsícem', likes: 69, tone: 'orange',
      slides: [{ t: 'milestone', n: '100', label: 'ODEHRANÝCH TURNAJŮ', sub: 'Bez jediného ručního seznamu.' }],
      caption: '100 turnajů bez jediného ručního seznamu.\n\nDíky všem organizátorům, kteří to s námi zkusili, a hráčům, kteří se přihlásili jedním klikem 🧡',
      tags: ['#padel', '#padelcz', '#padelleague'],
      comments: [{ u: 'smichovpadelcrew', t: 'Z toho 14 našich 💪' }],
      why: { audience: 'oba', practices: [4], data: ['stats.tournaments'],
        text: 'Milestone šablona z design briefu (100 hráčů, první turnaj v Německu…). Nejvyšší engagement v CZ vzorku měl post k výročí komunity (Padel Praha, 151 lajků): komunita a vděčnost fungují. [PŘEDPOKLAD] Číslo 100 je ilustrativní.',
        sources: [{ t: 'Padel Praha: 2 roky komunity (151 lajků)', u: 'https://www.instagram.com/p/DcLZAinoegl/' }] }
    },
    {
      id: 'brand', kind: 'carousel', ago: 'před 3 měsíci', likes: 52, tone: 'photo',
      slides: [1, 2, 3, 4, 5, 6].map(function (i) { return { t: 'image', src: 'assets/post1/brand-' + i + '.jpg' }; }),
      caption: 'Nová hra, nová značka.\n\nPadel je jedním z nejrychleji rostoucích sportů v Česku, ale chyběla mu appka i vizuální styl. Tohle je první díl příběhu identity PadelLeague.',
      tags: ['#padel', '#branding', '#padelleague'],
      comments: [{ u: 'princova.fikarova', t: 'Konečně venku 🧡' }],
      why: { audience: 'oba', practices: [], data: [],
        text: 'Hotový karusel z ig-post/post1 (case study identity) jako první post profilu. Kontinuita s tím, co už existuje. Patička „PRINCOVÁ & FIKAROVÁ“ zůstává, protože jde o autorský post o vzniku značky.',
        sources: [] }
    }
  ],

  /* Pořadí v mřížce (od nejnovějšího, připnuté nahoře) */
  gridOrder: ['explainer', 'case', 'card', 'recap', 'meme', 'whatson', 'leader', 'announce', 'vox', 'ach', 'milestone', 'brand'],

  /* ---------- HIGHLIGHTS ---------- */
  highlights: [
    { id: 'how', name: 'Jak to funguje', icon: 'steps', audience: 'organizátor',
      stories: [
        { t: 'st', tone: 'navy', eyebrow: 'Pro organizátory', title: 'TŘI KROKY|~A HRAJEŠ.', body: 'Žádné seznamy, žádné převody.' },
        { t: 'st', tone: 'orange', eyebrow: 'Krok 1 · 60 sekund', title: 'VYTVOŘ|~EVENT.', body: 'Formát, datum, kurty, cena.' },
        { t: 'stlink', eyebrow: 'Krok 2', title: 'POŠLI|~ODKAZ.' },
        { t: 'st', tone: 'navy', eyebrow: 'Krok 3', title: 'HRAJ.', body: 'Rozpis, skóre a výsledky se udělají samy.' },
        { t: 'st', tone: 'white', eyebrow: 'První event zdarma', title: 'ZKUS TO|~TENHLE TÝDEN.', body: 'Odkaz v biu.', cta: 'padelleague.eu' }
      ],
      why: { audience: 'organizátor', practices: [11, 2], data: ['event.going', 'event.cap'], text: 'Highlight pro organizátora: tři kroky a náhled odkazu se stavem „8/12“. Tournated má highlights rozdělené podle publika (For Clubs / For Tournaments), organizátor tak hned ví, kam kliknout.', sources: [{ t: 'Tournated', u: 'https://www.instagram.com/tournated/' }] } },
    { id: 'clubs', name: 'Pro kluby', icon: 'court', audience: 'organizátor',
      stories: [
        { t: 'stchat', eyebrow: 'Tohle znáš', title: '1. PETR|2. JANA|~3. ?' },
        { t: 'st', tone: 'navy', eyebrow: 'Řešení', title: 'JEDEN ODKAZ|~MÍSTO SEZNAMU.', body: 'Hráči se přihlásí a zaplatí sami. Ty vidíš všechno na jednom místě.' },
        { t: 'storg', eyebrow: 'Po čtvrtečním večeru', title: '4 200 KČ|~VYBRÁNO.' },
        { t: 'st', tone: 'orange', eyebrow: 'Pro kluby i party', title: 'AMERICANO,|~MEXICANO, PLAYOFF.', body: 'Rozpis kol a kurtů se sestaví sám.' },
        { t: 'st', tone: 'white', eyebrow: 'Napiš nám', title: 'UKÁŽEME TI|~TO ZA 10 MINUT.', cta: 'Zpráva v DM' }
      ],
      why: { audience: 'organizátor', practices: [11, 10], data: ['org.collected', 'org.paid'], text: 'Bolest (ruční seznam) → řešení → výsledek v číslech. Mluví ke klubu i k partě, ale vždy k tomu, kdo event pořádá.', sources: [] } },
    { id: 'tour', name: 'Turnaje', icon: 'trophy', audience: 'oba',
      stories: [
        { t: 'st', photo: 'court-reach.jpg', eyebrow: 'Čtvrtek 19:00', title: 'AMERICANO|~JE TADY.', body: 'Padel Dock Smíchov · 12 míst · 350 Kč' },
        { t: 'team', a: 'tereza', b: 'jakub' },
        { t: 'spots' },
        { t: 'live', court: 2, round: 4, a: ['tereza', 'martin'], b: ['jakub', 'klara'], s: [14, 10] },
        { t: 'winners', series: 12 },
        { t: 'st', photo: 'court-serve.jpg', eyebrow: 'Po turnaji', title: 'A TEĎ|~NA PIVO.', body: 'Díky, příští čtvrtek zase.' }
      ],
      why: { audience: 'oba', practices: [8, 2, 3], data: ['event.going[]', 'live.score', 'results.podium'], text: 'Celý příběh eventu ve stories, jak to dělá Padel Praha u Winter Cupu: oznámení → potvrzené týmy → poslední místa → živě → vítězové → oslava. Story „TÝM POTVRZEN“ je ruční série Padel Prahy, tady se vygeneruje automaticky po každé přihlášce.', sources: [{ t: 'Padel Praha: highlight Winter Cup 2026', u: 'https://www.instagram.com/stories/highlights/18084816032484351/' }] } },
    { id: 'res', name: 'Výsledky', icon: 'podium', audience: 'oba',
      stories: [{ t: 'winners', series: 10 }, { t: 'winners', series: 11 }, { t: 'winners', series: 12 }, { t: 'storycard', p: 'martin', series: 12 }],
      why: { audience: 'oba', practices: [3, 1], data: ['results[n].podium', 'results[n].date'], text: 'Stejná šablona „VÍTĚZOVÉ“ ve třech vydáních, mění se jen čísla, jména a datum. Padel Club Ostrava dělá každý týden „WINNERS“ ručně ve stejném stylu, opakovaný vzhled si lidi zapamatují jako značku série.', sources: [{ t: 'Padel Club Ostrava: highlight VP 2026', u: 'https://www.instagram.com/stories/highlights/18099658019083554/' }] } },
    { id: 'achs', name: 'Achievementy', icon: 'racket', audience: 'hráč',
      stories: [{ t: 'unlock', tier: 0 }, { t: 'unlock', tier: 1 }, { t: 'unlock', tier: 2 }, { t: 'unlock', tier: 3 }, { t: 'unlock', tier: 'streak' }],
      why: { audience: 'hráč', practices: [9], data: ['player.achievements[]'], text: 'Každý achievement jako story „ODEMČENO“, kterou hráč sdílí. Rakety a streak podle JVS.', sources: [] } },
    { id: 'faq', name: 'FAQ', icon: 'question', audience: 'organizátor',
      stories: [
        { t: 'faq', q: 'Musí mít hráči účet?', a: 'Ne. Jméno, kontakt, platba. Hotovo.' },
        { t: 'faq', q: 'Jak dostanu peníze?', a: 'Přes Stripe rovnou na svůj účet. Nebo ať platí na místě.' },
        { t: 'faq', q: 'Kolik to stojí?', a: '[DOPLNÍ KUBA] Cena zatím není určená.' },
        { t: 'faq', q: 'Jaké formáty umíte?', a: 'Americano, Mexicano, Round Robin, Playoff.' }
      ],
      why: { audience: 'organizátor', practices: [11], data: [], text: 'Otázky, které organizátor řeší před prvním eventem. Cenu nevymýšlíme, je to placeholder do OTAZKY.md.', sources: [] } }
  ],

  /* Aktivní story „Tento týden“ (kroužek kolem avataru) */
  activeStory: {
    stories: [
      { t: 'st', photo: 'court-orange-close.jpg', eyebrow: 'Tento týden', title: 'ČTVRTEČNÍ|~AMERICANO.', body: 'ČT 6. 11. · 19:00 · Padel Dock Smíchov' },
      { t: 'team', a: 'tereza', b: 'jakub' },
      { t: 'spots' },
      { t: 'winners', series: 12, last: true }
    ],
    why: { audience: 'oba', practices: [8, 2, 6], data: ['event.*', 'results.12'], text: 'Aktivní story vede k přihlášce na nejbližší event. „Kdo jde“ a „zbývají 3 místa“ jsou živá čísla z aplikace, ne text psaný ručně.', sources: [] }
  },

  /* Označené: UGC, karty sdílené hráči */
  tagged: [
    { by: 'tereza.m.padel', p: 'tereza', series: 12, variant: 'photo', result: 'VÍTĚZKA!', won: 8, total: 10 },
    { by: 'martin.c', p: 'martin', series: 12, variant: 'orange', result: '2. MÍSTO', won: 7, total: 10 },
    { by: 'jakub.l', p: 'jakub', series: 11, variant: 'navy', result: '2. MÍSTO', won: 6, total: 9 },
    { by: 'klara.padel', p: 'klara', series: 11, variant: 'photo', result: 'VÍTĚZKA!', won: 8, total: 9 },
    { by: 'ondrej.p', p: 'ondrej', series: 10, variant: 'navy', result: 'VÍTĚZ!', won: 7, total: 8 },
    { by: 'lucie.b', p: 'lucie', series: 11, variant: 'orange', result: '3. MÍSTO', won: 5, total: 9 }
  ],
  taggedWhy: { audience: 'hráč', practices: [9], data: ['card.*'], text: 'UGC: hráči sdílí své karty a označí účet. One Padel Zličín má highlight „TURNAJE“ skoro jen z repostů stories hostů. Obsah za značku vytvoří hráči.', sources: [{ t: 'One Padel Zličín: highlight TURNAJE', u: 'https://www.instagram.com/stories/highlights/17915270736430917/' }] }
};
