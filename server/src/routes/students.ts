import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { many, one, query } from '../db/pool.js';
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
      `SELECT ${STUDENT_COLUMNS} FROM students ORDER BY course, last_name, first_name`,
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
      const taken = await one('SELECT 1 FROM students WHERE login = $1 AND id <> $2', [data.login, id]);
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
        WHERE id = $6 RETURNING ${STUDENT_COLUMNS}`,
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

studentsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM students WHERE id = $1', [Number(req.params.id)]);
    if (result.rowCount === 0) throw new HttpError(404, 'Talaba topilmadi');
    res.status(204).end();
  }),
);
