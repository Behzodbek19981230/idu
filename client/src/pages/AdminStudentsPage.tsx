import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import StudentSubmissionsDialog from '../components/StudentSubmissionsDialog';
import { COURSES, type RegisterInput, type Student } from '../types';

export default function AdminStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | 'all'>('all');
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<RegisterInput>({ first_name: '', last_name: '', login: '', course: 1, password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [viewing, setViewing] = useState<Student | null>(null);

  const load = () => {
    api.listStudents().then(setStudents).catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        (courseFilter === 'all' || s.course === courseFilter) &&
        (!q || `${s.last_name} ${s.first_name} ${s.login}`.toLowerCase().includes(q)),
    );
  }, [students, search, courseFilter]);

  const countByCourse = (course: number) => students.filter((s) => s.course === course).length;

  const changeCourse = async (student: Student, course: number) => {
    try {
      const updated = await api.updateStudent(student.id, { course });
      setStudents((list) => list.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      login: student.login,
      course: student.course,
      password: '',
    });
    setShowPassword(false);
    setFormError('');
  };

  const passwordTooShort = form.password.length > 0 && form.password.length < 6;
  const canSave =
    form.first_name.trim().length >= 2 &&
    form.last_name.trim().length >= 2 &&
    form.login.trim().length >= 3 &&
    !passwordTooShort &&
    !saving;

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setFormError('');
    try {
      // Parol bo'sh bo'lsa — yuborilmaydi, eskisi qoladi
      const { password, ...rest } = form;
      const updated = await api.updateStudent(editing.id, password ? form : rest);
      setStudents((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      setEditing(null);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (student: Student) => {
    if (!confirm(`${student.last_name} ${student.first_name} o'chiriladi. Davom etasizmi?`)) return;
    try {
      await api.deleteStudent(student.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/admin')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Talabalar</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Ism, familiya yoki login…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`Barchasi (${students.length})`}
            color={courseFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setCourseFilter('all')}
          />
          {COURSES.map((c) => (
            <Chip
              key={c}
              label={`${c}-kurs (${countByCourse(c)})`}
              color={courseFilter === c ? 'primary' : 'default'}
              onClick={() => setCourseFilter(c)}
            />
          ))}
        </Stack>
      </Stack>

      {filtered.length === 0 ? (
        <Alert severity="info">
          {students.length === 0 ? "Hali ro'yxatdan o'tgan talaba yo'q." : 'Mos talaba topilmadi.'}
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>F.I.</TableCell>
                <TableCell>Login</TableCell>
                <TableCell width={130}>Kurs</TableCell>
                <TableCell width={130}>Ro'yxatdan o'tgan</TableCell>
                <TableCell width={100} align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      fontWeight={500}
                      underline="hover"
                      title="Yuborgan topshiriqlari"
                      sx={{ textAlign: 'left' }}
                      onClick={() => setViewing(s)}
                    >
                      {s.last_name} {s.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>{s.login}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      variant="standard"
                      value={s.course}
                      onChange={(e) => changeCourse(s, Number(e.target.value))}
                    >
                      {COURSES.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}-kurs
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
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

      <Button sx={{ mt: 2 }} onClick={load}>
        Yangilash
      </Button>

      <StudentSubmissionsDialog student={viewing} onClose={() => setViewing(null)} />

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Talabani tahrirlash</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Familiya"
              size="small"
              fullWidth
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
            <TextField
              label="Ism"
              size="small"
              fullWidth
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="edit-course">Kurs</InputLabel>
              <Select
                labelId="edit-course"
                label="Kurs"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: Number(e.target.value) })}
              >
                {COURSES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}-kurs
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Login"
              size="small"
              fullWidth
              autoComplete="off"
              helperText="Lotin harflari, raqam, _ . - (3–32 belgi)"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
            <TextField
              label="Yangi parol"
              size="small"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
              error={passwordTooShort}
              helperText={passwordTooShort ? 'Kamida 6 belgi' : "Bo'sh qolsa — eski parol saqlanadi"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Bekor qilish</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!canSave}>
            {saving ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
