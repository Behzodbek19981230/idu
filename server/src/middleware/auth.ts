import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface AuthPayload {
  login: string;
  role: 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }
  try {
    req.admin = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz yoki muddati tugagan' });
  }
}
