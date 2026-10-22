# Tapedare, beleške o buildu

Sajt je napravljen Skillom 02 (`website-build-rules`) iz `context.md`. Dizajn je
preuzet iz builda **Deko Pro** (`github.com/pavlegosicsales-cell/Deko-Pro`), koji
svoj sistem nasleđuje iz KupolArt / Framer premium-container template-a.

Teardown je rađen direktno iz izvornog koda tog repozitorijuma (HTML, `styles.css`,
`main.js` i njegov `BUILD-NOTES.md` sa mapom sekcija), a ne sa žive strane. Zato
nije bilo potrebe da tražimo originalni Framer template.

## Šta je preuzeto, a šta promenjeno

**Preuzeto 1:1:** `styles.css`, `main.js` i `lenis.min.js`. Cela anatomija
komponenti i motion sistem: floating pill nav sa tri scroll stanja, hero sa
prelivom i parallaxom, podela naslova po rečima, scroll reveal, drift kartica,
overlapping process paneli, FAQ akordeon, wizard forma, topologija u footeru.

**Paleta je promenjena** na boje sa Tapedare Facebook covera i logotipa. Promenjen
je `:root` blok, a zakucane vrednosti koje su preživele izmenu palete (mornarski
`rgba(20,35,66)` u prelivima, zlatna `rgba(208,178,106)`, bronza i mornarski preliv
u `.sec-foam`) sada idu kroz tokene `--deep-rgb`, `--flame-rgb` i `--flame-deep-rgb`.
Zlatna u topologiji (`main.js`) je takođe zamenjena.

| Token | Deko Pro | Tapedare |
|---|---|---|
| `--ink` | `#0B1E3B` mornarsko plava | `#1A1C1D` ugljeno crna |
| `--deep` | `#0B1E3B` | `#1E2223` pozadina covera |
| `--flame` | `#D0B26A` šampanj | `#E1BB28` zlatna iz logotipa |
| `--flame-deep` | `#8A6A2F` bronza | `#7D600C` tamno zlatna |
| `--wash` | `#F4F6FA` hladna | `#F7F4EC` topla krem |
| `--muted` | `#5B6472` | `#5E5B55` topla siva |
| `--btn-hover` | bronza | `#7D600C` |

Kontrast je proveren: tekst na beloj 17,1:1, telo teksta 6,77:1, tamno zlatna na
beloj 5,91:1, zlatna na tamnoj 8,67:1, crni tekst na zlatnom dugmetu 9,24:1.
Tipografija je ostala ista: Outfit za naslove, Noto Sans za telo teksta.

## Mapa sekcija

Pravilo je bilo: sekcije su naše (iz Skilla 02 i sadržaja klijenta), a dizajn se
uzima od najsličnije sekcije u Deko Pro.

| Sekcija kod nas | Blok iz Deko Pro |
|---|---|
| Hero | `.hero` |
| O nama + tri podatka | `.overview-top` + `.stat-row` |
| **Pre i posle (klizač)** | `.texture-split` raspored, nov `.ba` blok |
| Šta radimo (foto + 5 redova) | `.services-split` |
| Zašto Tapedare (2 kartice) | `.warranty-split` |
| Kako ide (3 koraka) | `.process-grid` |
| Česta pitanja | `.faq-split` |
| Footer | `.footer` |
| Wizard forma na kontaktu | `.wizard` |
| Politika privatnosti | `.page-head` + `.prose` |

**Nisu korišćeni** iz Deko Pro: `.feature-grid` (namene), `.project-stack` (tri
modela), konfigurator boje `.paleta` i `.work-grid` (radovi). Tapedare nema
modele ni boje proizvoda, a sa osam fotografija bi te sekcije samo ponavljale iste
slike. CSS za njih je ostao u `styles.css` i može da se ubaci bez novog koda.

**Jedina nova sekcija je Pre i posle.** U Deko Pro nema poređenja, a za tapetara je
to najjači dokaz kvaliteta. Najpopularnija objava na Facebooku (115 reakcija) je
upravo taj par fotografija. Raspored je preuzet iz sekcije „Tekstura i boje"
(tamna podloga, medij levo, tekst sa listom desno), a umesto videa stoji klizač:
gornja slika se klipuje sa `clip-path: inset()` do `--pos`, a prevlači se pravi
`<input type="range">`, pa rade i tastatura i čitači ekrana.

