-- Fanlar
CREATE TABLE IF NOT EXISTS subjects (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  code            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  semester        INTEGER,
  credits         INTEGER,
  lecture_hours   INTEGER NOT NULL DEFAULT 0,
  practice_hours  INTEGER NOT NULL DEFAULT 0,
  independent_hours INTEGER NOT NULL DEFAULT 0,
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mavzular (ish reja qatori + dars qo'llanmasi)
CREATE TABLE IF NOT EXISTS topics (
  id           SERIAL PRIMARY KEY,
  subject_id   INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  week         INTEGER,
  position     INTEGER NOT NULL DEFAULT 0,
  lesson_type  TEXT NOT NULL DEFAULT 'lecture',
  hours        INTEGER NOT NULL DEFAULT 2,
  summary      TEXT NOT NULL DEFAULT '',
  objectives   TEXT NOT NULL DEFAULT '',
  keywords     TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  assignments  TEXT NOT NULL DEFAULT '',
  resources    TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS topics_subject_position_idx ON topics (subject_id, position);

-- lesson_type uchun cheklov
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'topics_lesson_type_check') THEN
    ALTER TABLE topics ADD CONSTRAINT topics_lesson_type_check
      CHECK (lesson_type IN ('lecture', 'practice', 'lab', 'seminar', 'independent'));
  END IF;
END $$;

-- updated_at ni avtomatik yangilash
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subjects_set_updated_at ON subjects;
CREATE TRIGGER subjects_set_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS topics_set_updated_at ON topics;
CREATE TRIGGER topics_set_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Ommaviy havolalar: bitta fan yoki bitta mavzuni student bilan ulashish
CREATE TABLE IF NOT EXISTS shares (
  id          SERIAL PRIMARY KEY,
  token       TEXT NOT NULL UNIQUE,
  scope       TEXT NOT NULL,
  subject_id  INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id    INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  note        TEXT NOT NULL DEFAULT '',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at  TIMESTAMPTZ,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shares_subject_idx ON shares (subject_id);
CREATE INDEX IF NOT EXISTS shares_topic_idx ON shares (topic_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shares_scope_check') THEN
    ALTER TABLE shares ADD CONSTRAINT shares_scope_check CHECK (
      (scope = 'subject' AND subject_id IS NOT NULL AND topic_id IS NULL)
      OR
      (scope = 'topic' AND topic_id IS NOT NULL AND subject_id IS NOT NULL)
    );
  END IF;
END $$;
