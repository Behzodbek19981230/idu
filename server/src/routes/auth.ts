import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { one } from '../db/pool.js';
import { env } from '../env.js';
import { type AuthUser, requireUser, signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

export const authRouter = Router();

interface StudentRow {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  course: number;
  password_hash: string;
}

const loginSchema = z.object({
  login: z.string().min(1, 'login kiritilmagan'),
  password: z.string().min(1, 'parol kiritilmagan'),
});

/** Ro'yxatdan o'tish va adminkada tahrirlash uchun umumiy qoidalar */
export const registerSchema = z.object({
  first_name: z.string().trim().min(2, 'ism juda qisqa').max(60),
  last_name: z.string().trim().min(2, 'familiya juda qisqa').max(60),
  course: z.coerce.number().int().min(1, 'kurs 1–4 oralig‘ida').max(4, 'kurs 1–4 oralig‘ida'),
  login: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.-]{3,32}$/, 'login 3–32 belgi: lotin harf, raqam, _ . -'),
  password: z.string().min(6, 'parol kamida 6 belgi').max(100),
});

function studentUser(row: StudentRow): AuthUser {
  return {
    role: 'student',
    id: row.id,
    login: row.login,
    first_name: row.first_name,
    last_name: row.last_name,
    course: row.course,
  };
}

function studentResponse(row: StudentRow) {
  return {
    token: signToken({ role: 'student', id: row.id, login: row.login }),
    user: studentUser(row),
  };
}

/** Talaba ro'yxatdan o'tishi */
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    if (data.login === env.adminLogin.toLowerCase()) {
      throw new HttpError(409, 'Bu login band');
    }
    const exists = await one('SELECT 1 FROM students WHERE login = $1', [data.login]);
    if (exists) throw new HttpError(409, 'Bu login band');

    const hash = await bcrypt.hash(data.password, 10);
    const row = await one<StudentRow>(
      `INSERT INTO students (first_name, last_name, login, password_hash, course)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.first_name, data.last_name, data.login, hash, data.course],
    );
    res.status(201).json(studentResponse(row!));
  }),
);

/** Yagona kirish: avval admin (.env), so'ng talabalar jadvali */
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { login, password } = loginSchema.parse(req.body);
    if (login === env.adminLogin && password === env.adminPassword) {
      res.json({
        token: signToken({ role: 'admin', login }),
        user: { role: 'admin', login } satisfies AuthUser,
      });
      return;
    }

    const row = await one<StudentRow>('SELECT * FROM students WHERE login = $1', [
      login.trim().toLowerCase(),
    ]);
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      throw new HttpError(401, 'Login yoki parol xato');
    }
    res.json(studentResponse(row));
  }),
);

authRouter.get('/me', requireUser, (req, res) => {
  res.json(req.user);
});
