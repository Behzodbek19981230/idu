import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
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
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatScore, isValidScore } from '../components/JournalCells';
import SubmissionBody from '../components/SubmissionBody';
import { formatDateTime, type SubmissionWithContext } from '../types';

/** O'qituvchi: bitta topshiriqni ko'rish va baholash */
export default function AdminSubmissionPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionWithContext | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!submissionId) return;
    setLoading(true);
    setError('');
    setSaved(false);
    api
      .getSubmission(Number(submissionId))
      .then((s) => {
        setSubmission(s);
        setScore(s.score != null ? formatScore(s.score) : '');
        setFeedback(s.feedback);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [submissionId]);

  const scoreValue = Number(score.trim().replace(',', '.'));
  const scoreValid = score.trim() !== '' && isValidScore(scoreValue);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !scoreValid) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.gradeSubmission(submission.id, { score: scoreValue, feedback });
      setSubmission(updated);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const nextUngraded = async () => {
    try {
      // Eskidan yangiga: joriydan keyin yuborilgani, bo'lmasa — eng eskisi
      const queue = (await api.listSubmissions({ status: 'submitted' }))
        .filter((s) => s.id !== submission?.id)
        .reverse();
      const current = submission ? new Date(submission.submitted_at).getTime() : 0;
      const next = queue.find((s) => new Date(s.submitted_at).getTime() >= current) ?? queue[0];
      navigate(next ? `/admin/topshiriqlar/${next.id}` : '/admin/topshiriqlar');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!submission) return <Alert severity="error">{error || 'Topshiriq topilmadi'}</Alert>;

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/admin" underline="hover" color="inherit" variant="body2">
          Adminka
        </Link>
        <Link component={RouterLink} to="/admin/topshiriqlar" underline="hover" color="inherit" variant="body2">
          Topshiriqlar
        </Link>
        <Typography variant="body2" color="text.primary">
          #{submission.id}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-start' }}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5">
            {submission.last_name} {submission.first_name}
          </Typography>
          <Typography color="text.secondary">
            {submission.course}-kurs · {submission.subject_code} — {submission.topic_title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Yuborilgan: {formatDateTime(submission.submitted_at)}
            {submission.graded_at && ` · Baholangan: ${formatDateTime(submission.graded_at)}`}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<MenuBookOutlinedIcon />}
            component={RouterLink}
            to={`/fan/${submission.subject_id}/mavzu/${submission.topic_id}`}
          >
            Mavzu
          </Button>
          {submission.status === 'graded' ? (
            <Chip color="success" label={`${formatScore(submission.score ?? 0)} ball`} />
          ) : (
            <Chip variant="outlined" label="Tekshirilmagan" />
          )}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {submission.content_kind === 'code' ? 'Kod' : 'Javob'}
        </Typography>
        <SubmissionBody
          submission={submission}
          onSaved={(updated) => setSubmission((prev) => (prev ? { ...prev, ...updated } : prev))}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Baholash
        </Typography>

        {saved && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" endIcon={<ArrowForwardIcon />} onClick={nextUngraded}>
                Keyingi tekshirilmagan
              </Button>
            }
          >
            Baho saqlandi — talabaga ko'rinadi.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={save}>
          <Stack spacing={2}>
            <TextField
              label="Ball"
              size="small"
              autoFocus={submission.status !== 'graded'}
              value={score}
              onChange={(e) => {
                setScore(e.target.value);
                setSaved(false);
              }}
              error={score.trim() !== '' && !scoreValid}
              helperText={score.trim() !== '' && !scoreValid ? 'Manfiy bo‘lmagan son kiriting' : 'Istalgan son: 0,3 · 1 · 1,5 …'}
              inputProps={{ inputMode: 'decimal' }}
              sx={{ maxWidth: 200 }}
            />
            <TextField
              label="Izoh (talabaga ko'rinadi)"
              multiline
              minRows={3}
              fullWidth
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setSaved(false);
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={!scoreValid || saving}>
                {saving ? 'Saqlanmoqda…' : submission.status === 'graded' ? 'Bahoni yangilash' : 'Baholash'}
              </Button>
              <Button onClick={nextUngraded}>O'tkazib yuborish</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
