import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { many, one } from '../db/pool.js';
import { env } from '../env.js';
import { assertSubjectAccess, requireAdmin, requireUser } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import type { Submission } from '../types.js';

export const submissionsRouter = Router(); // /api/submissions

const uploadDir = resolve(env.uploadDir);
mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    // Diskda tasodifiy nom; asl nom bazada saqlanadi
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).slice(0, 16)}`),
  }),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
});

/** Multer fayl nomini latin1 deb o'qiydi — kirill/o'zbekcha nomlar buzilmasligi uchun */
const decodeFileName = (name: string) => Buffer.from(name, 'latin1').toString('utf8');

const removeFile = (path: string | null | undefined) =>
  path ? unlink(join(uploadDir, path)).catch(() => undefined) : Promise.resolve();

/** Talaba va o'qituvchi ko'radigan ustunlar (diskdagi yo'l tashqariga chiqmaydi) */
const PUBLIC_COLUMNS = `sb.id, sb.student_id, sb.topic_id, sb.content_kind, sb.content, sb.file_name,
  sb.file_size, sb.file_mime, sb.status, sb.score::float8 AS score, sb.feedback,
  sb.submitted_at, sb.seen_at, sb.graded_at`;

/** Admin ro'yxatlari uchun: kim, qaysi fan/mavzu */
const WITH_CONTEXT = `${PUBLIC_COLUMNS},
  st.first_name, st.last_name, st.course,
  t.title AS topic_title, s.id AS subject_id, s.name AS subject_name, s.code AS subject_code`;

const CONTEXT_JOINS = `
  JOIN students st ON st.id = sb.student_id
  JOIN topics   t  ON t.id  = sb.topic_id
  JOIN subjects s  ON s.id  = t.subject_id`;

// ─────────────────────────── Talaba ───────────────────────────

/** Mavzu (dars matnisiz) + topshiriq sharti + talabaning o'z topshiriqlari */
submissionsRouter.get(
  '/topic/:topicId',
  requireUser,
  asyncHandler(async (req, res) => {
    const topicId = Number(req.params.topicId);
    const topic = await one<{ subject_id: number }>(
      `SELECT t.id, t.subject_id, t.title, t.week, t.lesson_type, t.hours, t.assignments,
              s.name AS subject_name, s.code AS subject_code
         FROM topics t JOIN subjects s ON s.id = t.subject_id
        WHERE t.id = $1`,
      [topicId],
    );
    if (!topic) throw new HttpError(404, 'Mavzu topilmadi');
    await assertSubjectAccess(req.user!, topic.subject_id);

    const submissions =
      req.user!.role === 'student'
        ? await many(
            `SELECT ${PUBLIC_COLUMNS} FROM submissions sb
              WHERE sb.topic_id = $1 AND sb.student_id = $2
              ORDER BY sb.submitted_at DESC`,
            [topicId, req.user!.id],
          )
        : [];
    res.json({ topic, submissions });
  }),
);

/** Topshiriq yuborish: multipart — content_kind, content, file (ixtiyoriy) */
submissionsRouter.post(
  '/topic/:topicId',
  requireUser,
  // Ruxsat faylni diskka yozishdan OLDIN tekshiriladi
  asyncHandler(async (req, _res, next) => {
    if (req.user!.role !== 'student') throw new HttpError(403, 'Topshiriqni faqat talaba yuboradi');
    const topic = await one<{ subject_id: number }>('SELECT subject_id FROM topics WHERE id = $1', [
      Number(req.params.topicId),
    ]);
    if (!topic) throw new HttpError(404, 'Mavzu topilmadi');
    await assertSubjectAccess(req.user!, topic.subject_id);
    next();
  }),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    try {
      const data = z
        .object({
          content_kind: z.enum(['text', 'code']).default('text'),
          content: z.string().max(200_000, 'matn juda uzun').default(''),
        })
        .parse(req.body);
      if (!data.content.trim() && !file) {
        throw new HttpError(400, 'Fayl yoki matn/kod kiriting');
      }
      if (req.user!.role !== 'student') throw new HttpError(403, 'Faqat talaba uchun');

      const row = await one<Submission>(
        `INSERT INTO submissions (student_id, topic_id, content_kind, content, file_name, file_path, file_size, file_mime)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [
          req.user!.id,
          Number(req.params.topicId),
          data.content_kind,
          data.content,
          file ? decodeFileName(file.originalname) : null,
          file?.filename ?? null,
          file?.size ?? null,
          file?.mimetype ?? null,
        ],
      );
      const saved = await one(`SELECT ${PUBLIC_COLUMNS} FROM submissions sb WHERE sb.id = $1`, [row!.id]);
      res.status(201).json(saved);
    } catch (err) {
      await removeFile(file?.filename);
      throw err;
    }
  }),
);

/** Faylni yuklab olish: admin yoki topshiriq egasi */
submissionsRouter.get(
  '/:id/file',
  requireUser,
  asyncHandler(async (req, res) => {
    const row = await one<Submission>('SELECT * FROM submissions WHERE id = $1', [Number(req.params.id)]);
    if (!row || !row.file_path) throw new HttpError(404, 'Fayl topilmadi');
    if (req.user!.role === 'student' && row.student_id !== req.user!.id) {
      throw new HttpError(403, 'Bu fayl sizga tegishli emas');
    }
    res.download(join(uploadDir, row.file_path), row.file_name ?? 'fayl');
  }),
);

