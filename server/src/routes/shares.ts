import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { many, one, query } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Share, Subject, Topic } from '../types.js';

export const sharesRouter = Router(); // /api/shares  — admin
export const publicShareRouter = Router(); // /api/share — ochiq

function newToken(): string {
  return randomBytes(9).toString('base64url');
}

/** Token bo'yicha faol havolani topadi; muddati/holati tekshiriladi */
async function loadActiveShare(token: string): Promise<Share> {
  const share = await one<Share>('SELECT * FROM shares WHERE token = $1', [token]);
  if (!share) throw new HttpError(404, 'Havola topilmadi');
  if (!share.is_active) throw new HttpError(403, "Havola faolsizlantirilgan");
  if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
    throw new HttpError(410, 'Havola muddati tugagan');
  }
  return share;
}

const TOPIC_LIST_COLUMNS =
  'id, subject_id, title, week, position, lesson_type, hours, summary, keywords';

// ─────────────────────────── Adminka ───────────────────────────

const createSchema = z
  .object({
    scope: z.enum(['subject', 'topic']),
    subject_id: z.coerce.number().int().positive().optional(),
    topic_id: z.coerce.number().int().positive().optional(),
    note: z.string().default(''),
    expires_at: z.string().datetime().nullable().optional(),
  })
  .refine((d) => (d.scope === 'subject' ? Boolean(d.subject_id) : Boolean(d.topic_id)), {
    message: 'ulashiladigan obyekt ko‘rsatilmagan',
  });

/** Barcha havolalar (fan/mavzu nomlari bilan) */
sharesRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const rows = await many(
      `SELECT sh.*, s.name AS subject_name, s.code AS subject_code, t.title AS topic_title
         FROM shares sh
         LEFT JOIN subjects s ON s.id = sh.subject_id
         LEFT JOIN topics   t ON t.id = sh.topic_id
        ORDER BY sh.created_at DESC`,
    );
    res.json(rows);
  }),
);

/** Havola yaratish. Shu obyekt uchun faol havola bo'lsa — o'sha qaytariladi */
sharesRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    let subjectId: number;
    let topicId: number | null = null;

    if (data.scope === 'subject') {
      const subject = await one<Subject>('SELECT id FROM subjects WHERE id = $1', [data.subject_id]);
      if (!subject) throw new HttpError(404, 'Fan topilmadi');
      subjectId = subject.id;
    } else {
      const topic = await one<Topic>('SELECT id, subject_id FROM topics WHERE id = $1', [
        data.topic_id,
      ]);
      if (!topic) throw new HttpError(404, 'Mavzu topilmadi');
      topicId = topic.id;
      subjectId = topic.subject_id;
    }

    const existing =
      data.scope === 'subject'
        ? await one<Share>(
            `SELECT * FROM shares WHERE is_active AND scope = 'subject' AND subject_id = $1
             ORDER BY id DESC LIMIT 1`,
            [subjectId],
          )
        : await one<Share>(
            `SELECT * FROM shares WHERE is_active AND scope = 'topic' AND topic_id = $1
             ORDER BY id DESC LIMIT 1`,
            [topicId],
          );
    if (existing) {
      res.json(existing);
      return;
    }

    const share = await one<Share>(
      `INSERT INTO shares (token, scope, subject_id, topic_id, note, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [newToken(), data.scope, subjectId, topicId, data.note, data.expires_at ?? null],
    );
    res.status(201).json(share);
  }),
);

const updateSchema = z.object({
  is_active: z.boolean().optional(),
  note: z.string().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

sharesRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const share = await one<Share>(
      // $3: expires_at umuman yuborilganmi ('set'/null) — null qiymatni "tozalash" deb
      // tushunish uchun kerak; yuborilmasa eski qiymat saqlanadi
      `UPDATE shares
          SET is_active  = COALESCE($1, is_active),
              note       = COALESCE($2, note),
              expires_at = CASE WHEN $3::text IS NULL THEN expires_at ELSE $4::timestamptz END
        WHERE id = $5 RETURNING *`,
      [
        data.is_active ?? null,
        data.note ?? null,
        data.expires_at === undefined ? null : 'set',
        data.expires_at ?? null,
        Number(req.params.id),
      ],
    );
    if (!share) throw new HttpError(404, 'Havola topilmadi');
    res.json(share);
  }),
);

sharesRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM shares WHERE id = $1', [Number(req.params.id)]);
    if (result.rowCount === 0) throw new HttpError(404, 'Havola topilmadi');
    res.status(204).end();
  }),
);

// ─────────────────────── Ommaviy (student) ───────────────────────

/**
 * Havola mazmuni. Faqat ulashilgan obyekt qaytariladi:
 *  - scope=subject → o'sha fan va uning mavzulari ro'yxati
 *  - scope=topic   → faqat o'sha mavzu (qo'shni mavzular ro'yxati yo'q)
 */
publicShareRouter.get(
  '/:token',
  asyncHandler(async (req, res) => {
    const share = await loadActiveShare(req.params.token);
    await query('UPDATE shares SET view_count = view_count + 1 WHERE id = $1', [share.id]);

    if (share.scope === 'subject') {
      const subject = await one<Subject>('SELECT * FROM subjects WHERE id = $1', [share.subject_id]);
      if (!subject) throw new HttpError(404, 'Fan topilmadi');
      const topics = await many(
        `SELECT ${TOPIC_LIST_COLUMNS} FROM topics WHERE subject_id = $1 ORDER BY position, id`,
        [subject.id],
      );
      res.json({ scope: 'subject', share: { token: share.token, note: share.note }, subject, topics });
      return;
    }

    const topic = await one(
      `SELECT t.*, s.name AS subject_name, s.code AS subject_code
         FROM topics t JOIN subjects s ON s.id = t.subject_id
        WHERE t.id = $1`,
      [share.topic_id],
    );
    if (!topic) throw new HttpError(404, 'Mavzu topilmadi');
    res.json({ scope: 'topic', share: { token: share.token, note: share.note }, topic });
  }),
);

/** Ulashilgan fan ichidagi bitta mavzu (faqat shu fanga tegishli bo'lsa) */
publicShareRouter.get(
  '/:token/topic/:topicId',
  asyncHandler(async (req, res) => {
    const share = await loadActiveShare(req.params.token);
    if (share.scope !== 'subject') {
      throw new HttpError(403, 'Bu havola orqali boshqa mavzularni ochib bo‘lmaydi');
    }
    const topic = await one(
      `SELECT t.*, s.name AS subject_name, s.code AS subject_code
         FROM topics t JOIN subjects s ON s.id = t.subject_id
        WHERE t.id = $1 AND t.subject_id = $2`,
      [Number(req.params.topicId), share.subject_id],
    );
    if (!topic) throw new HttpError(404, 'Mavzu bu havolaga tegishli emas');
    res.json(topic);
  }),
);
