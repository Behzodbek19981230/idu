// "Internet dasturiy ta'minot arxitekturasi" fani uchun ish reja va dars qo'llanmalari.
// Manba: fan dasturi — Ma'ruza 24 soat (M1–M12), Amaliy 60 soat (A1–A12),
// Mustaqil ta'lim 116 soat (6 ta topshiriq).

export type SeedTopic = {
  title: string;
  week: number;
  lesson_type: 'lecture' | 'practice' | 'lab' | 'seminar' | 'independent';
  hours: number;
  summary: string;
  objectives: string;
  keywords: string;
  content: string;
  assignments: string;
  resources: string;
};

export type SeedSubject = {
  name: string;
  code: string;
  description: string;
  semester: number | null;
  credits: number | null;
  lecture_hours: number;
  practice_hours: number;
  independent_hours: number;
};

export const subject: SeedSubject = {
  name: 'Internet dasturiy ta’minot arxitekturasi',
  code: 'IDTA-301',
  description:
    'Fan talabalarda internet dasturiy ta’minot arxitekturasi — monolit, mijoz-server, mikroxizmatlar va bulutli arxitekturalar haqida yaxlit tushuncha hosil qiladi. Frontend (HTML, CSS, Bootstrap, JavaScript) va backend (REST API, AJAX, ma’lumotlar bazasi) texnologiyalari yordamida to‘liq web-ilova yaratish o‘rgatiladi. Ma’lumotlar bazasini arxitekturaga integratsiya qilish, HTTPS, SSL/TLS, autentifikatsiya va avtorizatsiya (OAuth 2.0, JWT) masalalari amaliyotda ko‘rib chiqiladi. Kurs yakunida talaba Git va CI/CD vositalari yordamida o‘z mini web-ilovasini bulutli platformada joylashtiradi.',
  semester: null,
  credits: null,
  lecture_hours: 24,
  practice_hours: 60,
  independent_hours: 116,
};

