import { Router } from 'express';
import { z } from 'zod';
import { many, one, query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
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
});

/** Fanlar ro'yxati + har biri uchun mavzular soni va umumiy soat */
subjectsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await many(
      `SELECT s.*,
              COALESCE(t.topic_count, 0)::int AS topic_count,
              COALESCE(t.total_hours, 0)::int AS planned_hours
         FROM subjects s
         LEFT JOIN (
           SELECT subject_id, COUNT(*) AS topic_count, SUM(hours) AS total_hours
             FROM topics GROUP BY subject_id
         ) t ON t.subject_id = s.id
        ORDER BY s.position, s.name`,
    );
    res.json(rows);
  }),
);

/** Bitta fan + uning mavzulari (ish reja) */
subjectsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const subject = await one<Subject>('SELECT * FROM subjects WHERE id = $1', [id]);
    if (!subject) throw new HttpError(404, 'Fan topilmadi');

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
    const row = await one<Subject>(
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
    res.status(201).json(row);
  }),
);

subjectsRouter.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = subjectSchema.parse(req.body);
    const row = await one<Subject>(
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
    if (!row) throw new HttpError(404, 'Fan topilmadi');
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
