import { Router } from 'express';
import { z } from 'zod';
import { many, one, pool } from '../db/pool.js';
import { assertStaffSubject, assertSubjectAccess, courseFilter, requireStaff, requireUser } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Topic } from '../types.js';

export const topicsRouter = Router();

/** Mavzu faqat mavjud (o'chirilmagan) fanga qo'shiladi yoki ko'chiriladi */
async function assertSubjectExists(subjectId: number) {
  const row = await one('SELECT 1 FROM subjects WHERE id = $1 AND deleted_at IS NULL', [subjectId]);
  if (!row) throw new HttpError(404, 'Fan topilmadi');
}

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

/** ?subject_id=1 bilan filtrlanadi; content qaytarilmaydi (ro'yxat yengil bo'lishi uchun).
 *  Talabaga faqat o'z kursidagi fanlar mavzulari qaytariladi. */
topicsRouter.get(
  '/',
  requireUser,
  asyncHandler(async (req, res) => {
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    if (subjectId) await assertSubjectAccess(req.user!, subjectId);
    const rows = subjectId
      ? await many<Topic>(
          `SELECT id, subject_id, title, week, position, lesson_type, hours, summary, keywords
             FROM topics WHERE subject_id = $1 AND deleted_at IS NULL ORDER BY position, id`,
          [subjectId],
        )
      : await many<Topic>(
          `SELECT id, subject_id, title, week, position, lesson_type, hours, summary, keywords
             FROM topics t
            WHERE t.deleted_at IS NULL
              AND ($1::int IS NULL
               OR EXISTS (SELECT 1 FROM subject_courses sc WHERE sc.subject_id = t.subject_id AND sc.course = $1))
            ORDER BY subject_id, position, id`,
          [courseFilter(req.user)],
        );
    res.json(rows);
  }),
);

/** To'liq dars qo'llanmasi — faqat admin. Talaba mavzu bo'yicha faqat topshiriq yuboradi
 *  (/api/submissions/topic/:id), dars matnini ko'rmaydi. */
topicsRouter.get(
  '/:id',
  requireStaff,
  asyncHandler(async (req, res) => {
    const row = await one<Topic>(
      `SELECT t.*, s.name AS subject_name, s.code AS subject_code
         FROM topics t JOIN subjects s ON s.id = t.subject_id
        WHERE t.id = $1 AND t.deleted_at IS NULL`,
      [Number(req.params.id)],
    );
    if (!row) throw new HttpError(404, 'Mavzu topilmadi');
    await assertStaffSubject(req.user!, row.subject_id);
    res.json(row);
  }),
);

topicsRouter.post(
  '/',
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = topicSchema.parse(req.body);
    await assertStaffSubject(req.user!, data.subject_id);
    await assertSubjectExists(data.subject_id);

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
  requireStaff,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = topicSchema.parse(req.body);
    const current = await one<Topic>(
      'SELECT position, subject_id FROM topics WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (!current) throw new HttpError(404, 'Mavzu topilmadi');
    await assertStaffSubject(req.user!, current.subject_id);
    await assertStaffSubject(req.user!, data.subject_id);
    await assertSubjectExists(data.subject_id);

    const row = await one<Topic>(
      `UPDATE topics SET subject_id=$1, title=$2, week=$3, position=$4, lesson_type=$5, hours=$6,
              summary=$7, objectives=$8, keywords=$9, content=$10, assignments=$11, resources=$12
        WHERE id=$13 AND deleted_at IS NULL RETURNING *`,
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

/**
 * Yumshoq o'chirish: mavzu bazada qoladi, faqat deleted_at qo'yiladi. Unga yuborilgan topshiriqlar va
 * havolalarga ham xuddi shu vaqt qo'yiladi. Darslarda mavzu nomi ko'rinmay qoladi (bog'lanish saqlanadi).
 */
topicsRouter.delete(
  '/:id',
  requireStaff,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const owner = await one<{ subject_id: number }>(
      'SELECT subject_id FROM topics WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (!owner) throw new HttpError(404, 'Mavzu topilmadi');
    await assertStaffSubject(req.user!, owner.subject_id);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // now() tranzaksiya davomida o'zgarmaydi — hamma yozuvga aynan bir xil vaqt tushadi
      const { rowCount } = await client.query(
        'UPDATE topics SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );
      if (!rowCount) throw new HttpError(404, 'Mavzu topilmadi');
      for (const table of ['submissions', 'shares']) {
        await client.query(
          `UPDATE ${table} SET deleted_at = now() WHERE topic_id = $1 AND deleted_at IS NULL`,
          [id],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    res.status(204).end();
  }),
);

/** Mavzular tartibini o'zgartirish: { ids: [3, 1, 2] } */
topicsRouter.put(
  '/reorder/:subjectId',
  requireStaff,
  asyncHandler(async (req, res) => {
    const subjectId = Number(req.params.subjectId);
    await assertStaffSubject(req.user!, subjectId);
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
