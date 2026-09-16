import { Router } from 'express';
import { z } from 'zod';
import { env } from '../env.js';
import { requireAdmin, signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

export const authRouter = Router();

const loginSchema = z.object({
  login: z.string().min(1, 'login kiritilmagan'),
  password: z.string().min(1, 'parol kiritilmagan'),
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { login, password } = loginSchema.parse(req.body);
    if (login !== env.adminLogin || password !== env.adminPassword) {
      throw new HttpError(401, 'Login yoki parol xato');
    }
    res.json({ token: signToken({ login, role: 'admin' }), login });
  }),
);

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json(req.admin);
});