Dekorativni line-art ukrasi (`.deco`) iz Deko Pro nisu preneti, jer su crteži
ograda i blokova. Ako se kasnije naprave ukrasi za tapetara (igla, konac, kauč),
sistem `.deco` i `.has-deco` je spreman.

## Logotip

Poslati PNG (`Desktop/tapedare slike/`) ima providnu pozadinu i tri pojasa: znak
(kauč sa jastucima), natpis TAPEDARE i natpis TAPETARIJA. Isto kao u Deko Pro:

- `images/logo-mark.png` je **samo znak**, 256 x 256 sa praznim okvirom. Koriste
  ga navigacija (na tamnoj pločici, da ne nestane kad nav pobeli) i favicon.
- `images/logo.png` je pun lockup, obrezan. Koristi ga footer, bez pločice, jer
  je footer taman.

## Slike

Sve fotografije su sa Facebook stranice Tapedare i sve su prave slike radova.
Svaka ima web verziju do 1600 px i `-800` varijantu, a `srcset` je postavljen
svuda. Originali su u `images/facebook/`.

Cover sa Facebooka (tekst preko slike) i stari narandžasti „T" placeholder nisu
na sajtu. Sa osam upotrebljivih fotografija neke se ponavljaju (pre/posle par je
i u klizaču i u koracima „Kako ide"), što je za prvu verziju svesna odluka.

## Forma

Šest koraka, ali zidni paneli vide četiri, jer se prave nanovo i ugrađuju na licu
mesta (nema smisla pitati „presvlačenje ili popravka" ni „kako da preuzmemo").

| Korak | Pitanje | Vidi se za |
|---|---|---|
| 1 | Šta treba da obnovimo? | sve |
| 2 | Šta želite da uradimo? | sve osim zidnih panela |
| 3 | Kakav materijal vam se dopada? | sve |
| 4 | Kako da preuzmemo nameštaj? | sve osim zidnih panela |
| 5 | Kada vam treba? | sve |
| 6 | Vaši podaci | sve |

Validacija u `main.js` je sada generička (korak sa izborom traži odgovor u svojoj
grupi), umesto zakucanih brojeva koraka iz Deko Pro. **Imejl nije obavezan**:
tapetar se javlja telefonom, a mnogo mušterija ne koristi imejl. Ako je upisan,
mora da bude ispravan.

## Šta je testirano

- Nema horizontalnog skrola na 1440, 1024 i 375 px, ni na jednoj od tri strane.
- Na 1024 px dugme u navu je izlazilo 120 px van ekrana, jer su „Tapedare" i
  „Pre i posle" duži od naziva u referenci. Ispravljeno užim razmacima menija
  između 992 i 1240 px.
- Sve slike se učitavaju, nema grešaka u konzoli.
- Mobilni meni se otvara i zatvara na sve tri strane. Sve tap mete su 44 px ili više.
- Klizač pre/posle radi na prevlačenje i klik.
- Wizard: blokira „Dalje" bez odgovora, zidni paneli daju 4 koraka, fotelja 6,
  „Nazad" radi, prazan submit prijavljuje ime, telefon i mesto, pogrešan imejl se
  prijavljuje, popunjen submit prikazuje potvrdu sa rezimeom.
- Naslovi su 43, 42 i 31 znak. Meta opisi su 151, 154 i 148 znakova. Po jedan
  `h1`, `alt` na svim slikama, nijedna crtica `—`, nijedna zabranjena fraza.

## Šta sledi

1. **Forma još ne šalje nigde.** `ENDPOINT` na vrhu `main.js` je prazan. Pokrenite
   Skill 03 (`form-backend-setup`).
2. **Domen je pretpostavljen.** `tapedare.rs` u `canonical` i `og:url`.
3. **Nedostaje od klijenta:** imejl, adresa radionice, godine rada, tačna zona
   pokrivanja prevozom. Sajt ništa od toga ne tvrdi.
4. **Messenger link** `m.me/Tapedare` je izveden iz imena stranice. Proveriti da li
   otvara pravi razgovor.
5. **Nema recenzija.** Na Facebooku je 0 ocena. Nijedna nije izmišljena.
