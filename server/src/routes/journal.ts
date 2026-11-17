import { Router } from 'express';
import { z } from 'zod';
import { many, one, pool, query } from '../db/pool.js';
import { assertStaffSubject, requireStaff } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { AttendanceMark, ClassSession, Student, Subject } from '../types.js';

export const journalRouter = Router(); // /api/journal — o'qituvchi (o'z fanlari) va admin

journalRouter.use(requireStaff);

/** Topshiriq yuborilgan sana mahalliy vaqt bo'yicha olinadi */
export const LOCAL_TZ = 'Asia/Tashkent';

/**
 * Dars ma'ruzami: mavzusining turi bo'yicha (mavzusiz yoki mavzusi o'chirilgan dars — ma'ruza emas).
 * Ma'ruza baholanmaydi: faqat davomat, ball qo'yilmaydi va topshiriq bali unga tushmaydi.
 */
export const isLectureSql = (sessionAlias: string) => `EXISTS (
  SELECT 1 FROM topics lt
   WHERE lt.id = ${sessionAlias}.topic_id AND lt.deleted_at IS NULL AND lt.lesson_type = 'lecture')`;

/**
 * Topshiriq (sb) qaysi darsga tegishli: fan ($1) + kurs ($2) darslari (ma'ruzalardan tashqari)
 * ichidan topshiriq yuborilgan kundagisi, u kuni dars bo'lmasa — undan oldingi eng yaqin dars;
 * bir kunda bir nechta bo'lsa — mavzusi mos kelgani, so'ng birinchisi.
 * Yuborilgan kungacha umuman dars bo'lmasa — NULL.
 */
const SUBMISSION_SESSION_SQL = `(
  SELECT cs.id FROM class_sessions cs
   WHERE cs.subject_id = $1 AND cs.course = $2 AND cs.deleted_at IS NULL
     AND NOT ${isLectureSql('cs')}
     AND (cs.group_id IS NULL
          OR cs.group_id IS NOT DISTINCT FROM (SELECT st.group_id FROM students st WHERE st.id = sb.student_id))
     AND cs.lesson_date <= (sb.submitted_at AT TIME ZONE '${LOCAL_TZ}')::date
   ORDER BY cs.lesson_date DESC, (cs.topic_id IS NOT DISTINCT FROM sb.topic_id) DESC, cs.id
   LIMIT 1)`;

/** DATE ustunini vaqt mintaqasiz 'YYYY-MM-DD' ko'rinishida qaytaramiz */
const SESSION_COLUMNS = `id, subject_id, course, to_char(lesson_date, 'YYYY-MM-DD') AS lesson_date,
  topic_id, note, group_id, created_at`;

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

/** Darsning guruhi: shu kursdagi guruh bo'lishi kerak */
async function assertGroupOfCourse(groupId: number | null | undefined, course: number) {
  if (!groupId) return;
  const row = await one('SELECT 1 FROM groups WHERE id = $1 AND course = $2', [groupId, course]);
  if (!row) throw new HttpError(400, `Guruh ${course}-kursga tegishli emas`);
}

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

async function assertSessionOwner(user: NonNullable<Express.Request['user']>, sessionId: number) {
  const session = await one<{ subject_id: number }>(
    'SELECT subject_id FROM class_sessions WHERE id = $1 AND deleted_at IS NULL',
    [sessionId],
  );
  if (!session) throw new HttpError(404, 'Dars topilmadi');
  await assertStaffSubject(user, session.subject_id);
}

async function assertCourseAttached(subjectId: number, course: number) {
  const row = await one(
    `SELECT 1 FROM subject_courses sc JOIN subjects s ON s.id = sc.subject_id
      WHERE sc.subject_id = $1 AND sc.course = $2 AND s.deleted_at IS NULL`,
    [subjectId, course],
  );
  if (!row) throw new HttpError(400, `Fan ${course}-kursga biriktirilmagan`);
}

