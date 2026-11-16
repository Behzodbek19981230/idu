/**
 * Demo seeder: o'qituvchi (login `seed_teacher`), unga biriktirilgan "Hisoblash matematikasi" fani,
 * 1-kurs 3-26 va 9-26 guruhlari, ularning talabalari, har guruhning o'z dars sanalari (mavzu bilan)
 * va davomat/ballar.
 *
 * Mavjud ma'lumotlarga TEGMAYDI: faqat o'zining yozuvlarini (SEED_SUBJECT_CODE kodli fan,
 * `seed_` prefiksli loginli talabalar va o'qituvchi) o'chirib, qaytadan yaratadi.
 * Guruhlar nomi bo'yicha qayta ishlatiladi (bo'lmasa yaratiladi) va o'chirilmaydi.
 *
 * Ishga tushirish: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const SEED_SUBJECT_CODE = 'HM-SEED-26';
const LOGIN_PREFIX = 'seed_';
const PASSWORD = 'idu12345';
const COURSE = 1;
const TEACHER = { login: 'nodira', first_name: 'Nodira', last_name: 'Fattoyeva' };
const GROUP_NAMES: Record<string, string> = { g326: '3-26', g926: '9-26' };
const YEAR = 2026;

/** Familiya Ism Otasining ismi — rasmdagi ro'yxat tartibida (ustiga chizilganlar kiritilmagan) */
const GROUPS: Record<string, { dates: string[]; students: string[] }> = {
  'g326': {
    dates: ['12.10', '13.10', '20.10', '21.10', '23.10', '26.10', '27.10', '30.10'],
    students: [
      'Abdufattoyev Jasurbek Valisherivich',
      'Abdullayev Dastonbek Ikramjonvich',
      "Abduxalilov Azizbek Jaxbar o'g'li",
      "Adham Axmedov O'rolovich",
      'Askarbekova Oyxon Yerbol qizi',
      'Bahromov Ohunjon Adhamovich',
      "Botirbekov Abdulloh Jasur o'g'li",
      'Iskandarova Gulasal Erkinbekova',
      'Jumayev Baxtiyor Jumayevich',
      'Mumindjanov Diyarbek',
      'Murodullayev Quvonchbek',
      'Nazaraliyev Shohrux',
      'Ochildiyev Rahmonjon Yunusalivich',
      "Otaboyev Otabek Turg'unboy o'g'li",
      'Oybek Mirzasharipov Maxmudovich',
      "Qobilov Zafar Zokir o'g'li",
      'Quralbayev Oljas Ahmetov Mansur',
      'Raimov Muhammadsharif',
      "Raxmonqulov Husan Hasan o'g'li",
      'Rustambekov Shohboz Baxtiyorovich',
      "Sadrtdinov Abduboriy Jamoltdin o'g'li",
      "Sherboboyev Zohirshoh Jasurbek o'g'li",
      'Shuhratov Behruz Shuhratovich',
      'Tolibboyeva Dilorom',
      'Urinbosarov Asadbek Muslimovich',
      'Muxammadjonov Nusratilla',
    ],
  },
  'g926': {
    dates: ['14.10', '15.10', '16.10', '20.10', '21.10', '22.10', '23.10', '29.10', '30.10', '03.11', '05.11', '06.11'],
    students: [
      'Abdigapparov Berik Nurmaxanovich',
      "Abdullaho'jayev Azam",
      'Abdurafi Abdullayev Elmurodovich',
      'Abduvoxidov Toxirjon Abduvoidovich',
      'Ahmadov Nodir Isroilovich',
      'Akbarjonov Behruz Umidjonovich',
      'Akmalov Jahongir Akramovich',
      'Asqarov Farruxbek Karimovich',
      "Avazbekov Shoxrux Xamid o'g'li",
      "Azamatov Shahriyor Otabek o'g'li",
      'Bahtiyorov Javoxirbek',
      'Dilshodov Shohruz Dilshodovich',
      "Eshonqulov Shahzod Bahodir o'g'li",
      'Mamanazarov Jahongir Jamolovich',
      'Nosirov Xojiakbar Shoyimardonovich',
      'Roziqulov Bekzod',
      "Sayfullayev Azizbek Nodir o'g'li",
      "To'qqulov Javoxir Jaxongirovich",
      'Toxtasinov Sherzod Faxriddinovich',
      'Irkinov Umid Xusniddinovich',
      'Xolmamatov Ozodbek',
      "Yunusov Umar Umidjon o'g'li",
      'Zokirjonov Abduboriy',
      "Salimova Ulbo'sin Abror qizi",
      "O'skenov Azamat Jahongir o'g'li",
      "Egamberdiyev Samariddin Qahramon o'g'li",
      "Abdunazarov Diyorbek Ixtiyor o'g'li",
      "Abdusattorov Abdug'affor",
      "Tangirbergenov Qadirbergen Kuatbay o'g'li",
    ],
  },
};

