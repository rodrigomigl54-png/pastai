# Faza 1: revizija materijala i plan

Datum: 16.10.2026.

## 1. Revizija priloženih fajlova

| # | Fajl u projektu | Rezolucija | Šta je na slici | Upotrebljivo za |
|---|---|---|---|---|
| 1 | `src/assets/raw/logo-original.jpg` | 451×443, JPEG q72 | Logo (klas, „Pastai“, potez, 2016, HAND MADE) | ✅ Vektorizovan u SVG (vidi §2) |
| 2 | `gallery/enterijer-separe.jpg` | 175×175 | Enterijer: separe sa dekorativnim tekstilom, pletene lampe | ❌ Samo 1× sličica |
| 3 | `spaghetti-viljuska-stock.jpg` | 547×365 | Špageti na viljušci, bela pozadina | ⚠️ Izgleda kao stock fotografija (licenca?) |
| 4 | `gallery/zelene-taljatele-gnezda.jpg` | 175×292 | Zelena gnezda taljatela na crnom tanjiru | ❌ Jedina „sveže testo“ fotografija, premala za teksturu |
| 5 | `gallery/pakovana-pasta.jpg` | 175×125 | Pakovana pasta sa Pastai etiketom | ❌ |
| 6 | `gallery/maslinovo-ulje-pasta.jpg` | 175×292 | Prelivanje ulja preko paste | ❌ |
| 7 | `gallery/crna-pasta-dagnje.jpg` | 175×292 | Crna pasta sa dagnjama i limunom | ❌ |
| 8 | `gallery/biftek-rukola.jpg` | 175×292 | Isečen biftek, rukola, krompir | ❌ |
| 9 | `gallery/sendvic-povrce.jpg` | 175×219 | Sendvič sa grilovanim povrćem | ❌ |
| 10 | `gallery/taljatele-meso-pecurke.jpg` | 175×292 | Taljatele sa mesom i pečurkama | ❌ |
| 11 | `gallery/pasta-plavi-tanjir.jpg` | 175×292 | Pasta na plavom tanjiru, drveni sto | ❌ |
| 12 | `gallery/pasta-brokoli.jpg` | 175×292 | Krem pasta sa brokolijem | ❌ |
| 13 | `gallery/rendanje-sira.jpg` | 175×292 | Rendanje sira preko paste | ❌ |
| 14 | `gallery/salata-avokado-pomorandza.jpg` | 175×292 | Salata sa avokadom i pomorandžom, mermer | ⚠️ Stil liči na stock/blog (licenca?) |
| 15 | `gallery/penne-sto.jpg` | 175×125 | Pene na stolu sa šarenim stolnjakom | ❌ |

**Video:** nije priložen nijedan video klip.

### Zašto su fotografije preniske rezolucije

Svih 13 fotografija hrane i enterijera su sličice širine 175 px (format Google Maps pregleda).
Minimalne potrebe po nameni (telefon 390 px CSS × DPR 3):

| Namena | Potrebna širina | Imamo |
|---|---|---|
| Hero (puna širina, telefon) | ≥ 1170 px (idealno 1920+) | 175 px |
| Galerija, pločica u 2 kolone | ≥ 540 px | 175 px |
| Lightbox (ceo ekran) | ≥ 1290 px | 175 px |
| Tekstura testa (traka 2×) | ravna oblast ≥ 2000 px | ~60 px čiste površine |
| OG slika 1200×630 | ≥ 1200 px | 547 px (stock) |

Po pravilu iz brifa **ništa ne uvećavam**. Na stranici iz faze 1 sličice su prikazane u
izvornoj veličini, samo radi revizije.

## 2. Logo

- Vektorizovan iz JPEG-a (potrace, sa internim 4× uvećanjem samo kao ulaz za trasiranje):
  `src/assets/brand/logo.svg` (33 KB, ~14 KB gzip).
- Razdvojen na 5 nezavisno animiranih delova: `src/assets/brand/logo-parts.svg`,
  `data-part = emblem | wordmark | swoosh | year | handmade`.
- Boja preko `currentColor`: radi i na tamnoj (`--ink`) i na svetloj (`--dough`) pozadini.
- ⚠️ Original je tesno isečen: leva ivica slova „P“ i desni kraj poteza dodiruju ivicu slike,
  pa su možda odsečeni. **Ako postoji originalni vektorski logo (AI/SVG/PDF), on je bolji izbor.**

## 3. Predlog: intro storyboard (5,0 s, „Preskoči“ vidljivo od prvog kadra)

Logo već ima potez ispod natpisa „Pastai“. **Izbor: traka testa se smiruje i postaje taj potez
(podvlaka).** Iscrtavanje konture slova trakom izgledalo bi jeftino, jer je „Pastai“ puni
četkasti rukopis, a ne linija.

