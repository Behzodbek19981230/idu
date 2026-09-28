# O'quv jarayoni platformasi — ish reja va dars qo'llanmalari

Universitet fanlari bo'yicha **ish reja (kalendar-tematik reja)** va har bir mavzu uchun
**dars qo'llanmasini** yuritish tizimi. Fanlar ham, mavzular ham adminka orqali
dinamik qo'shiladi — kodga tegmasdan.

| Qatlam | Texnologiya |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Baza | PostgreSQL (`pg`, xom SQL) |
| Frontend | React + Vite + TypeScript + MUI |
| Matn formati | Markdown (jadval, kod bloklari, ro'yxatlar) |

## Tuzilma

```
idu/
├── server/                  # Express API
│   └── src/
│       ├── db/              # pool, schema.sql, migrate, seed
│       ├── routes/          # auth, subjects, topics
│       ├── middleware/      # JWT, xatolar
│       └── index.ts
├── client/                  # React + MUI
│   └── src/
│       ├── components/      # Layout, Sidebar, Markdown
│       ├── pages/           # Home, Subject, Lesson, Admin*
│       ├── api/client.ts
│       └── context/AuthContext.tsx
└── scripts/setup-db.sh
```

## Ishga tushirish

### 1. Bazani tayyorlash

```bash
sudo ./scripts/setup-db.sh
```

Yoki qo'lda:

```bash
sudo -u postgres psql -c "CREATE USER idu WITH PASSWORD 'idu';"
sudo -u postgres psql -c "CREATE DATABASE idu OWNER idu;"
```

### 2. Sozlamalar

`server/.env` faylini tekshiring (`server/.env.example` dan nusxa olingan):

```
DATABASE_URL=postgresql://idu:idu@localhost:5432/idu
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=ozgartiring-uzun-maxfiy-kalit
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
```

> Ishlab chiqarishga chiqarishdan oldin `JWT_SECRET` va `ADMIN_PASSWORD` ni albatta o'zgartiring.

### 2.1. Frontend sozlamasi

`client/.env.example` → `client/.env` (yoki mavjud `client/.env.production`):

```
VITE_API_URL=https://api.idu.universal-uz.uz
```

- Qiymat — **server origini**, oxirida `/api` yozilmaydi (kod o'zi qo'shadi).
- Bo'sh qoldirilsa nisbiy `/api` ishlatiladi: dev rejimida `vite.config.ts` dagi proxy
  `http://localhost:4000` ga uzatadi; front va backend bitta domenda tursa ham shu variant ishlaydi.
- `npm run dev` — `.env.development`/`.env` ni, `npm run build` — `.env.production` ni oladi.
  Ya'ni lokal ishlash prod API ga tegmaydi.
- Backend tomonda `CLIENT_ORIGIN` ga frontend domenini qo'shishni unutmang, aks holda CORS bloklaydi.

### 3. O'rnatish va ishga tushirish

```bash
npm run install:all     # root + server + client
npm run db:migrate      # jadvallarni yaratadi
npm run db:seed         # namuna fan va 5 ta dars qo'llanmasi
npm run dev             # server :4000, client :5173
```

Brauzer: <http://localhost:5173> · Kirish: <http://localhost:5173/login> (admin: `admin` / `admin123`; talabalar `/register` orqali ro'yxatdan o'tadi)

## Foydalanish

**O'qituvchi/talaba ko'rinishi**
- Chap paneldan fanni tanlaysiz → mavzular ro'yxati chiqadi.
- "Ish reja (jadval)" — kalendar-tematik reja: hafta, mavzu, dars turi, soat, jami.
- Mavzuga bosilganda to'liq dars qo'llanmasi: maqsadlar, tayanch so'zlar, dars matni,
  topshiriqlar, adabiyotlar. Pastda oldingi/keyingi mavzu tugmalari.
- "Chop etish" tugmasi — reja yoki qo'llanmani PDF ga chiqarish uchun (sidebar va tugmalar chop etishda chiqmaydi).
- Yuqori o'ng burchakdagi ☾/☀ tugmasi — **yorug'/qorong'u rejim**. Tanlov brauzerda
  (`localStorage`) saqlanadi; tanlanmagan bo'lsa tizim sozlamasiga ergashadi.

**Ulashish (studentlar uchun)**
- O'qituvchi tizimga kirgan bo'lsa, **fan sahifasi** va **dars sahifasi** yuqorisida
  "Ulashish" tugmasi chiqadi — bir bosishda `/s/<token>` havolasi yaratiladi va
  nusxalash uchun tayyor turadi. Xuddi shu narsa adminka jadvallaridagi ⤴ belgisida ham bor.
- Tugma faqat o'qituvchiga ko'rinadi; havolani ochgan student uni ko'rmaydi.
- **Fan ulashilsa** — student faqat o'sha fanni va uning mavzularini ko'radi; yon panelda
  boshqa fanlar yo'q, katalogga o'tish havolasi yo'q.
- **Mavzu ulashilsa** — faqat o'sha bitta dars qo'llanmasi ochiladi; yon panel umuman
  ko'rsatilmaydi, qo'shni mavzular ro'yxati yuborilmaydi.
- Havolani istalgan vaqt **o'chirib qo'yish** (`is_active`) yoki butunlay o'chirish mumkin.
  Har bir havola necha marta ochilgani hisoblanadi.
- Barcha havolalar: `/admin/havolalar`.

**Adminka**
- `/admin` — fanlar: qo'shish, tahrirlash, o'chirish (semestr, kredit, soatlar).
- `/admin/fan/:id` — fan mavzulari: qo'shish, tartibni o'zgartirish (↑↓), o'chirish.
- Mavzu muharriri — Markdown matn + "Ko'rinishi" tab orqali jonli ko'rish.

## Ma'lumotlar modeli

**subjects** — `name`, `code` (unikal), `description`, `semester`, `credits`,
`lecture_hours`, `practice_hours`, `independent_hours`, `position`

**shares** — `token` (unikal), `scope` (`subject` | `topic`), `subject_id`, `topic_id`,
`is_active`, `expires_at`, `view_count`. Fan yoki mavzu o'chirilsa havola ham cascade bilan
o'chadi.

**topics** — `subject_id` (FK, cascade), `title`, `week`, `position`, `lesson_type`
(`lecture` | `practice` | `lab` | `seminar` | `independent`), `hours`, `summary`,
`objectives` (har qatorda bittadan), `keywords` (vergul bilan), `content` (Markdown),
`assignments` (Markdown), `resources` (Markdown)

## API

| Metod | Manzil | Kirish |
|---|---|---|
| GET | `/api/health` | ochiq |
| POST | `/api/auth/register` | ochiq — talaba: `first_name, last_name, course (1–4), login, password` |
| POST | `/api/auth/login` | ochiq — admin (.env) yoki talaba |
| GET | `/api/auth/me` | admin/talaba |
| GET | `/api/subjects` | admin — barchasi; talaba — faqat o'z kursidagi fanlar |
| GET | `/api/subjects/:id` | admin/talaba (mavzular bilan; talaba faqat o'z kursidagi fanni) |
| POST/PUT/DELETE | `/api/subjects[/:id]` | admin; body'da `courses: [1, 3]` — fan biriktirilgan kurslar |
| GET | `/api/topics?subject_id=1` | admin/talaba |
| GET | `/api/topics/:id` | admin (to'liq qo'llanma; talaba dars matnini ko'rmaydi) |
| POST/PUT/DELETE | `/api/topics[/:id]` | admin |
| PUT | `/api/topics/reorder/:subjectId` | admin, `{ ids: [...] }` |
| GET | `/api/students` | admin — talabalar ro'yxati |
| PATCH/DELETE | `/api/students/:id` | admin — kursni o'zgartirish `{ course }` / o'chirish |
| GET | `/api/journal/:subjectId?course=2` | admin — jurnal: talabalar, darslar, davomat va ballar |
| POST | `/api/journal/:subjectId/sessions` | admin — dars qo'shish `{ course, lesson_date, topic_id?, note? }` |
| PUT/DELETE | `/api/journal/sessions/:id` | admin — darsni tahrirlash / o'chirish |
| PUT | `/api/journal/sessions/:id/marks` | admin — `{ marks: [{ student_id, present, score }] }`, ball — istalgan manfiy bo'lmagan son (2 kasr xonagacha); NB bo'lsa ball 0 |
| GET | `/api/submissions/topic/:topicId` | talaba — mavzu nomi, topshiriq sharti va o'z topshiriqlari |
| POST | `/api/submissions/topic/:topicId` | talaba — multipart: `content_kind` (text/code), `content`, `file` |
| GET | `/api/submissions/:id/file` | admin yoki topshiriq egasi — faylni yuklab olish |
| GET | `/api/submissions/notifications` | admin — yangi (ochilmagan) topshiriqlar soni va ro'yxati |
| POST | `/api/submissions/notifications/read-all` | admin — hammasini ko'rilgan deb belgilash |
| GET | `/api/submissions?status=submitted&subject_id=1` | admin — topshiriqlar ro'yxati |
| GET | `/api/submissions/:id` | admin — topshiriq (ochilganda "ko'rildi" bo'ladi) |
| PATCH | `/api/submissions/:id/grade` | admin — `{ score, feedback }` |
| GET/POST | `/api/shares` | admin — havolalar ro'yxati / yaratish |
| PATCH/DELETE | `/api/shares/:id` | admin — yoqish-o'chirish / o'chirish |
| GET | `/api/share/:token` | **ochiq** — faqat ulashilgan fan yoki mavzu |
| GET | `/api/share/:token/topic/:id` | **ochiq** — faqat ulashilgan fan ichidagi mavzu |

Himoyalangan so'rovlar `Authorization: Bearer <token>` sarlavhasini talab qiladi (JWT, 12 soat).

`/api/share/...` uchun token kerak emas, lekin server har so'rovda havola faolligini,
muddatini va so'ralgan mavzu shu havolaga tegishli ekanini tekshiradi — mavzu havolasi
orqali boshqa mavzuni, fan havolasi orqali boshqa fan mavzusini olish mumkin emas.

## Dars qo'llanmasi uchun tavsiya etilgan struktura

Muharrirda yangi mavzu ochilganda shablon avtomatik qo'yiladi:

1. **Darsning maqsadi** — dars oxirida talaba nima qila oladi.
2. **Nazariy qism** — bo'limlarga ajratilgan, jadval va kod misollari bilan.
3. **Amaliy qism** — sinfda bajariladigan topshiriqlar.
4. **Yakunlash** — takrorlash savollari, uyga vazifa.

Markdown imkoniyatlari: `##` sarlavhalar, `**qalin**`, ro'yxatlar, `| jadval |`,
```` ```python ```` kod bloklari, `> eslatma`, havolalar.
