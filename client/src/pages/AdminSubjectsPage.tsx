import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ShareDialog from '../components/ShareDialog';
import type { Subject, SubjectInput } from '../types';

const emptySubject: SubjectInput = {
  name: '',
  code: '',
  description: '',
  semester: 1,
  credits: 5,
  lecture_hours: 30,
  practice_hours: 30,
  independent_hours: 60,
  position: 0,
};

export default function AdminSubjectsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SubjectInput>(emptySubject);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState<Subject | null>(null);

  const load = () => {
    api.listSubjects().then(setSubjects).catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptySubject, position: subjects.length });
    setDialogOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      semester: subject.semester,
      credits: subject.credits,
      lecture_hours: subject.lecture_hours,
      practice_hours: subject.practice_hours,
      independent_hours: subject.independent_hours,
      position: subject.position,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) await api.updateSubject(editingId, form);
      else await api.createSubject(form);
      setDialogOpen(false);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (subject: Subject) => {
    if (!confirm(`"${subject.name}" fani va uning barcha mavzulari o'chiriladi. Davom etasizmi?`)) return;
    try {
      await api.deleteSubject(subject.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const num = (v: number | null) => (v == null ? '' : String(v));
  const toNum = (v: string) => (v === '' ? null : Number(v));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Fanlar boshqaruvi</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => navigate('/admin/havolalar')}
          >
            Havolalar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Fan qo'shish
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {subjects.length === 0 ? (
        <Alert severity="info">Hali fan yo'q. "Fan qo'shish" tugmasi orqali boshlang.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={100}>Kod</TableCell>
                <TableCell>Fan nomi</TableCell>
                <TableCell width={90} align="center">Semestr</TableCell>
                <TableCell width={90} align="center">Mavzular</TableCell>
                <TableCell width={90} align="center">Soat</TableCell>
                <TableCell width={190} align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                  </TableCell>
                  <TableCell align="center">{s.semester ?? '—'}</TableCell>
                  <TableCell align="center">{s.topic_count ?? 0}</TableCell>
                  <TableCell align="center">{s.planned_hours ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ulashish havolasi">
                      <IconButton size="small" onClick={() => setSharing(s)}>
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mavzular">
                      <IconButton size="small" onClick={() => navigate(`/admin/fan/${s.id}`)}>
                        <ListAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tahrirlash">
                      <IconButton size="small" onClick={() => openEdit(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O'chirish">
                      <IconButton size="small" color="error" onClick={() => remove(s)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ShareDialog
        open={Boolean(sharing)}
        onClose={() => setSharing(null)}
        scope="subject"
        targetId={sharing?.id ?? 0}
        targetTitle={sharing ? `${sharing.code} — ${sharing.name}` : ''}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Fanni tahrirlash' : 'Yangi fan'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Fan nomi" size="small" fullWidth required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Kod" size="small" fullWidth required placeholder="DA-101"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Tavsif" size="small" fullWidth multiline minRows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Semestr" size="small" fullWidth type="number"
                value={num(form.semester)}
                onChange={(e) => setForm({ ...form, semester: toNum(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Kredit" size="small" fullWidth type="number"
                value={num(form.credits)}
                onChange={(e) => setForm({ ...form, credits: toNum(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Ma'ruza" size="small" fullWidth type="number"
                value={form.lecture_hours}
                onChange={(e) => setForm({ ...form, lecture_hours: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Amaliy" size="small" fullWidth type="number"
                value={form.practice_hours}
                onChange={(e) => setForm({ ...form, practice_hours: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Mustaqil" size="small" fullWidth type="number"
                value={form.independent_hours}
                onChange={(e) => setForm({ ...form, independent_hours: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.name || !form.code}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
