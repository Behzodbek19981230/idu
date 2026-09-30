import { Router } from 'express';
import { z } from 'zod';
import { many, one, pool, query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { AttendanceMark, ClassSession, Student, Subject } from '../types.js';

export const journalRouter = Router(); // /api/journal — o'qituvchi (admin)

journalRouter.use(requireAdmin);

/** DATE ustunini vaqt mintaqasiz 'YYYY-MM-DD' ko'rinishida qaytaramiz */
const SESSION_COLUMNS = `id, subject_id, course, to_char(lesson_date, 'YYYY-MM-DD') AS lesson_date,
  topic_id, note, created_at`;

/** Ball: istalgan manfiy bo'lmagan son (0.3, 1.5, 2 …); bazada 2 kasr xonagacha saqlanadi */
const scoreSchema = z.coerce
  .number()
  .min(0, 'ball manfiy bo‘lmaydi')
  .max(9999.99, 'ball juda katta');

const sessionSchema = z.object({
  lesson_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'sana YYYY-MM-DD ko‘rinishida'),
  topic_id: z.coerce.number().int().positive().nullable().optional(),
  note: z.string().default(''),
});

const marksSchema = z.object({
  marks: z
    .array(
      z.object({
        student_id: z.coerce.number().int().positive(),
        present: z.boolean(),
        score: scoreSchema,
        score_override: z.boolean().default(false),
      }),
    )
    .min(1),
});

async function assertCourseAttached(subjectId: number, course: number) {
  const row = await one('SELECT 1 FROM subject_courses WHERE subject_id = $1 AND course = $2', [
    subjectId,
    course,
  ]);
  if (!row) throw new HttpError(400, `Fan ${course}-kursga biriktirilmagan`);
}

async function assertTopicOfSubject(topicId: number | null | undefined, subjectId: number) {
  if (!topicId) return;
  const row = await one('SELECT 1 FROM topics WHERE id = $1 AND subject_id = $2', [
    topicId,
    subjectId,
  ]);
  if (!row) throw new HttpError(400, 'Mavzu bu fanga tegishli emas');
}

/**
 * Fan jurnali: ?course=2. Kurs berilmasa — fanga biriktirilgan birinchi kurs.
 * Talabalar: hozir shu kursda o'qiyotganlar + boshqa kursga o'tgan, lekin shu jurnalda bahosi borlar.
 */
journalRouter.get(
  '/:subjectId',
  asyncHandler(async (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const subject = await one<Subject & { courses: number[] }>(
      `SELECT s.*, COALESCE(
                (SELECT array_agg(course ORDER BY course) FROM subject_courses WHERE subject_id = s.id),
                '{}'::int[]) AS courses
         FROM subjects s WHERE s.id = $1`,
      [subjectId],
    );
    if (!subject) throw new HttpError(404, 'Fan topilmadi');

    const course = req.query.course ? Number(req.query.course) : (subject.courses[0] ?? null);
    if (course === null) {
      res.json({
        subject,
        course: null,
        students: [],
        sessions: [],
        marks: [],
        task_scores: [],
        unassigned_task_scores: [],
      });
      return;
    }
    if (!subject.courses.includes(course)) {
      throw new HttpError(400, `Fan ${course}-kursga biriktirilmagan`);
    }

    const sessions = await many<ClassSession & { topic_title: string | null }>(
      `SELECT cs.id, cs.subject_id, cs.course, to_char(cs.lesson_date, 'YYYY-MM-DD') AS lesson_date,
              cs.topic_id, cs.note, cs.created_at, t.title AS topic_title
         FROM class_sessions cs
         LEFT JOIN topics t ON t.id = cs.topic_id
        WHERE cs.subject_id = $1 AND cs.course = $2
        ORDER BY cs.lesson_date, cs.id`,
      [subjectId, course],
    );

    const students = await many<Omit<Student, 'created_at'>>(
      `SELECT id, first_name, last_name, login, course
         FROM students st
        WHERE st.course = $2
           OR EXISTS (
             SELECT 1 FROM attendance a JOIN class_sessions cs ON cs.id = a.session_id
              WHERE a.student_id = st.id AND cs.subject_id = $1 AND cs.course = $2)
        ORDER BY last_name, first_name`,
      [subjectId, course],
    );

    const marks = await many<AttendanceMark>(
      `SELECT a.session_id, a.student_id, a.present, a.score::float8 AS score, a.score_override
         FROM attendance a JOIN class_sessions cs ON cs.id = a.session_id
        WHERE cs.subject_id = $1 AND cs.course = $2`,
      [subjectId, course],
    );

    // Topshiriq ballari: talabaning mavzu bo'yicha baholangan barcha topshiriqlari yig'indisi
    // shu mavzu o'tilgan (birinchi) darsga qo'shiladi. Saqlanmaydi — har safar hisoblanadi.
    const taskScores = await many<{ session_id: number; student_id: number; score: number; count: number }>(
      `WITH topic_session AS (
         SELECT DISTINCT ON (topic_id) id, topic_id
           FROM class_sessions
          WHERE subject_id = $1 AND course = $2 AND topic_id IS NOT NULL
          ORDER BY topic_id, lesson_date, id
       )
       SELECT ts.id AS session_id, sb.student_id,
              SUM(sb.score)::float8 AS score, COUNT(*)::int AS count
         FROM submissions sb JOIN topic_session ts ON ts.topic_id = sb.topic_id
        WHERE sb.status = 'graded'
        GROUP BY ts.id, sb.student_id`,
      [subjectId, course],
    );

    // Jurnalda hali darsi yo'q mavzular bo'yicha topshiriq ballari (jami ballga baribir qo'shiladi)
    const unassignedTaskScores = await many<{ student_id: number; score: number; count: number }>(
      `SELECT sb.student_id, SUM(sb.score)::float8 AS score, COUNT(*)::int AS count
         FROM submissions sb JOIN topics t ON t.id = sb.topic_id
        WHERE t.subject_id = $1 AND sb.status = 'graded'
          AND NOT EXISTS (
            SELECT 1 FROM class_sessions cs
             WHERE cs.subject_id = $1 AND cs.course = $2 AND cs.topic_id = sb.topic_id)
        GROUP BY sb.student_id`,
      [subjectId, course],
    );

    res.json({
      subject,
      course,
      students,
      sessions,
      marks,
      task_scores: taskScores,
      unassigned_task_scores: unassignedTaskScores,
    });
  }),
);

