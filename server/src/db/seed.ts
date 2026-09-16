import { pool } from './pool.js';

type SeedTopic = {
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

const subject = {
  name: 'Dasturlash asoslari',
  code: 'DA-101',
  description:
    'Kurs talabalarni algoritmik fikrlash, Python tilining asosiy konstruksiyalari va sodda dasturiy masalalarni yechish ko‘nikmalari bilan tanishtiradi.',
  semester: 1,
  credits: 6,
  lecture_hours: 30,
  practice_hours: 30,
  independent_hours: 60,
};

const topics: SeedTopic[] = [
  {
    title: 'Kirish. Algoritm va dasturlash tushunchasi',
    week: 1,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Algoritm tushunchasi, uning xossalari va tasvirlash usullari. Dasturlash tillari tasnifi, Python tilining o‘rni.',
    objectives: [
      'Algoritm tushunchasini va uning 5 ta asosiy xossasini izohlay olish',
      'Blok-sxema yordamida sodda algoritmni tasvirlash',
      'Kompilyator va interpretator farqini tushuntirish',
      'Python muhitini o‘rnatib, birinchi dasturni ishga tushirish',
    ].join('\n'),
    keywords: 'algoritm, blok-sxema, psevdokod, interpretator, kompilyator, Python',
    content: `## 1. Darsning maqsadi

Talabada "kompyuter qanday qilib masalani yechadi?" degan savolga aniq javob shakllansin. Dars oxirida har bir talaba o‘z kompyuterida Python o‘rnatgan va birinchi dasturini ishga tushirgan bo‘lishi kerak.

## 2. Nazariy qism (50 daqiqa)

### 2.1. Algoritm nima?

**Algoritm** — qo‘yilgan masalani yechishga olib keladigan, chekli sondagi aniq buyruqlar ketma-ketligi.

Algoritmning asosiy xossalari:

| Xossa | Mazmuni |
|---|---|
| Diskretlik | Qadamlarga ajratilgan bo‘lishi |
| Aniqlik | Har bir qadam bir xil tushunilishi |
| Tushunarlilik | Ijrochi tushunadigan buyruqlardan iborat bo‘lishi |
| Natijaviylik | Chekli qadamdan keyin natija berishi |
| Ommaviylik | Bir turdagi masalalar sinfiga yaroqli bo‘lishi |

> **Auditoriyaga savol:** choy damlash retsepti algoritmmi? Qaysi xossalari bor, qaysilari yetishmaydi?

### 2.2. Algoritmni tasvirlash usullari

1. **So‘zlar bilan** — oddiy, lekin noaniq.
2. **Blok-sxema** — vizual, GOST belgilaridan foydalaniladi.
3. **Psevdokod** — tilga bog‘liq emas, lekin kodga yaqin.
4. **Dasturlash tilida** — to‘g‘ridan-to‘g‘ri ijro etiladi.

Blok-sxemaning asosiy belgilari: oval (boshlanish/tugash), parallelogramm (kiritish/chiqarish), to‘rtburchak (jarayon), romb (shart).

### 2.3. Dasturlash tillari tasnifi

- **Quyi darajali**: Assembler — apparatga yaqin.
- **Yuqori darajali**: Python, Java, C++ — odamga yaqin.
- **Kompilyatsiya** (C++): butun kod bir marta mashina kodiga aylantiriladi → tez.
- **Interpretatsiya** (Python): kod satrma-satr bajariladi → moslashuvchan, kross-platformali.

### 2.4. Nega Python?

Sodda sintaksis, katta kutubxonalar bazasi, ta’lim va sanoatda keng qo‘llanilishi.

\`\`\`python
print("Assalomu alaykum, dasturlash olami!")
\`\`\`

## 3. Amaliy qism (30 daqiqa)

1. python.org dan Python 3 ni o‘rnatish (Windows uchun “Add to PATH” belgilanishi shart).
2. VS Code + Python kengaytmasini o‘rnatish.
3. \`hello.py\` faylini yaratib, terminalda \`python hello.py\` buyrug‘i bilan ishga tushirish.
4. Interaktiv rejim (REPL) bilan tanishish: \`python\` buyrug‘i, \`2 + 2\`, \`exit()\`.

## 4. Yakunlash (10 daqiqa)

- Blits-so‘rov: algoritmning 5 xossasini ayting.
- Keyingi darsga: ma’lumot turlari mavzusini o‘qib kelish.`,
    assignments: `1. Bankomatdan pul yechish jarayonining blok-sxemasini chizing (shart bloki majburiy).
2. Ikki sonning kattasini topish algoritmini psevdokodda yozing.
3. O‘z kompyuteringizda Python o‘rnatilganini tasdiqlovchi skrinshot (\`python --version\`) yuboring.
4. "Kompilyator va interpretator" mavzusida 1 betlik qiyosiy jadval tayyorlang.`,
    resources: `- Mark Lutz. Learning Python. 5-nashr, O'Reilly — 1-bob
- https://docs.python.org/3/tutorial/introduction.html
- https://www.python.org/downloads/
- Video: "Algoritm va blok-sxemalar" (YouTube, o‘zbek tilida)`,
  },
  {
    title: 'Ma’lumot turlari, o‘zgaruvchilar va operatorlar',
    week: 2,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Sonli, satrli va mantiqiy turlar, o‘zgaruvchilarni e’lon qilish, arifmetik va mantiqiy operatorlar, tiplar konvertatsiyasi.',
    objectives: [
      'Python ning asosiy ma’lumot turlarini sanab bera olish',
      'O‘zgaruvchi nomlash qoidalariga amal qilish',
      'Arifmetik operatorlar ustuvorligini to‘g‘ri qo‘llash',
      'input() orqali olingan ma’lumotni kerakli turga o‘tkazish',
    ].join('\n'),
    keywords: 'int, float, str, bool, type(), input(), casting, operator',
    content: `## 1. Darsning maqsadi

Talaba xotirada ma’lumot qanday saqlanishini tushunsin va foydalanuvchidan ma’lumot olib, u ustida amal bajaradigan dastur yoza olsin.

## 2. Nazariy qism (50 daqiqa)

### 2.1. O‘zgaruvchi

O‘zgaruvchi — xotiradagi qiymatga berilgan nom. Pythonda tur oldindan e’lon qilinmaydi:

\`\`\`python
ism = "Ali"        # str
yosh = 19           # int
boy = 1.78          # float
talaba_mi = True    # bool
\`\`\`

**Nomlash qoidalari:** harf yoki \`_\` bilan boshlanadi, bo‘sh joy bo‘lmaydi, registrga sezgir, kalit so‘zlar ishlatilmaydi.

### 2.2. Asosiy turlar

| Tur | Misol | Izoh |
|---|---|---|
| \`int\` | \`42\`, \`-7\` | butun son, cheklanmagan uzunlik |
| \`float\` | \`3.14\` | haqiqiy son |
| \`str\` | \`"matn"\` | satr, o‘zgarmas |
| \`bool\` | \`True\`, \`False\` | mantiqiy |
| \`NoneType\` | \`None\` | qiymat yo‘qligi |

\`type(x)\` funksiyasi turni qaytaradi.

### 2.3. Operatorlar

Arifmetik: \`+  -  *  /  //  %  **\`

\`\`\`python
print(7 / 2)   # 3.5  — bo'lish
print(7 // 2)  # 3    — butun bo'lish
print(7 % 2)   # 1    — qoldiq
print(2 ** 10) # 1024 — daraja
\`\`\`

Ustuvorlik: \`**\` → \`* / // %\` → \`+ -\`. Qavs har doim ustun.

Taqqoslash: \`==  !=  >  <  >=  <=\` — natijasi \`bool\`.
Mantiqiy: \`and\`, \`or\`, \`not\`.

### 2.4. Kiritish va turlar konvertatsiyasi

\`input()\` **doim satr** qaytaradi — bu eng ko‘p uchraydigan xato manbai:

\`\`\`python
a = int(input("Birinchi son: "))
b = int(input("Ikkinchi son: "))
print("Yig'indi:", a + b)
\`\`\`

f-satrlar bilan chiqarish:

\`\`\`python
print(f"{a} + {b} = {a + b}")
\`\`\`

## 3. Amaliy qism (30 daqiqa)

- Foydalanuvchidan ism va yoshni olib, "Ali, 5 yildan keyin 24 yoshda bo'lasiz" ko‘rinishida chiqaring.
- Doira radiusini olib, yuzi va uzunligini hisoblang.
- Sekundlar sonini olib, uni soat:minut:sekund ko‘rinishiga aylantiring (\`//\` va \`%\` bilan).

## 4. Tipik xatolar

- \`TypeError: can only concatenate str\` — son va satrni \`+\` bilan qo‘shish.
- \`int(input())\` ni unutish → "2" + "3" = "23".
- O‘zgaruvchi nomida o‘zbekcha harflar yoki bo‘sh joy ishlatish.`,
    assignments: `1. Uch xonali sonni oling va uning raqamlari yig‘indisini toping (\`//\` va \`%\`).
2. Talabaning 4 ta fandan bahosini olib, o‘rtacha ballni 2 xona aniqlikda chiqaring.
3. Fahrenheitni Selsiyga o‘tkazuvchi dastur yozing.
4. \`type()\` yordamida 6 xil qiymat turini ekranga chiqaruvchi dastur yozing.`,
    resources: `- https://docs.python.org/3/library/stdtypes.html
- W3Schools: Python Data Types
- Interaktiv mashq: https://www.pythontutor.com (xotira vizualizatsiyasi)`,
  },
  {
    title: 'Shartli operatorlar: if, elif, else',
    week: 3,
    lesson_type: 'lecture',
    hours: 2,
    summary:
      'Tarmoqlanuvchi algoritmlar, if-elif-else konstruksiyasi, ichma-ich shartlar, mantiqiy ifodalarni soddalashtirish.',
    objectives: [
      'Tarmoqlanuvchi algoritmni blok-sxemada va kodda ifodalash',
      'if / elif / else ni to‘g‘ri tanlash',
      'Murakkab shartlarni and/or bilan qurish',
      'Indentatsiya (otstup) qoidalariga amal qilish',
    ].join('\n'),
    keywords: 'if, elif, else, indentatsiya, mantiqiy ifoda, ichma-ich shart',
    content: `## 1. Darsning maqsadi

Talaba dasturda qaror qabul qilish mexanizmini o‘zlashtirsin va real hayotiy shartlarni kodga ko‘chira olsin.

## 2. Nazariy qism (45 daqiqa)

### 2.1. Oddiy shart

\`\`\`python
yosh = int(input("Yoshingiz: "))
if yosh >= 18:
    print("Voyaga yetgan")
else:
    print("Voyaga yetmagan")
\`\`\`

Pythonda blok **indentatsiya** (4 probel) bilan ajratiladi — qavs yoki \`begin/end\` yo‘q. Bu tilning eng muhim sintaktik qoidasi.

### 2.2. Ko‘p tarmoqli shart

\`\`\`python
ball = int(input("Ball: "))
if ball >= 90:
    baho = "A'lo"
elif ball >= 70:
    baho = "Yaxshi"
elif ball >= 60:
    baho = "Qoniqarli"
else:
    baho = "Qoniqarsiz"
print(baho)
\`\`\`

> **Muhim:** \`elif\` shartlari yuqoridan pastga tekshiriladi va **birinchi rost** shart bajarilgach, qolganlari tekshirilmaydi. Shuning uchun shartlar tartibi ahamiyatli.

### 2.3. Murakkab shartlar

\`\`\`python
if yil % 4 == 0 and (yil % 100 != 0 or yil % 400 == 0):
    print("Kabisa yil")
\`\`\`

Pythonda zanjirli taqqoslash ishlaydi: \`if 0 <= ball <= 100:\`

### 2.4. Ichma-ich shartlar va ularni soddalashtirish

Chuqur ichma-ich shartlar o‘qishni qiyinlashtiradi. Iloji bo‘lsa, \`and\` bilan birlashtiring yoki erta \`return\`/\`exit\` qo‘llang.

## 3. Amaliy qism (35 daqiqa)

1. Uch sonning kattasini topish.
2. Kvadrat tenglama ildizlarini diskriminant orqali topish (3 holat).
3. Kalkulyator: ikki son va amal belgisi olinadi, natija chiqariladi (nolga bo‘lish tekshiriladi).
4. Yilni kabisaga tekshirish.

## 4. Baholash mezoni

| Mezon | Ball |
|---|---|
| Kod ishlaydi | 4 |
| Barcha chegaraviy holatlar hisobga olingan | 3 |
| Kod o‘qilishi, nomlar mazmunli | 2 |
| Izohlar mavjud | 1 |`,
    assignments: `1. Foydalanuvchi kiritgan belgi unli yoki undosh harfligini aniqlang.
2. Oy raqamini olib, uning fasli va kunlar sonini chiqaring (kabisa yilni hisobga oling).
3. Uchburchakning uch tomoni berilgan — mavjudligini va turini (teng tomonli / teng yonli / turli tomonli) aniqlang.
4. Elektr energiya tarifini pog‘onali hisoblovchi dastur yozing.`,
    resources: `- https://docs.python.org/3/tutorial/controlflow.html
- PEP 8 — kod formatlash standarti: https://peps.python.org/pep-0008/
- Mashqlar: https://www.hackerrank.com/domains/python`,
  },
  {
    title: 'Amaliy mashg‘ulot: Takrorlash operatorlari (for, while)',
    week: 4,
    lesson_type: 'practice',
    hours: 2,
    summary:
      'for va while sikllari, range(), break/continue, ichma-ich sikllar bilan amaliy masalalar yechish.',
    objectives: [
      'for va while orasidan to‘g‘risini tanlay olish',
      'range() ning uch parametrini qo‘llash',
      'Cheksiz siklni aniqlash va tuzatish',
      'Ichma-ich sikl bilan jadval/figura chiqarish',
    ].join('\n'),
    keywords: 'for, while, range, break, continue, ichma-ich sikl, akkumulyator',
    content: `## 1. Mashg‘ulot formati

Juftlikda ishlash (pair programming). Har 15 daqiqada rollar almashadi: biri yozadi, ikkinchisi tekshiradi.

## 2. Qisqa takrorlash (10 daqiqa)

\`\`\`python
for i in range(1, 6):      # 1, 2, 3, 4, 5
    print(i)

n = 5
while n > 0:               # shart rost ekan davom etadi
    print(n)
    n -= 1
\`\`\`

\`range(boshi, oxiri, qadam)\` — \`oxiri\` **kirmaydi**.

**Qoida:** takrorlanishlar soni oldindan ma’lum bo‘lsa → \`for\`; shartga bog‘liq bo‘lsa → \`while\`.

## 3. Sinfda yechiladigan masalalar

### Masala 1 — Akkumulyator shabloni
1 dan n gacha sonlar yig‘indisi va ko‘paytmasini toping.

\`\`\`python
n = int(input("n = "))
yigindi = 0
for i in range(1, n + 1):
    yigindi += i
print(yigindi)
\`\`\`

### Masala 2 — Shartli hisoblash
1..100 oralig‘idagi 3 ga ham, 5 ga ham bo‘linadigan sonlarni chiqaring.

### Masala 3 — break bilan
Foydalanuvchi 0 kiritmaguncha sonlarni qabul qilib, ularning o‘rtachasini hisoblang.

### Masala 4 — Ichma-ich sikl
Ekranga 9x9 ko‘paytirish jadvalini chiqaring.

\`\`\`python
for i in range(1, 10):
    for j in range(1, 10):
        print(f"{i*j:4}", end="")
    print()
\`\`\`

### Masala 5 — Figura
n qatorli to‘g‘ri burchakli yulduzcha uchburchagini chizing.

## 4. Tipik xatolar ro‘yxati

- \`while\` ichida hisoblagichni o‘zgartirishni unutish → cheksiz sikl (\`Ctrl+C\`).
- \`range(1, n)\` yozib, \`n\` ni tashlab yuborish.
- Akkumulyatorni sikl **ichida** nolga tenglash.
- Ichma-ich siklda ikkala siklda ham \`i\` ni ishlatish.

## 5. Yakuniy topshiriq (20 daqiqa, baholanadi)

Berilgan natural sonning barcha bo‘luvchilarini topib, tub son yoki yo‘qligini aniqlovchi dastur yozing.`,
    assignments: `1. Fibonachchi ketma-ketligining birinchi n hadini chiqaring.
2. Sonning raqamlarini teskari tartibda chiqaruvchi dastur (\`while\` bilan).
3. n! (faktorial) ni for sikli orqali hisoblang.
4. 2 dan 100 gacha barcha tub sonlarni chiqaring.
5.* Piramida ko‘rinishidagi yulduzchalar figurasini chizing (markazlashtirilgan).`,
    resources: `- https://docs.python.org/3/tutorial/controlflow.html#for-statements
- Codewars: 8 kyu Python mashqlari
- Kitob: "Python. K vershinam masterstva" — sikllar bo‘limi`,
  },
  {
    title: 'Oraliq nazorat: Chiziqli, tarmoqlanuvchi va takrorlanuvchi algoritmlar',
    week: 5,
    lesson_type: 'seminar',
    hours: 2,
    summary:
      'Birinchi modul bo‘yicha bilimlarni tekshirish: test, amaliy masala va kod tahlili.',
    objectives: [
      '1–4-haftalar materialini yaxlit qo‘llash',
      'Berilgan kodda xatoni topish va tuzatish',
      'Yechim samaradorligini asoslash',
    ].join('\n'),
    keywords: 'nazorat, test, kod tahlili, rubrika',
    content: `## 1. Nazorat tuzilmasi (80 daqiqa)

| Qism | Shakl | Vaqt | Ball |
|---|---|---|---|
| A | 15 ta test savoli | 20 daq | 30 |
| B | 2 ta amaliy masala | 40 daq | 50 |
| C | Kodni tahlil qilish va xatoni tuzatish | 20 daq | 20 |

## 2. A qismi — test namunasi

1. \`print(7 // 2)\` nima chiqaradi? a) 3.5 b) 3 c) 4 d) 1
2. \`input()\` qanday tur qaytaradi?
3. \`range(2, 10, 3)\` qaysi qiymatlarni beradi?
4. Indentatsiya buzilsa qanday xato yuzaga keladi?
5. \`and\` va \`or\` orasidagi ustuvorlik farqi.

## 3. B qismi — amaliy masalalar

**B1.** Foydalanuvchidan n ta son olib, ular orasidagi eng katta, eng kichik va o‘rtacha qiymatni toping. Nol kiritilsa, kiritish to‘xtatilsin.

**B2.** Berilgan sonning raqamlari yig‘indisi shu sonning bo‘luvchisi bo‘lsa "HA", aks holda "YO'Q" chiqaring.

## 4. C qismi — xatoni toping

\`\`\`python
n = input("n = ")
yigindi = 0
for i in range(1, n):
    yigindi = 0
    yigindi += i
print("Yig'indi:", yigindi)
\`\`\`

*Kutilayotgan javob:* uchta xato — \`int()\` yo‘q, \`range\` chegarasi \`n+1\` bo‘lishi kerak, akkumulyator sikl ichida nollanmoqda.

## 5. Baholash rubrikasi

| Daraja | Ball | Tavsif |
|---|---|---|
| A'lo | 86–100 | Barcha masalalar to‘g‘ri, kod toza va izohli |
| Yaxshi | 71–85 | Kichik kamchiliklar, chegaraviy holat e’tibordan chetda |
| Qoniqarli | 60–70 | Asosiy g‘oya to‘g‘ri, ishlashda xatolar bor |
| Qoniqarsiz | <60 | Masala yechilmagan |

## 6. Nazoratdan keyin

Xatolar ustida ishlash: har bir talaba o‘z xatolarini tahlil qilib, tuzatilgan yechimni keyingi darsga olib keladi.`,
    assignments: `1. Nazorat ishidagi xatolaringiz ustida ishlab, tuzatilgan versiyani topshiring.
2. B1 masalasini \`while\` o‘rniga \`for\` bilan qayta yozing va farqni izohlang.
3. Keyingi modulga tayyorgarlik: "Ro‘yxatlar (list)" mavzusini oldindan o‘qing.`,
    resources: `- Kurs silabusi, 1-modul baholash mezonlari
- O‘tilgan 1–4-darslar konspektlari
- Qo‘shimcha mashqlar to‘plami (LMS, "1-modul" bo‘limi)`,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM subjects WHERE code = $1', [subject.code]);
    if (existing.rows.length > 0) {
      console.log(`ℹ "${subject.code}" fani allaqachon mavjud, seed o'tkazib yuborildi.`);
      await client.query('ROLLBACK');
      return;
    }

    const inserted = await client.query<{ id: number }>(
      `INSERT INTO subjects (name, code, description, semester, credits, lecture_hours, practice_hours, independent_hours, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0) RETURNING id`,
      [
        subject.name,
        subject.code,
        subject.description,
        subject.semester,
        subject.credits,
        subject.lecture_hours,
        subject.practice_hours,
        subject.independent_hours,
      ],
    );
    const subjectId = inserted.rows[0].id;

    for (const [index, topic] of topics.entries()) {
      await client.query(
        `INSERT INTO topics (subject_id, title, week, position, lesson_type, hours, summary, objectives, keywords, content, assignments, resources)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          subjectId,
          topic.title,
          topic.week,
          index,
          topic.lesson_type,
          topic.hours,
          topic.summary,
          topic.objectives,
          topic.keywords,
          topic.content,
          topic.assignments,
          topic.resources,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`✓ Namuna ma'lumot qo'shildi: "${subject.name}" (${topics.length} ta mavzu)`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("✗ Seed xatosi:", err.message);
    process.exit(1);
  });
