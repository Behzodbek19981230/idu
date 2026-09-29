import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { api } from '../api/client';
import CodeRunner from '../components/CodeRunner';
import { formatScore } from '../components/JournalCells';
import LessonTypeChip from '../components/LessonTypeChip';
import Markdown from '../components/Markdown';
import SubmissionBody from '../components/SubmissionBody';
import {
  formatDateTime,
  formatFileSize,
  type StudentTopic,
  type Submission,
  type SubmissionKind,
} from '../types';

/** Talaba uchun mavzu: dars matni yo'q — faqat topshiriq sharti va topshiriq yuborish */
export default function StudentTopicPage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<StudentTopic | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Kod muharriri darhol ko'rinsin; matn javob uchun "Matn"ga o'tiladi
  const [kind, setKind] = useState<SubmissionKind>('code');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!topicId) return;
    setLoading(true);
    setError('');
    api
      .getStudentTopic(Number(topicId))
      .then((data) => {
        setTopic(data.topic);
        setSubmissions(data.submissions);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) return;
    setSending(true);
    setError('');
    setSent(false);
    try {
      const form = new FormData();
      form.append('content_kind', kind);
      form.append('content', content);
      if (file) form.append('file', file);
      const saved = await api.submitAssignment(Number(topicId), form);
      setSubmissions((list) => [saved, ...list]);
      setContent('');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!topic) return <Alert severity="error">{error || 'Mavzu topilmadi'}</Alert>;

  const canSubmit = Boolean(content.trim() || file) && !sending;

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit" variant="body2">
          Fanlar
        </Link>
        <Link
          component={RouterLink}
          to={`/fan/${topic.subject_id}`}
          underline="hover"
          color="inherit"
          variant="body2"
        >
          {topic.subject_name}
        </Link>
        <Typography variant="body2" color="text.primary">
          Topshiriq
        </Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        {topic.week != null && <Chip label={`${topic.week}-hafta`} size="small" variant="outlined" />}
        <LessonTypeChip type={topic.lesson_type} />
      </Stack>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {topic.title}
      </Typography>

      {topic.assignments.trim() && (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Topshiriq sharti
          </Typography>
          <Markdown>{topic.assignments}</Markdown>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Topshiriq yuborish
        </Typography>

        {sent && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSent(false)}>
            Topshiriq yuborildi. O'qituvchi tekshirgach, bahosi shu yerda ko'rinadi.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={submit}>
          <Stack spacing={2}>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={kind}
              onChange={(_e, value: SubmissionKind | null) => value && setKind(value)}
            >
              <ToggleButton value="code" sx={{ px: 2 }}>
                <CodeIcon fontSize="small" sx={{ mr: 1 }} />
                Kod
              </ToggleButton>
              <ToggleButton value="text" sx={{ px: 2 }}>
                <NotesIcon fontSize="small" sx={{ mr: 1 }} />
                Matn
              </ToggleButton>
            </ToggleButtonGroup>

            {kind === 'code' ? (
              <CodeRunner code={content} onChange={setContent} />
            ) : (
              <TextField
                multiline
                minRows={5}
                maxRows={30}
                fullWidth
                placeholder="Javobingizni yozing…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <input
                ref={fileInput}
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileInput.current?.click()}>
                Fayl biriktirish
              </Button>
              {file && (
                <Chip
                  label={`${file.name} · ${formatFileSize(file.size)}`}
                  onDelete={() => {
                    setFile(null);
                    if (fileInput.current) fileInput.current.value = '';
                  }}
                  deleteIcon={<CloseIcon />}
                  sx={{ maxWidth: '100%' }}
                />
              )}
            </Stack>

            <Box>
              <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={!canSubmit}>
                {sending ? 'Yuborilmoqda…' : 'Yuborish'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Yuborilgan topshiriqlar
      </Typography>
      {submissions.length === 0 ? (
        <Typography color="text.secondary">Hali topshiriq yubormagansiz.</Typography>
      ) : (
        <Stack spacing={2}>
          {submissions.map((s) => (
            <Paper key={s.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(s.submitted_at)}
                </Typography>
                {s.status === 'graded' ? (
                  <Chip color="success" size="small" label={`Baholandi: ${formatScore(s.score ?? 0)} ball`} />
                ) : (
                  <Chip size="small" variant="outlined" label="Tekshirilmoqda" />
                )}
              </Stack>

              <SubmissionBody
                submission={s}
                onSaved={
                  s.status === 'graded'
                    ? undefined
                    : (updated) => setSubmissions((list) => list.map((x) => (x.id === updated.id ? updated : x)))
                }
              />

              {s.status === 'graded' && s.feedback.trim() && (
                <Alert severity="info" icon={false} sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    O'qituvchi izohi
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {s.feedback}
                  </Typography>
                </Alert>
              )}
            </Paper>
          ))}
        </Stack>
      )}

    </Box>
  );
}