/** Yangi dars. Shu kursdagi barcha talabalar "keldi, 0 ball" bilan belgilanadi */
journalRouter.post(
  '/:subjectId/sessions',
  asyncHandler(async (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const data = sessionSchema
      .extend({ course: z.coerce.number().int().min(1).max(4) })
      .parse(req.body);
    await assertCourseAttached(subjectId, data.course);
    await assertTopicOfSubject(data.topic_id, subjectId);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<ClassSession>(
        `INSERT INTO class_sessions (subject_id, course, lesson_date, topic_id, note)
         VALUES ($1,$2,$3,$4,$5) RETURNING ${SESSION_COLUMNS}`,
        [subjectId, data.course, data.lesson_date, data.topic_id ?? null, data.note],
      );
      await client.query(
        `INSERT INTO attendance (session_id, student_id)
         SELECT $1, id FROM students WHERE course = $2`,
        [rows[0].id, data.course],
      );
      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }),
);

journalRouter.put(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = sessionSchema.parse(req.body);
    const current = await one<ClassSession>('SELECT subject_id FROM class_sessions WHERE id = $1', [
      id,
    ]);
    if (!current) throw new HttpError(404, 'Dars topilmadi');
    await assertTopicOfSubject(data.topic_id, current.subject_id);

    const row = await one<ClassSession>(
      `UPDATE class_sessions SET lesson_date = $1, topic_id = $2, note = $3
        WHERE id = $4 RETURNING ${SESSION_COLUMNS}`,
      [data.lesson_date, data.topic_id ?? null, data.note, id],
    );
    res.json(row);
  }),
);

journalRouter.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM class_sessions WHERE id = $1', [Number(req.params.id)]);
    if (result.rowCount === 0) throw new HttpError(404, 'Dars topilmadi');
    res.status(204).end();
  }),
);

/** Davomat va ballarni saqlash (bitta yoki bir nechta talaba). Kelmagan talabaning bali 0 */
journalRouter.put(
  '/sessions/:id/marks',
  asyncHandler(async (req, res) => {
    const sessionId = Number(req.params.id);
    const { marks } = marksSchema.parse(req.body);
    const session = await one('SELECT id FROM class_sessions WHERE id = $1', [sessionId]);
    if (!session) throw new HttpError(404, 'Dars topilmadi');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const mark of marks) {
        await client.query(
          `INSERT INTO attendance (session_id, student_id, present, score, score_override)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (session_id, student_id)
           DO UPDATE SET present = EXCLUDED.present, score = EXCLUDED.score,
                         score_override = EXCLUDED.score_override, updated_at = now()`,
          [
            sessionId,
            mark.student_id,
            mark.present,
            mark.present ? mark.score : 0,
            mark.present && mark.score_override,
          ],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const saved = await many<AttendanceMark>(
      `SELECT session_id, student_id, present, score::float8 AS score, score_override
         FROM attendance WHERE session_id = $1 AND student_id = ANY($2::int[])`,
      [sessionId, marks.map((m) => m.student_id)],
    );
    res.json(saved);
  }),
);
