export type LessonType = 'lecture' | 'practice' | 'lab' | 'seminar' | 'independent';

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
  courses?: number[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  subject_id: number;
  title: string;
  week: number | null;
  position: number;
  lesson_type: LessonType;
  hours: number;
  summary: string;
  objectives: string;
  keywords: string;
  content: string;
  assignments: string;
  resources: string;
  created_at: string;
  updated_at: string;
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
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  login: string;
  course: number;
  created_at: string;
}

export interface ClassSession {
  id: number;
  subject_id: number;
  course: number;
  lesson_date: string;
  topic_id: number | null;
  note: string;
  created_at: string;
}

export interface AttendanceMark {
  session_id: number;
  student_id: number;
  present: boolean;
  score: number;
}

export interface Submission {
  id: number;
  student_id: number;
  topic_id: number;
  content_kind: 'text' | 'code';
  content: string;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_mime: string | null;
  status: 'submitted' | 'graded';
  score: number | null;
  feedback: string;
  submitted_at: string;
  seen_at: string | null;
  graded_at: string | null;
}