export const topics: SeedTopic[] = [
  // ─────────────────────────── 1-hafta ───────────────────────────
  {
    title: 'Internet dasturiy ta’minot arxitekturasi tushunchasi',
    week: 1,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Internet dasturiy ta’minot arxitekturasi mohiyati, dasturiy tizimlarning tuzilishi, web-ilovalarning tarixiy rivojlanishi hamda monolit, mijoz-server va bulutli arxitekturalar o‘rtasidagi asosiy farqlar.',
    objectives: [
      'Dasturiy arxitektura tushunchasini ta’riflash va uni dizayndan farqlash',
      'Web-ilovalar rivojlanishining asosiy bosqichlarini ketma-ketlikda izohlash',
      'Monolit, mijoz-server va bulutli arxitekturalarni 4–5 mezon bo‘yicha qiyoslash',
      'Sifat atributlari (NFR) arxitektura tanloviga qanday ta’sir qilishini tushuntirish',
    ].join('\n'),
    keywords:
      'arxitektura, arxitektura uslubi, monolit, mijoz-server, bulutli arxitektura, sifat atributlari, C4 model, HTTP',
    content: `## 1. Darsning maqsadi

Dars oxirida talaba "arxitektura" so‘zini shunchaki chiroyli atama sifatida emas, **o‘zgartirish narxini belgilovchi qarorlar to‘plami** sifatida tushunadi va ixtiyoriy web-ilovani ko‘rib, uning qaysi arxitektura uslubiga tegishli ekanini ayta oladi.

## 2. Nazariy qism (50 daqiqa)

### 2.1. Arxitektura nima?

**Dasturiy arxitektura** — tizimning asosiy komponentlari, ular orasidagi bog‘lanishlar va shu bog‘lanishlarni boshqaruvchi qoidalar majmuasi.

> Martin Fowler ta’rifi: *"Arxitektura — bu keyinchalik o‘zgartirish qimmatga tushadigan qarorlar."*

Arxitektura va dizayn farqi:

| Savol | Arxitektura | Dizayn |
|---|---|---|
| Nimani hal qiladi | Tizim qanday bo‘laklarga bo‘linadi | Bo‘lak ichida kod qanday yoziladi |
| Qaror darajasi | Butun tizim | Bitta modul/sinf |
| O‘zgartirish narxi | Yuqori | Past |
| Misol | "Ma’lumotlar bazasi PostgreSQL, aloqa REST orqali" | "Bu funksiya nomi \`getUser\` bo‘lsin" |

### 2.2. Web-ilovaning fizik tuzilishi

Har qanday internet ilovasi kamida shu uch bo‘lakdan iborat:

1. **Mijoz (client)** — brauzer yoki mobil ilova. Interfeys shu yerda ko‘rsatiladi.
2. **Server** — so‘rovni qabul qiladi, biznes-mantiqni bajaradi (backend).
3. **Ma’lumotlar ombori** — SQL/NoSQL baza, fayl xotirasi, kesh.

Ular orasidagi aloqa **HTTP** protokoli orqali amalga oshadi:

\`\`\`http
GET /api/products?page=2 HTTP/1.1
Host: shop.uz
Accept: application/json
\`\`\`

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json

{ "items": [ { "id": 7, "name": "Klaviatura" } ], "total": 42 }
\`\`\`

### 2.3. Web-ilovalarning tarixiy rivojlanishi

| Davr | Texnologiya | Arxitektura xususiyati |
|---|---|---|
| 1991–1995 | Statik HTML | Server faqat fayl uzatadi |
| 1995–2000 | CGI, Perl, PHP | Sahifa serverda dinamik yig‘iladi |
| 2000–2005 | JSP, ASP.NET, MVC | Uch qatlamli monolit, shablonlar |
| 2005–2010 | AJAX, Web 2.0 | Sahifa yangilanmasdan ma’lumot almashadi |
| 2010–2015 | REST API + SPA | Frontend va backend ajraladi |
| 2015– | Mikroservis, konteyner, serverless | Mustaqil deploy, bulutli miqyoslash |

> **Auditoriyaga savol:** nega AJAX paydo bo‘lgach, REST API ehtiyoji keskin oshdi?

### 2.4. Asosiy arxitektura uslublari qiyosi

| Mezon | Monolit | Mijoz-server | Mikroservis | Bulutli (cloud-native) |
|---|---|---|---|---|
| Deploy birligi | Bitta | Ikkita (front + back) | Har xizmat alohida | Konteyner/funksiya |
| Miqyoslash | Butun ilova | Server qatlami | Faqat kerakli xizmat | Avtomatik (auto-scaling) |
| Murakkablik | Past | O‘rtacha | Yuqori | Yuqori |
| Xato ta’siri | Butun tizim to‘xtaydi | Server to‘xtaydi | Bitta xizmat to‘xtaydi | Izolyatsiya + qayta tiklash |
| Kimga mos | Kichik jamoa, MVP | Klassik web-ilova | Katta jamoa, yuqori yuk | O‘zgaruvchan yuk |

### 2.5. Sifat atributlari (NFR) — arxitekturani belgilovchi omil

Funksional talab "nima qiladi"ni, sifat atributi "qanday qiladi"ni aytadi:

- **Performance** — javob vaqti (masalan, p95 < 300 ms).
- **Scalability** — yuk 10 barobar oshsa nima bo‘ladi.
- **Availability** — yiliga qancha vaqt ishlamay turishi mumkin (99.9% = 8.7 soat).
- **Security** — maxfiylik, yaxlitlik, ruxsat nazorati.
- **Maintainability** — yangi dasturchi qancha vaqtda kod bilan tanishadi.

Arxitektura — shu atributlar orasidagi **murosa (trade-off)**. "Eng yaxshi arxitektura" yo‘q, "shu kontekst uchun mos arxitektura" bor.

### 2.6. Arxitekturani hujjatlashtirish: C4 modeli

1. **Context** — tizim va uning tashqi foydalanuvchilari.
2. **Container** — ishga tushuvchi birliklar (SPA, API, baza).
3. **Component** — konteyner ichidagi modullar.
4. **Code** — sinflar darajasi (kamdan-kam chiziladi).

## 3. Amaliy qism (25 daqiqa)

Guruhlarga bo‘linib, quyidagi tizimlar uchun **Context va Container** diagrammalarini qog‘ozda chizing:

- onlayn taksi buyurtma xizmati;
- universitet elektron kutubxonasi;
- ob-havo haqida ma’lumot beruvchi mobil ilova.

Har bir guruh: qaysi arxitektura uslubini tanlaganini va **nega** shuni tanlaganini 2 daqiqada himoya qiladi.

## 4. Yakunlash (5 daqiqa)

- Blits-savol: arxitektura va dizayn farqi nimada?
- Keyingi darsga: HTML hujjat tuzilmasi va semantik teglarni takrorlab kelish.`,
    assignments: `1. O‘zingiz kundalik foydalanadigan 3 ta web-xizmatni tanlang va ularning taxminiy arxitekturasini (mijoz, server, baza, tashqi xizmatlar) chizib, qaysi uslubga mos kelishini asoslang.
2. Brauzerning DevTools → Network bo‘limini oching, istalgan saytni yuklang va birinchi 5 ta HTTP so‘rovni jadvalga yozing: metod, manzil, status, javob turi, hajmi.
3. "Monolit va mikroservis" mavzusida 1 betlik qiyosiy tahlil yozing: qaysi holatda qaysi biri afzal va nega.
4. 99.9% va 99.99% availability yiliga necha daqiqa ishlamaslikni bildirishini hisoblang.`,
    resources: `- Mark Richards, Neal Ford. *Fundamentals of Software Architecture: An Engineering Approach*. O’Reilly, 2020 — 1–4-boblar
- Len Bass, Paul Clements, Rick Kazman. *Software Architecture in Practice*. 4-nashr, Addison-Wesley, 2021 — sifat atributlari
- Simon Brown. *Software Architecture for Developers* / C4 modeli — https://c4model.com
- MDN Web Docs. *An overview of HTTP* — https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- Ilya Grigorik. *High Performance Browser Networking*. O’Reilly — https://hpbn.co (1-bob)`,
  },
  {
    title: 'HTML asoslari bilan tanishuv',
    week: 1,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'HTML hujjatini yaratish, asosiy teglarni qo‘llash, matn, rasm, havola va jadvallarni joylashtirish, semantik tuzilma va formalar bilan ishlash.',
    objectives: [
      'To‘g‘ri tuzilgan HTML5 hujjatini noldan yaratish',
      'Semantik teglardan (header, nav, main, section, article, footer) o‘rinli foydalanish',
      'Rasm, havola, ro‘yxat va jadvalni sahifaga joylashtirish',
      'Forma elementlarini yaratib, ularni label bilan bog‘lash',
      'W3C validator orqali sahifadagi xatolarni topib tuzatish',
    ].join('\n'),
    keywords: 'HTML5, DOCTYPE, semantik teglar, atribut, forma, input, alt, W3C validator',
    content: `## 1. Mashg‘ulot formati (4 akademik soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Muhitni sozlash, birinchi hujjat | 30 daq |
| 2 | Matn, havola, rasm, ro‘yxat | 45 daq |
| 3 | Jadval va semantik tuzilma | 45 daq |
| 4 | Formalar | 30 daq |
| 5 | Validatsiya va topshirish | 30 daq |

## 2. Ish muhiti

- **VS Code** + \`Live Server\` kengaytmasi (sahifa avtomatik yangilanadi).
- Brauzer DevTools: \`F12\` → Elements tab.
- Loyiha papkasi:

\`\`\`
portfolio/
├── index.html
├── about.html
└── img/
    └── avatar.jpg
\`\`\`

## 3. Birinchi hujjat

\`\`\`html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mening portfoliom</title>
</head>
<body>
  <h1>Assalomu alaykum!</h1>
  <p>Men — <strong>Kompyuter injiniringi</strong> yo‘nalishi talabasiman.</p>
</body>
</html>
\`\`\`

**Har bir qator nima uchun kerak:**

| Element | Vazifasi |
|---|---|
| \`<!DOCTYPE html>\` | Brauzerga HTML5 standartini bildiradi |
| \`lang="uz"\` | Til — skrinrider va qidiruv tizimlari uchun |
| \`charset="UTF-8"\` | O‘zbekcha harflar to‘g‘ri ko‘rinishi uchun |
| \`viewport\` | Mobil qurilmada masshtab to‘g‘ri bo‘lishi uchun |

> ⚠️ \`charset\` yoki \`viewport\` unutilsa — matn "krakozyabra" bo‘ladi yoki telefonda sahifa kichrayib ketadi.

## 4. Asosiy teglar

\`\`\`html
<h1>–<h6>   sarlavhalar (sahifada <h1> bitta bo‘ladi)
<p>          xatboshi
<a href="">  havola
<img src="" alt="">  rasm
<ul><li>     tartibsiz ro‘yxat
<ol><li>     tartibli ro‘yxat
<table>      jadval
<br> <hr>    bo‘sh teglar
\`\`\`

\`\`\`html
<h2>Ko‘nikmalarim</h2>
<ul>
  <li>HTML va CSS</li>
  <li>JavaScript asoslari</li>
</ul>

<p>Men bilan bog‘lanish:
  <a href="mailto:talaba@univ.uz">talaba@univ.uz</a>
</p>

<img src="img/avatar.jpg" alt="Talabaning fotosurati" width="200">
\`\`\`

> \`alt\` — majburiy: rasm yuklanmasa matn ko‘rinadi, skrinrider uni o‘qiydi, SEO uchun ham muhim.

## 5. Semantik tuzilma

Noto‘g‘ri (hamma narsa \`div\`):

\`\`\`html
<div class="header">...</div>
<div class="content">...</div>
\`\`\`

To‘g‘ri:

\`\`\`html
<header>
  <h1>Portfolio</h1>
  <nav>
    <a href="index.html">Bosh sahifa</a>
    <a href="about.html">Men haqimda</a>
  </nav>
</header>

<main>
  <section id="loyihalar">
    <h2>Loyihalarim</h2>
    <article>
      <h3>Kalkulyator</h3>
      <p>JavaScript’da yozilgan sodda kalkulyator.</p>
    </article>
  </section>
</main>

<footer>
  <p>&copy; 2026 Talaba F.I.Sh.</p>
</footer>
\`\`\`

## 6. Jadval

\`\`\`html
<table>
  <caption>Semestr baholari</caption>
  <thead>
    <tr><th>Fan</th><th>Ball</th></tr>
  </thead>
  <tbody>
    <tr><td>Web arxitektura</td><td>87</td></tr>
    <tr><td>Ma’lumotlar bazasi</td><td>91</td></tr>
  </tbody>
</table>
\`\`\`

## 7. Forma

\`\`\`html
<form action="/api/feedback" method="post">
  <label for="ism">Ismingiz</label>
  <input type="text" id="ism" name="ism" required>

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <label for="xabar">Xabar</label>
  <textarea id="xabar" name="xabar" rows="4"></textarea>

  <button type="submit">Yuborish</button>
</form>
\`\`\`

\`label\` ning \`for\` qiymati \`input\` ning \`id\` siga teng bo‘lishi shart — shunda yorliqqa bosilganda maydon faollashadi.

## 8. Sinfda bajariladigan topshiriq

**"Shaxsiy portfolio" sahifasi:**

1. \`index.html\` — header (ism + navigatsiya), main (men haqimda, ko‘nikmalar ro‘yxati, loyihalar jadvali), footer.
2. \`about.html\` — batafsil tarjimai hol, rasm, tashqi havolalar (\`target="_blank"\`).
3. \`index.html\` ichida bog‘lanish formasi.
4. Ikkala sahifa bir-biriga havola orqali bog‘lansin.

## 9. Validatsiya

Sahifani https://validator.w3.org/#validate_by_input ga joylang. **0 ta error** bo‘lishi shart.

Ko‘p uchraydigan xatolar:

- yopilmagan teg (\`<p>\` ga \`</p>\` yo‘q);
- \`alt\` atributsiz \`<img>\`;
- bitta sahifada bir nechta \`<h1>\`;
- blok elementni \`<p>\` ichiga joylash;
- bir xil \`id\` ning takrorlanishi.`,
    assignments: `1. Portfolio sahifasini 3-sahifa bilan to‘ldiring: "Aloqa" (\`contact.html\`) — forma va joylashuv jadvali bilan.
2. Faqat semantik teglardan foydalangan holda yangiliklar sayti bosh sahifasining tuzilmasini yozing (\`div\` ishlatmasdan).
3. HTML5 ning kamida 8 xil \`input\` turini (\`email\`, \`date\`, \`range\`, \`color\`, \`number\`, \`file\`, \`checkbox\`, \`radio\`) bitta sahifada namoyish qiling.
4. Sahifangizni W3C validatordan o‘tkazing va natija skrinshotini topshiring.`,
    resources: `- Jon Duckett. *HTML and CSS: Design and Build Websites*. Wiley, 2011 — 1–7-boblar
- MDN Web Docs. *HTML: HyperText Markup Language* — https://developer.mozilla.org/en-US/docs/Web/HTML
- WHATWG HTML Living Standard — https://html.spec.whatwg.org
- web.dev. *Learn HTML* — https://web.dev/learn/html
- W3C Markup Validation Service — https://validator.w3.org`,
  },

  // ─────────────────────────── 2-hafta ───────────────────────────
  {
    title: 'CSS yordamida sahifalarni bezash',
    week: 2,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'CSS selektorlari, ranglar va shriftlar bilan ishlash, box model, kaskad va merosxo‘rlik, oddiy dizaynni qo‘llash tamoyillari.',
    objectives: [
      'CSS ni HTML ga ulashning uch usulini farqlash va to‘g‘risini tanlash',
      'Selektor turlarini va ularning ustuvorligini (specificity) hisoblash',
      'Box model elementlarini (content, padding, border, margin) izohlash',
      'Rang va shrift birliklarini (hex, rgb, hsl, px, rem, em) o‘rinli qo‘llash',
    ].join('\n'),
    keywords:
      'CSS, selektor, specificity, kaskad, merosxo‘rlik, box model, padding, margin, rem, hsl, web-shrift',
    content: `## 1. Darsning maqsadi

Talaba CSS ni "tasodifiy qiymatlarni tanlab ko‘rish" emas, **qoidalarga bo‘ysunuvchi tizim** sifatida tushunsin: qaysi qoida nega ustun keldi va element o‘lchami qanday hisoblanadi — shuni aniq ayta olsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. CSS ni ulashning uch usuli

\`\`\`html
<!-- 1. Inline — faqat favqulodda holatda -->
<p style="color: red;">Matn</p>

<!-- 2. Internal — bitta sahifa uchun -->
<style> p { color: red; } </style>

<!-- 3. External — to‘g‘ri yo‘l -->
<link rel="stylesheet" href="css/style.css">
\`\`\`

**External** afzal: kod takrorlanmaydi, brauzer faylni keshlaydi, dizayn va tuzilma ajratiladi.

### 2.2. Qoida tuzilmasi

\`\`\`css
selektor {
  xossa: qiymat;   /* e’lon (declaration) */
}
\`\`\`

### 2.3. Selektorlar

| Selektor | Misol | Nimani tanlaydi |
|---|---|---|
| Teg | \`p\` | barcha \`<p>\` |
| Sinf | \`.karta\` | \`class="karta"\` |
| ID | \`#menyu\` | \`id="menyu"\` (sahifada bitta) |
| Universal | \`*\` | hamma element |
| Guruh | \`h1, h2\` | ikkalasi |
| Avlod | \`nav a\` | \`nav\` ichidagi barcha \`a\` |
| Bevosita farzand | \`ul > li\` | faqat to‘g‘ridan-to‘g‘ri \`li\` |
| Atribut | \`input[type="email"]\` | shu turdagi maydon |
| Psevdo-sinf | \`a:hover\`, \`li:nth-child(2n)\` | holat yoki tartib |

### 2.4. Kaskad va ustuvorlik (specificity)

Bir elementga bir nechta qoida tegsa, g‘olib shu tartibda aniqlanadi:

1. \`!important\` (imkon qadar ishlatmang);
2. **specificity** — (inline, ID, sinf/atribut/psevdo-sinf, teg) ko‘rinishidagi to‘rtlik;
3. teng bo‘lsa — faylda **keyin** yozilgani.

\`\`\`css
p                 /* 0,0,0,1 */
.matn             /* 0,0,1,0 */
nav ul li a       /* 0,0,0,4 */
#menyu .link      /* 0,1,1,0  ← eng kuchli */
\`\`\`

> **Amaliy qoida:** ID bilan bezamang, sinf ishlating. Aks holda keyinchalik uslubni bekor qilish uchun \`!important\` ga majbur bo‘lasiz.

### 2.5. Merosxo‘rlik (inheritance)

\`color\`, \`font-family\`, \`line-height\` kabi xossalar farzandlarga o‘tadi; \`border\`, \`padding\`, \`background\` o‘tmaydi. Shuning uchun umumiy shriftni \`body\` ga bir marta beriladi.

### 2.6. Box model

Har bir element to‘rtta qatlamdan iborat: **content → padding → border → margin**.

\`\`\`css
* { box-sizing: border-box; }   /* zamonaviy loyihada standart */
\`\`\`

| \`box-sizing\` | \`width: 300px; padding: 20px; border: 5px\` da real eni |
|---|---|
| \`content-box\` (standart) | 300 + 40 + 10 = **350px** |
| \`border-box\` | **300px** (padding va border ichkarida) |

Vertikal margin’lar **birlashadi** (margin collapsing): 30px va 20px yonma-yon tursa — oraliq 50px emas, 30px bo‘ladi.

### 2.7. Ranglar

\`\`\`css
color: #1a73e8;                /* hex */
color: rgb(26 115 232);        /* rgb */
color: rgba(26,115,232,.5);    /* shaffoflik bilan */
color: hsl(214 82% 51%);       /* ohang, to‘yinganlik, yorug‘lik */
\`\`\`

**HSL** afzal: bitta ohangdan ochiq/to‘q variantlarni yorug‘lik foizini o‘zgartirib olish oson — shu bilan izchil palitra tuziladi.

### 2.8. Shriftlar va o‘lchov birliklari

\`\`\`css
body {
  font-family: "Inter", system-ui, sans-serif;  /* zaxira ro‘yxati */
  font-size: 16px;
  line-height: 1.6;
}
h1 { font-size: 2rem; }    /* 2 × ildiz o‘lchami = 32px */
\`\`\`

| Birlik | Nimaga nisbatan | Qachon |
|---|---|---|
| \`px\` | mutlaq | chegara, soya |
| \`rem\` | \`html\` shrift o‘lchami | shrift, bo‘shliq |
| \`em\` | ota element shrifti | ichki bo‘shliq |
| \`%\`, \`vw\`, \`vh\` | konteyner / oyna | moslashuvchan blok |

## 3. Amaliy qism (20 daqiqa)

Tayyor HTML sahifaga **faqat CSS orqali** quyidagilarni qo‘llang:

1. \`body\` ga umumiy shrift, rang va \`line-height\`;
2. sarlavhalar uchun izchil o‘lchov shkalasi (\`rem\`);
3. \`.karta\` sinfi: oq fon, \`padding\`, yumaloq burchak, yengil soya;
4. havolalar uchun \`:hover\` va \`:focus-visible\` holatlari.

## 4. Yakunlash (5 daqiqa)

- \`#menyu li a\` va \`.nav-link\` — qaysi biri ustun keladi? Nega?
- \`padding\` va \`margin\` farqini bir gapda ayting.`,
    assignments: `1. Bitta HTML sahifaga ikki xil CSS fayl yozing (och va to‘q mavzu) — faqat \`<link>\` ni almashtirib dizaynni o‘zgartirish mumkin bo‘lsin.
2. 5 ta qoidadan iborat CSS parchasi bering va har biri uchun specificity to‘rtligini hisoblab, qaysi biri g‘olib kelishini yozing.
3. \`box-sizing: content-box\` va \`border-box\` farqini bitta sahifada yonma-yon ko‘rsatuvchi misol tayyorlang.
4. HSL yordamida bitta asosiy rangdan 5 pog‘onali palitra (50, 200, 400, 600, 800) tuzing va uni sahifada namoyish qiling.`,
    resources: `- Eric Meyer, Estelle Weyl. *CSS: The Definitive Guide*. 4-nashr, O’Reilly, 2017 — 1–8-boblar
- Jon Duckett. *HTML and CSS: Design and Build Websites*. Wiley, 2011 — 10–14-boblar
- MDN Web Docs. *CSS: Cascading Style Sheets* — https://developer.mozilla.org/en-US/docs/Web/CSS
- web.dev. *Learn CSS* — https://web.dev/learn/css
- Lea Verou. *CSS Secrets*. O’Reilly, 2015`,
  },
  {
    title: 'CSS yordamida sahifalarni bezash (amaliy)',
    week: 2,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'CSS selektorlari, ranglar va shriftlar bilan amaliy ishlash, box model, flexbox asoslari va CSS o‘zgaruvchilari yordamida sahifaga yaxlit dizayn qo‘llash.',
    objectives: [
      'Tashqi CSS faylini loyihaga to‘g‘ri ulash va tartibli tashkil qilish',
      'Selektorlardan foydalanib sahifaning turli bo‘limlarini bezash',
      'Flexbox yordamida elementlarni bir qatorda va markazda joylashtirish',
      'CSS o‘zgaruvchilari (custom properties) bilan yagona palitra tuzish',
      'DevTools orqali uslub xatolarini topish',
    ].join('\n'),
    keywords: 'CSS fayl, flexbox, custom properties, hover, transition, box model, DevTools',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Fayl tuzilmasi va reset | 20 daq |
| 2 | Tipografika va palitra | 40 daq |
| 3 | Box model bilan mashq | 40 daq |
| 4 | Flexbox: header va kartalar | 50 daq |
| 5 | Holatlar va animatsiya | 20 daq |
| 6 | Topshirish va tekshiruv | 10 daq |

## 2. Boshlang‘ich sozlash

\`\`\`css
/* css/style.css */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
img { max-width: 100%; display: block; }
\`\`\`

## 3. Palitra va tipografika — CSS o‘zgaruvchilari

\`\`\`css
:root {
  --rang-asosiy: hsl(214 82% 51%);
  --rang-asosiy-toq: hsl(214 82% 38%);
  --rang-matn: hsl(220 15% 20%);
  --rang-fon: hsl(220 20% 97%);
  --radius: 12px;
  --bosh: 1rem;
}

body {
  font-family: system-ui, "Segoe UI", sans-serif;
  color: var(--rang-matn);
  background: var(--rang-fon);
  line-height: 1.6;
}

h1 { font-size: 2.25rem; margin-block: 0 .5em; }
h2 { font-size: 1.5rem; }
\`\`\`

> Rangni bir joyda o‘zgartirsangiz — butun sayt o‘zgaradi. Bu **dizayn tokenlari** g‘oyasi.

## 4. Box model bilan mashq

\`\`\`css
.karta {
  background: #fff;
  padding: calc(var(--bosh) * 1.5);
  border: 1px solid hsl(220 15% 88%);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px hsl(220 15% 20% / .08);
}
\`\`\`

**Tajriba:** DevTools → Elements → Computed → box model diagrammasi. \`padding\` ni o‘zgartirib, elementning real o‘lchami qanday o‘zgarishini kuzating.

## 5. Flexbox bilan joylashtirish

\`\`\`css
.header {
  display: flex;
  justify-content: space-between;  /* chetlarga */
  align-items: center;             /* vertikal markaz */
  gap: 1rem;
  padding: 1rem 2rem;
  background: #fff;
}

.kartalar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.kartalar > .karta {
  flex: 1 1 280px;   /* o‘sadi, kichrayadi, bazasi 280px */
}
\`\`\`

| Xossa | Vazifasi |
|---|---|
| \`justify-content\` | asosiy o‘q bo‘yicha taqsimlash |
| \`align-items\` | ko‘ndalang o‘q bo‘yicha tekislash |
| \`gap\` | elementlar orasidagi bo‘shliq |
| \`flex-wrap\` | joy yetmasa keyingi qatorga o‘tkazish |

## 6. Holatlar va silliq o‘tish

\`\`\`css
.tugma {
  background: var(--rang-asosiy);
  color: #fff;
  border: 0;
  padding: .75rem 1.25rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background .2s ease, transform .1s ease;
}
.tugma:hover  { background: var(--rang-asosiy-toq); }
.tugma:active { transform: translateY(1px); }
.tugma:focus-visible { outline: 3px solid hsl(214 82% 51% / .4); }
\`\`\`

> \`:focus-visible\` ni o‘chirib qo‘ymang — klaviatura bilan ishlaydigan foydalanuvchi sahifada adashib qoladi.

## 7. Sinfdagi asosiy topshiriq

O‘tgan darsdagi **portfolio** sahifasini to‘liq bezang:

1. \`:root\` da kamida 6 ta o‘zgaruvchi (3 rang, 2 bo‘shliq, 1 radius);
2. flexbox’li header: chapda ism, o‘ngda navigatsiya;
3. loyihalar — kamida 3 ta \`.karta\`, flex bilan qatorga terilgan;
4. jadval bezatilsin: \`border-collapse\`, zebra qatorlar (\`tr:nth-child(even)\`);
5. forma maydonlari bir xil uslubda, \`:focus\` holati ko‘rinsin;
6. havolalar uchun \`:hover\` effekti.

## 8. Tekshirish ro‘yxati

- [ ] Inline \`style=""\` umuman ishlatilmagan
- [ ] Rang qiymatlari faqat \`var()\` orqali olinadi
- [ ] \`!important\` yo‘q
- [ ] Sinf nomlari mazmunli (\`.karta\`, \`.tugma\` — \`.div1\`, \`.red\` emas)
- [ ] Barcha interaktiv elementlarda \`:focus-visible\` bor

## 9. Tipik xatolar

- CSS fayl yo‘li noto‘g‘ri — \`<link href="style.css">\` bo‘lsa-yu, fayl \`css/\` papkada bo‘lsa;
- \`margin: 0 auto\` ishlamayapti — elementga \`width\` berilmagan;
- flex konteyner o‘rniga farzandga \`display: flex\` berib qo‘yish;
- brauzer keshlagani uchun o‘zgarish ko‘rinmaydi (\`Ctrl+Shift+R\`).`,
    assignments: `1. Portfolio sahifasi uchun ikkinchi mavzu (to‘q rejim) tayyorlang: faqat \`:root\` dagi o‘zgaruvchilarni almashtirish yo‘li bilan.
2. Faqat flexbox ishlatib "narx jadvali" (3 ta tarif kartasi, o‘rtadagisi kattaroq va ajratilgan) tuzing.
3. \`transition\` va \`transform\` yordamida kartaga sichqoncha kelganda yengil ko‘tarilish effektini qo‘shing.
4. O‘zingiz yoqtirgan saytning bosh sahifasini DevTools orqali tahlil qiling: qaysi shrift, qaysi asosiy rang va qanday bo‘shliq shkalasi ishlatilganini yozing.`,
    resources: `- MDN. *CSS Flexbox* — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout
- CSS-Tricks. *A Complete Guide to Flexbox* — https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- MDN. *Using CSS custom properties* — https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- web.dev. *Learn CSS: Box Model* — https://web.dev/learn/css/box-model
- Andy Bell, Heydon Pickering. *Every Layout* — https://every-layout.dev`,
  },

  // ─────────────────────────── 3-hafta ───────────────────────────
  {
    title: 'CSS va Bootstrap yordamida web sahifalarni bezash',
    week: 3,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'CSS layout modellari (flexbox, grid), responsive dizayn va media so‘rovlari, Bootstrap freymvorkining grid tizimi hamda tayyor komponentlari yordamida tezkor dizayn yaratish.',
    objectives: [
      'Flexbox va Grid orasidan masalaga mosini tanlash',
      'Media so‘rovlari va mobile-first yondashuvini qo‘llash',
      'Bootstrap grid tizimining 12 ustunli mantiqini tushuntirish',
      'Utility-first yondashuv bilan o‘z CSS ini yozish orasidagi murosani baholash',
    ].join('\n'),
    keywords:
      'flexbox, CSS Grid, media query, mobile-first, breakpoint, Bootstrap, container, row, col, komponent, utility klass',
    content: `## 1. Darsning maqsadi

Talaba sahifa tartibini (layout) qo‘lda ham, freymvork bilan ham qura olsin va **qachon freymvork olish kerak, qachon o‘z CSS ini yozish arzonroq** — shu qarorni asoslay olsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Layout modellari evolyutsiyasi

| Davr | Vosita | Muammosi |
|---|---|---|
| 1995 | \`<table>\` bilan tartiblash | semantika buziladi |
| 2000 | \`float\` + \`clearfix\` | "hiyla"larga tayanadi |
| 2012 | Flexbox | bir o‘lchov (qator **yoki** ustun) |
| 2017 | CSS Grid | ikki o‘lchov (qator **va** ustun) |

### 2.2. Flexbox va Grid: qaysi biri?

| Vaziyat | Tanlov |
|---|---|
| Header: logo chapda, menyu o‘ngda | Flexbox |
| Kartalar qatori, soni oldindan noma’lum | Flexbox (\`wrap\`) |
| Butun sahifa tartibi: header / sidebar / main / footer | Grid |
| Galereya — teng kataklar to‘ri | Grid |

\`\`\`css
.sahifa {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
}
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
\`\`\`

\`\`\`css
/* Eng ko‘p ishlatiladigan responsiv naqsh — media query’siz */
.galereya {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}
\`\`\`

### 2.3. Responsive dizayn va media so‘rovlari

**Mobile-first**: avval kichik ekran uchun yoziladi, keyin \`min-width\` bilan kengaytiriladi.

\`\`\`css
.kartalar { display: grid; gap: 1rem; }              /* mobil: 1 ustun */

@media (min-width: 768px) {
  .kartalar { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .kartalar { grid-template-columns: repeat(3, 1fr); }
}
\`\`\`

Responsiv dizaynning uch ustuni: **moslashuvchan to‘r**, **moslashuvchan media**, **media so‘rovlari** (Ethan Marcotte, 2010).

### 2.4. Bootstrap nima va nega kerak?

Bootstrap — tayyor CSS sinflari va komponentlari kutubxonasi (Twitter, 2011; hozirgi versiya 5.x, jQuery talab qilmaydi).

\`\`\`html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
\`\`\`

### 2.5. Grid tizimi: container → row → col

Sahifa eni har doim **12 ustunga** bo‘linadi.

\`\`\`html
<div class="container">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-4">1-karta</div>
    <div class="col-12 col-md-6 col-lg-4">2-karta</div>
    <div class="col-12 col-md-12 col-lg-4">3-karta</div>
  </div>
</div>
\`\`\`

| Breakpoint | Prefiks | Eng kichik eni |
|---|---|---|
| Extra small | (yo‘q) | < 576px |
| Small | \`sm\` | ≥ 576px |
| Medium | \`md\` | ≥ 768px |
| Large | \`lg\` | ≥ 992px |
| Extra large | \`xl\` | ≥ 1200px |

> \`col-md-6\` = "**md va undan katta** ekranlarda 12 dan 6 ustun (yarmi)". Prefikssiz sinf eng kichik ekrandan boshlab ishlaydi.

### 2.6. Utility sinflar

\`\`\`html
<div class="d-flex justify-content-between align-items-center p-3 mb-4 bg-white rounded shadow-sm">
\`\`\`

| Prefiks | Ma’nosi | Misol |
|---|---|---|
| \`m\`, \`p\` | margin, padding | \`mt-3\`, \`px-4\` |
| \`d-\` | display | \`d-none\`, \`d-flex\` |
| \`text-\` | matn | \`text-center\`, \`text-muted\` |
| \`bg-\` | fon | \`bg-primary\` |

### 2.7. Tayyor komponentlar

Navbar, Card, Modal, Alert, Dropdown, Accordion, Toast, Pagination — HTML tuzilmasi va sinflari hujjatdan nusxalanadi, JS xatti-harakati \`data-bs-*\` atributlari orqali ulanadi:

\`\`\`html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#oyna">Ochish</button>
\`\`\`

### 2.8. Freymvork: foyda va narx

| Foyda | Narx |
|---|---|
| Tez natija, responsivlik tekin | HTML sinflar bilan to‘lib ketadi |
| Brauzerlararo moslik sinalgan | Barcha saytlar bir xil ko‘rinadi |
| Komponentlarda accessibility bor | Ortiqcha CSS yuklanadi (~160 KB) |
| Jamoada yagona til | Freymvorkka bog‘lanib qolish |

**Xulosa:** ichki panel, admin-panel, prototip → Bootstrap. Brend dizayni muhim marketing sayti → o‘z CSS ingiz (yoki Bootstrap’ni SCSS orqali sozlash).

## 3. Amaliy qism (20 daqiqa)

Bitta kartalar to‘rini ikki marta quring: (a) toza CSS Grid bilan, (b) Bootstrap grid bilan. Qaysi biri qancha qator kod olganini va o‘zgartirish qanchalik oson ekanini taqqoslang.

## 4. Yakunlash (5 daqiqa)

- \`col-6 col-md-4\` telefonda va noutbukda necha ustun egallaydi?
- Grid va Flexbox farqini bir gapda ayting.`,
    assignments: `1. Bitta maketni ikki xil usulda amalga oshiring: toza CSS Grid va Bootstrap grid. Har birining kod hajmini va o‘zgartirish qulayligini solishtirib xulosa yozing.
2. \`grid-template-areas\` yordamida "holy grail" maketini (header, sidebar, main, aside, footer) quring va u mobil ekranda bir ustunga aylansin.
3. Bootstrap navbar, card va modal komponentlaridan foydalanib mahsulotlar katalogi sahifasini yasang.
4. Bootstrap’ning standart \`--bs-primary\` rangini o‘z brend rangingizga o‘zgartiring (CSS o‘zgaruvchisi orqali) va natijani ko‘rsating.`,
    resources: `- Bootstrap 5 rasmiy hujjati — https://getbootstrap.com/docs/5.3/
- Rachel Andrew. *The New CSS Layout*. A Book Apart, 2017
- CSS-Tricks. *A Complete Guide to Grid* — https://css-tricks.com/snippets/css/complete-guide-grid/
- Ethan Marcotte. *Responsive Web Design*. A Book Apart, 2011
- MDN. *CSS Grid Layout* — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout`,
  },
  {
    title: 'Bootstrap yordamida responsive dizayn',
    week: 3,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Bootstrap grid tizimi va tayyor komponentlardan foydalanib sahifani turli ekranlarda to‘g‘ri ko‘rinadigan qilish, navbar, karta, modal va formani amalda yig‘ish.',
    objectives: [
      'Bootstrap ni loyihaga CDN orqali ulash',
      'container/row/col yordamida responsiv maket qurish',
      'Navbar, card, modal, form komponentlarini sozlash',
      'DevTools device toolbar orqali 3 xil ekranda tekshirish',
    ].join('\n'),
    keywords: 'Bootstrap 5, CDN, grid, navbar, card, modal, form-control, responsive, device toolbar',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Bootstrap ulash, sinov | 20 daq |
| 2 | Grid bilan maket | 45 daq |
| 3 | Navbar va hero bo‘limi | 40 daq |
| 4 | Kartalar katalogi | 40 daq |
| 5 | Forma va modal | 30 daq |
| 6 | Responsiv tekshiruv | 25 daq |

## 2. Boshlang‘ich shablon

\`\`\`html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kitoblar do‘koni</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <!-- kontent -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
\`\`\`

> \`viewport\` metasi bo‘lmasa Bootstrap’ning responsivligi **umuman ishlamaydi**.

## 3. Navbar

\`\`\`html
<nav class="navbar navbar-expand-lg bg-white shadow-sm">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">Kitob.uz</a>
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#menyu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="menyu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#">Bosh sahifa</a></li>
        <li class="nav-item"><a class="nav-link" href="#katalog">Katalog</a></li>
        <li class="nav-item"><a class="nav-link" href="#aloqa">Aloqa</a></li>
      </ul>
    </div>
  </div>
</nav>
\`\`\`

\`data-bs-target="#menyu"\` va \`id="menyu"\` bir xil bo‘lishi shart — aks holda gamburger tugma ishlamaydi.

## 4. Kartalar katalogi

\`\`\`html
<section id="katalog" class="container py-5">
  <h2 class="mb-4">Yangi kitoblar</h2>
  <div class="row g-4">
    <div class="col-12 col-sm-6 col-lg-3">
      <div class="card h-100 shadow-sm">
        <img src="img/kitob1.jpg" class="card-img-top" alt="Kitob muqovasi">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">Clean Code</h5>
          <p class="card-text text-muted small">Robert C. Martin</p>
          <p class="fw-bold mt-auto">120 000 so‘m</p>
          <button class="btn btn-primary w-100">Savatga</button>
        </div>
      </div>
    </div>
    <!-- yana 7 ta karta -->
  </div>
</section>
\`\`\`

- \`h-100\` — bir qatordagi kartalar balandligi tenglashadi;
- \`mt-auto\` — narx va tugma kartaning pastiga "yopishadi";
- \`g-4\` — kataklar orasidagi bo‘shliq (gutter).

## 5. Forma va modal

\`\`\`html
<form class="row g-3 needs-validation" novalidate>
  <div class="col-md-6">
    <label for="ism" class="form-label">Ism</label>
    <input type="text" class="form-control" id="ism" required>
    <div class="invalid-feedback">Ismni kiriting.</div>
  </div>
  <div class="col-md-6">
    <label for="tel" class="form-label">Telefon</label>
    <input type="tel" class="form-control" id="tel" required>
  </div>
  <div class="col-12">
    <button class="btn btn-success" type="submit">Buyurtma berish</button>
  </div>
</form>

<div class="modal fade" id="oyna" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Buyurtma qabul qilindi</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Operator tez orada bog‘lanadi.</div>
    </div>
  </div>
</div>
\`\`\`

## 6. Sinfdagi asosiy topshiriq

**"Kitoblar do‘koni" bir sahifali sayti:**

1. responsiv navbar (mobilda gamburger menyu);
2. hero bo‘limi: sarlavha, matn, ikkita tugma;
3. kamida 8 ta kitob kartasi — \`col-12 col-sm-6 col-lg-3\`;
4. buyurtma formasi (validatsiya sinflari bilan);
5. "Savatga" tugmasi modal oynani ochsin;
6. footer — 3 ustunli, mobilda ustma-ust.

## 7. Responsiv tekshiruv

DevTools → \`Ctrl+Shift+M\` → quyidagilarda tekshiring:

| Qurilma | Eni | Kutilayotgan natija |
|---|---|---|
| iPhone SE | 375px | 1 ustun, gamburger menyu |
| iPad | 768px | 2 ustun, menyu ochiq |
| Laptop | 1440px | 4 ustun |

**Gorizontal aylantirish (scroll) paydo bo‘lmasligi shart.**

## 8. Tipik xatolar

- \`row\` ni \`container\` siz ishlatish → chetlarda ortiqcha bo‘shliq;
- \`col\` ni to‘g‘ridan-to‘g‘ri \`row\` bo‘lmagan elementga joylash;
- bitta qatorda ustunlar yig‘indisi 12 dan oshib ketishi (ular keyingi qatorga tushadi);
- bundle JS ni ulashni unutish → modal va menyu ochilmaydi;
- Bootstrap sinflarini o‘z CSS ingiz bilan bekor qilishga urinish (\`!important\` zanjiri boshlanadi).`,
    assignments: `1. Sahifaga Bootstrap Carousel qo‘shing (kamida 3 ta slayd) va uni mobilda tekshiring.
2. Katalogni \`btn-group\` filtri bilan to‘ldiring: "Hammasi / Dasturlash / Dizayn" tugmalari (hozircha faqat ko‘rinish).
3. Bir xil maketni Bootstrap’siz, faqat CSS Grid bilan qayta yozing va ikkala variantning CSS hajmini solishtiring.
4. Sahifangizni https://pagespeed.web.dev orqali tekshirib, mobil ball va asosiy tavsiyalarni yozing.`,
    resources: `- Bootstrap 5 — Layout / Grid — https://getbootstrap.com/docs/5.3/layout/grid/
- Bootstrap 5 — Components — https://getbootstrap.com/docs/5.3/components/
- Bootstrap 5 — Forms & Validation — https://getbootstrap.com/docs/5.3/forms/validation/
- MDN. *Responsive design* — https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- Bootstrap Examples (tayyor maketlar) — https://getbootstrap.com/docs/5.3/examples/`,
  },

  // ─────────────────────────── 4-hafta ───────────────────────────
  {
    title: 'JavaScript asoslari va DOM bilan ishlash',
    week: 4,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'JavaScript dasturlash tilining asoslari — o‘zgaruvchilar, ma’lumot turlari, funksiyalar, hodisalar va DOM (Document Object Model) bilan ishlash jarayonlari.',
    objectives: [
      'JavaScript ning brauzerdagi o‘rnini va bajarilish modelini izohlash',
      'var/let/const farqini va scope tushunchasini tushuntirish',
      'Funksiya e’lon qilishning uch shaklini qo‘llash',
      'DOM daraxti tuzilishini va element tanlash usullarini bilish',
      'Hodisa modelini (event bubbling, delegatsiya) izohlash',
    ].join('\n'),
    keywords:
      'JavaScript, ECMAScript, let, const, scope, funksiya, massiv, obyekt, DOM, event, bubbling, event delegation',
    content: `## 1. Darsning maqsadi

Talaba sahifani "jonlantiruvchi" kod qanday ishlashini tushunsin: skript qachon bajariladi, brauzer HTML ni qanday obyektga aylantiradi va hodisa qayerdan qayerga tarqaladi.

## 2. Nazariy qism (55 daqiqa)

### 2.1. JavaScript brauzerda qayerda turadi

\`\`\`html
<script src="js/app.js" defer></script>
\`\`\`

| Variant | Yuklanishi | Bajarilishi |
|---|---|---|
| oddiy \`<script>\` | HTML tahlili to‘xtaydi | darhol |
| \`async\` | parallel | yuklanishi bilan, tartib kafolatlanmaydi |
| \`defer\` | parallel | HTML tayyor bo‘lgach, tartib bilan ✅ |

JavaScript **bir oqimli** (single-threaded): kod navbat (event loop) orqali bajariladi. Uzoq davom etuvchi hisob interfeysni "muzlatadi".

### 2.2. O‘zgaruvchilar va turlar

\`\`\`js
const PI = 3.14;      // qayta tayinlab bo‘lmaydi
let hisob = 0;        // o‘zgaradi
// var — eski, ishlatilmaydi (function scope, hoisting muammolari)
\`\`\`

Primitiv turlar: \`number\`, \`string\`, \`boolean\`, \`null\`, \`undefined\`, \`symbol\`, \`bigint\`.
Murakkab: \`object\` (massiv, funksiya ham obyekt).

\`\`\`js
console.log(typeof 42);        // "number"
console.log(0.1 + 0.2);        // 0.30000000000000004 (IEEE 754)
console.log("5" == 5);         // true  — tur keltiriladi
console.log("5" === 5);        // false — qat’iy taqqoslash ✅
\`\`\`

> **Qoida:** har doim \`===\` ishlating.

### 2.3. Funksiyalar

\`\`\`js
function salom(ism) { return \`Salom, \${ism}!\`; }        // deklaratsiya
const salom2 = function (ism) { return "Salom, " + ism; }; // ifoda
const salom3 = (ism) => \`Salom, \${ism}!\`;               // strelka
\`\`\`

Strelka funksiya o‘zining \`this\` iga ega emas — uni tashqi kontekstdan oladi. Shuning uchun callback’larda qulay.

### 2.4. Massiv va obyekt bilan ishlash

\`\`\`js
const talabalar = [
  { ism: "Ali",   ball: 87 },
  { ism: "Zilola", ball: 94 },
  { ism: "Bobur", ball: 61 },
];

const alochilar = talabalar.filter(t => t.ball >= 85);
const ismlar    = talabalar.map(t => t.ism);
const jami      = talabalar.reduce((s, t) => s + t.ball, 0);
const ortacha   = jami / talabalar.length;
\`\`\`

\`map\`, \`filter\`, \`reduce\`, \`find\`, \`some\`, \`every\` — REST API dan kelgan JSON massivini qayta ishlashda doimiy ishlatiladi.

### 2.5. DOM nima?

Brauzer HTML matnini o‘qib, undan **obyektlar daraxtini** quradi:

\`\`\`
document
└── html
    ├── head → title, meta
    └── body
        ├── header → h1, nav
        └── main   → section → article
\`\`\`

DOM — HTML ning o‘zi emas, uning **xotiradagi jonli modeli**. JS orqali daraxt o‘zgartirilsa, ekran darhol yangilanadi.

### 2.6. Element tanlash va o‘zgartirish

\`\`\`js
const sarlavha = document.querySelector("h1");
const kartalar = document.querySelectorAll(".karta");

sarlavha.textContent = "Yangi sarlavha";   // xavfsiz
sarlavha.classList.add("faol");
sarlavha.style.color = "crimson";

const yangi = document.createElement("li");
yangi.textContent = "Yangi element";
document.querySelector("ul").append(yangi);
\`\`\`

> \`innerHTML\` ga foydalanuvchi matnini qo‘yish — **XSS xavfi**. Matn uchun \`textContent\` ishlating (11–12-ma’ruzada batafsil).

### 2.7. Hodisalar

\`\`\`js
document.querySelector("#tugma").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("bosildi", e.target);
});
\`\`\`

Hodisa uch fazada tarqaladi: **capturing → target → bubbling**. Bubbling tufayli **delegatsiya** ishlaydi:

\`\`\`js
document.querySelector("#royxat").addEventListener("click", (e) => {
  const tugma = e.target.closest(".ochir");
  if (!tugma) return;
  tugma.closest("li").remove();
});
\`\`\`

Bitta tinglovchi — yuzlab elementga xizmat qiladi va keyin qo‘shilgan elementlar ham ishlaydi.

## 3. Amaliy qism (20 daqiqa)

Konsolda (\`F12\` → Console) bajaring: sahifadagi barcha havolalarni toping, ularning sonini chiqaring va har biriga \`target="_blank"\` qo‘shing.

## 4. Yakunlash (5 daqiqa)

- \`==\` va \`===\` farqi?
- Event delegation nima uchun kerak?
- Keyingi darsga: \`defer\`, \`querySelector\`, \`addEventListener\` ni takrorlash.`,
    assignments: `1. \`let\`, \`const\` va \`var\` ning scope farqini ko‘rsatuvchi 3 ta qisqa misol yozing va natijani izohlang.
2. 10 ta talabadan iborat massiv tuzing; \`filter\`, \`map\`, \`reduce\` yordamida a’lochilar ro‘yxatini, ismlar massivini va o‘rtacha ballni hisoblang.
3. Event bubbling ni ko‘rsatuvchi ichma-ich 3 ta blok yasang: har biriga tinglovchi qo‘yib, bosilganda konsolga qaysi tartibda chiqishini yozib oling.
4. \`innerHTML\` va \`textContent\` farqini XSS misolida tushuntiruvchi qisqa hisobot yozing.`,
    resources: `- David Flanagan. *JavaScript: The Definitive Guide*. 7-nashr, O’Reilly, 2020 — 1–8, 15-boblar
- Marijn Haverbeke. *Eloquent JavaScript*. 4-nashr — https://eloquentjavascript.net (13–15-boblar)
- MDN. *JavaScript Guide* — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- MDN. *Introduction to the DOM* — https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
- javascript.info — https://javascript.info (2, 6, 8-bo‘limlar)`,
  },
  {
    title: 'JavaScript asoslari (amaliy)',
    week: 4,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'O‘zgaruvchilar, shart operatorlari, sikllar va funksiyalarni amalda qo‘llash, massivlar bilan ishlash va konsolda hataliklarni tuzatish.',
    objectives: [
      'Shart va sikl konstruksiyalarini masalaga qarab tanlash',
      'Qayta ishlatiladigan funksiyalar yozish',
      'Massiv metodlarini (map/filter/reduce/sort) qo‘llash',
      'DevTools Console va debugger orqali xatoni topish',
    ].join('\n'),
    keywords: 'if, switch, for, while, for...of, funksiya, massiv metodlari, console, debugger, breakpoint',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Muhit, konsol, birinchi skript | 20 daq |
| 2 | Shartlar va sikllar | 45 daq |
| 3 | Funksiyalar | 45 daq |
| 4 | Massivlar | 45 daq |
| 5 | Debugging | 25 daq |
| 6 | Topshirish | 20 daq |

## 2. Ishga tayyorgarlik

\`\`\`html
<script src="js/app.js" defer></script>
\`\`\`

\`\`\`js
"use strict";
console.log("Skript ulandi");
\`\`\`

Konsol imkoniyatlari: \`console.log\`, \`console.table(massiv)\`, \`console.time/timeEnd\`, \`console.error\`.

## 3. Shartlar

\`\`\`js
function bahoniAniqla(ball) {
  if (ball < 0 || ball > 100) return "Xato ball";
  if (ball >= 90) return "A’lo";
  if (ball >= 70) return "Yaxshi";
  if (ball >= 60) return "Qoniqarli";
  return "Qoniqarsiz";
}
\`\`\`

\`switch\` — qiymatlar aniq ro‘yxat bo‘lganda:

\`\`\`js
switch (kun) {
  case 6:
  case 7:  natija = "Dam olish"; break;
  default: natija = "Ish kuni";
}
\`\`\`

> \`break\` unutilsa — keyingi \`case\` ham bajariladi (fall-through).

## 4. Sikllar

\`\`\`js
for (let i = 1; i <= 5; i++) console.log(i);

const ranglar = ["qizil", "yashil", "ko‘k"];
for (const rang of ranglar) console.log(rang);          // qiymat bo‘yicha

const user = { ism: "Ali", yosh: 20 };
for (const [kalit, qiymat] of Object.entries(user)) {
  console.log(kalit, "=", qiymat);
}

let n = 5;
while (n > 0) { console.log(n); n--; }
\`\`\`

| Vazifa | Tanlov |
|---|---|
| Takror soni ma’lum | \`for\` |
| Massiv elementlari | \`for...of\` yoki \`forEach\` |
| Obyekt kalitlari | \`Object.entries\` + \`for...of\` |
| Shartga bog‘liq | \`while\` |

## 5. Funksiyalar

\`\`\`js
function narxHisobla(summa, chegirma = 0) {
  return summa - (summa * chegirma) / 100;
}
console.log(narxHisobla(100000, 15));   // 85000

const soliqBilan = (summa, foiz = 12) => summa * (1 + foiz / 100);
\`\`\`

**Yaxshi funksiya belgilari:** bitta vazifa, mazmunli nom (fe’l bilan), 20 qatordan oshmaydi, global o‘zgaruvchiga tegmaydi.

## 6. Massivlar bilan ishlash

\`\`\`js
const mahsulotlar = [
  { nom: "Klaviatura", narx: 250000, soni: 4 },
  { nom: "Sichqoncha", narx: 120000, soni: 10 },
  { nom: "Monitor",    narx: 1900000, soni: 2 },
];

const arzonlar = mahsulotlar.filter(m => m.narx < 300000);
const nomlar   = mahsulotlar.map(m => m.nom);
const jamiPul  = mahsulotlar.reduce((s, m) => s + m.narx * m.soni, 0);
const qimmat   = [...mahsulotlar].sort((a, b) => b.narx - a.narx)[0];

console.table(mahsulotlar);
console.log("Jami:", jamiPul.toLocaleString("uz-UZ"), "so‘m");
\`\`\`

> \`sort\` massivni **joyida o‘zgartiradi** — shuning uchun \`[...massiv]\` bilan nusxa olinadi.

## 7. Sinfdagi topshiriqlar

1. **Kalkulyator funksiyasi** — ikki son va amal belgisini olib natija qaytaradi (nolga bo‘lish tekshiriladi).
2. **Tub sonlar** — 2 dan n gacha tub sonlarni massivga yig‘ib qaytaruvchi funksiya.
3. **Matn tahlili** — berilgan matndagi so‘zlar soni, eng uzun so‘z va harflar chastotasi.
4. **Baholar statistikasi** — 15 ta ball massivi bo‘yicha o‘rtacha, maksimal, minimal va baho taqsimoti.
5. **Savat** — mahsulotlar massivi bo‘yicha umumiy summa va 3 dan ortiq sotib olinganlarga 10% chegirma.

## 8. Debugging

1. \`debugger;\` qatorini qo‘ying yoki DevTools → Sources → qator raqamiga bosing (breakpoint).
2. \`F10\` — keyingi qator, \`F11\` — funksiya ichiga, \`F8\` — davom etish.
3. Scope panelida o‘zgaruvchilar qiymatini kuzating.

| Xato | Sababi |
|---|---|
| \`x is not defined\` | o‘zgaruvchi e’lon qilinmagan yoki nom xato |
| \`Cannot read properties of null\` | \`querySelector\` element topmagan (skript \`defer\` siz) |
| \`x is not a function\` | metod nomi xato yoki obyekt turi boshqa |
| \`NaN\` | matn ustida arifmetik amal |`,
    assignments: `1. 20 ta tasodifiy sondan iborat massiv yarating va uning o‘rtachasi, medianasi hamda standart chetlanishini hisoblovchi funksiyalar yozing.
2. Foydalanuvchi kiritgan matnni "palindrom yoki yo‘q" deb tekshiruvchi funksiya yozing (bo‘sh joy va registrni hisobga olmasdan).
3. \`map\`/\`filter\`/\`reduce\` ni ishlatmasdan, faqat \`for\` bilan xuddi shu natijani beruvchi kod yozing va ikkalasini o‘qilishi bo‘yicha taqqoslang.
4. Tarkibida ataylab 3 ta xato bor kod yozing, uni debugger bilan tuzating va jarayonni bosqichma-bosqich hisobot qilib yozing.`,
    resources: `- Marijn Haverbeke. *Eloquent JavaScript*. 4-nashr — 1–5-boblar
- MDN. *JavaScript first steps* — https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps
- javascript.info — 2-bo‘lim (asoslar), 5-bo‘lim (massivlar)
- Chrome DevTools. *Debug JavaScript* — https://developer.chrome.com/docs/devtools/javascript/
- Kyle Simpson. *You Don’t Know JS Yet*. 2-nashr — https://github.com/getify/You-Dont-Know-JS`,
  },

  // ─────────────────────────── 5-hafta ───────────────────────────
  {
    title: 'Dasturiy arxitektura dizaynlari: monolit, mijoz-server va mikroservislar',
    week: 5,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Dasturiy tizimlarda keng qo‘llaniladigan arxitektura naqshlari — monolit, mijoz-server va mikroservislar taqqoslanadi, ularning afzallik va kamchiliklari muhokama qilinadi.',
    objectives: [
      'Uch arxitektura naqshini tuzilishi, deploy va miqyoslash jihatidan qiyoslash',
      'Qatlamli (layered) monolit va modulli monolit farqini izohlash',
      'Mikroservislarga o‘tish shartlarini va narxini baholash',
      'Berilgan loyiha uchun arxitektura tanlab, qarorni asoslash',
    ].join('\n'),
    keywords:
      'monolit, modulli monolit, qatlamli arxitektura, mijoz-server, mikroservis, bounded context, API Gateway, Conway qonuni, strangler fig',
    content: `## 1. Darsning maqsadi

Talaba "mikroservis — zamonaviy, monolit — eskirgan" degan soddalashtirilgan qarashdan voz kechib, har bir naqshning **narxi va foydasi** bor ekanini tushunsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Monolit

Butun ilova **bitta deploy birligi** sifatida yig‘iladi va ishga tushiriladi.

\`\`\`
┌──────────────── app.jar / app.js ───────────────┐
│  UI  │  Buyurtma  │  To‘lov  │  Ombor  │  Xabar │
└───────────────────── bitta DB ──────────────────┘
\`\`\`

Odatda **qatlamli** bo‘ladi:

| Qatlam | Vazifasi |
|---|---|
| Presentation | HTTP so‘rov/javob, validatsiya |
| Business / Service | biznes qoidalari |
| Data Access | bazaga so‘rovlar (repository) |
| Database | saqlash |

**Kuchli tomoni:** sodda deploy, tranzaksiya bitta bazada, debugging oson, refaktoring arzon, xost xarajati kam.
**Zaif tomoni:** kod o‘sib ketsa modullar bir-biriga chirmashadi ("big ball of mud"), kichik o‘zgarish uchun ham butun ilova qayta deploy qilinadi, bitta modul xotirani "yeb" qo‘ysa hamma to‘xtaydi.

> **Modulli monolit** — oltin o‘rta yo‘l: bitta deploy birligi, lekin ichida qat’iy chegaralangan modullar. Ko‘pchilik loyiha aynan shu yerda to‘xtashi kerak.

### 2.2. Mijoz-server

Tizim ikki mustaqil qismga ajraladi: **mijoz** (brauzer/SPA/mobil) va **server** (API + baza). Aloqa HTTP orqali.

| Ko‘rinishi | Xususiyati |
|---|---|
| 2 qatlamli | mijoz to‘g‘ridan-to‘g‘ri bazaga (eski, xavfli) |
| 3 qatlamli | mijoz → ilova serveri → baza ✅ |
| N qatlamli | + kesh, kutish navbati, qidiruv xizmati |

Bu — hozirgi web-ilovalarning asosiy modeli. Frontend va backend alohida jamoada, alohida repozitoriyda rivojlanadi; ular orasidagi **shartnoma — API**.

### 2.3. Mikroservislar

Tizim biznes imkoniyatlari bo‘yicha mayda, mustaqil deploy qilinadigan xizmatlarga bo‘linadi. Har birining **o‘z ma’lumotlar bazasi** bor.

\`\`\`
        ┌───────── API Gateway ─────────┐
        │            │           │      │
   Buyurtma      To‘lov       Ombor   Xabar
      DB           DB           DB      DB
\`\`\`

**Asosiy tamoyillar:**
1. Bitta xizmat — bitta bounded context (DDD).
2. Ma’lumotlar bazasi umumiy bo‘lmaydi (database per service).
3. Aloqa faqat API yoki xabar navbati orqali.
4. Har bir xizmat mustaqil deploy va mustaqil miqyoslanadi.

**Narxi:** taqsimlangan tranzaksiya (saga), tarmoq nosozliklari, monitoring/tracing, versiyalash, DevOps madaniyati, kamida 2–3 barobar ko‘p infratuzilma ishi.

### 2.4. Uchalasining qiyosi

| Mezon | Monolit | Mijoz-server | Mikroservis |
|---|---|---|---|
| Deploy birligi | 1 | 2 | N |
| Ma’lumotlar bazasi | 1 | 1 | har xizmatga 1 |
| Jamoa hajmi | 1–8 | 5–20 | 20+ |
| Boshlang‘ich tezlik | Yuqori | Yuqori | Past |
| Uzoq muddatli moslashuvchanlik | Past | O‘rtacha | Yuqori |
| Xato izolyatsiyasi | Yo‘q | Qisman | Yaxshi |
| Kuzatuvchanlik | Oson | Oson | Murakkab (tracing kerak) |

### 2.5. Conway qonuni

> *"Tizim arxitekturasi uni yaratgan tashkilot tuzilmasini takrorlaydi."*

Agar jamoa bitta bo‘lsa, mikroservis qurish sun’iy bo‘lib chiqadi. Arxitektura tanlash — texnik emas, **tashkiliy** qaror ham.

### 2.6. Migratsiya: Strangler Fig naqshi

Monolitdan mikroservisga o‘tish "hammasini qaytadan yozish" emas:

1. Monolit oldiga proksi (gateway) qo‘yiladi.
2. Bitta modul alohida xizmat sifatida yoziladi.
3. Proksi shu yo‘nalishdagi so‘rovlarni yangi xizmatga o‘tkazadi.
4. Eski kod o‘chiriladi. 2-bosqichga qaytiladi.

## 3. Amaliy qism (20 daqiqa) — arxitektura muhokamasi

Kazus: universitet uchun onlayn imtihon tizimi. Semestrda 2 marta 20 000 talaba bir vaqtda kiradi, qolgan vaqt yuk deyarli nol.

Guruhlarda javob bering:
1. Qaysi arxitekturani tanlaysiz va nega?
2. Qaysi qism alohida miqyoslanishi kerak?
3. Yuk cho‘qqisiga qanday tayyorlanasiz?

## 4. Yakunlash (5 daqiqa)

- Mikroservisga o‘tishning eng ko‘p uchraydigan xatosi nima? (*Javob: erta o‘tish — "distributed monolith" hosil bo‘ladi.*)
- Modulli monolit nima uchun ko‘pchilikka yetarli?`,
    assignments: `1. Tanlagan real tizim (Uzum, Click, Telegram) uchun mikroservis bo‘linishini taklif qiling: kamida 6 ta xizmat, har birining javobgarligi va bazasi.
2. Monolitdan mikroservisga o‘tish rejasini Strangler Fig naqshi asosida 5 bosqichda yozing.
3. "Database per service" tamoyili buzilsa qanday muammolar chiqishini 1 betlik tahlilda yozing.
4. Conway qonuniga misol topib (ochiq manbalardan), uni o‘z so‘zlaringiz bilan izohlang.`,
    resources: `- Sam Newman. *Building Microservices*. 2-nashr, O’Reilly, 2021 — 1–4-boblar
- Chris Richardson. *Microservices Patterns*. Manning, 2018 — https://microservices.io/patterns/
- Martin Fowler. *Monolith First* / *MicroservicePremium* — https://martinfowler.com/bliki/MonolithFirst.html
- Mark Richards, Neal Ford. *Fundamentals of Software Architecture*. O’Reilly, 2020 — 9–17-boblar (arxitektura uslublari)
- Eric Evans. *Domain-Driven Design*. Addison-Wesley, 2003 — bounded context`,
  },
  {
    title: 'DOM bilan ishlash',
    week: 5,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'JavaScript orqali HTML elementlarini tanlash, o‘zgartirish va hodisalarga bog‘lash; dinamik ro‘yxat, forma validatsiyasi va localStorage bilan ishlash.',
    objectives: [
      'querySelector oilasidagi metodlar bilan element tanlash',
      'Elementni yaratish, qo‘shish, o‘chirish va sinfini boshqarish',
      'Hodisa tinglovchilarini va delegatsiyani qo‘llash',
      'Forma ma’lumotini JS orqali tekshirish',
      'localStorage’da holatni saqlash',
    ].join('\n'),
    keywords:
      'querySelector, createElement, append, remove, classList, addEventListener, event delegation, dataset, localStorage, FormData',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Element tanlash va o‘zgartirish | 40 daq |
| 2 | Element yaratish/o‘chirish | 40 daq |
| 3 | Hodisalar va delegatsiya | 45 daq |
| 4 | Loyiha: To-do ilovasi | 50 daq |
| 5 | localStorage va topshirish | 25 daq |

## 2. Element tanlash

\`\`\`js
document.querySelector("#royxat");        // birinchi moslik
document.querySelectorAll(".karta");      // NodeList (forEach bor)
document.getElementById("royxat");        // tezroq, faqat id

const karta = tugma.closest(".karta");    // yuqoriga qarab qidiradi
const sarlavha = karta.querySelector("h3"); // ichidan qidiradi
\`\`\`

> \`querySelectorAll\` **jonli emas** — keyin qo‘shilgan elementlar unga tushmaydi.

## 3. Element o‘zgartirish

\`\`\`js
el.textContent = "Matn";                 // xavfsiz ✅
el.innerHTML = "<b>Qalin</b>";           // faqat ishonchli manba uchun ⚠️

el.classList.add("faol");
el.classList.remove("yashirin");
el.classList.toggle("ochiq");
el.classList.contains("faol");           // true/false

el.setAttribute("aria-expanded", "true");
el.dataset.id = 42;                      // data-id="42"
\`\`\`

## 4. Yaratish, qo‘shish, o‘chirish

\`\`\`js
function vazifaYarat(matn, id) {
  const li = document.createElement("li");
  li.className = "vazifa";
  li.dataset.id = id;

  const span = document.createElement("span");
  span.textContent = matn;               // XSS dan himoya

  const ochir = document.createElement("button");
  ochir.className = "ochir";
  ochir.textContent = "✕";

  li.append(span, ochir);
  return li;
}

royxat.append(vazifaYarat("Uy vazifasi", 1));
\`\`\`

Ko‘p element qo‘shilganda **DocumentFragment** ishlating — DOM bir marta yangilanadi:

\`\`\`js
const frag = document.createDocumentFragment();
malumotlar.forEach(m => frag.append(vazifaYarat(m.matn, m.id)));
royxat.append(frag);
\`\`\`

## 5. Hodisalar va delegatsiya

\`\`\`js
royxat.addEventListener("click", (e) => {
  if (e.target.classList.contains("ochir")) {
    e.target.closest("li").remove();
    saqla();
  }
});
\`\`\`

Klaviatura hodisasi:

\`\`\`js
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") qoshish();
  if (e.key === "Escape") input.value = "";
});
\`\`\`

## 6. Forma bilan ishlash

\`\`\`js
forma.addEventListener("submit", (e) => {
  e.preventDefault();                       // sahifa qayta yuklanmasin

  const data = Object.fromEntries(new FormData(forma));
  const xatolar = [];

  if (!data.ism.trim()) xatolar.push("Ism bo‘sh bo‘lmasin");
  if (!/^\\S+@\\S+\\.\\S+$/.test(data.email)) xatolar.push("Email noto‘g‘ri");

  if (xatolar.length) {
    xabar.textContent = xatolar.join("; ");
    xabar.className = "xato";
    return;
  }
  qoshish(data);
  forma.reset();
});
\`\`\`

## 7. Sinfdagi asosiy loyiha — "Vazifalar ro‘yxati"

Talablar:

1. Input + "Qo‘shish" tugmasi; bo‘sh matn qo‘shilmaydi.
2. Har bir vazifa yonida ✓ (bajarildi) va ✕ (o‘chirish) tugmalari.
3. ✓ bosilsa matn chizilib qoladi (\`text-decoration: line-through\`).
4. Filtr: "Hammasi / Bajarilgan / Bajarilmagan".
5. Pastda hisoblagich: "Bajarilmagan: 3 ta".
6. Ro‘yxat \`localStorage\` da saqlanadi va sahifa yangilanganda tiklanadi.
7. Barcha tugmalar **bitta** delegatsiyalangan tinglovchi bilan ishlansin.

\`\`\`js
const KALIT = "vazifalar";

function saqla(vazifalar) {
  localStorage.setItem(KALIT, JSON.stringify(vazifalar));
}
function yukla() {
  try {
    return JSON.parse(localStorage.getItem(KALIT)) ?? [];
  } catch {
    return [];
  }
}
\`\`\`

> \`localStorage\` faqat **matn** saqlaydi — shuning uchun \`JSON.stringify/parse\`. Buzilgan ma’lumotdan himoya uchun \`try/catch\` shart.

## 8. Tekshirish ro‘yxati

- [ ] \`innerHTML\` ga foydalanuvchi matni qo‘yilmagan
- [ ] \`submit\` da \`preventDefault()\` bor
- [ ] Skript \`defer\` bilan ulangan
- [ ] Tinglovchilar sikl ichida takror qo‘shilmayapti
- [ ] Sahifa yangilangach ma’lumot saqlanib qoladi

## 9. Tipik xatolar

| Xato | Sabab |
|---|---|
| \`Cannot read properties of null\` | element hali yaratilmagan — \`defer\` yo‘q |
| Tugma bir marta bosilgandan keyin ishlamaydi | element qayta yaratilgan, tinglovchi yo‘qolgan → delegatsiya |
| Forma sahifani qayta yuklaydi | \`preventDefault()\` unutilgan |
| \`localStorage\` dan \`[object Object]\` chiqadi | \`JSON.stringify\` qilinmagan |`,
    assignments: `1. To-do ilovasiga tahrirlash imkoniyatini qo‘shing: vazifa matniga ikki marta bosilganda u inputga aylansin.
2. Vazifalarni sudrab (drag & drop) tartibini o‘zgartirish funksiyasini qo‘shing.
3. Sahifada "to‘q/och rejim" tugmasi yasang — tanlov \`localStorage\` da saqlansin.
4. 1000 ta elementni (a) har birini alohida \`append\` qilib, (b) \`DocumentFragment\` bilan qo‘shing; \`console.time\` orqali vaqtni o‘lchab, farqni izohlang.`,
    resources: `- MDN. *Manipulating documents* — https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents
- MDN. *Introduction to events* — https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events
- javascript.info — *Document* va *Events* bo‘limlari — https://javascript.info/document
- MDN. *Web Storage API* — https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- David Flanagan. *JavaScript: The Definitive Guide*. 7-nashr — 15-bob`,
  },

  // ─────────────────────────── 6-hafta ───────────────────────────
  {
    title: 'RESTful API va Web Services arxitekturasi',
    week: 6,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'REST va SOAP xizmatlari, JSON va XML formatlari, Web API’larning ishlash prinsiplari hamda ular yordamida tizimlararo integratsiya.',
    objectives: [
      'REST ning 6 ta arxitektura cheklovini sanab, izohlash',
      'Resurs, URI, HTTP metod va status kodlarini to‘g‘ri loyihalash',
      'JSON va XML formatlarini qiyoslash',
      'REST va SOAP orasidan masalaga mosini tanlash',
      'API versiyalash, paginatsiya va xatoliklarni qaytarish qoidalarini qo‘llash',
    ].join('\n'),
    keywords:
      'REST, Fielding, resurs, URI, HTTP metod, idempotentlik, status kod, JSON, XML, SOAP, OpenAPI, paginatsiya, versiyalash, HATEOAS',
    content: `## 1. Darsning maqsadi

Talaba "REST API" iborasini to‘g‘ri ishlatsin: nafaqat JSON qaytaruvchi endpoint yozsin, balki resurslarni to‘g‘ri nomlab, mos metod va status kod tanlay olsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Web Service nima?

Tarmoq orqali, mashina-mashina aloqasi uchun mo‘ljallangan interfeys. Asosiy uslublari: **SOAP**, **REST**, **GraphQL**, **gRPC**.

### 2.2. REST ning kelib chiqishi

REST (Representational State Transfer) — Roy Fielding ning 2000-yildagi dissertatsiyasida ta’riflangan **arxitektura uslubi** (protokol emas).

**Olti cheklov:**

| Cheklov | Mazmuni |
|---|---|
| Client–Server | mas’uliyat ajratilgan |
| Stateless | server so‘rovlar orasida sessiya holatini saqlamaydi |
| Cacheable | javob keshlanishi mumkinligi belgilanadi |
| Uniform Interface | yagona, bir xil interfeys (resurs, metod, media-tur) |
| Layered System | oradagi proksi/gateway mijozga bilinmaydi |
| Code on Demand | ixtiyoriy (masalan, JS uzatish) |

> **Stateless** eng muhim: shuning uchun har so‘rovda token yuboriladi va shuning uchun serverlarni gorizontal ko‘paytirish oson.

### 2.3. Resurs va URI loyihalash

| Yomon | Yaxshi |
|---|---|
| \`/getAllUsers\` | \`GET /users\` |
| \`/createUser\` | \`POST /users\` |
| \`/user/delete/5\` | \`DELETE /users/5\` |
| \`/getUserOrders?id=5\` | \`GET /users/5/orders\` |

**Qoidalar:** ot ishlating (fe’l emas), ko‘plik shaklda, kichik harf, so‘zlar orasiga defis, ierarxiya 2 darajadan oshmasin.

### 2.4. HTTP metodlari

| Metod | Vazifasi | Xavfsiz | Idempotent |
|---|---|---|---|
| GET | o‘qish | ha | ha |
| POST | yaratish | yo‘q | yo‘q |
| PUT | to‘liq almashtirish | yo‘q | ha |
| PATCH | qisman yangilash | yo‘q | yo‘q |
| DELETE | o‘chirish | yo‘q | ha |

**Idempotent** — bir xil so‘rovni 10 marta yuborsangiz ham natija bitta marta yuborgandek bo‘ladi. Tarmoq uzilganda qayta urinish uchun muhim.

### 2.5. Status kodlar

| Kod | Ma’nosi | Qachon |
|---|---|---|
| 200 OK | muvaffaqiyat | GET, PUT, PATCH |
| 201 Created | yaratildi | POST (+ \`Location\` sarlavhasi) |
| 204 No Content | tana yo‘q | DELETE |
| 400 Bad Request | so‘rov noto‘g‘ri | validatsiya xatosi |
| 401 Unauthorized | kim ekaningiz noma’lum | token yo‘q/eskirgan |
| 403 Forbidden | kim ekaningiz ma’lum, ruxsat yo‘q | rol yetarli emas |
| 404 Not Found | resurs yo‘q | noto‘g‘ri id |
| 409 Conflict | ziddiyat | takroriy email |
| 422 Unprocessable | mazmuni noto‘g‘ri | biznes qoida buzilgan |
| 429 Too Many Requests | limit | rate limiting |
| 500 Internal Server Error | server xatosi | kutilmagan holat |

> **Eng keng tarqalgan xato:** har doim \`200 OK\` qaytarib, tanada \`{"error": "..."}\` yozish. Bu mijozning xatoni aniqlashiga to‘sqinlik qiladi.

### 2.6. JSON va XML

\`\`\`json
{ "id": 7, "nom": "Klaviatura", "narx": 250000, "mavjud": true }
\`\`\`

\`\`\`xml
<mahsulot><id>7</id><nom>Klaviatura</nom><narx>250000</narx></mahsulot>
\`\`\`

| Mezon | JSON | XML |
|---|---|---|
| Hajm | ixcham | katta |
| O‘qilishi | oson | og‘ir |
| Sxema | JSON Schema | XSD (kuchli) |
| Izohlar | yo‘q | bor |
| Web API da | standart ✅ | eski tizimlarda |

### 2.7. REST va SOAP

| Mezon | REST | SOAP |
|---|---|---|
| Uslub/protokol | uslub | qat’iy protokol |
| Format | JSON, XML, matn | faqat XML (Envelope) |
| Shartnoma | OpenAPI (ixtiyoriy) | WSDL (majburiy) |
| Tranzaksiya | yo‘q | WS-AtomicTransaction |
| Xavfsizlik | HTTPS + JWT/OAuth | WS-Security |
| Qayerda | web, mobil | bank, davlat tizimlari |

### 2.8. Amaliy API dizayni

\`\`\`http
GET /api/v1/products?category=tech&sort=-price&page=2&limit=20
\`\`\`

\`\`\`json
{
  "data": [ { "id": 7, "nom": "Klaviatura" } ],
  "meta": { "page": 2, "limit": 20, "total": 137 }
}
\`\`\`

Xatolik javobi bir xil ko‘rinishda bo‘lsin:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email noto‘g‘ri formatda",
    "fields": { "email": "Format xato" }
  }
}
\`\`\`

**Versiyalash:** \`/api/v1/...\` yoki \`Accept: application/vnd.company.v1+json\`. Buzuvchi o‘zgarish — yangi versiya.

**Hujjatlashtirish:** OpenAPI (Swagger) spetsifikatsiyasi — API ning mashina o‘qiy oladigan shartnomasi; undan hujjat, mijoz kodi va testlar generatsiya qilinadi.

## 3. Amaliy qism (20 daqiqa)

Kutubxona tizimi uchun REST API loyihalang: resurslar (\`books\`, \`authors\`, \`loans\`), har biri uchun metod, URI, so‘rov tanasi, javob va status kod jadvalini tuzing. Kamida 10 ta endpoint.

## 4. Yakunlash (5 daqiqa)

- \`PUT\` va \`PATCH\` farqi?
- 401 va 403 farqi?
- Nega REST stateless bo‘lishi kerak?`,
    assignments: `1. Onlayn do‘kon uchun to‘liq REST API shartnomasini yozing (kamida 15 ta endpoint) — jadval ko‘rinishida: metod, URI, parametrlar, javob, status kodlar.
2. Shu API ni OpenAPI 3 formatida (\`openapi.yaml\`) tasvirlang va https://editor.swagger.io da tekshiring.
3. Bitta resursni JSON va XML ko‘rinishida yozing, hajmini bayt bilan taqqoslang va xulosa qiling.
4. Ochiq API (masalan, https://api.github.com) so‘rovlarini yuborib, qaytgan status kodlar va sarlavhalarni (\`ETag\`, \`Cache-Control\`, \`X-RateLimit-*\`) tahlil qiling.`,
    resources: `- Roy T. Fielding. *Architectural Styles and the Design of Network-based Software Architectures*. PhD diss., 2000 — 5-bob
- Leonard Richardson, Mike Amundsen. *RESTful Web APIs*. O’Reilly, 2013
- Mark Masse. *REST API Design Rulebook*. O’Reilly, 2011
- OpenAPI Specification — https://spec.openapis.org/oas/latest.html
- MDN. *HTTP request methods / Response status codes* — https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods`,
  },
  {
    title: 'REST API’dan foydalanish',
    week: 6,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Tashqi REST API’dan ma’lumot olib, uni sahifada ko‘rsatish; fetch, async/await, xatolarni boshqarish va Postman bilan API ni sinash.',
    objectives: [
      'Postman/Thunder Client orqali API ni sinash',
      'fetch va async/await bilan so‘rov yuborish',
      'JSON javobni DOM ga chiqarish',
      'Yuklanish va xatolik holatlarini foydalanuvchiga ko‘rsatish',
      'Qidiruv va paginatsiyani API parametrlari orqali amalga oshirish',
    ].join('\n'),
    keywords: 'fetch, Promise, async/await, JSON, Postman, query parametr, loading, error handling, AbortController',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Postman bilan API ni o‘rganish | 40 daq |
| 2 | fetch asoslari | 40 daq |
| 3 | Ma’lumotni sahifaga chiqarish | 45 daq |
| 4 | Holatlar: loading / error / empty | 30 daq |
| 5 | Qidiruv va paginatsiya | 35 daq |

## 2. Postman bilan tanishuv

Sinov uchun ochiq API’lar:

| API | Manzil | Nimasi bor |
|---|---|---|
| JSONPlaceholder | https://jsonplaceholder.typicode.com | posts, users, comments |
| REST Countries | https://restcountries.com/v3.1/all | davlatlar |
| Open-Meteo | https://open-meteo.com/en/docs | ob-havo (kalitsiz) |
| DummyJSON | https://dummyjson.com/products | mahsulotlar, qidiruv, limit |

Postman’da bajaring: \`GET\`, \`POST\`, \`PUT\`, \`DELETE\` so‘rovlarini yuborib, **status kod**, **javob vaqti**, **sarlavhalar** va **tana**ni yozib oling.

## 3. fetch asoslari

\`\`\`js
async function mahsulotlarniOl() {
  const javob = await fetch("https://dummyjson.com/products?limit=12");

  if (!javob.ok) {                       // 404, 500 → fetch xato TASHLAMAYDI
    throw new Error("Server xatosi: " + javob.status);
  }
  const data = await javob.json();
  return data.products;
}
\`\`\`

> ⚠️ **Eng ko‘p uchraydigan xato:** \`fetch\` faqat tarmoq uzilganda \`reject\` bo‘ladi. 404 va 500 da ham \`then\` ishlaydi — shuning uchun \`javob.ok\` ni tekshirish **majburiy**.

POST so‘rovi:

\`\`\`js
const javob = await fetch("https://dummyjson.com/products/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Yangi mahsulot", price: 99 }),
});
\`\`\`

## 4. Ma’lumotni sahifaga chiqarish

\`\`\`js
function kartaYarat(m) {
  const div = document.createElement("div");
  div.className = "col-12 col-sm-6 col-lg-3";
  div.innerHTML = \`
    <div class="card h-100">
      <img class="card-img-top" alt="">
      <div class="card-body">
        <h5 class="card-title"></h5>
        <p class="fw-bold mb-0"></p>
      </div>
    </div>\`;
  div.querySelector("img").src = m.thumbnail;
  div.querySelector("img").alt = m.title;      // matn — atribut orqali
  div.querySelector(".card-title").textContent = m.title;
  div.querySelector(".fw-bold").textContent = m.price + " $";
  return div;
}

function chiqar(mahsulotlar) {
  konteyner.replaceChildren();
  const frag = document.createDocumentFragment();
  mahsulotlar.forEach(m => frag.append(kartaYarat(m)));
  konteyner.append(frag);
}
\`\`\`

> Shablon HTML — o‘zimizniki (ishonchli), lekin **API dan kelgan matn** hech qachon \`innerHTML\` ga qo‘yilmaydi.

## 5. To‘rtta holatni boshqarish

Har bir ma’lumot yuklovchi ekran shu to‘rt holatni ko‘rsatishi kerak:

\`\`\`js
async function yukla() {
  holat.textContent = "Yuklanmoqda…";       // 1. loading
  try {
    const mahsulotlar = await mahsulotlarniOl();
    if (!mahsulotlar.length) {
      holat.textContent = "Hech narsa topilmadi";   // 2. empty
      return;
    }
    holat.textContent = "";                  // 3. success
    chiqar(mahsulotlar);
  } catch (e) {
    holat.textContent = "Xatolik: " + e.message;    // 4. error
    console.error(e);
  }
}
\`\`\`

## 6. Qidiruv va paginatsiya

\`\`\`js
let sahifa = 1;
const LIMIT = 12;

function url(q = "") {
  const skip = (sahifa - 1) * LIMIT;
  return q
    ? \`https://dummyjson.com/products/search?q=\${q}&limit=\${LIMIT}&skip=\${skip}\`
    : \`https://dummyjson.com/products?limit=\${LIMIT}&skip=\${skip}\`;
}

// Har harfda so‘rov yubormaslik uchun — debounce
let taymer;
qidiruv.addEventListener("input", (e) => {
  clearTimeout(taymer);
  taymer = setTimeout(() => { sahifa = 1; yukla(e.target.value); }, 400);
});
\`\`\`

## 7. Sinfdagi asosiy topshiriq — "Mahsulotlar katalogi"

1. Sahifa ochilganda API dan 12 ta mahsulot yuklansin;
2. har biri Bootstrap kartasida (rasm, nom, narx, reyting);
3. yuqorida qidiruv maydoni (debounce bilan);
4. kategoriya bo‘yicha filtr (\`/products/category/{name}\`);
5. "Ko‘proq yuklash" tugmasi (paginatsiya);
6. loading/empty/error holatlari ko‘rinsin;
7. kartaga bosilganda modal oynada batafsil ma’lumot (\`/products/{id}\`).

## 8. Tekshirish ro‘yxati

- [ ] \`javob.ok\` tekshirilgan
- [ ] \`try/catch\` bor
- [ ] Yuklanish indikatori ko‘rsatiladi
- [ ] API dan kelgan matn \`textContent\` orqali qo‘yiladi
- [ ] Network tabda ortiqcha takroriy so‘rovlar yo‘q

## 9. Tipik xatolar

| Xato | Sabab / yechim |
|---|---|
| \`CORS policy\` xatosi | API boshqa domenda va \`Access-Control-Allow-Origin\` bermagan → proksi yoki boshqa API |
| \`Unexpected token < in JSON\` | server JSON emas, HTML sahifa qaytargan (404) |
| \`undefined\` chiqadi | javob tuzilmasi boshqacha — avval \`console.log(data)\` qiling |
| Sahifa qotib qoladi | \`await\` unutilgan yoki cheksiz sikl ichida fetch |`,
    assignments: `1. Katalogga saralash qo‘shing: narx bo‘yicha o‘sish/kamayish va reyting bo‘yicha (API parametri orqali).
2. Ob-havo ilovasi yozing: foydalanuvchi shahar nomini kiritadi, Open-Meteo API dan 7 kunlik prognoz olinadi va jadvalda ko‘rsatiladi.
3. Bitta API so‘rovining \`Promise.then\` va \`async/await\` variantlarini yozib, o‘qilishi bo‘yicha taqqoslang.
4. \`AbortController\` yordamida qidiruvda eskirgan so‘rovlarni bekor qiling va Network tabda natijani ko‘rsating.`,
    resources: `- MDN. *Using the Fetch API* — https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN. *Promises / async-await* — https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous
- javascript.info — *Network requests* — https://javascript.info/network
- Postman Learning Center — https://learning.postman.com
- DummyJSON / JSONPlaceholder hujjatlari — https://dummyjson.com/docs`,
  },
  {
    title: 'Mustaqil ish: REST API lar va JSON formatida ma’lumot almashish',
    week: 6,
    lesson_type: 'independent',
    hours: 12,
    summary:
      'Ochiq REST API’larni tahlil qilish, JSON tuzilmalarini o‘rganish va o‘z API shartnomangizni (OpenAPI) loyihalash bo‘yicha mustaqil ish.',
    objectives: [
      'Real API hujjatini mustaqil o‘qib tushunish',
      'JSON sxemasini tahlil qilish va tavsiflash',
      'O‘z sohangiz uchun REST API shartnomasini loyihalash',
      'Postman kolleksiyasi ko‘rinishida hujjat tayyorlash',
    ].join('\n'),
    keywords: 'REST, JSON, OpenAPI, Swagger, Postman collection, JSON Schema, API shartnoma',
    content: `## 1. Mustaqil ishning maqsadi

Talaba o‘qituvchisiz, faqat rasmiy hujjatga tayanib, notanish API bilan ishlay olsin va o‘zi API loyihalay olsin. Hajmi — **12 soat**.

## 2. Vazifa tuzilmasi

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | Uchta ochiq API ni tahlil qilish | 3 | Qiyosiy jadval |
| 2 | JSON tuzilmalarini o‘rganish | 2 | Sxema tavsifi |
| 3 | O‘z API shartnomangizni loyihalash | 4 | Endpoint jadvali |
| 4 | OpenAPI/Postman hujjati | 3 | \`openapi.yaml\` + kolleksiya |

## 3. 1-bosqich: API tahlili

Quyidagilardan uchtasini tanlang: GitHub API, OpenWeather, REST Countries, Spotify Web API, Telegram Bot API, Stripe API.

Har biri uchun aniqlang:

- autentifikatsiya usuli (kalit, OAuth, token joylashuvi);
- resurslar va URI naqshlari;
- paginatsiya usuli (\`page/limit\`, \`cursor\`, \`Link\` sarlavhasi);
- xatolik javobining tuzilmasi;
- rate limiting (limit qanday xabar qilinadi);
- versiyalash usuli.

## 4. 2-bosqich: JSON tahlili

Tanlangan API dan bitta katta javobni oling va uni tavsiflang:

\`\`\`json
{
  "id": 7,
  "title": "Klaviatura",
  "price": 250000,
  "tags": ["tech", "office"],
  "rating": { "value": 4.7, "count": 128 },
  "createdAt": "2026-03-14T09:20:00Z"
}
\`\`\`

| Maydon | Tur | Majburiy | Izoh |
|---|---|---|---|
| id | integer | ha | unikal identifikator |
| rating | object | yo‘q | ichma-ich obyekt |
| createdAt | string (ISO 8601) | ha | UTC vaqt |

Sanani doim **ISO 8601 / UTC** da uzating — vaqt mintaqasi muammosi shunda hal bo‘ladi.

## 5. 3-bosqich: O‘z API ingiz

Soha tanlang (kutubxona, klinika, taksi, onlayn kurslar, restoran) va kamida **4 ta resurs**, **15 ta endpoint** loyihalang:

- CRUD to‘liq bo‘lsin;
- kamida bitta ichma-ich resurs (\`/courses/{id}/lessons\`);
- filtr, saralash, paginatsiya parametrlari;
- xatolik javobi yagona formatda;
- autentifikatsiya talab qilinadigan endpointlar belgilansin.

## 6. 4-bosqich: Hujjat

\`openapi.yaml\` faylini https://editor.swagger.io da tuzing — u xatosiz validatsiyadan o‘tsin. Qo‘shimcha: Postman kolleksiyasi (\`.json\`) eksport qilinsin.

## 7. Topshirish shakli

\`\`\`
mustaqil-1/
├── 1-api-tahlil.md
├── 2-json-tahlil.md
├── 3-endpointlar.md
├── openapi.yaml
└── collection.json
\`\`\`

## 8. Baholash mezonlari

| Mezon | Ball |
|---|---|
| Uchta API to‘liq va to‘g‘ri tahlil qilingan | 20 |
| JSON tuzilmasi aniq tavsiflangan | 15 |
| Endpointlar REST qoidalariga mos (nom, metod, status kod) | 30 |
| OpenAPI fayli validatsiyadan o‘tadi | 25 |
| Hujjat tartibli, xatosiz | 10 |
| **Jami** | **100** |`,
    assignments: `1. Uchta ochiq REST API ni belgilangan mezonlar bo‘yicha tahlil qilib, qiyosiy jadval tayyorlang.
2. Tanlagan sohangiz uchun kamida 15 ta endpointdan iborat REST API shartnomasini yozing.
3. Shartnomani \`openapi.yaml\` ko‘rinishida rasmiylashtiring va Swagger Editor validatsiyasidan o‘tkazing.
4. Postman kolleksiyasini tayyorlab, har bir so‘rov uchun namuna javob (example) saqlang.`,
    resources: `- OpenAPI Specification 3.1 — https://spec.openapis.org/oas/latest.html
- Swagger Editor — https://editor.swagger.io
- JSON Schema — https://json-schema.org/learn/getting-started-step-by-step
- GitHub REST API hujjati (namunaviy API dizayni) — https://docs.github.com/en/rest
- Leonard Richardson, Mike Amundsen. *RESTful Web APIs*. O’Reilly, 2013`,
  },

  // ─────────────────────────── 7-hafta ───────────────────────────
  {
    title: 'Frontend va Backend arxitekturasi',
    week: 7,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Veb-ilovani ikki qismga bo‘lib ko‘rish: frontend (HTML, CSS, JS yordamida foydalanuvchi interfeysi) va backend (ma’lumotlar bazasi, server va API) arxitekturalari.',
    objectives: [
      'Frontend va backend mas’uliyatlarini aniq ajratish',
      'SSR, CSR va SPA renderlash strategiyalarini qiyoslash',
      'Backend qatlamlari (route → controller → service → repository) vazifasini izohlash',
      'Frontend va backend orasidagi shartnoma (API) va CORS mexanizmini tushuntirish',
      'Muhit o‘zgaruvchilari va konfiguratsiya tamoyillarini qo‘llash',
    ].join('\n'),
    keywords:
      'frontend, backend, SSR, CSR, SPA, MPA, controller, service, repository, DTO, middleware, CORS, .env, 12-factor',
    content: `## 1. Darsning maqsadi

Talaba "bu mantiq frontendda bo‘ladimi yoki backendda?" degan savolga har safar to‘g‘ri javob bera olsin va backend kodini qatlamlarga ajratib yoza olsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Mas’uliyatlar taqsimoti

| Vazifa | Frontend | Backend |
|---|---|---|
| Interfeys, animatsiya | ✅ | — |
| Kiritishni **qulaylik uchun** tekshirish | ✅ | — |
| Kiritishni **xavfsizlik uchun** tekshirish | — | ✅ |
| Biznes qoidalari (chegirma, limit) | — | ✅ |
| Narxni hisoblash | — | ✅ |
| Autentifikatsiya, ruxsatlar | — | ✅ |
| Ma’lumotni saqlash | — | ✅ |
| Marshrutlash (SPA) | ✅ | ✅ (API yo‘llari) |

> **Oltin qoida:** frontend validatsiyasi — foydalanuvchiga hurmat; backend validatsiyasi — himoya. Frontend kodini istalgan foydalanuvchi o‘zgartira oladi, shuning uchun **ishonch faqat serverda**.

### 2.2. Renderlash strategiyalari

| Strategiya | Qayerda yig‘iladi | Afzalligi | Kamchiligi |
|---|---|---|---|
| **MPA/SSR** (PHP, JSP, EJS) | serverda | SEO, birinchi ko‘rinish tez | har o‘tishda to‘liq qayta yuklash |
| **CSR/SPA** (React, Vue) | brauzerda | silliq navigatsiya, API qayta ishlatiladi | birinchi yuklash og‘ir, SEO qiyin |
| **SSR + gidratsiya** (Next.js, Nuxt) | ikkalasida | SEO + silliqlik | murakkab infratuzilma |
| **SSG / Jamstack** | build vaqtida | eng tez, arzon | dinamik kontent cheklangan |

### 2.3. Frontend arxitekturasi

\`\`\`
src/
├── pages/         # ekranlar
├── components/    # qayta ishlatiladigan bo‘laklar
├── api/           # server bilan aloqa (bitta joyda!)
├── context|store/ # global holat
├── hooks/         # qayta ishlatiladigan mantiq
└── styles/
\`\`\`

**Muhim tamoyil:** \`fetch\` chaqiruvlari komponentlar ichiga sochilib ketmasin — bitta \`api/client\` moduli bo‘lsin. Shunda bazaviy manzil, token va xatolarni bir joyda boshqarasiz:

\`\`\`js
const BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiGet(yol) {
  const javob = await fetch(BASE + "/api" + yol, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  });
  if (!javob.ok) throw new Error(await javob.text());
  return javob.json();
}
\`\`\`

### 2.4. Backend arxitekturasi — qatlamlar

\`\`\`
So‘rov
  ↓ Middleware   (log, CORS, JSON parser, auth)
  ↓ Route        (URL → funksiya)
  ↓ Controller   (so‘rovni o‘qish, validatsiya, javob)
  ↓ Service      (biznes mantiq)
  ↓ Repository   (SQL / ORM)
  ↓ Database
\`\`\`

\`\`\`js
// routes/products.js
router.get("/:id", async (req, res, next) => {
  try {
    const mahsulot = await productService.getById(Number(req.params.id));
    if (!mahsulot) return res.status(404).json({ error: "Topilmadi" });
    res.json(mahsulot);
  } catch (e) { next(e); }
});
\`\`\`

**Nega qatlamlar kerak?** Biznes mantiq HTTP dan mustaqil bo‘ladi — uni test qilish, qayta ishlatish va bazani almashtirish osonlashadi.

### 2.5. DTO va ma’lumotni tozalash

Bazadagi yozuvni to‘g‘ridan-to‘g‘ri qaytarmang: \`password_hash\`, ichki bayroqlar tashqariga chiqib ketmasin.

\`\`\`js
const toDTO = (u) => ({ id: u.id, ism: u.full_name, email: u.email });
\`\`\`

### 2.6. CORS — brauzerning himoya mexanizmi

Brauzer \`http://localhost:5173\` dan \`http://localhost:4000\` ga so‘rovni **boshqa origin** deb hisoblaydi (protokol, domen yoki port farq qilsa).

\`\`\`js
app.use(cors({
  origin: process.env.CLIENT_ORIGIN.split(","),
  credentials: true,
}));
\`\`\`

Murakkab so‘rovlardan oldin brauzer \`OPTIONS\` (preflight) yuboradi va server ruxsatni sarlavhalarda tasdiqlaydi. **CORS — serverni emas, foydalanuvchini himoya qiladi**; u autentifikatsiya o‘rnini bosmaydi.

### 2.7. Konfiguratsiya (12-factor)

\`\`\`
DATABASE_URL=postgresql://user:pass@localhost:5432/db
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=...
\`\`\`

Qoidalar: maxfiy qiymatlar kodda bo‘lmaydi, \`.env\` git ga tushmaydi (\`.env.example\` tushadi), har bir muhit (dev/stage/prod) o‘z qiymatiga ega.

## 3. Amaliy qism (20 daqiqa)

Berilgan "hammasi bitta faylda" yozilgan Express kodini qatlamlarga ajrating: route, controller, service, repository. Har bir qatlam nimani biladi va nimani bilmasligi kerakligini yozing.

## 4. Yakunlash (5 daqiqa)

- Chegirmani hisoblash mantiqi qayerda bo‘lishi kerak va nega?
- CORS xatosi chiqsa, uni frontendda tuzatib bo‘ladimi?`,
    assignments: `1. Tanlagan web-ilovangiz uchun mas’uliyatlar jadvalini tuzing: har bir funksiya frontendda, backendda yoki ikkalasida bajarilishini asoslang.
2. SSR, CSR va SSG ni bitta sahifa misolida qiyoslang: birinchi yuklash vaqti, SEO va murakkablik bo‘yicha jadval.
3. Express (yoki boshqa freymvork) da 4 qatlamli minimal API yozing: \`/api/notes\` uchun to‘liq CRUD.
4. CORS xatosini ataylab keltirib chiqaring, DevTools’dagi xabarni saqlang va serverda to‘g‘ri sozlab hal qiling — jarayonni hisobot qiling.`,
    resources: `- Martin Fowler. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002 — Service Layer, Repository
- Express.js rasmiy hujjati — https://expressjs.com/en/guide/routing.html
- MDN. *Cross-Origin Resource Sharing (CORS)* — https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- The Twelve-Factor App — https://12factor.net
- web.dev. *Rendering on the Web* — https://web.dev/articles/rendering-on-the-web`,
  },
  {
    title: 'Frontend va Backend integratsiyasi',
    week: 7,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Foydalanuvchi kiritgan ma’lumotlarni backend serverga yuborish va javobni ko‘rsatish: Express API yozish, CORS sozlash va frontenddan CRUD amallarini bajarish.',
    objectives: [
      'Node.js + Express da minimal REST API yaratish',
      'CORS va JSON middleware’larini sozlash',
      'Frontenddan POST/PUT/DELETE so‘rovlarini yuborish',
      'Server tomonida validatsiya qilish va to‘g‘ri status kod qaytarish',
      'Xatolarni ikkala tomonda ham foydalanuvchiga tushunarli ko‘rsatish',
    ].join('\n'),
    keywords: 'Node.js, Express, middleware, CORS, CRUD, validatsiya, status kod, fetch, .env, nodemon',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Server loyihasini yaratish | 30 daq |
| 2 | CRUD endpointlar | 50 daq |
| 3 | Validatsiya va xatolar | 30 daq |
| 4 | Frontendni ulash | 50 daq |
| 5 | Sinov va topshirish | 20 daq |

## 2. Serverni yaratish

\`\`\`bash
mkdir server && cd server
npm init -y
npm i express cors dotenv
npm i -D nodemon
\`\`\`

\`package.json\`: \`"type": "module"\`, \`"scripts": { "dev": "nodemon index.js" }\`

\`\`\`js
// index.js
import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5500" }));
app.use(express.json());                 // JSON tanani o‘qish
app.use((req, _res, next) => {           // sodda logger
  console.log(req.method, req.url);
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server: http://localhost:" + PORT));
\`\`\`

> \`express.json()\` unutilsa — \`req.body\` **undefined** bo‘ladi. Bu eng ko‘p uchraydigan boshlang‘ich xato.

## 3. CRUD endpointlar

\`\`\`js
let vazifalar = [{ id: 1, matn: "Birinchi vazifa", bajarildi: false }];
let keyingiId = 2;

app.get("/api/tasks", (req, res) => {
  const { done } = req.query;
  let natija = vazifalar;
  if (done === "true")  natija = vazifalar.filter(v => v.bajarildi);
  if (done === "false") natija = vazifalar.filter(v => !v.bajarildi);
  res.json({ data: natija, meta: { total: natija.length } });
});

app.post("/api/tasks", (req, res) => {
  const matn = String(req.body?.matn ?? "").trim();
  if (matn.length < 3) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Matn kamida 3 belgidan iborat bo‘lsin" },
    });
  }
  const yangi = { id: keyingiId++, matn, bajarildi: false };
  vazifalar.push(yangi);
  res.status(201).location("/api/tasks/" + yangi.id).json(yangi);
});

app.patch("/api/tasks/:id", (req, res) => {
  const vazifa = vazifalar.find(v => v.id === Number(req.params.id));
  if (!vazifa) return res.status(404).json({ error: { message: "Topilmadi" } });
  if (typeof req.body.bajarildi === "boolean") vazifa.bajarildi = req.body.bajarildi;
  if (typeof req.body.matn === "string") vazifa.matn = req.body.matn.trim();
  res.json(vazifa);
});

app.delete("/api/tasks/:id", (req, res) => {
  const oldin = vazifalar.length;
  vazifalar = vazifalar.filter(v => v.id !== Number(req.params.id));
  if (vazifalar.length === oldin) return res.status(404).json({ error: { message: "Topilmadi" } });
  res.status(204).end();
});
\`\`\`

Oxirida markazlashtirilgan xato ushlagich:

\`\`\`js
app.use((_req, res) => res.status(404).json({ error: { message: "Yo‘l topilmadi" } }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { message: "Server xatosi" } });
});
\`\`\`

## 4. Frontendni ulash

\`\`\`js
const API = "http://localhost:4000/api";

async function sorov(yol, opsiya = {}) {
  const javob = await fetch(API + yol, {
    headers: { "Content-Type": "application/json" },
    ...opsiya,
  });
  if (javob.status === 204) return null;
  const data = await javob.json().catch(() => null);
  if (!javob.ok) throw new Error(data?.error?.message ?? "Xatolik " + javob.status);
  return data;
}

const olish   = ()        => sorov("/tasks");
const qoshish = (matn)    => sorov("/tasks", { method: "POST", body: JSON.stringify({ matn }) });
const ozgart  = (id, b)   => sorov("/tasks/" + id, { method: "PATCH", body: JSON.stringify(b) });
const ochirish= (id)      => sorov("/tasks/" + id, { method: "DELETE" });
\`\`\`

\`\`\`js
forma.addEventListener("submit", async (e) => {
  e.preventDefault();
  tugma.disabled = true;                     // ikki marta bosishdan himoya
  try {
    await qoshish(input.value);
    input.value = "";
    await chizish();
  } catch (err) {
    xabar.textContent = err.message;
  } finally {
    tugma.disabled = false;
  }
});
\`\`\`

## 5. Sinfdagi asosiy topshiriq

**"Vazifalar" to‘liq ilovasi (frontend + backend):**

1. Server: \`GET/POST/PATCH/DELETE /api/tasks\`, filtr \`?done=true\`;
2. validatsiya: bo‘sh matn — \`400\`, mavjud bo‘lmagan id — \`404\`;
3. frontend: ro‘yxat, qo‘shish formasi, ✓ va ✕ tugmalari, filtr;
4. server o‘chirilganda frontend tushunarli xabar bersin ("Serverga ulanib bo‘lmadi");
5. \`.env\` da \`PORT\` va \`CLIENT_ORIGIN\`, repozitoriyda \`.env.example\`.

## 6. Sinov (Postman + brauzer)

| Sinov | Kutilgan natija |
|---|---|
| \`POST\` bo‘sh matn bilan | 400 + tushunarli xabar |
| \`GET\` mavjud bo‘lmagan id | 404 |
| \`DELETE\` mavjud vazifa | 204, ro‘yxatdan yo‘qoladi |
| Server o‘chirilgan holda frontend | "Serverga ulanib bo‘lmadi" xabari |
| Boshqa portdan so‘rov | CORS sozlangani tekshiriladi |

## 7. Tipik xatolar

| Xato | Sabab |
|---|---|
| \`req.body\` undefined | \`express.json()\` yo‘q yoki \`Content-Type\` yuborilmagan |
| CORS xatosi | \`cors()\` sozlanmagan yoki origin ro‘yxatda yo‘q |
| \`Cannot GET /api/tasks\` | yo‘l xato yoki route ro‘yxatdan keyin e’lon qilingan |
| \`Port 4000 is already in use\` | eski jarayon o‘chirilmagan |
| Frontendda \`undefined\` | javob tuzilmasi (\`data\` o‘rami) e’tiborga olinmagan |`,
    assignments: `1. API ga qidiruv (\`?q=\`) va saralash (\`?sort=\`) parametrlarini qo‘shing.
2. Ma’lumotni xotira o‘rniga \`data.json\` faylida saqlang (\`fs/promises\`) — server qayta ishga tushganda yo‘qolmasin.
3. Barcha endpointlar uchun Postman kolleksiyasi tuzing va har biriga sinov (test) yozing.
4. Serverga \`express-rate-limit\` qo‘shib, bir daqiqada 60 tadan ortiq so‘rovni \`429\` bilan rad eting.`,
    resources: `- Express.js — Getting started / Routing / Error handling — https://expressjs.com
- MDN. *Express/Node introduction* — https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs
- Node.js rasmiy hujjati — https://nodejs.org/docs/latest/api/
- npm \`cors\` paketi — https://www.npmjs.com/package/cors
- Postman Learning Center — *Writing tests* — https://learning.postman.com/docs/writing-scripts/test-scripts/`,
  },
  {
    title: 'Mustaqil ish: Frontend va backend o‘zaro ishlashi',
    week: 7,
    lesson_type: 'independent',
    hours: 12,
    summary:
      'Frontend va backend o‘rtasidagi aloqa mexanizmlarini mustaqil o‘rganish: so‘rov hayoti, CORS, holat boshqaruvi, xatolarni qayta ishlash va API shartnomasiga rioya qilish.',
    objectives: [
      'HTTP so‘rovining brauzerdan bazagacha bo‘lgan yo‘lini tavsiflash',
      'CORS va preflight mexanizmini tajribada tekshirish',
      'Frontend–backend xatolarini diagnostika qilish metodikasini egallash',
      'To‘liq CRUD ilovasini mustaqil yig‘ish',
    ].join('\n'),
    keywords: 'so‘rov hayoti, CORS, preflight, DevTools Network, CRUD, optimistic UI, xatolarni boshqarish',
    content: `## 1. Maqsad va hajm

**12 soat.** Talaba frontend va backend orasidagi aloqani "qora quti" emas, bosqichma-bosqich kuzatiladigan jarayon sifatida tushunsin.

## 2. Bosqichlar

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | So‘rov hayotini o‘rganish | 3 | Diagramma + izoh |
| 2 | CORS tajribasi | 2 | Tajriba hisoboti |
| 3 | To‘liq CRUD ilova | 5 | Ishlaydigan kod |
| 4 | Xatolar katalogi | 2 | Jadval |

## 3. 1-bosqich: So‘rov hayoti

Brauzerda \`fetch("/api/tasks")\` yozilganidan to ekranda ma’lumot ko‘ringunga qadar bo‘lgan bosqichlarni yozing:

1. DNS so‘rovi → IP;
2. TCP ulanish (+ TLS handshake, agar HTTPS);
3. HTTP so‘rov sarlavhalari;
4. serverda middleware zanjiri;
5. route → controller → service → repository;
6. SQL so‘rov va javob;
7. JSON serializatsiya;
8. javob sarlavhalari va status;
9. brauzerda \`json()\` tahlili;
10. DOM yangilanishi.

Har bir bosqichda **nima noto‘g‘ri ketishi mumkinligini** va uni qanday aniqlashni yozing.

## 4. 2-bosqich: CORS tajribasi

Uchta holatni amalda hosil qiling va DevTools → Network dan skrinshot oling:

| Holat | Kutilgan natija |
|---|---|
| \`cors()\` umuman yo‘q | so‘rov bloklanadi, konsolda CORS xatosi |
| \`origin\` ro‘yxatda emas | bloklanadi, lekin server logida so‘rov ko‘rinadi |
| Maxsus sarlavha bilan \`PUT\` | \`OPTIONS\` preflight so‘rovi ko‘rinadi |

**Savol:** nega server so‘rovni qabul qilgani holda brauzer javobni ko‘rsatmaydi?

## 5. 3-bosqich: To‘liq CRUD ilova

Mavzu o‘zingiz tanlaysiz (kitoblar, retseptlar, xarajatlar, mashqlar). Talablar:

- backend: 5 ta endpoint, validatsiya, yagona xatolik formati;
- frontend: ro‘yxat, qo‘shish, tahrirlash, o‘chirish, filtr;
- to‘rt holat: loading, empty, error, success;
- takroriy yuborishdan himoya (tugma bloklanadi);
- \`.env\` va \`.env.example\`;
- \`README.md\` — ishga tushirish yo‘riqnomasi.

## 6. 4-bosqich: Xatolar katalogi

Kamida 10 ta real uchragan xatoni jadvalga yozing:

| Xato xabari | Qayerda ko‘rindi | Sababi | Yechimi |
|---|---|---|---|
| \`Failed to fetch\` | brauzer konsoli | server ishlamayapti | serverni ishga tushirish |

## 7. Topshirish shakli

\`\`\`
mustaqil-2/
├── 1-sorov-hayoti.md
├── 2-cors-tajriba.md   (skrinshotlar bilan)
├── 3-ilova/  (server/ + client/ + README.md)
└── 4-xatolar.md
\`\`\`

## 8. Baholash mezonlari

| Mezon | Ball |
|---|---|
| So‘rov hayoti to‘liq va to‘g‘ri tavsiflangan | 20 |
| CORS tajribasi bajarilgan, xulosa asosli | 15 |
| CRUD ilova to‘liq ishlaydi | 35 |
| Xato holatlari to‘g‘ri boshqarilgan | 15 |
| Hujjat va kod tartibi | 15 |
| **Jami** | **100** |`,
    assignments: `1. So‘rovning brauzerdan bazagacha bo‘lgan yo‘lini diagramma bilan tasvirlab, har bosqichdagi mumkin bo‘lgan nosozliklarni yozing.
2. CORS ning uch holatini amalda sinab, Network paneli skrinshotlari bilan hisobot tayyorlang.
3. Tanlagan mavzuingizda to‘liq CRUD ilovasini (frontend + backend) yozing.
4. Loyihangizda uchragan kamida 10 ta xatoni sabab-yechim jadvali ko‘rinishida rasmiylashtiring.`,
    resources: `- MDN. *CORS* va *Preflight request* — https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Chrome DevTools. *Inspect network activity* — https://developer.chrome.com/docs/devtools/network/
- MDN. *An overview of HTTP* — https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- Express.js — *Error handling* — https://expressjs.com/en/guide/error-handling.html
- web.dev. *Fetch API* va *Network reliability* — https://web.dev`,
  },

  // ─────────────────────────── 8-hafta ───────────────────────────
  {
    title: 'Ma’lumotlar bazasi va ORM texnologiyalari',
    week: 8,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Web-ilovalarda ma’lumotlarni saqlash va boshqarish usullari: SQL va NoSQL bazalar, normalizatsiya, indekslar, tranzaksiyalar hamda ORM texnologiyalarining ishlash prinsipi.',
    objectives: [
      'SQL va NoSQL bazalarni vazifasiga qarab tanlash',
      'Normalizatsiya (1NF–3NF) va bog‘lanish turlarini izohlash',
      'Indeks va tranzaksiya (ACID) tushunchalarini tushuntirish',
      'ORM ning afzalliklarini va tipik muammolarini (N+1) baholash',
      'Migratsiyalar orqali sxemani versiyalashni tushuntirish',
    ].join('\n'),
    keywords:
      'SQL, NoSQL, normalizatsiya, birlamchi kalit, tashqi kalit, indeks, tranzaksiya, ACID, ORM, Active Record, Data Mapper, N+1, migratsiya, connection pool',
    content: `## 1. Darsning maqsadi

Talaba ma’lumotlar bazasini "jadval yig‘indisi" emas, **ilovaning eng uzoq yashaydigan qismi** sifatida ko‘rsin: sxema noto‘g‘ri bo‘lsa, kodni qancha yaxshilamang, muammo qolaveradi.

## 2. Nazariy qism (55 daqiqa)

### 2.1. SQL va NoSQL

| Mezon | Relatsion (SQL) | Hujjatli (NoSQL) |
|---|---|---|
| Model | jadvallar, satrlar | hujjatlar (JSON) |
| Sxema | qat’iy | moslashuvchan |
| Bog‘lanish | JOIN | ichma-ich hujjat / qo‘lda |
| Tranzaksiya | kuchli ACID | cheklangan |
| Miqyoslash | vertikal (asosan) | gorizontal |
| Misol | PostgreSQL, MySQL | MongoDB, Redis, Cassandra |

**Qachon nima:** moliyaviy va bog‘lanishlarga boy ma’lumot → SQL. Log, kesh, sessiya, tez o‘zgaruvchi tuzilma → NoSQL. Ko‘p loyihada ikkalasi birga ishlatiladi (PostgreSQL + Redis).

> PostgreSQL da \`jsonb\` turi bor — ya’ni relatsion bazada ham hujjatli yondashuvni qo‘llash mumkin.

### 2.2. Sxema loyihalash

\`\`\`sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  full_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total    NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  status   TEXT NOT NULL DEFAULT 'new'
);
\`\`\`

| Bog‘lanish | Amalga oshirilishi | Misol |
|---|---|---|
| 1:1 | \`UNIQUE\` tashqi kalit | user ↔ profile |
| 1:N | "ko‘p" tomonda tashqi kalit | user → orders |
| N:M | oraliq jadval | students ↔ courses |

**Normalizatsiya:** 1NF — atomar qiymat; 2NF — to‘liq funksional bog‘liqlik; 3NF — tranzitiv bog‘liqlik yo‘q. Maqsad — **takrorlanishni va anomaliyalarni yo‘qotish**. Hisobot tezligi uchun ataylab denormalizatsiya qilinishi mumkin, lekin bu ongli qaror bo‘lishi kerak.

### 2.3. Indekslar

\`\`\`sql
CREATE INDEX idx_orders_user ON orders(user_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
\`\`\`

- Indeks **o‘qishni tezlashtiradi**, yozishni sekinlashtiradi va joy egallaydi.
- Tashqi kalitlar va \`WHERE\`/\`JOIN\`/\`ORDER BY\` da tez-tez ishlatiladigan ustunlarga qo‘yiladi.
- \`EXPLAIN\` — indeks ishlayaptimi yoki \`Seq Scan\` ketyaptimi, shuni ko‘rsatadi.

### 2.4. Tranzaksiyalar va ACID

\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- xato bo‘lsa ROLLBACK
\`\`\`

| Harf | Ma’nosi |
|---|---|
| **A**tomicity | hammasi yoki hech nima |
| **C**onsistency | cheklovlar buzilmaydi |
| **I**solation | parallel tranzaksiyalar aralashmaydi |
| **D**urability | commit’dan keyin ma’lumot saqlanadi |

### 2.5. ORM nima?

**Object-Relational Mapping** — jadval satrini dasturlash tilidagi obyektga moslashtiruvchi qatlam.

\`\`\`js
// ORM (Prisma)
const users = await prisma.user.findMany({
  where: { isActive: true },
  include: { orders: true },
});

// Xom SQL
const { rows } = await pool.query(
  "SELECT * FROM users u JOIN orders o ON o.user_id = u.id WHERE u.is_active = true"
);
\`\`\`

Ikki asosiy naqsh (Fowler):

| Naqsh | G‘oyasi | Misol |
|---|---|---|
| **Active Record** | obyektning o‘zi saqlanishni biladi (\`user.save()\`) | Rails AR, Sequelize |
| **Data Mapper** | alohida qatlam obyekt va jadvalni bog‘laydi | Hibernate, TypeORM, Doctrine |

**Afzalliklari:** kam shablon kod, SQL injection dan himoya (parametrlash), migratsiyalar, tur xavfsizligi, bazani almashtirish osonroq.

**Kamchiliklari:** murakkab so‘rovlarda qiyinlashadi, samaradorlik yashiringan, o‘rganish narxi bor, "sehrli" xulq nosozlikni yashiradi.

### 2.6. N+1 muammosi — eng mashhur ORM tuzog‘i

\`\`\`js
const users = await User.findAll();          // 1 ta so‘rov
for (const u of users) {
  u.orders = await Order.findAll({ where: { userId: u.id } });  // N ta so‘rov!
}
\`\`\`

100 ta foydalanuvchi → 101 ta so‘rov. Yechim: \`include\` / \`JOIN\` / eager loading orqali bitta so‘rovda olish.

### 2.7. Migratsiyalar va connection pool

\`\`\`
migrations/
├── 001_create_users.sql
├── 002_create_orders.sql
└── 003_add_status_index.sql
\`\`\`

Sxema ham kod kabi **versiyalanadi** va git da saqlanadi — shunda har bir muhitda baza bir xil holatga keladi.

Har so‘rovga yangi ulanish ochish qimmat — shuning uchun **connection pool** ishlatiladi (masalan, \`pg.Pool\`).

## 3. Amaliy qism (20 daqiqa)

Onlayn kurslar platformasi uchun ER-diagramma tuzing: \`users\`, \`courses\`, \`lessons\`, \`enrollments\`, \`progress\`. Bog‘lanishlarni, kalitlarni va kerakli indekslarni belgilang.

## 4. Yakunlash (5 daqiqa)

- N+1 muammosi nima va qanday hal qilinadi?
- Indeks qo‘shish har doim foydalimi?`,
    assignments: `1. Tanlagan sohangiz uchun 6 ta jadvaldan iborat sxemani 3NF da loyihalang va \`CREATE TABLE\` skriptini yozing.
2. Bir xil vazifani ORM va xom SQL bilan bajaruvchi kod yozib, o‘qilishi va samaradorligini taqqoslang.
3. N+1 muammosini ataylab hosil qiling, \`EXPLAIN\`/so‘rovlar sonini o‘lchang va uni bartaraf eting.
4. Uchta migratsiya fayli yozing: jadval yaratish, ustun qo‘shish, indeks qo‘shish; har birining \`rollback\` variantini ham ko‘rsating.`,
    resources: `- Alan Beaulieu. *Learning SQL*. 3-nashr, O’Reilly, 2020
- Martin Fowler. *Patterns of Enterprise Application Architecture*. 2002 — Active Record, Data Mapper, Unit of Work
- PostgreSQL rasmiy hujjati — https://www.postgresql.org/docs/current/
- Markus Winand. *Use The Index, Luke!* — https://use-the-index-luke.com
- Martin Kleppmann. *Designing Data-Intensive Applications*. O’Reilly, 2017 — 2–3-boblar`,
  },
  {
    title: 'Ma’lumotlar bazasi bilan ishlash',
    week: 8,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'SQL buyruqlari yordamida ma’lumotlarni yaratish, o‘qish, o‘zgartirish va o‘chirish; jadval yaratish, JOIN, agregatsiya va API ni bazaga ulash.',
    objectives: [
      'PostgreSQL da baza va jadval yaratish',
      'INSERT, SELECT, UPDATE, DELETE buyruqlarini qo‘llash',
      'JOIN, GROUP BY, ORDER BY, LIMIT bilan so‘rov yozish',
      'Node.js API ni bazaga ulab, parametrlangan so‘rov yozish',
      'SQL injection dan himoyalanish qoidasini amalda qo‘llash',
    ].join('\n'),
    keywords: 'PostgreSQL, psql, DDL, DML, JOIN, GROUP BY, agregat funksiya, pg.Pool, parametrlangan so‘rov, transaction',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Bazani o‘rnatish, jadval yaratish | 35 daq |
| 2 | INSERT va SELECT | 40 daq |
| 3 | JOIN va agregatsiya | 45 daq |
| 4 | UPDATE, DELETE, tranzaksiya | 25 daq |
| 5 | API ni bazaga ulash | 35 daq |

## 2. Bazani tayyorlash

\`\`\`bash
sudo -u postgres psql -c "CREATE USER dukon WITH PASSWORD 'dukon';"
sudo -u postgres psql -c "CREATE DATABASE dukon OWNER dukon;"
psql "postgresql://dukon:dukon@localhost:5432/dukon"
\`\`\`

Foydali \`psql\` buyruqlari: \`\\l\` (bazalar), \`\\dt\` (jadvallar), \`\\d jadval\` (tuzilma), \`\\q\` (chiqish).

## 3. Jadval yaratish (DDL)

\`\`\`sql
CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name        TEXT NOT NULL,
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  customer   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
\`\`\`

## 4. Ma’lumot kiritish va o‘qish

\`\`\`sql
INSERT INTO categories (name) VALUES ('Texnika'), ('Kitob'), ('Kiyim');

INSERT INTO products (category_id, name, price, stock) VALUES
  (1, 'Klaviatura', 250000, 12),
  (1, 'Monitor',   1900000, 3),
  (2, 'Clean Code', 120000, 25);

SELECT * FROM products WHERE price < 300000 ORDER BY price DESC;
SELECT name, price FROM products WHERE name ILIKE '%mon%';
SELECT * FROM products ORDER BY created_at DESC LIMIT 10 OFFSET 0;
\`\`\`

| Operator | Misol |
|---|---|
| \`BETWEEN\` | \`price BETWEEN 100000 AND 500000\` |
| \`IN\` | \`category_id IN (1,2)\` |
| \`ILIKE\` | registrga befarq qidiruv |
| \`IS NULL\` | bo‘sh qiymat (\`= NULL\` ishlamaydi!) |

## 5. JOIN va agregatsiya

\`\`\`sql
-- Har bir mahsulot va uning kategoriyasi
SELECT p.name, c.name AS category, p.price
FROM products p
JOIN categories c ON c.id = p.category_id;

-- Kategoriyalar bo‘yicha statistika
SELECT c.name,
       COUNT(p.id)      AS soni,
       ROUND(AVG(p.price)) AS ortacha,
       MAX(p.price)     AS eng_qimmat
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
HAVING COUNT(p.id) > 0
ORDER BY soni DESC;

-- Buyurtma summasi
SELECT o.id, o.customer, SUM(p.price * oi.quantity) AS jami
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
GROUP BY o.id, o.customer;
\`\`\`

| JOIN turi | Nimani qaytaradi |
|---|---|
| \`INNER JOIN\` | faqat ikkalasida bor satrlar |
| \`LEFT JOIN\` | chapdagi hammasi + moslari |
| \`RIGHT JOIN\` | o‘ngdagi hammasi |
| \`FULL JOIN\` | ikkala tomonning hammasi |

> \`WHERE\` guruhlashdan **oldin**, \`HAVING\` guruhlashdan **keyin** ishlaydi.

## 6. UPDATE, DELETE va tranzaksiya

\`\`\`sql
UPDATE products SET price = price * 1.10 WHERE category_id = 1;
DELETE FROM products WHERE stock = 0;

BEGIN;
  INSERT INTO orders (customer) VALUES ('Ali') RETURNING id;   -- masalan, 5
  INSERT INTO order_items (order_id, product_id, quantity) VALUES (5, 1, 2);
  UPDATE products SET stock = stock - 2 WHERE id = 1;
COMMIT;
\`\`\`

> ⚠️ \`UPDATE\`/\`DELETE\` ni **har doim** avval \`SELECT\` bilan sinab ko‘ring. \`WHERE\` siz \`DELETE\` — butun jadvalni o‘chiradi.

## 7. API ni bazaga ulash

\`\`\`bash
npm i pg
\`\`\`

\`\`\`js
import pg from "pg";
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.get("/api/products", async (req, res, next) => {
  try {
    const { category, q, limit = 20, offset = 0 } = req.query;
    const { rows } = await pool.query(
      \`SELECT p.*, c.name AS category
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ($1::int IS NULL OR p.category_id = $1)
          AND ($2::text IS NULL OR p.name ILIKE '%' || $2 || '%')
        ORDER BY p.created_at DESC
        LIMIT $3 OFFSET $4\`,
      [category ?? null, q ?? null, limit, offset],
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
});
\`\`\`

> 🔒 **Hech qachon** so‘rovni satr biriktirish bilan yasamang:
> \`"SELECT * FROM users WHERE email = '" + email + "'"\` — bu SQL injection eshigi.
> Faqat \`$1, $2\` parametrlari.

## 8. Sinfdagi asosiy topshiriq

1. Yuqoridagi 4 ta jadvalni yarating va kamida 20 ta mahsulot, 5 ta buyurtma kiriting.
2. Quyidagi so‘rovlarni yozing:
   - eng qimmat 5 ta mahsulot;
   - kategoriyalar bo‘yicha o‘rtacha narx;
   - hech qanday mahsuloti yo‘q kategoriyalar (\`LEFT JOIN ... IS NULL\`);
   - eng ko‘p xarid qilgan mijoz;
   - oxirgi 7 kundagi buyurtmalar soni.
3. \`/api/products\` endpointini bazaga ulang: filtr, qidiruv, paginatsiya bilan.
4. Buyurtma yaratishni tranzaksiya ichida bajaring (buyurtma + pozitsiyalar + qoldiqni kamaytirish).

## 9. Tipik xatolar

| Xato | Sabab |
|---|---|
| \`violates foreign key constraint\` | mavjud bo‘lmagan \`category_id\` |
| \`duplicate key value\` | \`UNIQUE\` buzilgan |
| \`column must appear in GROUP BY\` | agregatsiz ustun tanlangan |
| \`= NULL\` hech narsa qaytarmaydi | \`IS NULL\` ishlatilishi kerak |
| So‘rov sekin | indeks yo‘q — \`EXPLAIN ANALYZE\` bilan tekshiring |`,
    assignments: `1. Sxemaga \`customers\` jadvalini qo‘shing va \`orders\` ni unga bog‘lang (matn maydon o‘rniga tashqi kalit).
2. 10 ta murakkab \`SELECT\` so‘rovi yozing: ichma-ich so‘rov, \`LEFT JOIN\`, \`HAVING\`, oyma-oy statistika.
3. Bitta sekin so‘rovni \`EXPLAIN ANALYZE\` bilan tahlil qiling, indeks qo‘shib, vaqtni "oldin/keyin" jadvalida ko‘rsating.
4. \`data.json\` dagi ma’lumotni bazaga ko‘chiruvchi seed skript yozing.`,
    resources: `- Alan Beaulieu. *Learning SQL*. 3-nashr, O’Reilly, 2020 — 3–9-boblar
- PostgreSQL Tutorial — https://www.postgresqltutorial.com
- PostgreSQL. *SQL Language* — https://www.postgresql.org/docs/current/sql.html
- node-postgres (\`pg\`) hujjati — https://node-postgres.com
- SQLBolt (interaktiv mashqlar) — https://sqlbolt.com`,
  },
  {
    title: 'Mustaqil ish: SQL da ma’lumotlarni tanlash va filtrlash',
    week: 8,
    lesson_type: 'independent',
    hours: 12,
    summary:
      'SELECT so‘rovlarini chuqur o‘rganish: filtrlash, saralash, guruhlash, ichma-ich so‘rovlar, JOIN turlari va so‘rov samaradorligini tahlil qilish.',
    objectives: [
      'Murakkab SELECT so‘rovlarini mustaqil yozish',
      'JOIN turlarini farqlab qo‘llash',
      'Agregatsiya va oyna (window) funksiyalaridan foydalanish',
      'EXPLAIN orqali so‘rov rejasini o‘qish',
    ].join('\n'),
    keywords: 'SELECT, WHERE, JOIN, GROUP BY, HAVING, subquery, CTE, window function, EXPLAIN, indeks',
    content: `## 1. Maqsad va hajm

**12 soat.** Talaba SQL ni "jadvaldan ma’lumot olish" darajasidan **ma’lumot bilan savolga javob berish** darajasiga ko‘tarsin.

## 2. Bosqichlar

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | Sinov bazasini tayyorlash | 2 | \`schema.sql\` + \`seed.sql\` |
| 2 | 30 ta so‘rov yechish | 6 | \`solutions.sql\` |
| 3 | Samaradorlik tahlili | 2 | \`explain.md\` |
| 4 | Hisobot so‘rovlari | 2 | \`reports.sql\` |

## 3. 1-bosqich: Baza

Kamida 5 ta jadval va **1000+ satr** ma’lumot bo‘lsin (generatsiya skripti bilan):

\`\`\`sql
INSERT INTO products (category_id, name, price, stock)
SELECT (random()*2)::int + 1,
       'Mahsulot ' || i,
       (random()*2000000)::numeric(12,2),
       (random()*50)::int
FROM generate_series(1, 1000) AS i;
\`\`\`

## 4. 2-bosqich: So‘rovlar to‘plami

Quyidagi turlarni qamrab oling (jami 30 ta):

**Filtrlash (8 ta):** \`BETWEEN\`, \`IN\`, \`ILIKE\`, \`IS NULL\`, sana oralig‘i, murakkab \`AND/OR\`, \`NOT\`, oxirgi 30 kun.

**Saralash va cheklash (4 ta):** ko‘p ustun bo‘yicha, \`NULLS LAST\`, \`LIMIT/OFFSET\`, top-N.

**Guruhlash (6 ta):** \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN/MAX\`, \`HAVING\`, sana bo‘yicha (\`date_trunc\`).

**JOIN (6 ta):** \`INNER\`, \`LEFT\`, "yetim" satrlarni topish, uch jadvalli \`JOIN\`, \`SELF JOIN\`, N:M.

**Ichma-ich so‘rov va CTE (4 ta):** \`IN (SELECT ...)\`, \`EXISTS\`, skalyar subquery, \`WITH\`.

**Window funksiyalar (2 ta):**

\`\`\`sql
SELECT name, price, category_id,
       RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS orin
FROM products;
\`\`\`

Har bir so‘rov uchun: **savol (o‘zbekcha)** → **SQL** → **natija namunasi**.

## 5. 3-bosqich: Samaradorlik

5 ta so‘rovni tahlil qiling:

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM products WHERE name ILIKE '%mon%';
\`\`\`

| So‘rov | Indekssiz vaqt | Indeks | Indeksdan keyin | Reja o‘zgarishi |
|---|---|---|---|---|
| ... | 120 ms | \`idx_products_name\` | 4 ms | Seq Scan → Index Scan |

Javob bering: qaysi hollarda indeks **ishlamaydi**? (\`%...%\` bilan boshlangan qidiruv, ustunga funksiya qo‘llash, kam selektivlik.)

## 6. 4-bosqich: Hisobot so‘rovlari

Biznes savollariga javob beruvchi 5 ta so‘rov:

1. oyma-oy sotuv dinamikasi;
2. har bir kategoriyaning umumiy tushumdagi ulushi (%);
3. hech narsa sotib olmagan mijozlar;
4. eng ko‘p birga sotib olinadigan mahsulot juftligi;
5. qoldig‘i 5 tadan kam mahsulotlar (ogohlantirish hisoboti).

## 7. Topshirish shakli

\`\`\`
mustaqil-3/
├── schema.sql
├── seed.sql
├── solutions.sql   (30 ta so‘rov, izohlar bilan)
├── explain.md
└── reports.sql
\`\`\`

## 8. Baholash mezonlari

| Mezon | Ball |
|---|---|
| Baza va ma’lumot to‘g‘ri tayyorlangan | 15 |
| 30 ta so‘rov ishlaydi va savolga mos | 40 |
| JOIN va guruhlash to‘g‘ri qo‘llangan | 15 |
| EXPLAIN tahlili asosli | 20 |
| Kod tartibli, izohlangan | 10 |
| **Jami** | **100** |`,
    assignments: `1. Kamida 1000 satrli sinov bazasini generatsiya skripti bilan tayyorlang.
2. Belgilangan turlar bo‘yicha 30 ta SELECT so‘rovini yozing va har birini savol-javob ko‘rinishida hujjatlang.
3. Beshta so‘rovni EXPLAIN ANALYZE bilan tahlil qilib, indeks qo‘shishdan oldingi va keyingi natijani solishtiring.
4. Beshta biznes-hisobot so‘rovini yozing va natijani jadval ko‘rinishida keltiring.`,
    resources: `- Alan Beaulieu. *Learning SQL*. 3-nashr, O’Reilly, 2020
- Markus Winand. *SQL Performance Explained* / https://use-the-index-luke.com
- PostgreSQL. *Window Functions* — https://www.postgresql.org/docs/current/tutorial-window.html
- PostgreSQL. *Using EXPLAIN* — https://www.postgresql.org/docs/current/using-explain.html
- Interaktiv mashqlar: https://sqlbolt.com, https://pgexercises.com`,
  },

  // ─────────────────────────── 9-hafta ───────────────────────────
  {
    title: 'Integratsiya arxitekturasi va JavaScriptda AJAX',
    week: 9,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'AJAX va Fetch API yordamida ma’lumotlarni sahifani yangilamasdan olish; integratsiya arxitekturasining asosiy elementlari — SOA, ESB, API Gateway, Message Queue.',
    objectives: [
      'AJAX g‘oyasini va uning web rivojidagi o‘rnini izohlash',
      'XMLHttpRequest va Fetch API ni qiyoslash',
      'Sinxron va asinxron aloqa naqshlarini farqlash',
      'SOA, ESB, API Gateway va Message Queue vazifalarini tushuntirish',
      'Real vaqt texnologiyalarini (polling, SSE, WebSocket) tanlash mezonini bilish',
    ].join('\n'),
    keywords:
      'AJAX, XMLHttpRequest, Fetch, Promise, SOA, ESB, API Gateway, Message Queue, RabbitMQ, Kafka, pub/sub, WebSocket, SSE, polling, idempotentlik',
    content: `## 1. Darsning maqsadi

Talaba ikki darajadagi integratsiyani ko‘ra bilsin: **brauzer ↔ server** (AJAX) va **server ↔ server** (SOA, gateway, navbatlar) — hamda qaysi holatda sinxron, qaysi holatda asinxron aloqa to‘g‘ri kelishini asoslay olsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. AJAX gacha va keyin

AJAX (Asynchronous JavaScript and XML, 2005) — sahifani **to‘liq qayta yuklamasdan** server bilan ma’lumot almashish usuli. Google Maps va Gmail shu texnologiya bilan "sahifa" tushunchasini "ilova"ga aylantirdi.

| AJAX gacha | AJAX bilan |
|---|---|
| Har amal → butun sahifa qayta yuklanadi | Faqat kerakli bo‘lak yangilanadi |
| Server tayyor HTML yuboradi | Server ma’lumot (JSON) yuboradi |
| Holat yo‘qoladi | Holat brauzerda saqlanadi |
| Trafik katta | Trafik kam |

Nomida "XML" bo‘lsa-da, bugun deyarli har doim **JSON** ishlatiladi.

### 2.2. XMLHttpRequest va Fetch

\`\`\`js
// Eski usul
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/tasks");
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
  }
};
xhr.send();

// Zamonaviy usul
const data = await (await fetch("/api/tasks")).json();
\`\`\`

| Mezon | XMLHttpRequest | Fetch |
|---|---|---|
| API uslubi | callback | Promise |
| Kod hajmi | katta | ixcham |
| Bekor qilish | \`xhr.abort()\` | \`AbortController\` |
| Yuklanish progressi | bor | oqim orqali (murakkabroq) |
| Xato holati | \`status\` | \`response.ok\` ni **qo‘lda** tekshirish |

### 2.3. Asinxronlikni boshqarish

\`\`\`js
// Ketma-ket — ikkinchi so‘rov birinchisiga bog‘liq bo‘lsa
const user = await apiGet("/users/1");
const orders = await apiGet("/users/" + user.id + "/orders");

// Parallel — bir-biriga bog‘liq bo‘lmasa (2 barobar tez)
const [mahsulotlar, kategoriyalar] = await Promise.all([
  apiGet("/products"),
  apiGet("/categories"),
]);

// Biri yiqilsa ham qolganini olish
const natijalar = await Promise.allSettled([a(), b(), c()]);
\`\`\`

> Ketma-ket \`await\` — eng ko‘p uchraydigan samaradorlik xatosi. Bog‘liq bo‘lmagan so‘rovlarni **doim** \`Promise.all\` bilan yuboring.

### 2.4. Integratsiya arxitekturasi: server ↔ server

**SOA (Service-Oriented Architecture)** — korxona tizimlarini qayta ishlatiladigan xizmatlar sifatida qurish. Mikroservislar — uning "yengil" avlodi.

**ESB (Enterprise Service Bus)** — markazlashgan "shina": marshrutlash, format o‘girish, protokol adaptatsiyasi. Kamchiligi — markaziy nuqta ham "bo‘g‘iz", ham yagona nosozlik nuqtasi bo‘lib qoladi.

**API Gateway** — mijoz uchun yagona kirish nuqtasi:

| Vazifasi | Izoh |
|---|---|
| Marshrutlash | \`/orders\` → buyurtma xizmati |
| Autentifikatsiya | tokenni bir joyda tekshirish |
| Rate limiting | so‘rovlar sonini cheklash |
| Agregatsiya | bir nechta xizmat javobini birlashtirish |
| Kesh, log, monitoring | markazlashgan |

**Message Queue** — asinxron aloqa (RabbitMQ, Kafka, Redis Streams):

\`\`\`
Buyurtma xizmati ──► [ navbat ] ──► Email xizmati
                             └────► Statistika xizmati
\`\`\`

| Mezon | Sinxron (REST) | Asinxron (navbat) |
|---|---|---|
| Javob | darhol | keyinroq |
| Bog‘liqlik | qattiq (ikkalasi ishlashi shart) | bo‘sh (loose coupling) |
| Yuk cho‘qqisi | server yiqiladi | navbat "amortizator" |
| Murakkablik | past | yuqori |
| Qachon | foydalanuvchi javobni kutadi | email, hisobot, bildirishnoma |

**Kafolatlar:** xabar **kamida bir marta** yetkaziladi — demak, iste’molchi **idempotent** bo‘lishi shart (bir xil xabarni ikki marta qayta ishlasa ham natija bir xil).

### 2.5. Real vaqt aloqasi

| Texnologiya | Yo‘nalish | Qachon |
|---|---|---|
| Short polling | mijoz so‘raydi | sodda, kam yangilanish |
| Long polling | mijoz kutadi | eski brauzerlar |
| **SSE** | server → mijoz | yangiliklar lentasi, bildirishnoma |
| **WebSocket** | ikki tomonlama | chat, o‘yin, birgalikda tahrirlash |

\`\`\`js
const manba = new EventSource("/api/stream");
manba.onmessage = (e) => qoshish(JSON.parse(e.data));
\`\`\`

### 2.6. Barqarorlik naqshlari

- **Retry + exponential backoff** — xato bo‘lsa 1s, 2s, 4s kutib qayta urinish;
- **Timeout** — cheksiz kutish taqiqlanadi;
- **Circuit breaker** — xizmat yiqilgan bo‘lsa, so‘rov yubormay darhol xato qaytarish;
- **Bulkhead** — resurslarni ajratish, bir xizmat butun tizimni "yeb" qo‘ymasin.

## 3. Amaliy qism (20 daqiqa)

Onlayn do‘kon uchun "buyurtma qabul qilish" jarayonini chizing: qaysi qadam sinxron (narx hisoblash, to‘lov), qaysi biri asinxron (email, SMS, ombor bildirishnomasi) bo‘lishi kerak va nega?

## 4. Yakunlash (5 daqiqa)

- Nima uchun \`Promise.all\` ketma-ket \`await\` dan tez?
- WebSocket va SSE orasidan chat uchun qaysi biri va nega?`,
    assignments: `1. Bir xil vazifani XMLHttpRequest, \`fetch().then()\` va \`async/await\` bilan yozib, uch variantni qiyoslang.
2. Beshta bog‘liq bo‘lmagan so‘rovni ketma-ket va \`Promise.all\` bilan bajarib, umumiy vaqtni o‘lchang va natijani jadvalda ko‘rsating.
3. API Gateway ning 5 ta vazifasini tanlagan tizimingiz misolida tasvirlang (diagramma bilan).
4. Message Queue ishlatish maqsadga muvofiq bo‘lgan 3 ta stsenariy va mos kelmaydigan 2 ta stsenariy yozib, asoslang.`,
    resources: `- Gregor Hohpe, Bobby Woolf. *Enterprise Integration Patterns*. Addison-Wesley, 2003 — https://enterpriseintegrationpatterns.com
- Sam Newman. *Building Microservices*. 2-nashr, O’Reilly, 2021 — 4-bob (integratsiya)
- MDN. *Fetch API* va *Server-sent events* — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Martin Kleppmann. *Designing Data-Intensive Applications*. O’Reilly, 2017 — 11-bob (stream processing)
- Michael Nygard. *Release It!*. 2-nashr, Pragmatic Bookshelf, 2018 — barqarorlik naqshlari`,
  },
  {
    title: 'AJAX va real vaqt rejimida ma’lumot olish',
    week: 9,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Fetch API bilan sahifani yangilamasdan ma’lumot olish, avtomatik yangilanish (polling), Server-Sent Events va WebSocket yordamida real vaqt aloqasini qurish.',
    objectives: [
      'AJAX so‘rovlarini optimallashtirish (debounce, AbortController, kesh)',
      'Polling bilan avtomatik yangilanadigan ro‘yxat qurish',
      'SSE orqali serverdan oqim qabul qilish',
      'WebSocket bilan ikki tomonlama aloqa yozish',
      'Real vaqt ilovasida ulanish uzilishini boshqarish',
    ].join('\n'),
    keywords: 'fetch, debounce, AbortController, polling, EventSource, SSE, WebSocket, ws, reconnect, optimistic UI',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | AJAX qidiruv + debounce | 40 daq |
| 2 | Polling bilan avtomatik yangilanish | 35 daq |
| 3 | Server-Sent Events | 45 daq |
| 4 | WebSocket chat | 50 daq |
| 5 | Uzilishlarni boshqarish | 20 daq |

## 2. AJAX qidiruv: debounce va bekor qilish

\`\`\`js
let boshqaruvchi;
let taymer;

qidiruv.addEventListener("input", (e) => {
  clearTimeout(taymer);
  taymer = setTimeout(() => izla(e.target.value), 350);
});

async function izla(q) {
  boshqaruvchi?.abort();                  // eski so‘rovni bekor qilamiz
  boshqaruvchi = new AbortController();
  holat.textContent = "Qidirilmoqda…";
  try {
    const javob = await fetch("/api/products?q=" + encodeURIComponent(q), {
      signal: boshqaruvchi.signal,
    });
    if (!javob.ok) throw new Error("Status " + javob.status);
    chizish((await javob.json()).data);
    holat.textContent = "";
  } catch (e) {
    if (e.name === "AbortError") return;   // bu xato emas
    holat.textContent = "Xatolik: " + e.message;
  }
}
\`\`\`

> \`encodeURIComponent\` — foydalanuvchi kiritgan matnni URL ga qo‘yishdan oldin **majburiy**.

## 3. Polling — sodda avtomatik yangilanish

\`\`\`js
let oxirgiId = 0;

async function yangilanishniTekshir() {
  const javob = await fetch("/api/messages?since=" + oxirgiId);
  const { data } = await javob.json();
  if (data.length) {
    data.forEach(qoshish);
    oxirgiId = data.at(-1).id;
  }
}

let interval = setInterval(yangilanishniTekshir, 5000);

// Sahifa ko‘rinmasa — so‘rov yubormaymiz (batareya va trafikni tejaydi)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(interval);
  else interval = setInterval(yangilanishniTekshir, 5000);
});
\`\`\`

## 4. Server-Sent Events (SSE)

Server tomoni:

\`\`\`js
app.get("/api/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const timer = setInterval(() => {
    res.write("data: " + JSON.stringify({ vaqt: Date.now(), narx: narxOl() }) + "\\n\\n");
  }, 2000);

  req.on("close", () => clearInterval(timer));   // ulanish uzilsa tozalash
});
\`\`\`

Mijoz tomoni:

\`\`\`js
const manba = new EventSource("/api/stream");
manba.onmessage = (e) => yangila(JSON.parse(e.data));
manba.onerror = () => holat.textContent = "Ulanish uzildi, qayta ulanmoqda…";
\`\`\`

> \`EventSource\` uzilganda **o‘zi qayta ulanadi** — bu SSE ning katta qulayligi.

## 5. WebSocket chat

\`\`\`bash
npm i ws
\`\`\`

\`\`\`js
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 4001 });

wss.on("connection", (soket) => {
  soket.on("message", (xom) => {
    const xabar = JSON.parse(xom);
    const paket = JSON.stringify({ ...xabar, vaqt: Date.now() });
    wss.clients.forEach((c) => c.readyState === 1 && c.send(paket));  // broadcast
  });
});
\`\`\`

\`\`\`js
const soket = new WebSocket("ws://localhost:4001");
soket.onopen    = () => holat.textContent = "Ulandi";
soket.onmessage = (e) => chiqar(JSON.parse(e.data));
soket.onclose   = () => setTimeout(qaytaUlan, 2000);   // qayta ulanish

forma.addEventListener("submit", (e) => {
  e.preventDefault();
  soket.send(JSON.stringify({ ism, matn: input.value }));
  input.value = "";
});
\`\`\`

## 6. Texnologiyani tanlash

| Vazifa | To‘g‘ri tanlov |
|---|---|
| Qidiruvda takliflar | AJAX + debounce |
| Har 30 soniyada statistika | polling |
| Kurs/narx lentasi | SSE |
| Chat, birgalikda tahrirlash, o‘yin | WebSocket |
| Fayl yuklash progressi | XHR yoki oqim |

## 7. Sinfdagi asosiy topshiriq

**"Real vaqt boshqaruv paneli":**

1. jonli qidiruv (debounce + AbortController);
2. har 10 soniyada yangilanadigan statistika kartalari (polling, sahifa yashiringanda to‘xtaydi);
3. SSE orqali kelayotgan hodisalar lentasi (oxirgi 20 ta);
4. WebSocket chat (ism, xabar, vaqt);
5. ulanish holati indikatori: "Ulangan / Uzildi / Qayta ulanmoqda";
6. server o‘chirilganda ilova "qulamasin", xabar bersin.

## 8. Tekshirish ro‘yxati

- [ ] Har harfda so‘rov ketmaydi (debounce)
- [ ] Eskirgan so‘rovlar bekor qilinadi
- [ ] Sahifa yashiringanda polling to‘xtaydi
- [ ] \`clearInterval\` / \`close()\` chaqiriladi (xotira sizishi yo‘q)
- [ ] Uzilishdan keyin avtomatik qayta ulanish bor

## 9. Tipik xatolar

| Xato | Sabab |
|---|---|
| Server "sekinlashdi" | polling intervali juda kichik |
| Eski natija yangisini almashtiradi | \`AbortController\` yo‘q (race condition) |
| SSE ishlamaydi | \`Content-Type: text/event-stream\` yoki \`\\n\\n\` yo‘q |
| WebSocket ulanmaydi | HTTPS sahifada \`ws://\` ishlatilgan — \`wss://\` kerak |
| Xotira to‘lib boradi | interval va tinglovchilar tozalanmagan |`,
    assignments: `1. Chatga "foydalanuvchi yozmoqda…" indikatorini qo‘shing (WebSocket orqali).
2. Polling, SSE va WebSocket variantlarini bitta vazifada solishtiring: 5 daqiqada nechta so‘rov va qancha trafik ketganini o‘lchang.
3. Qayta ulanishni exponential backoff bilan amalga oshiring (1s, 2s, 4s, 8s, maksimum 30s).
4. Optimistic UI qo‘shing: xabar serverga yetmasdan oldin ro‘yxatda "kulrang" holatda ko‘rinsin, tasdiqlangach oddiy holatga o‘tsin, xato bo‘lsa "qayta yuborish" tugmasi chiqsin.`,
    resources: `- MDN. *Using server-sent events* — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
- MDN. *The WebSocket API* — https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- javascript.info — *Network requests* (Fetch, AbortController, WebSocket) — https://javascript.info/network
- \`ws\` kutubxonasi hujjati — https://github.com/websockets/ws
- Ilya Grigorik. *High Performance Browser Networking* — 15–17-boblar — https://hpbn.co`,
  },
  {
    title: 'Mustaqil ish: AJAX va real vaqt rejimida ma’lumot olish',
    week: 9,
    lesson_type: 'independent',
    hours: 18,
    summary:
      'Asinxron so‘rovlar, real vaqt texnologiyalari va ularning samaradorligini mustaqil o‘rganish; to‘liq real vaqt ilovasini loyihalash va o‘lchovlar bilan asoslash.',
    objectives: [
      'Polling, SSE va WebSocket ni amalda qiyoslash va o‘lchash',
      'Asinxron kodni to‘g‘ri tashkil qilish (parallel/ketma-ket)',
      'Real vaqt ilovasida uzilish va qayta ulanishni boshqarish',
      'Natijalarni o‘lchovlar bilan asoslangan hisobotda taqdim etish',
    ].join('\n'),
    keywords: 'AJAX, polling, SSE, WebSocket, Promise.all, AbortController, backoff, o‘lchov, trafik, latency',
    content: `## 1. Maqsad va hajm

**18 soat** — kursning eng katta mustaqil ishi. Talaba real vaqt texnologiyasini shunchaki "ishlatib ko‘rish" emas, **o‘lchab, taqqoslab, asoslab** tanlasin.

## 2. Bosqichlar

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | Nazariy tahlil | 3 | \`1-tahlil.md\` |
| 2 | Uch texnologiyani amalda sinash | 5 | 3 ta prototip |
| 3 | O‘lchov va taqqoslash | 3 | \`3-olchovlar.md\` |
| 4 | Yakuniy real vaqt ilovasi | 5 | Ishlaydigan loyiha |
| 5 | Hisobot va taqdimot | 2 | \`README.md\` + slaydlar |

## 3. 1-bosqich: Nazariy tahlil

Yoriting: AJAX tarixi va ahamiyati; XHR va Fetch farqi; event loop, microtask va macrotask; \`Promise.all\`, \`allSettled\`, \`race\`, \`any\` farqi; polling/long polling/SSE/WebSocket/WebRTC qiyosi.

## 4. 2-bosqich: Uch prototip

Bitta vazifani (masalan, jonli narx taxtasi) uch usulda yozing:

1. **Polling** — har 3 soniyada \`GET /api/prices\`;
2. **SSE** — \`GET /api/prices/stream\`;
3. **WebSocket** — ikki tomonlama, mijoz obuna bo‘ladigan simvollarni tanlaydi.

Uchalasi bir xil interfeysga ega bo‘lsin — faqat transport farq qilsin.

## 5. 3-bosqich: O‘lchovlar

5 daqiqalik sinov davomida DevTools → Network orqali o‘lchang:

| Mezon | Polling | SSE | WebSocket |
|---|---|---|---|
| So‘rovlar soni | | | |
| Umumiy trafik (KB) | | | |
| O‘rtacha kechikish (ms) | | | |
| Server CPU/xotira | | | |
| Kod murakkabligi (qator) | | | |
| Uzilishdan tiklanish | | | |

Xulosa: **qaysi holatda qaysi biri** — asoslangan tavsiya yozing.

## 6. 4-bosqich: Yakuniy ilova

Mavzu variantlari: jonli auksion, guruh chati, hamkorlikdagi to‘do-taxta, jonli so‘rovnoma (poll), monitoring paneli.

Majburiy talablar:

- backend (Node.js/Express) + real vaqt kanali;
- kamida 2 ta foydalanuvchi bir vaqtda ishlay olsin;
- ulanish holati ko‘rsatiladi, uzilganda **exponential backoff** bilan qayta ulanadi;
- xabarlar bazada saqlanadi (yangi kirgan oxirgi 50 tasini ko‘radi);
- optimistic UI;
- so‘rovlar debounce/throttle bilan optimallashtirilgan;
- \`README.md\` — ishga tushirish va arxitektura tavsifi.

## 7. Topshirish shakli

\`\`\`
mustaqil-4/
├── 1-tahlil.md
├── 2-prototiplar/  (polling/ sse/ websocket/)
├── 3-olchovlar.md  (jadval + skrinshotlar)
├── 4-ilova/        (server/ client/ README.md)
└── 5-taqdimot.pdf
\`\`\`

## 8. Baholash mezonlari

| Mezon | Ball |
|---|---|
| Nazariy tahlil to‘liq va aniq | 15 |
| Uchala prototip ishlaydi | 20 |
| O‘lchovlar real va to‘g‘ri talqin qilingan | 20 |
| Yakuniy ilova barcha talablarga javob beradi | 30 |
| Hisobot va taqdimot sifati | 15 |
| **Jami** | **100** |`,
    assignments: `1. Asinxron JavaScript va real vaqt texnologiyalari bo‘yicha nazariy tahlil yozing.
2. Bitta vazifani polling, SSE va WebSocket bilan uch marta amalga oshiring.
3. Uch variantni belgilangan mezonlar bo‘yicha o‘lchab, taqqoslash jadvalini va asoslangan tavsiyani tayyorlang.
4. Tanlangan texnologiyada to‘liq real vaqt ilovasini yozing va uni taqdimot bilan himoya qiling.`,
    resources: `- MDN. *Asynchronous JavaScript* — https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous
- MDN. *WebSockets API* / *Server-sent events*
- javascript.info — *Promises, async/await* — https://javascript.info/async
- Ilya Grigorik. *High Performance Browser Networking* — https://hpbn.co
- Jake Archibald. *In The Loop* (event loop tushuntirishi) — https://www.youtube.com/watch?v=cCOL7MC4Pl0`,
  },

  // ─────────────────────────── 10-hafta ───────────────────────────
  {
    title: 'Bulutli arxitekturalar va web-xizmatlar (Cloud Computing)',
    week: 10,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Bulutli hisoblash tushunchasi, SaaS, PaaS, IaaS xizmat modellari, joylashtirish modellari hamda AWS, Azure va Google Cloud platformalarining asosiy xususiyatlari.',
    objectives: [
      'Bulutli hisoblashning 5 ta asosiy xususiyatini (NIST) sanash',
      'IaaS, PaaS, SaaS va FaaS mas’uliyat chegaralarini ajratish',
      'Joylashtirish modellarini (public, private, hybrid) qiyoslash',
      'Konteynerizatsiya va orkestratsiya o‘rnini tushuntirish',
      'Bulut xarajatlarini baholash va optimallashtirish yo‘llarini bilish',
    ].join('\n'),
    keywords:
      'cloud computing, NIST, IaaS, PaaS, SaaS, FaaS, serverless, AWS, Azure, GCP, Docker, Kubernetes, CDN, auto-scaling, SLA, vendor lock-in',
    content: `## 1. Darsning maqsadi

Talaba bulutni "boshqa birovning kompyuteri" degan hazildan nariga o‘tib, **mas’uliyat chegaralari** va **xarajat modeli** nuqtai nazaridan tushunsin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Ta’rif va asosiy xususiyatlar (NIST SP 800-145)

1. **On-demand self-service** — resurs o‘zing so‘raganda, odamsiz beriladi.
2. **Broad network access** — tarmoq orqali, har qanday qurilmadan.
3. **Resource pooling** — resurslar umumiy hovuzdan taqsimlanadi.
4. **Rapid elasticity** — yuk oshsa kengayadi, tushsa qisqaradi.
5. **Measured service** — iste’mol o‘lchanadi va shunga qarab to‘lanadi.

### 2.2. Xizmat modellari va mas’uliyat

| Qatlam | On-premise | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Ilova | siz | siz | siz | provayder |
| Ma’lumot | siz | siz | siz | provayder |
| Runtime | siz | siz | provayder | provayder |
| OS | siz | siz | provayder | provayder |
| Virtualizatsiya | siz | provayder | provayder | provayder |
| Serverlar, tarmoq | siz | provayder | provayder | provayder |

**Analogiya:** IaaS — bo‘sh kvartira; PaaS — jihozlangan kvartira; SaaS — mehmonxona xonasi.

| Model | Misol | Qachon |
|---|---|---|
| IaaS | AWS EC2, DigitalOcean Droplet | to‘liq nazorat kerak |
| PaaS | Heroku, Render, App Engine | tez deploy, kam DevOps |
| SaaS | Gmail, Figma, Notion | tayyor mahsulot |
| FaaS | AWS Lambda, Cloud Functions | kamdan-kam ishlaydigan vazifa |

> **Shared responsibility model:** bulutda ham xavfsizlik bo‘lingan. Provayder — infratuzilma **ning** xavfsizligi; siz — infratuzilma **dagi** xavfsizlik (sozlama, ruxsat, ma’lumot).

### 2.3. Joylashtirish modellari

| Model | Xususiyati | Qachon |
|---|---|---|
| Public | umumiy infratuzilma | startap, o‘zgaruvchan yuk |
| Private | faqat bitta tashkilot uchun | bank, davlat, qat’iy talablar |
| Hybrid | ikkalasi birga | maxfiy ma’lumot ichkarida, front tashqarida |
| Multi-cloud | bir nechta provayder | lock-in dan qochish |

### 2.4. Asosiy platformalar va xizmatlar

| Ehtiyoj | AWS | Azure | Google Cloud |
|---|---|---|---|
| Virtual server | EC2 | Virtual Machines | Compute Engine |
| Obyekt xotirasi | S3 | Blob Storage | Cloud Storage |
| Boshqariladigan SQL | RDS | SQL Database | Cloud SQL |
| Funksiyalar | Lambda | Functions | Cloud Functions |
| Konteyner | ECS/EKS | AKS | GKE |
| CDN | CloudFront | Front Door | Cloud CDN |

Talabalar uchun soddaroq: **Vercel** va **Netlify** (frontend), **Render** va **Railway** (backend + baza), **Neon**/**Supabase** (PostgreSQL).

### 2.5. Konteynerizatsiya va orkestratsiya

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "dist/index.js"]
\`\`\`

- **Docker** — ilovani barcha bog‘liqliklari bilan yagona obrazga joylaydi: "mening mashinamda ishlaydi" muammosi yo‘qoladi.
- **Kubernetes** — ko‘p konteynerni boshqaradi: miqyoslash, yiqilganini qayta ko‘tarish, yangilanishni bosqichma-bosqich chiqarish.

### 2.6. Miqyoslash va yuk taqsimoti

| Usul | Mazmuni |
|---|---|
| Vertikal | serverga ko‘proq CPU/RAM (chegarasi bor) |
| Gorizontal | server sonini ko‘paytirish (bulutda asosiy usul) |
| Auto-scaling | yukga qarab avtomatik |
| Load balancer | so‘rovlarni taqsimlash |
| CDN | statik fayllarni foydalanuvchiga yaqin joydan berish |

Gorizontal miqyoslash uchun ilova **stateless** bo‘lishi shart: sessiya serverning xotirasida emas, Redis/JWT da bo‘ladi.

### 2.7. Xarajat va SLA

- **Pay-as-you-go**: hisob-kitob soat/so‘rov/GB bo‘yicha.
- Eng ko‘p uchraydigan ortiqcha xarajat: unutilgan test serverlari, chiquvchi trafik (egress), kattalashtirilgan baza.
- **SLA:** 99.9% — oyiga ~43 daqiqa, 99.99% — ~4 daqiqa uzilish.
- **Vendor lock-in:** provayderning maxsus xizmatlariga qanchalik bog‘lansangiz, ko‘chish shunchalik qimmat.

## 3. Amaliy qism (20 daqiqa)

Talabalar 4 guruhga bo‘linadi va bitta ilova (universitet portali, 5000 foydalanuvchi) uchun joylashtirish variantini taklif qiladi: (1) o‘z serveri, (2) IaaS, (3) PaaS, (4) serverless. Har biri xarajat, murakkablik va miqyoslash bo‘yicha himoya qiladi.

## 4. Yakunlash (5 daqiqa)

- PaaS da siz nimaga javobgarsiz?
- Serverless har doim arzonmi? (*Yo‘q: doimiy yuqori yukda qimmatlashadi.*)`,
    assignments: `1. IaaS, PaaS, SaaS va FaaS ni 8 ta mezon bo‘yicha qiyoslovchi jadval tuzing va har biriga real misol keltiring.
2. Kichik web-ilova uchun oylik bulut xarajatini uch platformada hisoblang (kalkulyatorlardan foydalaning) va natijani solishtiring.
3. O‘z Node.js ilovangiz uchun \`Dockerfile\` va \`docker-compose.yml\` (ilova + PostgreSQL) yozing.
4. Vendor lock-in xavfini kamaytirishning 5 ta amaliy usulini yozib, har birining narxini baholang.`,
    resources: `- NIST SP 800-145. *The NIST Definition of Cloud Computing* — https://csrc.nist.gov/publications/detail/sp/800-145/final
- Thomas Erl. *Cloud Computing: Concepts, Technology & Architecture*. Prentice Hall, 2013
- AWS Well-Architected Framework — https://aws.amazon.com/architecture/well-architected/
- Docker rasmiy hujjati — https://docs.docker.com/get-started/
- Kubernetes — *Concepts* — https://kubernetes.io/docs/concepts/`,
  },
  {
    title: 'Bulutli platformalarda web ilovalarni joylashtirish',
    week: 10,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Heroku, Netlify, Vercel va shunga o‘xshash platformalar bilan ishlash, CI/CD asoslari, muhit o‘zgaruvchilari va domen sozlash.',
    objectives: [
      'Frontendni statik hosting platformasida joylashtirish',
      'Backend va bazani bulut platformasida ishga tushirish',
      'Muhit o‘zgaruvchilarini xavfsiz sozlash',
      'GitHub Actions bilan CI/CD quvuri yaratish',
      'Deploy’dan keyingi nosozliklarni loglar orqali topish',
    ].join('\n'),
    keywords: 'deploy, Vercel, Netlify, Render, Railway, build, environment variables, CI/CD, GitHub Actions, domen, HTTPS, loglar',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Loyihani deploy’ga tayyorlash | 35 daq |
| 2 | Frontend deploy | 35 daq |
| 3 | Backend + baza deploy | 50 daq |
| 4 | CI/CD quvuri | 40 daq |
| 5 | Domen, HTTPS, monitoring | 20 daq |

## 2. Deploy’ga tayyorgarlik

**Tekshiruv ro‘yxati:**

- [ ] Kod GitHub repozitoriyasida
- [ ] \`.gitignore\` da: \`node_modules\`, \`.env\`, \`dist\`
- [ ] \`.env.example\` bor (maxfiy qiymatlarsiz)
- [ ] \`package.json\` da \`build\` va \`start\` skriptlari
- [ ] Port muhit o‘zgaruvchisidan olinadi: \`process.env.PORT\`
- [ ] API manzili kodga qattiq yozilmagan
- [ ] \`README.md\` — ishga tushirish yo‘riqnomasi

\`\`\`js
const PORT = process.env.PORT || 4000;
app.listen(PORT);                          // bulut portni O‘ZI beradi
\`\`\`

> ⚠️ Portni qattiq yozib qo‘ysangiz, platforma ilovani "o‘lik" deb hisoblaydi va deploy muvaffaqiyatsiz tugaydi.

## 3. Frontend deploy (Vercel / Netlify)

\`\`\`bash
npm i -g vercel
vercel          # sinov (preview) deploy
vercel --prod   # ishlab chiqarish
\`\`\`

Yoki GitHub orqali: repozitoriyni ulash → **Build command** \`npm run build\`, **Output directory** \`dist\` → Deploy.

Muhit o‘zgaruvchisi paneldan qo‘shiladi:

\`\`\`
VITE_API_URL=https://mening-api.onrender.com
\`\`\`

> Vite’da faqat \`VITE_\` bilan boshlangan o‘zgaruvchilar brauzerga tushadi — **maxfiy kalitni u yerga yozmang**, u bundle ichida ochiq ko‘rinadi.

## 4. Backend va baza deploy (Render / Railway)

1. **PostgreSQL** xizmatini yarating → \`DATABASE_URL\` ni nusxalang.
2. **Web Service** yarating: repozitoriy, \`Build: npm ci && npm run build\`, \`Start: npm start\`.
3. Muhit o‘zgaruvchilari: \`DATABASE_URL\`, \`JWT_SECRET\`, \`CLIENT_ORIGIN\`, \`NODE_ENV=production\`.
4. Migratsiyani ishga tushiring (\`npm run db:migrate\`).
5. \`CLIENT_ORIGIN\` ga frontend domenini qo‘shing — aks holda CORS bloklaydi.

\`\`\`js
// Bulut bazalari ko‘pincha SSL talab qiladi
new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
\`\`\`

## 5. CI/CD quvuri

\`\`\`yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build
\`\`\`

**CI/CD nima beradi:**

| Bosqich | Mazmuni |
|---|---|
| Continuous Integration | har push’da avtomatik build va test |
| Continuous Delivery | har doim deploy’ga tayyor artefakt |
| Continuous Deployment | \`main\` ga tushgan kod avtomatik prod’ga chiqadi |

Amaliy qoida: \`main\` himoyalangan bo‘lsin, o‘zgarish faqat Pull Request orqali kirsin, CI yashil bo‘lmasa merge qilinmasin.

## 6. Domen, HTTPS, monitoring

- Platforma bepul subdomen beradi (\`loyiha.vercel.app\`); o‘z domeningizni **CNAME** yozuvi orqali ulaysiz.
- HTTPS sertifikati (Let's Encrypt) avtomatik chiqariladi va yangilanadi.
- Loglar: platforma panelidagi **Logs** bo‘limi — deploy xatolari shu yerda ko‘rinadi.
- Uptime monitoring: UptimeRobot yoki platforma health-check (\`/api/health\`).

## 7. Sinfdagi asosiy topshiriq

O‘zingizning 7-hafta loyihangizni (frontend + backend + baza) **to‘liq internetga chiqaring**:

1. backend — Render/Railway, baza bilan ulangan;
2. frontend — Vercel/Netlify, \`VITE_API_URL\` bulut API ga qaragan;
3. CORS to‘g‘ri sozlangan;
4. CI ishlaydi (build + test);
5. \`README.md\` da **jonli havola** va ishga tushirish yo‘riqnomasi;
6. \`/api/health\` endpointi 200 qaytaradi.

## 8. Tipik deploy xatolari

| Xato | Sabab / yechim |
|---|---|
| \`Application failed to respond\` | \`process.env.PORT\` ishlatilmagan |
| Build muvaffaqiyatli, sahifa oq | \`dist\` papkasi noto‘g‘ri, yoki SPA fallback sozlanmagan |
| CORS xatosi | \`CLIENT_ORIGIN\` ga prod domen qo‘shilmagan |
| \`ECONNREFUSED\` bazaga | \`DATABASE_URL\` noto‘g‘ri yoki SSL talab qilinadi |
| Lokalda ishlaydi, prodda yo‘q | \`devDependencies\` ga bog‘liqlik (\`npm ci --omit=dev\`) |
| Kalit git ga tushib ketdi | \`.env\` \`.gitignore\` da emas → **kalitni darhol almashtiring** |`,
    assignments: `1. Ilovangizni ikki xil platformada joylashtiring va deploy vaqti, sozlash qulayligi, cheklovlar bo‘yicha taqqoslang.
2. CI quvurini kengaytiring: lint, test, build bosqichlari va \`main\` ga merge bo‘lganda avtomatik deploy.
3. Loyihangizga \`Dockerfile\` yozib, konteyner ko‘rinishida joylashtiring.
4. Deploy jarayonida uchragan har bir xatoni "xato → sabab → yechim" jadvalida hujjatlang.`,
    resources: `- Vercel Documentation — https://vercel.com/docs
- Netlify Docs — https://docs.netlify.com
- Render Docs — *Deploy a Node service / PostgreSQL* — https://render.com/docs
- GitHub Actions hujjati — https://docs.github.com/en/actions
- Jez Humble, David Farley. *Continuous Delivery*. Addison-Wesley, 2010`,
  },
  {
    title: 'Mustaqil ish: Bulutli platformalarda web ilovalarni joylashtirish',
    week: 10,
    lesson_type: 'independent',
    hours: 12,
    summary:
      'Bulut xizmat modellarini mustaqil o‘rganish, ilovani konteynerlash, CI/CD quvurini qurish va deploy xarajatlarini baholash.',
    objectives: [
      'Bulut platformalarini mezonlar bo‘yicha qiyoslash',
      'Ilovani Docker konteyneriga joylash',
      'To‘liq CI/CD quvurini sozlash',
      'Deploy xarajati va monitoringni rejalashtirish',
    ].join('\n'),
    keywords: 'cloud, Docker, docker-compose, CI/CD, GitHub Actions, monitoring, xarajat, health check, rollback',
    content: `## 1. Maqsad va hajm

**12 soat.** Talaba o‘z ilovasini "lokalda ishlayapti" holatidan **internetda barqaror ishlaydigan xizmat** holatiga olib chiqsin.

## 2. Bosqichlar

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | Platformalarni qiyoslash | 2 | \`1-platformalar.md\` |
| 2 | Konteynerlash | 3 | \`Dockerfile\`, \`docker-compose.yml\` |
| 3 | CI/CD quvuri | 3 | \`.github/workflows/\` |
| 4 | Deploy va monitoring | 3 | Jonli havola |
| 5 | Xarajat tahlili | 1 | \`5-xarajat.md\` |

## 3. 1-bosqich: Platformalar qiyosi

Kamida 4 ta platformani (Vercel, Netlify, Render, Railway, Fly.io, AWS Amplify) shu mezonlar bo‘yicha solishtiring: bepul limit, qo‘llab-quvvatlanadigan til, baza mavjudligi, deploy tezligi, log va monitoring, maxsus domen, "sovuq start" muammosi, narx (100 000 so‘rov/oy).

## 4. 2-bosqich: Konteynerlash

\`\`\`dockerfile
# Ko‘p bosqichli build — obraz hajmi keskin kichrayadi
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
HEALTHCHECK CMD wget -qO- http://localhost:4000/api/health || exit 1
CMD ["node", "dist/index.js"]
\`\`\`

\`docker-compose.yml\` da ilova + PostgreSQL birga ko‘tarilsin. Obraz hajmini oddiy va ko‘p bosqichli build’da o‘lchab, farqni yozing.

## 5. 3-bosqich: CI/CD

Quvur bosqichlari: \`checkout → install → lint → test → build → docker build → deploy\`.

Talablar: sirlar (\`secrets\`) GitHub Secrets’da saqlanadi; PR da faqat tekshiruv, \`main\` da deploy; muvaffaqiyatsiz bo‘lsa bildirishnoma; **rollback** rejasi tavsiflangan.

## 6. 4-bosqich: Deploy va monitoring

- Ilova jonli havolada ishlaydi (frontend + backend + baza);
- \`/api/health\` health-check sozlangan;
- uptime monitoring ulangan (masalan, UptimeRobot);
- loglar ko‘rinadi, xatoliklar kuzatiladi;
- maxsus domen (imkoni bo‘lsa) va HTTPS.

## 7. 5-bosqich: Xarajat

| Stsenariy | Foydalanuvchi | Oylik so‘rov | Taxminiy narx |
|---|---|---|---|
| Talaba loyihasi | 100 | 50 000 | ? |
| Kichik biznes | 5 000 | 2 mln | ? |
| O‘rta xizmat | 50 000 | 30 mln | ? |

Xarajatni kamaytirishning 5 ta usulini (kesh, CDN, obraz hajmi, avtomatik o‘chirish, to‘g‘ri instans hajmi) yozing.

## 8. Topshirish shakli

\`\`\`
mustaqil-5/
├── 1-platformalar.md
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
├── 4-deploy.md   (havola + skrinshotlar)
└── 5-xarajat.md
\`\`\`

## 9. Baholash mezonlari

| Mezon | Ball |
|---|---|
| Platformalar tahlili asosli | 15 |
| Docker obraz ishlaydi va optimallashtirilgan | 25 |
| CI/CD quvuri to‘liq ishlaydi | 25 |
| Ilova jonli havolada barqaror ishlaydi | 25 |
| Xarajat tahlili real | 10 |
| **Jami** | **100** |`,
    assignments: `1. To‘rtta bulut platformasini belgilangan mezonlar bo‘yicha qiyoslab, o‘z loyihangiz uchun asoslangan tanlov qiling.
2. Ko‘p bosqichli \`Dockerfile\` va \`docker-compose.yml\` yozing; obraz hajmini optimallashtirishdan oldin va keyin o‘lchang.
3. To‘liq CI/CD quvurini sozlang va uning ishlaganini skrinshotlar bilan hujjatlang.
4. Ilovani joylashtiring, monitoring ulang va oylik xarajat hisob-kitobini tayyorlang.`,
    resources: `- Docker Docs. *Best practices for writing Dockerfiles* — https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- GitHub Actions — *Workflow syntax* — https://docs.github.com/en/actions/using-workflows
- Render / Railway / Fly.io rasmiy hujjatlari
- Jez Humble, David Farley. *Continuous Delivery*. Addison-Wesley, 2010
- Google. *Site Reliability Engineering* — https://sre.google/books/`,
  },

  // ─────────────────────────── 11-hafta ───────────────────────────
  {
    title: 'Xavfsizlik arxitekturasi va autentifikatsiya usullari',
    week: 11,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Web-ilovalarda xavfsizlik muammolari, HTTPS, SSL/TLS, autentifikatsiya va avtorizatsiya usullari (JWT, OAuth 2.0) hamda xavfsizlik arxitekturasi elementlari.',
    objectives: [
      'Autentifikatsiya va avtorizatsiyani aniq farqlash',
      'HTTPS va TLS handshake jarayonini izohlash',
      'Parollarni to‘g‘ri saqlash usulini qo‘llash',
      'Sessiya va JWT yondashuvlarini qiyoslash',
      'OAuth 2.0 va OpenID Connect rollarini va oqimlarini tushuntirish',
    ].join('\n'),
    keywords:
      'autentifikatsiya, avtorizatsiya, HTTPS, TLS, sertifikat, bcrypt, salt, sessiya, cookie, JWT, refresh token, OAuth 2.0, OIDC, RBAC, MFA, HSTS',
    content: `## 1. Darsning maqsadi

Talaba "kim bu?" va "nimaga ruxsati bor?" savollarini ajrata olsin, parolni to‘g‘ri saqlasin va tokenni qayerda saqlash kerakligini asoslab tanlasin.

## 2. Nazariy qism (55 daqiqa)

### 2.1. Ikki tushuncha

| Savol | Atama | Misol |
|---|---|---|
| Sen kimsan? | **Autentifikatsiya** (AuthN) | login + parol, SMS kod |
| Senga nima mumkin? | **Avtorizatsiya** (AuthZ) | admin o‘chira oladi, oddiy foydalanuvchi yo‘q |

Status kodlar: \`401\` — kimligingiz noma’lum; \`403\` — ma’lum, lekin ruxsat yo‘q.

### 2.2. HTTPS va TLS

HTTPS = HTTP + TLS. U uchta narsani beradi: **maxfiylik** (shifrlash), **yaxlitlik** (o‘zgartirilmaganlik), **autentiklik** (sayt haqiqiyligi).

TLS handshake (soddalashtirilgan):

1. Mijoz \`ClientHello\` — qo‘llab-quvvatlanadigan shifr to‘plamlari;
2. Server \`ServerHello\` + **sertifikat** (ochiq kalit, CA imzosi);
3. Mijoz sertifikatni ishonchli CA zanjiri bo‘yicha tekshiradi;
4. Kalit almashinuvi (ECDHE) → umumiy **sessiya kaliti**;
5. Keyingi trafik simmetrik shifrlanadi (tez).

> Asimmetrik kriptografiya faqat kalit kelishishda ishlatiladi; ma’lumotning o‘zi simmetrik kalit bilan shifrlanadi — chunki u ancha tez.

Amaliy talablar: TLS 1.2/1.3 (eskilari o‘chirilgan), HTTP → HTTPS redirect, **HSTS** sarlavhasi, sertifikat avtomatik yangilanishi (Let's Encrypt), Mixed content bo‘lmasligi.

### 2.3. Parollarni saqlash

\`\`\`js
import bcrypt from "bcryptjs";

const hash = await bcrypt.hash(parol, 12);       // ro‘yxatdan o‘tishda
const togri = await bcrypt.compare(parol, hash); // kirishda
\`\`\`

| ❌ Hech qachon | ✅ To‘g‘ri |
|---|---|
| Ochiq matnda saqlash | bcrypt / argon2 / scrypt |
| MD5, SHA-1, SHA-256 (tez) | ataylab sekin algoritm |
| Umumiy "salt" | har parolga alohida salt (avtomatik) |
| Parolni emailga yuborish | tiklash havolasi (muddatli, bir martalik) |

**Nega tez xesh yomon?** Zamonaviy GPU SHA-256 ni sekundiga milliardlab hisoblaydi; bcrypt esa ataylab sekin (cost parametri bilan sozlanadi).

### 2.4. Sessiya va JWT

**Sessiya (stateful):** server sessiyani saqlaydi, brauzerga faqat sessiya identifikatori cookie sifatida beriladi.

**JWT (stateless):** token o‘zida ma’lumotni saqlaydi va imzolanadi.

\`\`\`
header.payload.signature
{"alg":"HS256"} . {"sub":"42","role":"admin","exp":1767225600} . <imzo>
\`\`\`

> ⚠️ JWT ning payload qismi **shifrlanmagan** — u shunchaki base64. Unga parol, karta raqami yoki shaxsiy ma’lumot yozmang. Imzo faqat **o‘zgartirilmaganlikni** kafolatlaydi.

| Mezon | Sessiya | JWT |
|---|---|---|
| Server holati | saqlaydi | saqlamaydi |
| Bekor qilish | oson (o‘chirdingiz — tamom) | qiyin (qora ro‘yxat kerak) |
| Miqyoslash | umumiy xotira kerak (Redis) | oson |
| Hajmi | kichik | kattaroq (har so‘rovda) |
| Mobil/SPA | cookie bilan | qulay |

**Amaliy naqsh:** qisqa umrli **access token** (10–15 daqiqa) + uzoq umrli **refresh token** (HttpOnly cookie da, aylantirib turiladi).

Tokenni qayerda saqlash kerak?

| Joy | XSS xavfi | CSRF xavfi | Tavsiya |
|---|---|---|---|
| \`localStorage\` | yuqori | yo‘q | oddiy loyihalarda ehtiyot bilan |
| \`HttpOnly\` cookie | yo‘q | bor → \`SameSite=Strict/Lax\` + CSRF token | ✅ afzal |

### 2.5. OAuth 2.0 va OpenID Connect

**OAuth 2.0 — avtorizatsiya delegatsiyasi protokoli** ("Google bilan kirish"da parolingiz ilovaga berilmaydi).

Rollar: **Resource Owner** (foydalanuvchi), **Client** (ilova), **Authorization Server** (Google), **Resource Server** (API).

Authorization Code oqimi + **PKCE**:

\`\`\`
1. Ilova → foydalanuvchini Google ga yuboradi (code_challenge bilan)
2. Foydalanuvchi Google’da tasdiqlaydi
3. Google → ilovaga qaytaradi: ?code=abc
4. Ilova → Google: code + code_verifier
5. Google → ilova: access_token (+ refresh_token, id_token)
6. Ilova → API: Authorization: Bearer <access_token>
\`\`\`

| Oqim | Qachon |
|---|---|
| Authorization Code + PKCE | web va mobil ilovalar ✅ |
| Client Credentials | server-server |
| Device Code | televizor, konsol |
| Implicit | **eskirgan**, ishlatilmaydi |

**OpenID Connect** — OAuth 2.0 ustiga qurilgan **autentifikatsiya** qatlami: \`id_token\` (JWT) foydalanuvchi kimligini bildiradi. Ya’ni OAuth "nimaga ruxsat", OIDC "kim" degan savolga javob beradi.

### 2.6. Avtorizatsiya modellari va qo‘shimcha himoya

- **RBAC** — rollarga asoslangan (\`admin\`, \`teacher\`, \`student\`);
- **ABAC** — atributlarga asoslangan (bo‘lim, vaqt, resurs egasi);
- **Eng kam imtiyoz** tamoyili: faqat zarur ruxsat beriladi;
- Ruxsat tekshiruvi **har doim serverda** (UI da tugmani yashirish — himoya emas);
- **MFA**, kirishga urinishlarni cheklash (rate limiting), shubhali kirish haqida xabar.

## 3. Amaliy qism (20 daqiqa)

Universitet portali uchun xavfsizlik arxitekturasini loyihalang: rollar (student, o‘qituvchi, admin), har rol uchun ruxsatlar matritsasi, token strategiyasi, parol siyosati va tiklash jarayoni.

## 4. Yakunlash (5 daqiqa)

- JWT payload ini o‘qish uchun kalit kerakmi? (*Yo‘q — u shifrlanmagan.*)
- Access token qisqa umrli bo‘lishining sababi nima?`,
    assignments: `1. JWT ni https://jwt.io da yasang, payload ini qo‘lda o‘zgartirib ko‘ring va nega imzo tekshiruvidan o‘tmasligini tushuntiring.
2. Express’da to‘liq autentifikatsiya oqimini yozing: ro‘yxatdan o‘tish (bcrypt), kirish (JWT), himoyalangan endpoint (\`middleware\`), chiqish.
3. OAuth 2.0 Authorization Code + PKCE oqimini ketma-ketlik diagrammasi ko‘rinishida chizing va har qadamda qanday hujum oldi olinishini izohlang.
4. Sessiya va JWT yondashuvlarini 8 ta mezon bo‘yicha qiyoslab, o‘z loyihangiz uchun asoslangan tanlov qiling.`,
    resources: `- RFC 6749 — *The OAuth 2.0 Authorization Framework* — https://datatracker.ietf.org/doc/html/rfc6749
- RFC 7519 — *JSON Web Token (JWT)* — https://datatracker.ietf.org/doc/html/rfc7519
- Justin Richer, Antonio Sanso. *OAuth 2 in Action*. Manning, 2017
- OWASP Cheat Sheets: *Authentication*, *Password Storage*, *JWT* — https://cheatsheetseries.owasp.org
- Ivan Ristić. *Bulletproof SSL and TLS*. Feisty Duck, 2014`,
  },
  {
    title: 'Veb ilovalarda xavfsizlik asoslari',
    week: 11,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Amaliy xavfsizlik: parol xeshlash, JWT autentifikatsiyasi, ruxsatlarni tekshirish, kiritishni validatsiya qilish va xavfsizlik sarlavhalarini sozlash.',
    objectives: [
      'bcrypt bilan parolni xavfsiz saqlash',
      'JWT chiqarish va tekshirish middleware’ini yozish',
      'Rolga asoslangan ruxsat nazoratini amalga oshirish',
      'Kiritishni server tomonida validatsiya qilish',
      'Xavfsizlik sarlavhalari va rate limiting ni sozlash',
    ].join('\n'),
    keywords: 'bcrypt, JWT, middleware, RBAC, zod, validatsiya, helmet, rate limit, HttpOnly cookie, .env, secret',
    content: `## 1. Mashg‘ulot rejasi (4 soat)

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Foydalanuvchilar jadvali, ro‘yxatdan o‘tish | 40 daq |
| 2 | Kirish va JWT | 40 daq |
| 3 | Himoya middleware va rollar | 45 daq |
| 4 | Validatsiya | 30 daq |
| 5 | Sarlavhalar, rate limit, audit | 25 daq |

## 2. Tayyorgarlik

\`\`\`bash
npm i bcryptjs jsonwebtoken zod helmet express-rate-limit
\`\`\`

\`\`\`
JWT_SECRET=uzun-tasodifiy-kalit-kamida-32-belgi
JWT_EXPIRES=15m
\`\`\`

\`\`\`bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
\`\`\`

> Kalit **kodda** emas, \`.env\` da; \`.env\` **git ga tushmaydi**.

## 3. Ro‘yxatdan o‘tish

\`\`\`sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
\`\`\`

\`\`\`js
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, password } = schema.parse(req.body);
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email, role",
      [email.toLowerCase(), hash],
    );
    res.status(201).json(rows[0]);          // hash QAYTARILMAYDI
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: { message: "Email band" } });
    next(e);
  }
});
\`\`\`

## 4. Kirish va token

\`\`\`js
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      String(email).toLowerCase(),
    ]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));

    if (!ok) {
      // Bir xil xabar: "email yo‘q" va "parol xato" farqlanmasin
      return res.status(401).json({ error: { message: "Email yoki parol noto‘g‘ri" } });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
\`\`\`

> **User enumeration:** xabarlar farq qilsa, hujumchi qaysi emaillar ro‘yxatdan o‘tganini aniqlab oladi.

## 5. Himoya middleware va rollar

\`\`\`js
export function auth(req, res, next) {
  const [turi, token] = (req.headers.authorization || "").split(" ");
  if (turi !== "Bearer" || !token) {
    return res.status(401).json({ error: { message: "Token yo‘q" } });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: { message: "Token yaroqsiz yoki muddati tugagan" } });
  }
}

export const rol = (...ruxsat) => (req, res, next) =>
  ruxsat.includes(req.user?.role)
    ? next()
    : res.status(403).json({ error: { message: "Ruxsat yo‘q" } });

app.get("/api/profile", auth, (req, res) => res.json({ id: req.user.sub }));
app.delete("/api/products/:id", auth, rol("admin"), ochirish);
\`\`\`

**Egalik tekshiruvi** (IDOR dan himoya):

\`\`\`js
const { rows } = await pool.query("SELECT user_id FROM notes WHERE id = $1", [id]);
if (!rows[0]) return res.status(404).json({ error: { message: "Topilmadi" } });
if (rows[0].user_id !== Number(req.user.sub) && req.user.role !== "admin") {
  return res.status(403).json({ error: { message: "Ruxsat yo‘q" } });
}
\`\`\`

> Bu tekshiruv unutilsa, \`/api/notes/2\` ni so‘rab, boshqa odamning yozuvini o‘qish mumkin bo‘ladi.

## 6. Validatsiya

\`\`\`js
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["user", "admin"]).optional(),
});

const natija = schema.safeParse(req.body);
if (!natija.success) {
  return res.status(400).json({
    error: { code: "VALIDATION_ERROR", fields: natija.error.flatten().fieldErrors },
  });
}
\`\`\`

Qoida: **allow-list** (nimaga ruxsat berilgani sanaladi), deny-list emas. Mijozdan kelgan \`role\` maydoniga hech qachon ishonmang.

## 7. Sarlavhalar, limit, audit

\`\`\`js
app.use(helmet());                      // xavfsizlik sarlavhalari
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use(express.json({ limit: "100kb" }));   // katta tanaga qarshi
\`\`\`

| Sarlavha | Vazifasi |
|---|---|
| \`Content-Security-Policy\` | XSS ni keskin cheklaydi |
| \`Strict-Transport-Security\` | faqat HTTPS |
| \`X-Content-Type-Options: nosniff\` | MIME sniffing yo‘q |
| \`X-Frame-Options: DENY\` | clickjacking |
| \`Referrer-Policy\` | manzil sizib chiqmaydi |

Loglash qoidasi: kirish urinishlari, ruxsat rad etilishi, admin amallari **yoziladi**; parol, token va shaxsiy ma’lumot **yozilmaydi**.

## 8. Sinfdagi asosiy topshiriq

Loyihangizga to‘liq autentifikatsiya tizimini qo‘shing:

1. \`/register\`, \`/login\`, \`/me\` endpointlari;
2. parollar bcrypt (cost ≥ 12) bilan;
3. JWT 15 daqiqa amal qiladi;
4. \`admin\` va \`user\` rollari, o‘chirish faqat adminga;
5. har bir resursda egalik tekshiruvi;
6. barcha kiruvchi ma’lumot zod bilan validatsiya qilinadi;
7. \`helmet\` va \`/login\` uchun rate limit;
8. frontend: kirish formasi, token saqlash, chiqish, 401 da avtomatik chiqarish.

## 9. Tekshiruv ro‘yxati

- [ ] \`password_hash\` hech qachon javobda chiqmaydi
- [ ] Kirish xabari bir xil ("Email yoki parol noto‘g‘ri")
- [ ] \`JWT_SECRET\` \`.env\` da, kodda emas
- [ ] Har bir o‘zgartiruvchi endpoint \`auth\` bilan himoyalangan
- [ ] Boshqa foydalanuvchining resursiga kirib bo‘lmaydi (sinab ko‘ring!)
- [ ] Token muddati tugagach 401 qaytadi`,
    assignments: `1. Refresh token mexanizmini qo‘shing: access 15 daqiqa, refresh 7 kun, \`HttpOnly\` cookie da va har yangilashda aylantiriladi.
2. Parolni tiklash oqimini yozing: bir martalik, 30 daqiqa amal qiladigan token (xeshlangan holda saqlanadi).
3. O‘z ilovangizga qarshi IDOR sinovini o‘tkazing: boshqa foydalanuvchi id si bilan so‘rov yuborib, natijani hisobot qiling.
4. \`helmet\` sozlamalarini qo‘lda yozib (CSP bilan), https://securityheaders.com da bahoni "A" ga ko‘taring.`,
    resources: `- OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org
- OWASP ASVS (Application Security Verification Standard) — https://owasp.org/www-project-application-security-verification-standard/
- \`jsonwebtoken\`, \`bcryptjs\`, \`helmet\`, \`express-rate-limit\` npm hujjatlari
- Zod hujjati — https://zod.dev
- MDN. *HTTP security headers* — https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers`,
  },
  {
    title: 'Mustaqil ish: Veb ilovalarda xavfsizlik asoslari',
    week: 11,
    lesson_type: 'independent',
    hours: 12,
    summary:
      'OWASP Top 10 ni mustaqil o‘rganish, o‘z ilovangizni xavfsizlik nuqtai nazaridan audit qilish va aniqlangan zaifliklarni bartaraf etish.',
    objectives: [
      'OWASP Top 10 kategoriyalarini tushunish va misollar bilan izohlash',
      'O‘z ilovasida zaifliklarni aniqlash',
      'Zaifliklarni bartaraf etib, natijani hujjatlash',
      'Xavfsizlik tekshiruv ro‘yxatini (checklist) tuzish',
    ].join('\n'),
    keywords: 'OWASP Top 10, audit, zaiflik, XSS, SQL injection, IDOR, CSRF, xavfsizlik sarlavhalari, penetration test',
    content: `## 1. Maqsad va hajm

**12 soat.** Talaba o‘z kodiga "hujumchi ko‘zi" bilan qaray olsin.

## 2. Bosqichlar

| № | Bosqich | Soat | Natija |
|---|---|---|---|
| 1 | OWASP Top 10 tahlili | 4 | \`1-owasp.md\` |
| 2 | O‘z ilovangizni audit qilish | 4 | \`2-audit.md\` |
| 3 | Zaifliklarni tuzatish | 3 | Kod + \`3-tuzatish.md\` |
| 4 | Checklist tuzish | 1 | \`4-checklist.md\` |

## 3. 1-bosqich: OWASP Top 10 (2021)

Har bir kategoriya uchun: ta’rif, real hujum misoli, o‘z loyihangizga aloqasi, himoya usuli.

| № | Kategoriya |
|---|---|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | Injection (SQL, NoSQL, komanda, XSS) |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable and Outdated Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery (SSRF) |

## 4. 2-bosqich: Audit

O‘z ilovangizni quyidagi savollar bo‘yicha tekshiring:

**Kirish nazorati:** boshqa foydalanuvchi resursiga kira olasizmi? URL dagi \`id\` ni almashtirib ko‘rdingizmi? Admin endpointlari himoyalanganmi? Ruxsat faqat frontendda tekshirilmayaptimi?

**Kriptografiya:** parollar qanday saqlanadi? HTTPS majburiymi? Maxfiy kalitlar qayerda?

**Injection:** SQL parametrlanganmi? \`innerHTML\` ga foydalanuvchi matni tushmayaptimi? Fayl nomi/yo‘li tekshiriladimi?

**Konfiguratsiya:** xato xabarlarida stack trace chiqmayaptimi? Standart parollar qolmaganmi? \`npm audit\` nima deydi? Ortiqcha CORS ruxsati (\`*\`) yo‘qmi?

**Loglash:** kirish urinishlari yoziladimi? Loglarda parol/token bormi?

Har bir topilma uchun:

| Maydon | Mazmuni |
|---|---|
| ID | VULN-01 |
| Tavsif | \`/api/notes/:id\` da egalik tekshirilmaydi |
| OWASP | A01 |
| Jiddiylik | Yuqori |
| Qayta ishlab chiqarish | 1) A bo‘lib kiring 2) \`GET /api/notes/7\` (B foydalanuvchining yozuvi) 3) ma’lumot qaytadi |
| Ta’siri | Boshqa foydalanuvchi ma’lumoti oshkor bo‘ladi |
| Yechim | So‘rovga \`user_id\` sharti qo‘shiladi |

## 5. 3-bosqich: Tuzatish

Har bir zaiflik uchun "oldin/keyin" kodini va qayta sinov natijasini ko‘rsating. \`npm audit fix\` natijasini ham keltiring.

## 6. 4-bosqich: Checklist

Kamida 30 punktli, deploy oldidan tekshiriladigan ro‘yxat tuzing (autentifikatsiya, ruxsatlar, kiritish, chiqarish, sozlama, bog‘liqliklar, loglar, sarlavhalar, maxfiy kalitlar).

## 7. Etika eslatmasi

Barcha sinovlar **faqat o‘z ilovangizda** yoki maxsus ruxsat berilgan mashq platformalarida (OWASP Juice Shop, PortSwigger Web Security Academy, TryHackMe) o‘tkaziladi. Begona tizimni ruxsatsiz tekshirish — qonunbuzarlik.

## 8. Topshirish shakli

\`\`\`
mustaqil-6/
├── 1-owasp.md
├── 2-audit.md      (kamida 8 ta topilma)
├── 3-tuzatish.md   (oldin/keyin)
└── 4-checklist.md
\`\`\`

## 9. Baholash mezonlari

| Mezon | Ball |
|---|---|
| OWASP Top 10 to‘liq va tushunarli tahlil qilingan | 25 |
| Audit chinakam topilmalarga asoslangan | 25 |
| Zaifliklar tuzatilgan va qayta sinalgan | 30 |
| Checklist amaliy va to‘liq | 15 |
| Hujjat sifati | 5 |
| **Jami** | **100** |`,
    assignments: `1. OWASP Top 10 ning har bir kategoriyasini real misol va o‘z loyihangizga bog‘lab tahlil qiling.
2. O‘z ilovangizni audit qilib, kamida 8 ta topilmani belgilangan shablonda hujjatlang.
3. Topilgan zaifliklarni tuzating va "oldin/keyin" kodi bilan qayta sinov natijasini keltiring.
4. Deploy oldidan ishlatiladigan 30 punktli xavfsizlik checklistini tuzing.`,
    resources: `- OWASP Top 10 (2021) — https://owasp.org/Top10/
- OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org
- PortSwigger Web Security Academy (bepul labaratoriyalar) — https://portswigger.net/web-security
- OWASP Juice Shop (mashq ilovasi) — https://owasp.org/www-project-juice-shop/
- Michal Zalewski. *The Tangled Web*. No Starch Press, 2011`,
  },

  // ─────────────────────────── 12-hafta ───────────────────────────
  {
    title: 'Yakuniy integratsiya va loyiha tahlili: SQL Injection, XSS, CSRF',
    week: 12,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'SQL Injection, XSS va CSRF hujumlari hamda ulardan himoyalanish; kurs davomida o‘rganilgan arxitektura qatlamlarini yaxlit loyihada birlashtirish va uni tahlil qilish.',
    objectives: [
      'SQL Injection mexanizmini va himoyasini tushuntirish',
      'XSS turlarini (stored, reflected, DOM-based) farqlash va oldini olish',
      'CSRF hujumini va unga qarshi choralarni izohlash',
      'Kurs davomidagi bilimlarni yagona arxitektura ko‘rinishida birlashtirish',
      'Loyihani arxitektura mezonlari bo‘yicha tahlil qilish',
    ].join('\n'),
    keywords:
      'SQL injection, parametrlangan so‘rov, XSS, stored, reflected, DOM-based, CSP, CSRF, SameSite, CSRF token, code review, refaktoring, arxitektura tahlili',
    content: `## 1. Darsning maqsadi

Talaba uchta eng keng tarqalgan web-hujumni **mexanizm darajasida** tushunsin va kurs davomida qurgan ilovasini yaxlit arxitektura sifatida tahlil qila olsin.

## 2. Nazariy qism (50 daqiqa)

### 2.1. SQL Injection

**Mexanizmi:** foydalanuvchi matni SQL so‘rovga kod sifatida qo‘shilib ketadi.

\`\`\`js
// ❌ Zaif kod
const sql = "SELECT * FROM users WHERE email = '" + email + "' AND pass = '" + p + "'";
\`\`\`

Hujumchi \`email\` maydoniga \`' OR '1'='1' --\` yozsa, so‘rov quyidagiga aylanadi:

\`\`\`sql
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND pass = '...'
\`\`\`

Shart doim rost — parolsiz kirish mumkin. Yanada og‘iri: \`UNION SELECT\` bilan boshqa jadvallarni o‘qish yoki \`DROP TABLE\`.

**Himoya:**

\`\`\`js
// ✅ Parametrlangan so‘rov — ma’lumot hech qachon kodga aylanmaydi
await pool.query("SELECT * FROM users WHERE email = $1", [email]);
\`\`\`

| Qatlam | Chora |
|---|---|
| 1 | Parametrlangan so‘rov / ORM (asosiy himoya) |
| 2 | Kiritishni validatsiya (allow-list) |
| 3 | Baza foydalanuvchisiga eng kam huquq (\`DROP\` kerak emas) |
| 4 | Xato xabarlarida SQL matnini ko‘rsatmaslik |

> Jadval yoki ustun nomini dinamik qo‘yish kerak bo‘lsa — uni **allow-list** dan tanlang; parametr sifatida uzatib bo‘lmaydi.

### 2.2. XSS (Cross-Site Scripting)

**Mexanizmi:** hujumchining JS kodi boshqa foydalanuvchining brauzerida, sayt nomidan bajariladi — ya’ni token va cookie ga to‘liq kirish imkoni paydo bo‘ladi.

| Turi | Qayerda saqlanadi | Misol |
|---|---|---|
| **Stored** | bazada | izohga \`<script>\` yozilgan — hamma ko‘rganda ishlaydi |
| **Reflected** | URL da | \`?q=<script>...\` havolasi yuboriladi |
| **DOM-based** | mijoz kodida | \`location.hash\` \`innerHTML\` ga qo‘yiladi |

\`\`\`js
// ❌
izohlar.innerHTML += "<p>" + foydalanuvchiMatni + "</p>";

// ✅
const p = document.createElement("p");
p.textContent = foydalanuvchiMatni;
izohlar.append(p);
\`\`\`

**Himoya qatlamlari:**

1. **Kontekstga mos ekranlash** — HTML, atribut, JS, URL uchun har xil qoidalar;
2. \`textContent\` / freymvork shablonlari (React, Vue matnni avtomatik ekranlaydi);
3. HTML kerak bo‘lsa — **DOMPurify** bilan tozalash;
4. **CSP** sarlavhasi: \`Content-Security-Policy: default-src 'self'\` — inline skriptni bloklaydi;
5. Cookie’ga \`HttpOnly\` — JS uni o‘qiy olmaydi.

### 2.3. CSRF (Cross-Site Request Forgery)

**Mexanizmi:** foydalanuvchi bankda avtorizatsiyadan o‘tgan; hujumchi saytidagi yashirin forma uning nomidan so‘rov yuboradi — brauzer cookie’ni **avtomatik** biriktiradi.

\`\`\`html
<form action="https://bank.uz/api/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="hujumchi">
  <input type="hidden" name="amount" value="1000000">
</form>
<script>document.getElementById("f").submit();</script>
\`\`\`

**Himoya:**

| Chora | Mazmuni |
|---|---|
| \`SameSite=Lax/Strict\` cookie | boshqa saytdan yuborilgan so‘rovga cookie qo‘shilmaydi |
| **CSRF token** | serverda generatsiya qilinadi, formada yuboriladi, tekshiriladi |
| \`Authorization\` sarlavhasi (JWT) | brauzer avtomatik qo‘shmaydi → CSRF ta’sir qilmaydi |
| Holat o‘zgartiruvchi amal uchun GET ishlatmaslik | \`GET /delete?id=5\` — jiddiy xato |
| Muhim amalda qayta tasdiqlash | parol yoki OTP so‘rash |

> **Diqqat:** XSS mavjud bo‘lsa, CSRF himoyasi ahamiyatsiz bo‘lib qoladi — hujumchi kodi sahifa ichida ishlaydi va tokenni o‘qiy oladi.

### 2.4. Uchalasining qiyosi

| Mezon | SQL Injection | XSS | CSRF |
|---|---|---|---|
| Nishon | ma’lumotlar bazasi | boshqa foydalanuvchi brauzeri | foydalanuvchi sessiyasi |
| Qayerda bajariladi | serverda | mijozda | mijozdan server’ga |
| Asosiy himoya | parametrlangan so‘rov | ekranlash + CSP | SameSite + token |

## 3. Yakuniy integratsiya: kursning yaxlit manzarasi (20 daqiqa)

\`\`\`
Foydalanuvchi
   │ HTTPS (TLS)
   ▼
Frontend (HTML, CSS, Bootstrap, JS)        ← M2–M4, A1–A5
   │ fetch / AJAX (JSON)                   ← M9, A9
   ▼
API Gateway / CORS / Rate limit            ← M7, M9
   ▼
Backend: route → controller → service       ← M7, A7
   │  auth: JWT / OAuth 2.0                ← M11, A11
   ▼
Repository / ORM                            ← M8, A8
   ▼
Ma’lumotlar bazasi (PostgreSQL)
   ▲
CI/CD, Docker, bulut                        ← M10, A10
\`\`\`

**Loyiha tahlili mezonlari (code review):**

| Mezon | Savol |
|---|---|
| Tuzilma | Qatlamlar ajratilganmi, mas’uliyat aralashmaganmi? |
| Xavfsizlik | Parametrlangan so‘rov, ekranlash, ruxsat tekshiruvi bormi? |
| Xatolar | Har bir xato holati qayd etiladimi va foydalanuvchiga tushunarli ko‘rinadimi? |
| Konfiguratsiya | Maxfiy qiymatlar \`.env\` dami? |
| O‘qilishi | Nomlar mazmunlimi, funksiyalar qisqami? |
| Hujjat | \`README\` bilan loyihani ishga tushirib bo‘ladimi? |

**Refaktoring va code review madaniyati:** sharh kodga beriladi, odamga emas; "nega" tushuntiriladi; kichik PR tez ko‘riladi; avtomatlashtirish (linter, formatter, CI) odamning vaqtini muhim narsalarga qoldiradi.

## 4. Yakunlash (10 daqiqa)

- Uchala hujumning asosiy himoyasini bir jumladan ayting.
- O‘z loyihangizda qaysi biri eng katta xavf tug‘diradi?
- Yakuniy loyiha talablari va himoya tartibi bilan tanishish.`,
    assignments: `1. Ataylab zaif qilingan mini-ilova yozing (SQLi, XSS, CSRF), hujumni ko‘rsating, so‘ng uch bosqichda himoyalang va natijani hujjatlang.
2. Kurs davomida qurgan loyihangizni arxitektura mezonlari bo‘yicha tahlil qilib, kuchli va zaif tomonlari haqida 2 betlik hisobot yozing.
3. Kurs mavzulari asosida yaxlit arxitektura diagrammasini chizing (C4 Container darajasi).
4. Guruhdoshingiz loyihasiga code review yozing: kamida 10 ta izoh, har biri sabab va taklif bilan.`,
    resources: `- OWASP. *SQL Injection Prevention*, *XSS Prevention*, *CSRF Prevention* Cheat Sheets — https://cheatsheetseries.owasp.org
- PortSwigger Web Security Academy — SQL injection, XSS, CSRF bo‘limlari — https://portswigger.net/web-security
- MDN. *Content Security Policy* — https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Robert C. Martin. *Clean Code*. Prentice Hall, 2008
- Martin Fowler. *Refactoring*. 2-nashr, Addison-Wesley, 2018`,
  },
  {
    title: 'HTML, CSS, JS, REST API va DB asosida mustaqil mini web-app ishlab chiqish',
    week: 12,
    lesson_type: 'practice',
    hours: 4,
    summary:
      'Kurs davomida o‘rganilgan barcha texnologiyalarni birlashtirib, to‘liq funksional mini web-ilovani loyihalash, yozish, joylashtirish va himoya qilish.',
    objectives: [
      'To‘liq stek ilovasini mustaqil loyihalash va amalga oshirish',
      'Frontend, API va bazani yagona arxitekturaga birlashtirish',
      'Autentifikatsiya va xavfsizlik choralarini qo‘llash',
      'Ilovani bulutga joylashtirish va hujjatlashtirish',
      'Loyihani taqdim etish va savollarga javob berish',
    ].join('\n'),
    keywords:
      'full-stack, CRUD, REST API, PostgreSQL, JWT, responsive, deploy, README, Git, code review, taqdimot',
    content: `## 1. Yakuniy loyiha haqida

Bu mashg‘ulot — kursning yakuniy ishi. Talaba **o‘zi tanlagan mavzuda** to‘liq ishlaydigan web-ilova yaratadi va uni himoya qiladi.

| Bosqich | Mazmun | Vaqt |
|---|---|---|
| 1 | Mavzu va texnik topshiriq | 30 daq |
| 2 | Baza sxemasi va API shartnomasi | 40 daq |
| 3 | Backend | 50 daq |
| 4 | Frontend | 50 daq |
| 5 | Deploy va himoya | 20 daq |

## 2. Mavzu variantlari

| № | Mavzu | Asosiy resurslar |
|---|---|---|
| 1 | Kutubxona katalogi | kitoblar, mualliflar, ijaralar |
| 2 | Xarajatlarni hisoblash | tranzaksiyalar, kategoriyalar, hisobotlar |
| 3 | Onlayn kurslar | kurslar, darslar, ro‘yxatdan o‘tish |
| 4 | Klinika navbati | shifokorlar, bemorlar, qabullar |
| 5 | Retseptlar to‘plami | retseptlar, ingredientlar, yoqtirishlar |
| 6 | Vazifalar taxtasi | loyihalar, vazifalar, izohlar |
| 7 | Mini do‘kon | mahsulotlar, savat, buyurtmalar |

## 3. Majburiy talablar

**Ma’lumotlar bazasi**
- kamida 4 ta bog‘langan jadval, tashqi kalitlar va cheklovlar;
- migratsiya va seed skriptlari;
- kerakli indekslar.

**Backend (REST API)**
- kamida 12 ta endpoint, to‘liq CRUD;
- filtr, qidiruv, saralash, paginatsiya;
- server tomonida validatsiya, yagona xatolik formati, to‘g‘ri status kodlar;
- JWT autentifikatsiya, kamida 2 ta rol, egalik tekshiruvi;
- parametrlangan SQL so‘rovlar, \`helmet\`, rate limit;
- \`/api/health\` endpointi.

**Frontend**
- kamida 4 ta ekran (ro‘yxat, batafsil, forma, kirish);
- responsiv (mobil, planshet, desktop);
- loading / empty / error / success holatlari;
- AJAX orqali ishlaydi, sahifa qayta yuklanmaydi;
- forma validatsiyasi va tushunarli xato xabarlari.

**Infratuzilma va hujjat**
- Git: mazmunli commit’lar, \`main\` + feature branch;
- \`.env.example\`, \`.env\` git ga tushmaydi;
- \`README.md\`: tavsif, stek, ishga tushirish, API jadvali, ekran rasmlari, jonli havola;
- bulutga joylashtirilgan.

## 4. Ish tartibi

**1-bosqich — texnik topshiriq:** maqsad, foydalanuvchi rollari, 8–10 ta foydalanuvchi ssenariysi ("Men ... sifatida ... qila olishim kerak, chunki ...").

**2-bosqich — dizayn:** ER-diagramma; endpoint jadvali (metod, URI, tana, javob, status, ruxsat); ekranlar eskizi.

**3-bosqich — backend:** baza → migratsiya → repository → service → route → autentifikatsiya → Postman bilan sinov.

**4-bosqich — frontend:** \`api/client\` moduli → ekranlar → holatlar → responsivlik.

**5-bosqich — deploy:** muhit o‘zgaruvchilari, CORS, migratsiya, jonli sinov.

## 5. Baholash rubrikasi

| Mezon | Ball |
|---|---|
| Baza sxemasi va migratsiyalar | 10 |
| API to‘liqligi va REST qoidalariga mosligi | 20 |
| Autentifikatsiya va xavfsizlik | 15 |
| Frontend funksionalligi va holatlar | 15 |
| Responsiv dizayn va UX | 10 |
| Deploy (jonli ishlayotgan havola) | 10 |
| Kod sifati va tuzilmasi | 10 |
| Hujjat (README) va Git tarixi | 5 |
| Himoya (taqdimot, savollarga javob) | 5 |
| **Jami** | **100** |

## 6. Himoya tartibi (har talabaga 10 daqiqa)

1. Ilovani jonli namoyish qilish (3 daq);
2. Arxitektura tushuntirishi: qatlamlar, ma’lumot oqimi (3 daq);
3. Savollar (4 daq):
   - Bu so‘rov qaysi qatlamlardan o‘tadi?
   - SQL injection dan qanday himoyalangansiz?
   - Token qayerda saqlanadi va nega?
   - Foydalanuvchi 10 barobar oshsa nima qilasiz?
   - Nimani boshqacha qilgan bo‘lardingiz?

## 7. Topshirishdan oldin tekshiring

- [ ] Jonli havola ishlaydi, sinov hisobi (login/parol) README da
- [ ] \`git clone\` + README bo‘yicha loyiha noldan ko‘tariladi
- [ ] \`.env\` repozitoriyda yo‘q, \`.env.example\` bor
- [ ] Barcha CRUD amallari ishlaydi
- [ ] Mobil ekranda gorizontal scroll yo‘q
- [ ] Konsolda xato yo‘q
- [ ] Begona foydalanuvchi ma’lumotiga kirib bo‘lmaydi
- [ ] Server o‘chirilganda frontend tushunarli xabar beradi`,
    assignments: `1. Yakuniy loyihani barcha majburiy talablarga muvofiq yakunlang va jonli havolada joylashtiring.
2. \`README.md\` ni to‘liq rasmiylashtiring: tavsif, arxitektura diagrammasi, API jadvali, ishga tushirish, ekran rasmlari.
3. Guruhdoshingiz loyihasiga code review yozing (kamida 10 ta asoslangan izoh) va o‘zingiznikiga kelgan izohlarni hisobga olib tuzating.
4. 5 daqiqalik taqdimot slaydlarini tayyorlang: muammo, arxitektura, texnologiyalar, demo, xulosa va keyingi qadamlar.`,
    resources: `- Robert C. Martin. *Clean Code*. Prentice Hall, 2008
- Martin Fowler. *Refactoring*. 2-nashr, Addison-Wesley, 2018
- Scott Chacon, Ben Straub. *Pro Git*. 2-nashr — https://git-scm.com/book
- Google Engineering Practices — *Code Review Developer Guide* — https://google.github.io/eng-practices/review/
- web.dev. *Learn* seriyasi (HTML, CSS, JS, Performance, Accessibility) — https://web.dev/learn`,
  },
];
