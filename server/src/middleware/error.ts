import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Manzil topilmadi' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const detail = err.errors.map((e) => `${e.path.join('.') || 'maydon'}: ${e.message}`).join('; ');
    return res.status(400).json({ error: `Ma'lumot noto'g'ri — ${detail}` });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  const pgErr = err as { code?: string; message?: string };
  if (pgErr.code === '23505') {
    return res.status(409).json({ error: 'Bunday kod bilan yozuv allaqachon mavjud' });
  }
  if (pgErr.code === '23503') {
    return res.status(400).json({ error: 'Bog‘liq yozuv topilmadi' });
  }
  console.error(err);
  res.status(500).json({ error: 'Serverda kutilmagan xato' });
}

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
