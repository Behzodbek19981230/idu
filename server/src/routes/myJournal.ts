import { Router } from 'express';
import { many, one } from '../db/pool.js';
import { assertSubjectAccess, requireUser } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';

export const myJournalRouter = Router(); // /api/my-journal — talabaning o'z davomati va baholari

myJournalRouter.use(requireUser);

/**
 * Talabaning fan bo'yicha jurnali: har bir dars kuni (davomat, darsdagi ball, topshiriq bali, kunlik ball)
 * va yuborgan barcha topshiriqlari. Hisob admin jurnalidagi bilan bir xil:
 * topshiriq bali mavzu o'tilgan birinchi darsga qo'shiladi, qo'lda o'zgartirilgan kunda qo'shilmaydi.
 */
myJournalRouter.get(
  '/:subjectId',
  asyncHandler(async (req, res) => {
    const user = req.user!;
    if (user.role !== 'student') throw new HttpError(403, 'Faqat talaba uchun');
    const subjectId = Number(req.params.subjectId);
    const subject = await one('SELECT id FROM subjects WHERE id = $1', [subjectId]);
    if (!subject) throw new HttpError(404, 'Fan topilmadi');
    await assertSubjectAccess(user, subjectId);

    // Talabaning hozirgi kursidagi darslar + boshqa kursda bo'lsa ham, o'zi belgilangan darslar
    const days = await many<{
      session_id: number;
      lesson_date: string;
      topic_id: number | null;
      topic_title: string | null;
      present: boolean | null;
      score: number;
      score_override: boolean;
      task_score: number | null;
      task_count: number;
    }>(
      `WITH my_sessions AS (
         SELECT cs.* FROM class_sessions cs
          WHERE cs.subject_id = $1
            AND (cs.course = $3 OR EXISTS (
                  SELECT 1 FROM attendance a WHERE a.session_id = cs.id AND a.student_id = $2))
       ),
       topic_session AS (
         SELECT DISTINCT ON (topic_id) id, topic_id
           FROM my_sessions WHERE topic_id IS NOT NULL
          ORDER BY topic_id, lesson_date, id
       ),
       tasks AS (
         SELECT ts.id AS session_id, SUM(sb.score)::float8 AS score, COUNT(*)::int AS count
           FROM submissions sb JOIN topic_session ts ON ts.topic_id = sb.topic_id
          WHERE sb.student_id = $2 AND sb.status = 'graded'
          GROUP BY ts.id
       )
       SELECT ms.id AS session_id, to_char(ms.lesson_date, 'YYYY-MM-DD') AS lesson_date,
              ms.topic_id, t.title AS topic_title,
              a.present, COALESCE(a.score, 0)::float8 AS score,
              COALESCE(a.present AND a.score_override, FALSE) AS score_override,
              tk.score AS task_score, COALESCE(tk.count, 0) AS task_count
         FROM my_sessions ms
         LEFT JOIN topics t ON t.id = ms.topic_id
         LEFT JOIN attendance a ON a.session_id = ms.id AND a.student_id = $2
         LEFT JOIN tasks tk ON tk.session_id = ms.id
        ORDER BY ms.lesson_date, ms.id`,
      [subjectId, user.id, user.course],
    );

    const submissions = await many(
      `SELECT sb.id, sb.topic_id, t.title AS topic_title, sb.status, sb.score::float8 AS score,
              sb.feedback, sb.submitted_at, sb.graded_at, sb.file_name, sb.content_kind
         FROM submissions sb JOIN topics t ON t.id = sb.topic_id
        WHERE t.subject_id = $1 AND sb.student_id = $2
        ORDER BY sb.submitted_at DESC`,
      [subjectId, user.id],
    );

    // Darsi hali jurnalda yo'q mavzular bo'yicha baholangan topshiriqlar — jami ballga baribir qo'shiladi
    const dayTopics = new Set(days.map((d) => d.topic_id).filter((id) => id !== null));
    const unassigned = submissions.filter(
      (s) => s.status === 'graded' && !dayTopics.has(s.topic_id),
    );

    res.json({
      days,
      submissions,
      unassigned_task_score: unassigned.reduce((sum, s) => sum + Number(s.score ?? 0), 0),
      unassigned_task_count: unassigned.length,
    });
  }),
);
