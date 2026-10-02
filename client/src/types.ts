export type LessonType = 'lecture' | 'practice' | 'lab' | 'seminar' | 'independent';

export const LESSON_TYPES: {
  value: LessonType;
  label: string;
  color: string;
  darkColor: string;
}[] = [
  { value: 'lecture', label: "Ma'ruza", color: '#1565c0', darkColor: '#7cb6f5' },
  { value: 'practice', label: 'Amaliy', color: '#2e7d32', darkColor: '#81c784' },
  { value: 'lab', label: 'Laboratoriya', color: '#e65100', darkColor: '#ffb74d' },
  { value: 'seminar', label: 'Seminar', color: '#7b1fa2', darkColor: '#ce93d8' },
  { value: 'independent', label: 'Mustaqil ish', color: '#455a64', darkColor: '#b0bec5' },
];

export function lessonTypeLabel(type: LessonType): string {
  return LESSON_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Dars turi rangi — mavzu rejimiga qarab (light/dark) */
export function lessonTypeColor(type: LessonType, mode: 'light' | 'dark' = 'light'): string {
  const found = LESSON_TYPES.find((t) => t.value === type);
  if (!found) return mode === 'dark' ? '#b0bec5' : '#455a64';
  return mode === 'dark' ? found.darkColor : found.color;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: number | null;
  credits: number | null;
  lecture_hours: number;
  practice_hours: number;
  independent_hours: number;
  position: number;
  /** Fan biriktirilgan kurslar (1–4) */
  courses?: number[];
  topic_count?: number;
  planned_hours?: number;
}

export interface TopicListItem {
  id: number;
  subject_id: number;
  title: string;
  week: number | null;
  position: number;
  lesson_type: LessonType;
  hours: number;
  summary: string;
  keywords: string;
}

export interface Topic extends TopicListItem {
  objectives: string;
  content: string;
  assignments: string;
  resources: string;
  subject_name?: string;
  subject_code?: string;
}

export interface SubjectWithTopics extends Subject {
  topics: TopicListItem[];
}

export type TopicInput = Omit<Topic, 'id' | 'position' | 'subject_name' | 'subject_code'> & {
  position?: number;
};

export type SubjectInput = Omit<Subject, 'id' | 'topic_count' | 'planned_hours' | 'courses'> & {
  courses: number[];
};

export const COURSES = [1, 2, 3, 4] as const;

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

export interface RegisterInput {
  first_name: string;
  last_name: string;
  course: number;
  login: string;
  password: string;
}

/** Adminkada talabani tahrirlash: yuborilgan maydonlargina o'zgaradi; bo'sh parol — eskisi qoladi */
export type StudentUpdate = Partial<RegisterInput>;

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  login: string;
  course: number;
  created_at: string;
}

export type ShareScope = 'subject' | 'topic';

export interface Share {
  id: number;
  token: string;
  scope: ShareScope;
  subject_id: number | null;
  topic_id: number | null;
  note: string;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  subject_name?: string;
  subject_code?: string;
  topic_title?: string;
}

/** Ulashilgan fan: faqat shu fan va uning mavzulari */
export interface SharedSubjectPayload {
  scope: 'subject';
  share: { token: string; note: string };
  subject: Subject;
  topics: TopicListItem[];
}

/** Ulashilgan mavzu: faqat bitta mavzu, qo'shni mavzular yo'q */
export interface SharedTopicPayload {
  scope: 'topic';
  share: { token: string; note: string };
  topic: Topic;
}

export type SharePayload = SharedSubjectPayload | SharedTopicPayload;

export function shareUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}

export interface ClassSession {
  id: number;
  subject_id: number;
  course: number;
  /** YYYY-MM-DD */
  lesson_date: string;
  topic_id: number | null;
  topic_title?: string | null;
  note: string;
}

export interface ClassSessionInput {
  lesson_date: string;
  topic_id: number | null;
  note: string;
}

export interface AttendanceMark {
  session_id: number;
  student_id: number;
  present: boolean;
  score: number;
  /** true — score kunning yakuniy bali (admin qo'lda qo'ygan), topshiriq bali qo'shilmaydi */
  score_override: boolean;
}

export type JournalStudent = Omit<Student, 'created_at'>;

export interface Journal {
  subject: Subject & { courses: number[] };
  course: number | null;
  students: JournalStudent[];
  sessions: ClassSession[];
  marks: AttendanceMark[];
  /** Baholangan topshiriqlar — topshiriq yuborilgan kundagi (yoki undan oldingi eng yaqin) darsga qo'shiladi */
  task_scores: { session_id: number; student_id: number; score: number; count: number }[];
  /** Yuborilgan kungacha jurnalda dars bo'lmagan topshiriqlar ballari */
  unassigned_task_scores: { student_id: number; score: number; count: number }[];
}

/** Talabaning o'z jurnali: bitta dars kuni */
export interface MyJournalDay {
  session_id: number;
  lesson_date: string;
  topic_id: number | null;
  topic_title: string | null;
  /** null — belgilanmagan */
  present: boolean | null;
  /** Darsdagi ball (score_override bo'lsa — kunning yakuniy bali) */
  score: number;
  score_override: boolean;
  /** Shu kunga tushgan baholangan topshiriqlar yig'indisi */
  task_score: number | null;
  task_count: number;
}

export interface MyJournalSubmission {
  id: number;
  topic_id: number;
  topic_title: string;
  status: 'submitted' | 'graded';
  score: number | null;
  feedback: string;
  submitted_at: string;
  graded_at: string | null;
  file_name: string | null;
  content_kind: SubmissionKind;
}

export interface MyJournal {
  days: MyJournalDay[];
  submissions: MyJournalSubmission[];
  unassigned_task_score: number;
  unassigned_task_count: number;
}

export type SubmissionKind = 'text' | 'code';

export interface Submission {
  id: number;
  student_id: number;
  topic_id: number;
  content_kind: SubmissionKind;
  content: string;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  status: 'submitted' | 'graded';
  score: number | null;
  feedback: string;
  submitted_at: string;
  seen_at: string | null;
  graded_at: string | null;
}

/** O'qituvchi uchun: kim, qaysi fan va mavzu */
export interface SubmissionWithContext extends Submission {
  first_name: string;
  last_name: string;
  course: number;
  topic_title: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
}

/** Talaba ko'radigan mavzu: dars matnisiz, faqat topshiriq sharti */
export interface StudentTopic {
  id: number;
  subject_id: number;
  title: string;
  week: number | null;
  lesson_type: LessonType;
  hours: number;
  assignments: string;
  subject_name: string;
  subject_code: string;
}

export interface SubmissionNotification {
  id: number;
  submitted_at: string;
  file_name: string | null;
  first_name: string;
  last_name: string;
  course: number;
  topic_title: string;
  subject_code: string;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 28.09.2026 14:05 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