| Vreme | Kadar |
|---|---|
| 0,0–0,3 s | Ekran `--ink`. Dugme „Preskoči“ je već vidljivo, uz nekoliko zrnaca brašna (statični SVG). |
| 0,3–1,4 s | Jedna traka svežeg testa (prava tekstura, blaga senka) ulazi s leve ivice i odmotava se u blagom S-luku preko ekrana, kao taljatela. |
| 1,0–2,9 s | Traka postaje **filmska traka**: 3–4 kadra iz restorana (enterijer, crna pasta, rendanje sira, gnezda) klize *unutar* trake, maskirani njenim oblikom. |
| 2,9–3,7 s | Traka ubrzava, pravi jednu petlju („uvijanje“), pa se njen rep morfuje tačno u oblik poteza iz logotipa (GSAP MorphSVG). |
| 3,4–4,1 s | Natpis „Pastai“ se otkriva maskom u smeru poteza četke, sleva nadesno. Klas se blago podiže, a „2016 · HAND MADE“ se diskretno pojavljuje. |
| 4,1–4,9 s | **Shared-element prelaz:** logo + traka (FLIP, `getBoundingClientRect`) klize na tačnu poziciju u hero sekciji, dok se `--ink` sloj podiže i otkriva hero ispod. Nema belog bljeska ni pomeranja rasporeda. |
| 4,9–5,0 s | Kraj trake se nastavlja u **scroll nit** (početna tačka puta = tačka na kraju poteza u heru). Skrol se otključava. |

- **Smanjeno kretanje:** prelaz logotipa preko statične slike u trajanju od 1,2 s, bez putanja.
- **Preskoči / Esc / tap-and-hold:** timeline ubrzava (`timeScale`) do kraja prelaza za ~350 ms, bez naglog reza.
- **LCP:** hero (logo + naslov) se renderuje odmah ispod intro sloja; intro je samo prekrivač.

## 4. Postavljeno u fazi 1

- Astro 7.4 (statični izlaz), TypeScript strict, `@astrojs/sitemap`, GSAP 3.15, sharp, Vitest.
- `SITE_URL`, `SHOW_PRICES`, `LAST_RESERVATION_OFFSET_MIN` u `src/config/site.ts`.
- Tokeni u `src/styles/tokens.css`, sa izmerenim WCAG kontrastom (vidi niže).
- Fontovi (samostalno hostovani, heš imena, `font-display: swap`, metrički usklađeni fallback):
  - Naslovi: **Fraunces** (statični rezovi 500 / 600 / 500 italik, SOFT 50, opsz 32), ~12 KB + 2 KB po rezu.
  - Tekst: **Manrope** varijabilni, ~16,5 KB + 2,5 KB.
  - Preload samo za Fraunces 500 (jedina težina naslova iznad pregiba).
- `src/data/business.ts` sa verifikovanim podacima iz brifa.

### Zašto Fraunces, a ne Cormorant Garamond

Cormorant ima malu x-visinu i visoke kvačice. Na č, š i ž one „lebde“ iznad slova i izgledaju
kao greška (proverio sam: to je dizajn fonta, ne greška podskupa). Fraunces drži dijakritike uz
slovo, ima lining brojeve (lepše cene: 1.280 RSD), a SOFT osa daje blago zaobljene, „testaste“
serife.

### Kontrast (WCAG AA)

| Par | Odnos | |
|---|---|---|
| ink / dough | 15,52 | ✅ |
| tomato tekst na dough | 4,29 | ❌ → tekst koristi `--tomato-text #B5341E` (4,97) |
| beli tekst na tomato (CTA) | 5,21 | ✅ (dough na tomato = 4,29 ❌) |
| tomato na ink | 3,62 | ❌ za tekst → `--tomato-on-ink #E0573C` (5,03) |
| basil na dough | 5,13 | ✅ |
| basil na dough-deep | 4,36 | ❌ → `--basil-text #355C32` (5,38) |
| basil na ink | 3,03 | ❌ → `--basil-on-ink #7FA877` (6,98) |

## 5. Šta mi treba od vas pre faze 2

1. **Fotografija svežeg testa** za teksturu trake (najvažnije): razvučen list svežeg jajčanog
   testa (krem boja), snimljen odozgo, na dnevnom svetlu, bez jakih senki, ravno izoštren, sa
   malo brašna. Original sa telefona, **≥ 3000 px**, bez kompresije (pošaljite kao fajl, ne kroz
   WhatsApp/Viber). Idealno 2–3 snimka.
2. **Originali fotografija** (telefon/fotoaparat ili Instagram originali ≥ 1080 px): bar jedna
   horizontalna i jedna vertikalna za hero, enterijer, bašta, jela.
3. **Video klipovi** za intro, ako postoje (bilo koji format; enkodiranje radi skripta).
4. Potvrda da su **špageti na viljušci** i **salata sa avokadom** vaše fotografije ili da imate
   licencu; u suprotnom ih izbacujem.
5. Originalni **vektorski logo**, ako postoji.
