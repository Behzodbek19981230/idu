import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { one } from '../db/pool.js';
import { env } from '../env.js';
import { asyncHandler, HttpError } from './error.js';

/** Tokenga yoziladigan ma'lumot */
export type AuthPayload =
  | { role: 'admin'; login: string }
  | { role: 'student'; id: number; login: string };

/** So'rov davomida mavjud foydalanuvchi. Talabaning kursi har safar bazadan olinadi —
 *  admin kursni o'zgartirsa yoki talabani o'chirsa, darhol kuchga kiradi. */
export type AuthUser =
  | { role: 'admin'; login: string }
  | {
      role: 'student';
      id: number;
      login: string;
      first_name: string;
      last_name: string;
      course: number;
    };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

function readToken(req: Request): AuthPayload {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Avtorizatsiya talab qilinadi');
  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    throw new HttpError(401, 'Token yaroqsiz yoki muddati tugagan');
  }
}

async function resolveUser(payload: AuthPayload): Promise<AuthUser> {
  if (payload.role === 'admin') return { role: 'admin', login: payload.login };
  const student = await one<Omit<Extract<AuthUser, { role: 'student' }>, 'role'>>(
    'SELECT id, login, first_name, last_name, course FROM students WHERE id = $1',
    [payload.id],
  );
  if (!student) throw new HttpError(401, 'Foydalanuvchi topilmadi');
  return { role: 'student', ...student };
}

/** Admin yoki talaba — tizimga kirgan har qanday foydalanuvchi */
export const requireUser = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(readToken(req));
  next();
});

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = readToken(req);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Faqat admin uchun' });
    }
    req.user = { role: 'admin', login: payload.login };
    next();
  } catch (err) {
    return res.status(401).json({ error: (err as Error).message });
  }
}

/** Talaba uchun: fan uning kursiga biriktirilganmi. Admin hamma fanni ko'radi. */
export async function assertSubjectAccess(user: AuthUser, subjectId: number): Promise<void> {
  if (user.role === 'admin') return;
  const row = await one(
    'SELECT 1 FROM subject_courses WHERE subject_id = $1 AND course = $2',
    [subjectId, user.course],
  );
  if (!row) throw new HttpError(403, 'Bu fan sizning kursingizga biriktirilmagan');
}

/** Ro'yxatlarni filtrlash uchun: talaba bo'lsa kursi, admin bo'lsa null */
export function courseFilter(user: AuthUser | undefined): number | null {
  return user?.role === 'student' ? user.course : null;
}
