import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Markdown from '../components/Markdown';
import { LESSON_TYPES, type LessonType, type Subject, type TopicInput } from '../types';

const emptyTopic: TopicInput = {
  subject_id: 0,
  title: '',
  week: null,
  lesson_type: 'lecture',
  hours: 2,
  summary: '',
  objectives: '',
  keywords: '',
  content: '',
  assignments: '',
  resources: '',
};

const CONTENT_TEMPLATE = `## 1. Darsning maqsadi

...

## 2. Nazariy qism (50 daqiqa)

### 2.1. ...

...

## 3. Amaliy qism (30 daqiqa)

1. ...
2. ...

## 4. Yakunlash (10 daqiqa)

- ...
`;

export default function AdminTopicEditorPage() {
  const { topicId, subjectId } = useParams();
  const navigate = useNavigate();
  const isNew = !topicId;

  const [form, setForm] = useState<TopicInput>({
    ...emptyTopic,
    subject_id: subjectId ? Number(subjectId) : 0,
    content: isNew ? CONTENT_TEMPLATE : '',
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!topicId) return;
    api
      .getTopic(Number(topicId))
      .then((topic) =>
        setForm({
          subject_id: topic.subject_id,
          title: topic.title,
          week: topic.week,
          lesson_type: topic.lesson_type,
          hours: topic.hours,
          summary: topic.summary,
          objectives: topic.objectives,
          keywords: topic.keywords,
          content: topic.content,
          assignments: topic.assignments,
          resources: topic.resources,
          position: topic.position,
        }),
      )
      .catch((e: Error) => setError(e.message));
  }, [topicId]);

  const set = <K extends keyof TopicInput>(key: K, value: TopicInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await api.createTopic(form);
        setSaved(true);
        navigate(`/admin/mavzu/${created.id}`, { replace: true });
      } else {
        await api.updateTopic(Number(topicId), form);
        setSaved(true);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(form.subject_id ? `/admin/fan/${form.subject_id}` : '/admin')}
          >
            Orqaga
          </Button>
          <Typography variant="h5">{isNew ? 'Yangi mavzu' : 'Mavzuni tahrirlash'}</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={save}
          disabled={saving || !form.title || !form.subject_id}
        >
          Saqlash
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select label="Fan" size="small" fullWidth required
              value={form.subject_id || ''}
              onChange={(e) => set('subject_id', Number(e.target.value))}
            >
              {subjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              label="Hafta" type="number" size="small" fullWidth
              value={form.week ?? ''}
              onChange={(e) => set('week', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              label="Soat" type="number" size="small" fullWidth
              value={form.hours}
              onChange={(e) => set('hours', Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select label="Dars turi" size="small" fullWidth
              value={form.lesson_type}
              onChange={(e) => set('lesson_type', e.target.value as LessonType)}
            >
              {LESSON_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mavzu nomi" size="small" fullWidth required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Qisqacha mazmun" size="small" fullWidth multiline minRows={2}
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dars maqsadlari (har biri yangi qatorda)"
              size="small" fullWidth multiline minRows={4}
              value={form.objectives}
              onChange={(e) => set('objectives', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tayanch so'zlar (vergul bilan)"
              size="small" fullWidth multiline minRows={4}
              value={form.keywords}
              onChange={(e) => set('keywords', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Dars matni" />
          <Tab label="Ko'rinishi" />
        </Tabs>
        <Box sx={{ p: 2.5 }}>
          {tab === 0 ? (
            <TextField
              fullWidth multiline minRows={20}
              placeholder="Markdown formatida yozing: ## sarlavha, **qalin**, - ro'yxat, ```kod```, jadval"
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: 14, lineHeight: 1.6 } }}
            />
          ) : form.content ? (
            <Markdown>{form.content}</Markdown>
          ) : (
            <Typography color="text.secondary">Matn kiritilmagan.</Typography>
          )}
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Topshiriqlar (Markdown)
            </Typography>
            <TextField
              fullWidth multiline minRows={6}
              value={form.assignments}
              onChange={(e) => set('assignments', e.target.value)}
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: 14 } }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Adabiyotlar va manbalar (Markdown)
            </Typography>
            <TextField
              fullWidth multiline minRows={6}
              value={form.resources}
              onChange={(e) => set('resources', e.target.value)}
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: 14 } }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={saved}
        autoHideDuration={2500}
        onClose={() => setSaved(false)}
        message="Saqlandi"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
