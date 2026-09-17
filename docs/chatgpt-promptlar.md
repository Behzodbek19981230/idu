# ChatGPT uchun promptlar — fan, ish reja va dars qo'llanmalari

## Qanday ishlatiladi

1. **1-prompt** → fan ma'lumotlari + kalendar-tematik reja.
   Natijani *Adminka → Fanlar → Fan qo'shish* oynasiga kiriting.
2. **2-prompt** → bitta mavzu uchun to'liq dars qo'llanmasi.
   *Adminka → fan → Mavzu qo'shish* — javobdagi har bir sarlavha formadagi maydon nomi bilan bir xil.
3. **3-prompt** → keyingi mavzular uchun qisqa buyruq (shu chatning o'zida).

**Maslahatlar**
- `[...]` qavs ichidagi joylarni o'zingiz to'ldiring, qavslarni olib tashlang.
- Uchala promptni **bitta chatda** ketma-ket ishlating — ChatGPT rejani eslab qoladi, mavzular bir-biriga bog'lanadi.
- Har bir maydon alohida kod blokida keladi. **Blokning o'ng yuqorisidagi "Copy" tugmasi bilan nusxalang** —
  sichqoncha bilan belgilasangiz `##`, `**`, jadvallar yo'qoladi.
- Saqlashdan oldin muharrirdagi **"Ko'rinishi"** tabida tekshiring.
- Adabiyotlar ro'yxatini albatta ko'zdan kechiring — model ba'zan mavjud bo'lmagan manba yozishi mumkin.

---

## 1-prompt: Fan va kalendar-tematik reja

````text
Sen O‘zbekiston oliy ta’lim muassasalari uchun o‘quv-uslubiy hujjatlar tayyorlaydigan tajribali metodist va "[FAN NOMI]" fani bo‘yicha dotsentsan.

VAZIFA: quyidagi fan uchun asosiy ma’lumotlar va kalendar-tematik ish reja tuz.

FAN HAQIDA
- Fan nomi: [FAN NOMI]
- Ta’lim yo‘nalishi: [masalan: 60610500 – Kompyuter injiniringi]
- Kurs / semestr: [masalan: 2-kurs, 3-semestr]
- Kredit: [masalan: 6]
- Haftalar soni: [masalan: 15]
- Soatlar: ma’ruza [30], amaliy va laboratoriya [30], mustaqil ta’lim [60]
- Bir juftlik davomiyligi: [80] daqiqa (= 2 akademik soat)
- Talabalarning boshlang‘ich bilimi: [masalan: dasturlash asoslarini biladi]
- Qo‘shimcha talablar: [ixtiyoriy, masalan: 8-haftada oraliq nazorat, 15-haftada yakuniy nazorat]

QOIDALAR
1. Til — faqat o‘zbek tili, lotin yozuvi. o‘, g‘ va tutuq belgisi (’) to‘g‘ri yozilsin.
2. "Dars turi" faqat shu 5 qiymatdan biri, aynan shu yozuvda: Ma’ruza, Amaliy, Laboratoriya, Seminar, Mustaqil ish.
3. Mavzular soatlarining yig‘indisi yuqoridagi auditoriya soatlariga to‘liq teng bo‘lsin — har bir tur bo‘yicha alohida ham.
4. Mavzular oddiydan murakkabga, mantiqiy ketma-ketlikda. Odatda har haftada 1 ta ma’ruza va unga mos 1 ta amaliy/laboratoriya.
5. Amaliy mashg‘ulot mavzusi shu haftadagi ma’ruza mavzusini mustahkamlasin.
6. Mavzu nomi aniq va qisqa (90 belgidan oshmasin), boshiga "Mavzu 1:" kabi prefiks qo‘shma.
7. Javobda salomlashish, kirish yoki xulosa matni bo‘lmasin — faqat quyidagi format.

JAVOB FORMATI

### A. Fan ma’lumotlari

| Maydon | Qiymat |
|---|---|
| Fan nomi | ... |
| Kod | ... (masalan: KI-2103) |
| Semestr | faqat raqam |
| Kredit | faqat raqam |
| Ma’ruza | soat, faqat raqam |
| Amaliy | soat, faqat raqam (amaliy + laboratoriya) |
| Mustaqil | soat, faqat raqam |

#### Tavsif
```text
(3–4 gap: fanning maqsadi, nimani o‘rgatadi, talaba qanday ko‘nikma egallaydi — oddiy matn)
```

### B. Kalendar-tematik reja

| № | Hafta | Mavzu nomi | Dars turi | Soat | Qisqacha mazmun (1–2 gap) |
|---|---|---|---|---|---|

Jadval ostida: har bir dars turi bo‘yicha jami soat va umumiy jami. Yuqoridagi soatlarga mos kelishini tekshirib yoz; mos kelmasa, jadvalni tuzat.
````

---

## 2-prompt: Bitta mavzu uchun to'liq dars qo'llanmasi

`````text
Sen "[FAN NOMI]" fanidan dars beradigan tajribali dotsent va metodistsan. Endi bitta mavzu uchun o‘qituvchi darsni to‘liq o‘tishi mumkin bo‘lgan batafsil dars qo‘llanmasini yoz.

MAVZU HAQIDA
- Fan: [FAN NOMI]
- Mavzu nomi: [MAVZU NOMI]
- Hafta: [3]
- Dars turi: [Ma’ruza | Amaliy | Laboratoriya | Seminar | Mustaqil ish]
- Soat: [2]
- Juftlik davomiyligi: [80] daqiqa
- Oldingi mavzu: [ixtiyoriy — bog‘lash uchun]
- Talabalar darajasi: [masalan: 2-kurs, Python asoslarini biladi]
- Qo‘shimcha: [ixtiyoriy — masalan: real hayotiy misollar ko‘proq bo‘lsin, bank tizimi misolida]

UMUMIY QOIDALAR
1. Til — faqat o‘zbek tili, lotin yozuvi; o‘, g‘ va ’ to‘g‘ri yozilsin. Atamaning inglizcha/ruscha varianti kerak bo‘lsa, birinchi uchraganda qavsda bering.
2. Markdown faqat shular: `##` va `###` sarlavhalar, **qalin**, *kursiv*, raqamli va nuqtali ro‘yxatlar, jadvallar, `> ` eslatma bloklari, kod bloklari, havolalar.
3. TAQIQLANADI: HTML teglar, LaTeX formulalar ($...$), Mermaid diagrammalar, rasmlar, emoji. Formulalarni oddiy matn yoki kod blokida yoz (masalan: `S = a * b`).
4. `#` (1-darajali sarlavha) ishlatma va mavzu nomini matn ichida sarlavha sifatida takrorlama — sahifada u allaqachon bor. Dars matni `##` bilan boshlanadi.
5. HAR BIR kod blokida til ko‘rsatilsin: ```python, ```sql, ```bash, ```text va h.k. Tilsiz ``` ishlatma.
6. Vaqt ko‘rsatilgan bo‘limlar daqiqalari yig‘indisi aynan [80] daqiqaga teng bo‘lsin.
7. Faqat haqiqatda mavjud manbalarni yoz (rasmiy hujjatlar, taniqli darsliklar). Aniq bilmasang — o‘ylab topma, kamroq yoz.
8. Javobda kirish/xulosa so‘zlari bo‘lmasin — faqat quyidagi format.

DARS MATNI TUZILMASI — dars turiga qarab:

▸ Ma’ruza (kamida 1200 so‘z):
## 1. Darsning maqsadi
## 2. Kirish va motivatsiya (N daqiqa) — hayotiy misol yoki muammoli savol bilan boshlansin
## 3. Nazariy qism (N daqiqa) — ### 3.1, ### 3.2 ... kichik bo‘limlar; har birida ta’rif → izoh → misol; taqqoslash uchun jadval; kerak bo‘lsa kod misoli
## 4. Mustahkamlash (N daqiqa) — auditoriyaga 3–5 ta savol, `> **Savol:**` ko‘rinishida
## 5. Yakunlash (N daqiqa) — asosiy xulosalar va keyingi darsga bog‘lanish

▸ Amaliy (kamida 900 so‘z):
## 1. Mashg‘ulot maqsadi va formati (yakka / juftlik / guruh)
## 2. Qisqa nazariy takrorlash (N daqiqa)
## 3. Namunaviy masala (N daqiqa) — shart, yechim bosqichma-bosqich, to‘liq kod yoki hisob
## 4. Sinfda yechiladigan masalalar (N daqiqa) — 3–5 ta, osondan qiyinga; har biriga kutilgan natija
## 5. Tipik xatolar — talabalar ko‘p yo‘l qo‘yadigan 4–6 ta xato va to‘g‘rilash
## 6. Baholash mezonlari — jadval (mezon | ball)

▸ Laboratoriya (kamida 900 so‘z):
## 1. Ishning maqsadi
## 2. Kerakli jihozlar va dasturiy ta’minot
## 3. Qisqa nazariy ma’lumot (N daqiqa)
## 4. Ishni bajarish tartibi (N daqiqa) — raqamlangan bosqichlar, har bosqichda kutilgan natija
## 5. Variantlar — kamida 5 ta variant jadvalda
## 6. Hisobot talablari va himoya savollari
## 7. Baholash mezonlari — jadval

▸ Seminar yoki nazorat (kamida 700 so‘z):
## 1. Maqsad
## 2. Tuzilma — jadval (qism | shakl | vaqt | ball)
## 3. Muhokama savollari yoki test namunalari (javob kalitlari bilan)
## 4. Amaliy topshiriq / keys
## 5. Baholash rubrikasi — jadval (daraja | ball | tavsif)

▸ Mustaqil ish (kamida 500 so‘z):
## 1. Topshiriq maqsadi
## 2. Topshiriq sharti (batafsil)
## 3. Bajarish bo‘yicha yo‘riqnoma
## 4. Topshiriladigan natija va format
## 5. Baholash mezonlari — jadval

JAVOB FORMATI — qat’iy shu tartibda. Har bir sarlavhadan keyin FAQAT bitta kod bloki. Markdown bo‘ladigan bloklar TO‘RTTA backtick (````) bilan ochilib-yopilsin, chunki ichida oddiy ``` kod bloklari bo‘ladi:

#### Asosiy ma’lumotlar
| Hafta | Dars turi | Soat |
|---|---|---|
| ... | ... | ... |

#### Mavzu nomi
```text
(bir qator)
```

#### Qisqacha mazmun
```text
(1–2 gap, oddiy matn)
```

#### Dars maqsadlari
```text
(3–5 qator. Har qatorda BITTA o‘lchanadigan natija, fe’l bilan tugasin: "... ni tushuntira olish", "... ni yoza olish".
Qator boshida "-", "•" yoki raqam QO‘YMA — tizim har qatorni o‘zi ro‘yxatga aylantiradi.)
```

#### Tayanch so‘zlar
```text
(5–10 ta atama, bitta qatorda, vergul bilan ajratilgan, oxirida nuqta yo‘q)
```

#### Dars matni
````markdown
(yuqoridagi tuzilma bo‘yicha to‘liq matn, ## bilan boshlanadi)
````

#### Topshiriqlar
````markdown
(uyga vazifa: 4–6 ta raqamlangan topshiriq, osondan qiyinga; eng qiyiniga "*" belgisi qo‘y.
Har birida aniq shart va kutilgan natija bo‘lsin.)
````

#### Adabiyotlar va manbalar
````markdown
(4–6 ta, nuqtali ro‘yxat: asosiy darslik (muallif, nomi, nashr yili, bob), rasmiy hujjat havolasi, qo‘shimcha manba)
````

Yuborishdan oldin o‘zingni tekshir (tekshiruvni javobga yozma):
- vaqtlar yig‘indisi = [80] daqiqa;
- har bir kod blokida til ko‘rsatilgan;
- dars maqsadlarida qator boshida belgi yo‘q;
- Markdown bloklari to‘rtta backtick bilan to‘g‘ri yopilgan;
- HTML, LaTeX, emoji yo‘q.
`````

---

## 3-prompt: Keyingi mavzu (o'sha chatning o'zida)

```text
Xuddi shu format, tuzilma va qoidalar bilan keyingi mavzu uchun dars qo‘llanmasini yoz:
- Mavzu nomi: [MAVZU NOMI]  (yoki: "reja jadvalidagi [5]-qator")
- Hafta: [4]
- Dars turi: [Amaliy]
- Soat: [2]
- Oldingi mavzu bilan bog‘la: [ha]
```

### Qo'shimcha foydali buyruqlar

```text
Dars matnidagi "Nazariy qism"ni kengaytir: har bir kichik bo‘limga yana bittadan hayotiy misol va bittadan kod misoli qo‘sh. Faqat "Dars matni" blokini to‘liq qayta yubor.
```

```text
Topshiriqlarni 3 darajaga ajrat: boshlang‘ich (2 ta), o‘rta (2 ta), murakkab (1 ta). Faqat "Topshiriqlar" blokini qayta yubor.
```

```text
Shu mavzu bo‘yicha 10 ta test savoli tuz (4 ta variant, to‘g‘ri javob belgilangan) va "Seminar" turidagi dars matni formatida yubor.
```
