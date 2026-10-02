import { Router } from 'express';
import { many, one } from '../db/pool.js';
import { assertSubjectAccess, requireUser } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/error.js';
import { LOCAL_TZ } from './journal.js';

export const myJournalRouter = Router(); // /api/my-journal — talabaning o'z davomati va baholari

myJournalRouter.use(requireUser);

/**
 * Talabaning fan bo'yicha jurnali: har bir dars kuni (davomat, darsdagi ball, topshiriq bali, kunlik ball)
 * va yuborgan barcha topshiriqlari. Hisob admin jurnalidagi bilan bir xil:
 * topshiriq bali u yuborilgan kundagi (u kuni dars bo'lmasa — oldingi eng yaqin) darsga qo'shiladi, qo'lda o'zgartirilgan kunda qo'shilmaydi.
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
       graded AS (
         SELECT sb.score, (
                  SELECT ms.id FROM my_sessions ms
                   WHERE ms.lesson_date <= (sb.submitted_at AT TIME ZONE '${LOCAL_TZ}')::date
                   ORDER BY ms.lesson_date DESC, (ms.topic_id IS NOT DISTINCT FROM sb.topic_id) DESC, ms.id
                   LIMIT 1) AS session_id
           FROM submissions sb JOIN topics t ON t.id = sb.topic_id
          WHERE t.subject_id = $1 AND sb.student_id = $2 AND sb.status = 'graded'
       ),
       tasks AS (
         SELECT session_id, SUM(score)::float8 AS score, COUNT(*)::int AS count
           FROM graded WHERE session_id IS NOT NULL
          GROUP BY session_id
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

    // Yuborilgan kungacha dars bo'lmagan baholangan topshiriqlar — jami ballga baribir qo'shiladi
    const assigned = days.reduce((sum, d) => sum + d.task_count, 0);
    const assignedScore = days.reduce((sum, d) => sum + (d.task_score ?? 0), 0);
    const graded = submissions.filter((s) => s.status === 'graded');
    const gradedScore = graded.reduce((sum, s) => sum + Number(s.score ?? 0), 0);

    res.json({
      days,
      submissions,
      unassigned_task_score: Math.round((gradedScore - assignedScore) * 100) / 100,
      unassigned_task_count: graded.length - assigned,
    });
  }),
);