/** Mavzular tartibi (elementar matematika, fake): guruhning i-darsi — i-mavzu */
const TOPICS: { title: string; type: 'lecture' | 'practice'; summary: string }[] = [
  { title: 'Natural va butun sonlar ustida amallar', type: 'lecture', summary: "Natural, butun sonlar, bo'linish belgilari, EKUB va EKUK." },
  { title: "Oddiy va o'nli kasrlar", type: 'practice', summary: "Kasrlarni qisqartirish, umumiy maxrajga keltirish, kasrlar ustida amallar." },
  { title: 'Nisbat va proporsiya', type: 'lecture', summary: "Nisbat, proporsiya, to'g'ri va teskari proporsional bog'lanishlar." },
  { title: 'Foizga oid masalalar', type: 'practice', summary: "Sonning foizini topish, foiz bo'yicha sonni topish, murakkab foiz." },
  { title: 'Darajalar va ildizlar', type: 'lecture', summary: "Butun ko'rsatkichli daraja, kvadrat ildiz, xossalari." },
  { title: 'Qisqa ko‘paytirish formulalari', type: 'practice', summary: "(a±b)², a²−b², (a±b)³ formulalarini qo'llash." },
  { title: 'Ko‘phadlarni ko‘paytuvchilarga ajratish', type: 'practice', summary: "Umumiy ko'paytuvchini qavsdan chiqarish, guruhlash usuli." },
  { title: 'Algebraik kasrlar', type: 'lecture', summary: "Algebraik kasrlarni qisqartirish va ular ustida amallar." },
  { title: 'Chiziqli tenglamalar', type: 'lecture', summary: "Bir noma'lumli chiziqli tenglamalar va ularni yechish." },
  { title: 'Chiziqli tenglamalar sistemasi', type: 'practice', summary: "O'rniga qo'yish va qo'shish usullari." },
  { title: 'Chiziqli tengsizliklar', type: 'practice', summary: "Tengsizlik xossalari, sonli oraliqlar, tengsizliklarni yechish." },
  { title: 'Kvadrat tenglamalar', type: 'lecture', summary: "Diskriminant, Viyet teoremasi." },
  { title: 'Kvadrat tenglamalarga keltiriladigan tenglamalar', type: 'practice', summary: "Bikvadrat va kasr-ratsional tenglamalar." },
];

/** Deterministik tasodifiy sonlar — har ishga tushirishda bir xil natija */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isoDate = (ddmm: string) => {
  const [d, m] = ddmm.split('.');
  return `${YEAR}-${m}-${d}`;
};

