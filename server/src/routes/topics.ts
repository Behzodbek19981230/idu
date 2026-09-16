import { Router } from 'express';
import { z } from 'zod';
import { many, one, pool, query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Topic } from '../types.js';

export const topicsRouter = Router();

const lessonTypes = ['lecture', 'practice', 'lab', 'seminar', 'independent'] as const;

const topicSchema = z.object({
  subject_id: z.coerce.number().int().positive('fan tanlanmagan'),
  title: z.string().min(2, 'mavzu nomi juda qisqa'),
  week: z.coerce.number().int().min(1).max(52).nullable().optional(),
  lesson_type: z.enum(lessonTypes).default('lecture'),
  hours: z.coerce.number().int().min(0).max(24).default(2),
  summary: z.string().default(''),
  objectives: z.string().default(''),
  keywords: z.string().default(''),
  content: z.string().default(''),
  assignments: z.string().default(''),
  resources: z.string().default(''),
  position: z.coerce.number().int().min(0).optional(),
});

/** ?subject_id=1 bilan filtrlanadi; content qaytarilmaydi (ro'yxat yengil bo'lishi uchun) */
topicsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    const rows = subjectId
      ? await many<Topic>(
          `SELECT id, subject_id, title, week, position, lesson_type, hours, summary, keywords
             FROM topics WHERE subject_id = $1 ORDER BY position, id`,
          [subjectId],
        )
      : await many<Topic>(
          `SELECT id, subject_id, title, week, position, lesson_type, hours, summary, keywords
             FROM topics ORDER BY subject_id, position, id`,
        );
    res.json(rows);
  }),
);

/** To'liq dars qo'llanmasi */
topicsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await one(
      `SELECT t.*, s.name AS subject_name, s.code AS subject_code
         FROM topics t JOIN subjects s ON s.id = t.subject_id
        WHERE t.id = $1`,
      [Number(req.params.id)],
    );
    if (!row) throw new HttpError(404, 'Mavzu topilmadi');
    res.json(row);
  }),
);

topicsRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = topicSchema.parse(req.body);

    // position berilmagan bo'lsa — fan ichida oxiriga qo'shiladi
    let position = data.position;
    if (position === undefined) {
      const last = await one<{ next: number }>(
        'SELECT COALESCE(MAX(position) + 1, 0)::int AS next FROM topics WHERE subject_id = $1',
        [data.subject_id],
      );
      position = last?.next ?? 0;
    }

    const row = await one<Topic>(
      `INSERT INTO topics (subject_id, title, week, position, lesson_type, hours, summary, objectives, keywords, content, assignments, resources)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        data.subject_id,
        data.title,
        data.week ?? null,
        position,
        data.lesson_type,
        data.hours,
        data.summary,
        data.objectives,
        data.keywords,
        data.content,
        data.assignments,
        data.resources,
      ],
    );
    res.status(201).json(row);
  }),
);

topicsRouter.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = topicSchema.parse(req.body);
    const current = await one<Topic>('SELECT position FROM topics WHERE id = $1', [id]);
    if (!current) throw new HttpError(404, 'Mavzu topilmadi');

    const row = await one<Topic>(
      `UPDATE topics SET subject_id=$1, title=$2, week=$3, position=$4, lesson_type=$5, hours=$6,
              summary=$7, objectives=$8, keywords=$9, content=$10, assignments=$11, resources=$12
        WHERE id=$13 RETURNING *`,
      [
        data.subject_id,
        data.title,
        data.week ?? null,
        data.position ?? current.position,
        data.lesson_type,
        data.hours,
        data.summary,
        data.objectives,
        data.keywords,
        data.content,
        data.assignments,
        data.resources,
        id,
      ],
    );
    res.json(row);
  }),
);

topicsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM topics WHERE id = $1', [Number(req.params.id)]);
    if (result.rowCount === 0) throw new HttpError(404, 'Mavzu topilmadi');
    res.status(204).end();
  }),
);

/** Mavzular tartibini o'zgartirish: { ids: [3, 1, 2] } */
topicsRouter.put(
  '/reorder/:subjectId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const { ids } = z.object({ ids: z.array(z.coerce.number().int()) }).parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [index, id] of ids.entries()) {
        await client.query('UPDATE topics SET position = $1 WHERE id = $2 AND subject_id = $3', [
          index,
          id,
          subjectId,
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    res.json({ ok: true });
  }),
);