/** Brauzerda tahrirlab saqlasa bo'ladigan fayllar (kod ko'rinishida ochiladiganlar bilan bir xil) */
const EDITABLE_FILE = /\.(html?|m?js|css|txt)$/i;

/**
 * Kodni tahrirlab saqlash: yuborilgan kod matni (target=content) yoki biriktirilgan fayl (target=file).
 * O'qituvchi — istalganini; talaba — faqat o'zining, hali baholanmagan topshirig'ini.
 */
submissionsRouter.patch(
  '/:id/code',
  requireUser,
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        target: z.enum(['content', 'file']),
        // Matn yuborishdagi chegara bilan bir xil; fayl — ochiladigan hajmgacha (1 MB)
        code: z.string().max(1_000_000, 'kod juda uzun'),
      })
      .refine((d) => d.target === 'file' || d.code.length <= 200_000, 'kod juda uzun')
      .parse(req.body);
    const id = Number(req.params.id);
    const row = await one<Submission>('SELECT * FROM submissions WHERE id = $1', [id]);
    if (!row) throw new HttpError(404, 'Topshiriq topilmadi');
    if (req.user!.role === 'student') {
      if (row.student_id !== req.user!.id) throw new HttpError(403, 'Bu topshiriq sizga tegishli emas');
      if (row.status === 'graded') throw new HttpError(403, 'Baholangan topshiriqni o‘zgartirib bo‘lmaydi');
    }

    if (data.target === 'content') {
      if (row.content_kind !== 'code') throw new HttpError(400, 'Bu topshiriqda kod yo‘q');
      await one('UPDATE submissions SET content = $1 WHERE id = $2', [data.code, id]);
    } else {
      if (!row.file_path || !row.file_name || !EDITABLE_FILE.test(row.file_name)) {
        throw new HttpError(400, 'Bu faylni tahrirlab bo‘lmaydi');
      }
      await writeFile(join(uploadDir, row.file_path), data.code, 'utf8');
      await one('UPDATE submissions SET file_size = $1 WHERE id = $2', [Buffer.byteLength(data.code), id]);
    }

    const saved = await one(`SELECT ${PUBLIC_COLUMNS} FROM submissions sb WHERE sb.id = $1`, [id]);
    res.json(saved);
  }),
);

// ─────────────────────────── O'qituvchi ───────────────────────────

/** Bildirishnomalar: yangi (ochilmagan) topshiriqlar soni va oxirgilari */
submissionsRouter.get(
  '/notifications',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const count = await one<{ unread: number }>(
      'SELECT COUNT(*)::int AS unread FROM submissions WHERE seen_at IS NULL',
    );
    const items = await many(
      `SELECT sb.id, sb.submitted_at, sb.file_name, st.first_name, st.last_name, st.course,
              t.title AS topic_title, s.code AS subject_code
         FROM submissions sb ${CONTEXT_JOINS}
        WHERE sb.seen_at IS NULL
        ORDER BY sb.submitted_at DESC
        LIMIT 15`,
    );
    res.json({ unread: count?.unread ?? 0, items });
  }),
);

/** Barcha yangilarni ko'rilgan deb belgilash */
submissionsRouter.post(
  '/notifications/read-all',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    await one('UPDATE submissions SET seen_at = now() WHERE seen_at IS NULL');
    res.json({ ok: true });
  }),
);

/** Ro'yxat: ?status=submitted|graded&subject_id=1&student_id=5 */
submissionsRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, subject_id, student_id } = z
      .object({
        status: z.enum(['submitted', 'graded']).optional(),
        subject_id: z.coerce.number().int().positive().optional(),
        student_id: z.coerce.number().int().positive().optional(),
      })
      .parse(req.query);
    const rows = await many(
      `SELECT ${WITH_CONTEXT}
         FROM submissions sb ${CONTEXT_JOINS}
        WHERE ($1::text IS NULL OR sb.status = $1)
          AND ($2::int IS NULL OR s.id = $2)
          AND ($3::int IS NULL OR sb.student_id = $3)
        ORDER BY sb.submitted_at DESC
        LIMIT 500`,
      [status ?? null, subject_id ?? null, student_id ?? null],
    );
    res.json(rows);
  }),
);

/** Bitta topshiriq. O'qituvchi ochgach — bildirishnomadan chiqadi */
submissionsRouter.get(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await one('UPDATE submissions SET seen_at = now() WHERE id = $1 AND seen_at IS NULL', [id]);
    const row = await one(`SELECT ${WITH_CONTEXT} FROM submissions sb ${CONTEXT_JOINS} WHERE sb.id = $1`, [id]);
    if (!row) throw new HttpError(404, 'Topshiriq topilmadi');
    res.json(row);
  }),
);

/** Baholash: ball (istalgan manfiy bo'lmagan son) + izoh */
submissionsRouter.patch(
  '/:id/grade',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        score: z.coerce.number().min(0, 'ball manfiy bo‘lmaydi').max(9999.99),
        feedback: z.string().max(10_000).default(''),
      })
      .parse(req.body);
    const id = Number(req.params.id);
    const updated = await one(
      `UPDATE submissions
          SET score = $1, feedback = $2, status = 'graded', graded_at = now(),
              seen_at = COALESCE(seen_at, now())
        WHERE id = $3 RETURNING id`,
      [data.score, data.feedback, id],
    );
    if (!updated) throw new HttpError(404, 'Topshiriq topilmadi');
    const row = await one(`SELECT ${WITH_CONTEXT} FROM submissions sb ${CONTEXT_JOINS} WHERE sb.id = $1`, [id]);
    res.json(row);
  }),
);
