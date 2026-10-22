# Tapedare

Sajt za **Tapedare tapetariju** iz Beograda: tapaciranje, presvlačenje i popravka
svih vrsta nameštaja, sa obezbeđenim prevozom.

Statičan sajt. Nema build korak, nema zavisnosti u kodu. Otvorite `index.html`
ili poslužite folder bilo kojim statičkim serverom.

```bash
python -m http.server 8778
```

## Strane

| Fajl | Šta je |
|---|---|
| `index.html` | Početna, sedam sekcija |
| `contact.html` | Kontakt sa formom u šest koraka (četiri za zidne panele) |
| `privacy.html` | Politika privatnosti |

## Fajlovi

| Fajl | Šta je |
|---|---|
| `styles.css` | Ceo dizajn sistem, sve boje su tokeni u `:root` |
| `main.js` | Navigacija, scroll reveal, FAQ, forma, klizač pre/posle, topologija u footeru |
| `lenis.min.js` | Glatko skrolovanje |
| `images/` | 8 fotografija sa `-800` varijantama, logo i znak |
| `images/facebook/` | Originali skinuti sa Facebook stranice |
| `context.md` | Podaci o klijentu, izvor za sadržaj |
| `BUILD-NOTES.md` | Odakle je dizajn, šta je promenjeno i zašto |

## Boje

| Token | Vrednost | Gde |
|---|---|---|
| `--ink` | `#1A1C1D` | naslovi na svetloj podlozi |
| `--deep` | `#1E2223` | tamne sekcije, pozadina sa Facebook covera |
| `--flame` | `#E1BB28` | zlatna iz logotipa, samo na tamnoj podlozi |
| `--flame-deep` | `#7D600C` | tamno zlatna, akcenti na beloj podlozi |

Zlatna `#E1BB28` na beloj ima kontrast 1,85:1 i **ne sme** da se koristi za
tekst na beloj. Za to služi `--flame-deep` (5,91:1).

## Pre objave

1. `ENDPOINT` na vrhu `main.js` je prazan. Forma nigde ne šalje dok se ne
   pokrene Skill 03 i ne nalepi Apps Script URL.
2. Domen `tapedare.rs` je pretpostavljen. Stoji u `canonical` i `og:url`.
3. Imejl klijenta nije poznat, zato ga sajt nigde ne navodi.