async function assertTopicOfSubject(topicId: number | null | undefined, subjectId: number) {
  if (!topicId) return;
  const row = await one('SELECT 1 FROM topics WHERE id = $1 AND subject_id = $2 AND deleted_at IS NULL', [
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
    await assertStaffSubject(req.user!, subjectId);
    const subject = await one<Subject & { courses: number[] }>(
      `SELECT s.*, COALESCE(
                (SELECT array_agg(course ORDER BY course) FROM subject_courses WHERE subject_id = s.id),
                '{}'::int[]) AS courses
         FROM subjects s WHERE s.id = $1 AND s.deleted_at IS NULL`,
      [subjectId],
    );
    if (!subject) throw new HttpError(404, 'Fan topilmadi');

    const normalizedSubject = {
      ...subject,
      courses: Array.isArray(subject.courses) ? subject.courses : [],
    };
    const course = req.query.course ? Number(req.query.course) : (normalizedSubject.courses[0] ?? null);
    if (course === null) {
      res.json({
        subject,
        course: null,
        groups: [],
        group_id: null,
        students: [],
        sessions: [],
        marks: [],
        task_scores: [],
        unassigned_task_scores: [],
      });
      return;
    }
    if (!normalizedSubject.courses.includes(course)) {
      throw new HttpError(400, `Fan ${course}-kursga biriktirilmagan`);
    }

    // Guruhlar: ?guruh=ID yoki ?guruh=all. Berilmasa — kursda guruh bo'lsa birinchisi, bo'lmasa hammasi
    const groups = await many<{ id: number; name: string; course: number }>(
      'SELECT id, name, course FROM groups WHERE course = $1 ORDER BY name',
      [course],
    );
    const groupParam = req.query.guruh;
    let groupId: number | null;
    if (groupParam === 'all') groupId = null;
    else if (groupParam) {
      groupId = Number(groupParam);
      if (!groups.some((g) => g.id === groupId)) throw new HttpError(400, 'Guruh topilmadi');
    } else groupId = groups[0]?.id ?? null;

    // Tanlangan guruhning darslari + butun kursga umumiy (guruhsiz) darslar
    const sessions = await many<ClassSession & { topic_title: string | null; lesson_type: string | null }>(
      `SELECT cs.id, cs.subject_id, cs.course, to_char(cs.lesson_date, 'YYYY-MM-DD') AS lesson_date,
              t.id AS topic_id, cs.note, cs.group_id, cs.created_at, t.title AS topic_title,
              t.lesson_type
         FROM class_sessions cs
         LEFT JOIN topics t ON t.id = cs.topic_id AND t.deleted_at IS NULL
        WHERE cs.subject_id = $1 AND cs.course = $2 AND cs.deleted_at IS NULL
          AND ($3::int IS NULL OR cs.group_id IS NULL OR cs.group_id = $3)
        ORDER BY cs.lesson_date, cs.id`,
      [subjectId, course, groupId],
    );

    const students = await many<Omit<Student, 'created_at'>>(
      `SELECT id, first_name, last_name, login, course, group_id
         FROM students st
        WHERE st.deleted_at IS NULL
          AND ($3::int IS NULL OR st.group_id = $3)
          AND (st.course = $2
           OR EXISTS (
             SELECT 1 FROM attendance a JOIN class_sessions cs ON cs.id = a.session_id
              WHERE a.student_id = st.id AND cs.subject_id = $1 AND cs.course = $2
                AND cs.deleted_at IS NULL))
        ORDER BY last_name, first_name`,
      [subjectId, course, groupId],
    );

    // Ma'ruzada ball hisoblanmaydi (dars keyin ma'ruzaga o'zgartirilgan bo'lsa ham eski ball ko'rinmaydi)
    const marks = await many<AttendanceMark>(
      `SELECT a.session_id, a.student_id, a.present,
              CASE WHEN ${isLectureSql('cs')} THEN 0 ELSE a.score::float8 END AS score,
              a.score_override AND NOT ${isLectureSql('cs')} AS score_override
         FROM attendance a
         JOIN class_sessions cs ON cs.id = a.session_id
         JOIN students st ON st.id = a.student_id AND st.deleted_at IS NULL
        WHERE cs.subject_id = $1 AND cs.course = $2 AND cs.deleted_at IS NULL
          AND ($3::int IS NULL OR cs.group_id IS NULL OR cs.group_id = $3)`,
      [subjectId, course, groupId],
    );

    // Topshiriq ballari topshiriq yuborilgan kundagi (u kuni dars bo'lmasa — oldingi eng yaqin)
    // darsga qo'shiladi. Saqlanmaydi — har safar hisoblanadi.
    // Yuborilgan kungacha dars bo'lmasa — "darssiz topshiriq" (jami ballga baribir qo'shiladi).
    const taskRows = await many<{ session_id: number | null; student_id: number; score: number; count: number }>(
      `SELECT ${SUBMISSION_SESSION_SQL} AS session_id, sb.student_id,
              SUM(sb.score)::float8 AS score, COUNT(*)::int AS count
         FROM submissions sb JOIN topics t ON t.id = sb.topic_id
        WHERE t.subject_id = $1 AND sb.status = 'graded' AND sb.deleted_at IS NULL
        GROUP BY 1, sb.student_id`,
      [subjectId, course],
    );
    const taskScores = taskRows.filter((r) => r.session_id !== null);
    const unassignedTaskScores = taskRows
      .filter((r) => r.session_id === null)
      .map(({ student_id, score, count }) => ({ student_id, score, count }));

    res.json({
      subject: normalizedSubject,
      course,
      groups,
      group_id: groupId,
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
      .extend({
        course: z.coerce.number().int().min(1).max(4),
        group_id: z.coerce.number().int().positive().nullable().optional(),
      })
      .parse(req.body);
    await assertStaffSubject(req.user!, subjectId);
    await assertCourseAttached(subjectId, data.course);
    await assertGroupOfCourse(data.group_id, data.course);
    await assertTopicOfSubject(data.topic_id, subjectId);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<ClassSession>(
        `INSERT INTO class_sessions (subject_id, course, lesson_date, topic_id, note, group_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${SESSION_COLUMNS}`,
        [subjectId, data.course, data.lesson_date, data.topic_id ?? null, data.note, data.group_id ?? null],
      );
      await client.query(
        `INSERT INTO attendance (session_id, student_id)
         SELECT $1, id FROM students
          WHERE course = $2 AND deleted_at IS NULL AND ($3::int IS NULL OR group_id = $3)`,
        [rows[0].id, data.course, data.group_id ?? null],
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
    const current = await one<ClassSession>(
      'SELECT subject_id FROM class_sessions WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (!current) throw new HttpError(404, 'Dars topilmadi');
    await assertStaffSubject(req.user!, current.subject_id);
    await assertTopicOfSubject(data.topic_id, current.subject_id);

    const row = await one<ClassSession>(
      `UPDATE class_sessions SET lesson_date = $1, topic_id = $2, note = $3
        WHERE id = $4 RETURNING ${SESSION_COLUMNS}`,
      [data.lesson_date, data.topic_id ?? null, data.note, id],
    );
    res.json(row);
  }),
);

/**
 * Yumshoq o'chirish: dars va uning davomati/baholari bazada qoladi, faqat deleted_at qo'yiladi.
 * Jurnal, talaba sahifasi va topshiriq ballari o'chirilgan darsni ko'rmaydi.
 */
journalRouter.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await assertSessionOwner(req.user!, id);
    const result = await query(
      'UPDATE class_sessions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (result.rowCount === 0) throw new HttpError(404, 'Dars topilmadi');
    res.status(204).end();
  }),
);

/**
 * Davomat va ballarni saqlash (bitta yoki bir nechta talaba). Kelmagan talabaning bali 0.
 * Ma'ruza darsiga faqat davomat belgilanadi — ball qo'yib bo'lmaydi.
 */
journalRouter.put(
  '/sessions/:id/marks',
  asyncHandler(async (req, res) => {
    const sessionId = Number(req.params.id);
    const { marks } = marksSchema.parse(req.body);
    await assertSessionOwner(req.user!, sessionId);
    const lecture = await one(`SELECT 1 FROM class_sessions cs WHERE cs.id = $1 AND ${isLectureSql('cs')}`, [
      sessionId,
    ]);
    if (lecture && marks.some((m) => m.present && (m.score > 0 || m.score_override))) {
      throw new HttpError(400, "Ma'ruza darsi baholanmaydi — faqat davomat belgilanadi");
    }

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
