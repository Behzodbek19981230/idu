import { pool } from './pool.js';
import { subject, topics } from './seed-data.js';

const TUR_NOMI: Record<string, string> = {
  lecture: 'Ma’ruza',
  practice: 'Amaliy',
  lab: 'Laboratoriya',
  seminar: 'Seminar',
  independent: 'Mustaqil ish',
};

function soatlarniHisobla() {
  const jami: Record<string, number> = {};
  for (const t of topics) {
    jami[t.lesson_type] = (jami[t.lesson_type] ?? 0) + t.hours;
  }
  return jami;
}

function soatlarniTekshir() {
  const jami = soatlarniHisobla();
  const kutilgan: Array<[string, number, number]> = [
    ['Ma’ruza', jami.lecture ?? 0, subject.lecture_hours],
    ['Amaliy', (jami.practice ?? 0) + (jami.lab ?? 0) + (jami.seminar ?? 0), subject.practice_hours],
    ['Mustaqil', jami.independent ?? 0, subject.independent_hours],
  ];

  for (const [nom, mavzular, fan] of kutilgan) {
    if (mavzular !== fan) {
      console.warn(
        `⚠ ${nom}: mavzular bo'yicha ${mavzular} soat, fan kartasida ${fan} soat (${fan - mavzular} soat taqsimlanmagan).`,
      );
    }
  }
}

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

    const jami = soatlarniHisobla();
    console.log(`✓ "${subject.name}" (${subject.code}) qo'shildi — ${topics.length} ta mavzu.`);
    for (const [tur, soat] of Object.entries(jami)) {
      const soni = topics.filter((t) => t.lesson_type === tur).length;
      console.log(`  · ${TUR_NOMI[tur] ?? tur}: ${soni} ta mavzu, ${soat} soat`);
    }
    soatlarniTekshir();
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
    console.error('✗ Seed xatosi:', err.message);
    process.exit(1);
  });
