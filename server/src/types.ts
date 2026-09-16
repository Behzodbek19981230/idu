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