const ascii = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Faqat o'zimizning oldingi yozuvlarni tozalaymiz (fan o'chsa mavzu/dars/davomat ham cascade)
    await client.query('DELETE FROM subjects WHERE code = $1', [SEED_SUBJECT_CODE]);
    await client.query('DELETE FROM students WHERE login LIKE $1', [`${LOGIN_PREFIX}%`]);
    await client.query('DELETE FROM teachers WHERE login = $1', [TEACHER.login]);

    const hash = await bcrypt.hash(PASSWORD, 10);

    const { rows: [teacher] } = await client.query<{ id: number }>(
      `INSERT INTO teachers (first_name, last_name, login, password_hash) VALUES ($1,$2,$3,$4) RETURNING id`,
      [TEACHER.first_name, TEACHER.last_name, TEACHER.login, hash],
    );

    const { rows: [subject] } = await client.query<{ id: number }>(
      `INSERT INTO subjects (name, code, description, semester, credits, lecture_hours, practice_hours, independent_hours, position, teacher_id)
       VALUES ('Hisoblash matematikasi', $1, 'Elementar matematika asoslari (demo ma''lumot)', 1, 4, 32, 32, 56,
               COALESCE((SELECT MAX(position) + 1 FROM subjects), 0), $2)
       RETURNING id`,
      [SEED_SUBJECT_CODE, teacher.id],
    );
    await client.query('INSERT INTO subject_courses (subject_id, course) VALUES ($1, $2)', [subject.id, COURSE]);

    const topicIds: number[] = [];
    for (const [i, t] of TOPICS.entries()) {
      const { rows: [topic] } = await client.query<{ id: number }>(
        `INSERT INTO topics (subject_id, title, week, position, lesson_type, hours, summary)
         VALUES ($1,$2,$3,$4,$5,2,$6) RETURNING id`,
        [subject.id, t.title, Math.floor(i / 3) + 1, i, t.type, t.summary],
      );
      topicIds.push(topic.id);
    }

    const rand = mulberry32(2026);
    let studentCount = 0;
    let markCount = 0;
    let sessionCount = 0;
    for (const [groupKey, group] of Object.entries(GROUPS)) {
      const { rows: [grp] } = await client.query<{ id: number }>(
        `INSERT INTO groups (name, course) VALUES ($1,$2)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [GROUP_NAMES[groupKey], COURSE],
      );

      // Guruhning o'z darslari: i-dars — i-mavzu
      const sessionIds: number[] = [];
      for (const [i, date] of group.dates.entries()) {
        const { rows: [session] } = await client.query<{ id: number }>(
          `INSERT INTO class_sessions (subject_id, course, lesson_date, topic_id, group_id)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [subject.id, COURSE, isoDate(date), topicIds[i], grp.id],
        );
        sessionIds.push(session.id);
        sessionCount++;
      }

      for (const full of group.students) {
        const [lastName, ...rest] = full.split(/\s+/);
        const firstName = rest.join(' ') || lastName;
        const login = `${LOGIN_PREFIX}${groupKey}_${ascii(lastName)}`.slice(0, 32);
        const { rows: [student] } = await client.query<{ id: number }>(
          `INSERT INTO students (first_name, last_name, login, password_hash, course, group_id)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [firstName, lastName, login, hash, COURSE, grp.id],
        );
        studentCount++;

        const attendRate = 0.45 + rand() * 0.5; // har talabaning o'z davomat darajasi
        for (const sessionId of sessionIds) {
          const present = rand() < attendRate;
          const score = present ? 1 + Math.floor(rand() * 5) : 0;
          await client.query(
            `INSERT INTO attendance (session_id, student_id, present, score) VALUES ($1,$2,$3,$4)`,
            [sessionId, student.id, present, score],
          );
          markCount++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(
      `✓ Seed bajarildi: o'qituvchi, 1 fan, ${TOPICS.length} mavzu, 2 guruh, ${sessionCount} dars, ${studentCount} talaba, ${markCount} davomat yozuvi.\n` +
        `  O'qituvchi: ${TEACHER.login}; talabalar: ${LOGIN_PREFIX}g326_<familiya>, ${LOGIN_PREFIX}g926_<familiya>; parol hammasiga: ${PASSWORD}`,
    );
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('✗ Seed xatosi:', err.message);
  process.exit(1);
});
