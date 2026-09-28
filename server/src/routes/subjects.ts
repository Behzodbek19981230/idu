import { Router } from 'express';
import { z } from 'zod';
import type pg from 'pg';
import { many, one, pool, query } from '../db/pool.js';
import { assertSubjectAccess, courseFilter, requireAdmin, requireUser } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Subject, Topic } from '../types.js';

export const subjectsRouter = Router();

const subjectSchema = z.object({
  name: z.string().min(2, 'fan nomi juda qisqa'),
  code: z.string().min(1, 'fan kodi kiritilmagan'),
  description: z.string().default(''),
  semester: z.coerce.number().int().min(1).max(12).nullable().optional(),
  credits: z.coerce.number().int().min(0).max(60).nullable().optional(),
  lecture_hours: z.coerce.number().int().min(0).default(0),
  practice_hours: z.coerce.number().int().min(0).default(0),
  independent_hours: z.coerce.number().int().min(0).default(0),
  position: z.coerce.number().int().min(0).default(0),
  /** Fan biriktirilgan kurslar (1–4) */
  courses: z.array(z.coerce.number().int().min(1).max(4)).default([]),
});

/** Har bir fan uchun biriktirilgan kurslar massivi */
const COURSES_JOIN = `
  LEFT JOIN (
    SELECT subject_id, array_agg(course ORDER BY course) AS courses
      FROM subject_courses GROUP BY subject_id
  ) c ON c.subject_id = s.id`;

async function saveCourses(client: pg.PoolClient, subjectId: number, courses: number[]) {
  await client.query('DELETE FROM subject_courses WHERE subject_id = $1', [subjectId]);
  for (const course of new Set(courses)) {
    await client.query('INSERT INTO subject_courses (subject_id, course) VALUES ($1, $2)', [
      subjectId,
      course,
    ]);
  }
}

/** Fan + kurslarni bitta tranzaksiyada saqlaydi */
async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Fanlar ro'yxati + har biri uchun mavzular soni va umumiy soat.
 *  Talabaga faqat uning kursiga biriktirilgan fanlar qaytariladi. */
subjectsRouter.get(
  '/',
  requireUser,
  asyncHandler(async (req, res) => {
    const rows = await many(
      `SELECT s.*,
              COALESCE(t.topic_count, 0)::int AS topic_count,
              COALESCE(t.total_hours, 0)::int AS planned_hours,
              COALESCE(c.courses, '{}'::int[]) AS courses
         FROM subjects s
         LEFT JOIN (
           SELECT subject_id, COUNT(*) AS topic_count, SUM(hours) AS total_hours
             FROM topics GROUP BY subject_id
         ) t ON t.subject_id = s.id
         ${COURSES_JOIN}
        WHERE $1::int IS NULL
           OR EXISTS (SELECT 1 FROM subject_courses sc WHERE sc.subject_id = s.id AND sc.course = $1)
        ORDER BY s.position, s.name`,
      [courseFilter(req.user)],
    );
    res.json(rows);
  }),
);

/** Bitta fan + uning mavzulari (ish reja) */
subjectsRouter.get(
  '/:id',
  requireUser,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const subject = await one<Subject>(
      `SELECT s.*, COALESCE(c.courses, '{}'::int[]) AS courses
         FROM subjects s ${COURSES_JOIN}
        WHERE s.id = $1`,
      [id],
    );
    if (!subject) throw new HttpError(404, 'Fan topilmadi');
    await assertSubjectAccess(req.user!, id);

    const topics = await many<Topic>(
      `SELECT id, subject_id, title, week, position, lesson_type, hours, summary, keywords
         FROM topics WHERE subject_id = $1 ORDER BY position, id`,
      [id],
    );
    res.json({ ...subject, topics });
  }),
);

subjectsRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = subjectSchema.parse(req.body);
    const row = await withTransaction(async (client) => {
      const { rows } = await client.query<Subject>(
        `INSERT INTO subjects (name, code, description, semester, credits, lecture_hours, practice_hours, independent_hours, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          data.name,
          data.code,
          data.description,
          data.semester ?? null,
          data.credits ?? null,
          data.lecture_hours,
          data.practice_hours,
          data.independent_hours,
          data.position,
        ],
      );
      await saveCourses(client, rows[0].id, data.courses);
      return { ...rows[0], courses: [...new Set(data.courses)].sort() };
    });
    res.status(201).json(row);
  }),
);

subjectsRouter.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = subjectSchema.parse(req.body);
    const row = await withTransaction(async (client) => {
      const { rows } = await client.query<Subject>(
        `UPDATE subjects SET name=$1, code=$2, description=$3, semester=$4, credits=$5,
                lecture_hours=$6, practice_hours=$7, independent_hours=$8, position=$9
          WHERE id=$10 RETURNING *`,
        [
          data.name,
          data.code,
          data.description,
          data.semester ?? null,
          data.credits ?? null,
          data.lecture_hours,
          data.practice_hours,
          data.independent_hours,
          data.position,
          id,
        ],
      );
      if (!rows[0]) throw new HttpError(404, 'Fan topilmadi');
      await saveCourses(client, id, data.courses);
      return { ...rows[0], courses: [...new Set(data.courses)].sort() };
    });
    res.json(row);
  }),
);

subjectsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM subjects WHERE id = $1', [Number(req.params.id)]);
    if (result.rowCount === 0) throw new HttpError(404, 'Fan topilmadi');
    res.status(204).end();
  }),
);
