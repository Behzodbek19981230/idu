import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { COURSES, type RegisterInput } from '../types';

const emptyForm: RegisterInput = {
  first_name: '',
  last_name: '',
  course: 1,
  login: '',
  password: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>(emptyForm);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== form.password;
  const canSubmit =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.login.trim() &&
    form.password.length >= 6 &&
    confirm === form.password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon={<PersonAddAlt1OutlinedIcon />}
      title="Ro'yxatdan o'tish"
      subtitle="Kursingizni tanlang — sizga shu kursga biriktirilgan fanlar ko'rinadi"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={submit}>
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="course-select">Kurs</InputLabel>
            <Select
              labelId="course-select"
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
            label="Ism"
            size="small"
            fullWidth
            autoComplete="given-name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <TextField
            label="Familiya"
            size="small"
            fullWidth
            autoComplete="family-name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <TextField
            label="Login"
            size="small"
            fullWidth
            autoComplete="username"
            helperText="Lotin harflari, raqam, _ . - (3–32 belgi)"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
          />
          <TextField
            label="Parol"
            type="password"
            size="small"
            fullWidth
            autoComplete="new-password"
            helperText="Kamida 6 belgi"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <TextField
            label="Parolni takrorlang"
            type="password"
            size="small"
            fullWidth
            autoComplete="new-password"
            error={mismatch}
            helperText={mismatch ? 'Parollar mos emas' : ' '}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" disabled={loading || !canSubmit}>
            {loading ? 'Saqlanmoqda…' : "Ro'yxatdan o'tish"}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2.5 }}>
        Hisobingiz bormi?{' '}
        <Link component={RouterLink} to="/login">
          Kirish
        </Link>
      </Typography>
    </AuthShell>
  );
}
