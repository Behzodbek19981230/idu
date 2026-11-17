import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { many, one } from '../db/pool.js';
import { env } from '../env.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Student } from '../types.js';
import { registerSchema } from './auth.js';

export const studentsRouter = Router(); // /api/students — faqat admin

studentsRouter.use(requireAdmin);

const STUDENT_COLUMNS = 'id, first_name, last_name, login, course, created_at';

studentsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await many<Student>(
      `SELECT ${STUDENT_COLUMNS} FROM students WHERE deleted_at IS NULL
        ORDER BY course, last_name, first_name`,
    );
    res.json(rows);
  }),
);

/** Tahrirlash: ism, familiya, login, kurs, parol — faqat yuborilgan maydonlar o'zgaradi.
 *  Parol bo'sh bo'lsa yoki yuborilmasa — eskisi qoladi. */
const updateSchema = registerSchema.partial().extend({
  password: z.union([z.literal(''), registerSchema.shape.password]).optional(),
});

studentsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = updateSchema.parse(req.body);

    if (data.login !== undefined) {
      if (data.login === env.adminLogin.toLowerCase()) throw new HttpError(409, 'Bu login band');
      const taken = await one(
        'SELECT 1 FROM students WHERE login = $1 AND id <> $2 AND deleted_at IS NULL',
        [data.login, id],
      );
      if (taken) throw new HttpError(409, 'Bu login band');
    }
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

    const row = await one<Student>(
      `UPDATE students
          SET first_name    = COALESCE($1, first_name),
              last_name     = COALESCE($2, last_name),
              login         = COALESCE($3, login),
              course        = COALESCE($4, course),
              password_hash = COALESCE($5, password_hash)
        WHERE id = $6 AND deleted_at IS NULL RETURNING ${STUDENT_COLUMNS}`,
      [
        data.first_name ?? null,
        data.last_name ?? null,
        data.login ?? null,
        data.course ?? null,
        passwordHash,
        id,
      ],
    );
    if (!row) throw new HttpError(404, 'Talaba topilmadi');
    res.json(row);
  }),
);

/**
 * Yumshoq o'chirish: talaba bazada qoladi (davomati va baholari bilan), faqat deleted_at qo'yiladi.
 * Uning topshiriqlariga ham xuddi shu vaqt qo'yiladi. Tizimga kira olmaydi, ro'yxat va jurnalda ko'rinmaydi.
 */
studentsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    // Bitta so'rov = bitta tranzaksiya: talaba va topshiriqlariga aynan bir xil now() tushadi
    const deleted = await one(
      `WITH st AS (
         UPDATE students SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id
       ), sb AS (
         UPDATE submissions SET deleted_at = now()
          WHERE student_id = $1 AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM st)
       )
       SELECT id FROM st`,
      [id],
    );
    if (!deleted) throw new HttpError(404, 'Talaba topilmadi');
    res.status(204).end();
  }),
);
