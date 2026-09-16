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

export type SubjectInput = Omit<Subject, 'id' | 'topic_count' | 'planned_hours'>;

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
