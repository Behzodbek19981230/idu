import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.login, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      icon={<LockOutlinedIcon />}
      title="Tizimga kirish"
      subtitle="Fanlar va dars qo'llanmalarini ko'rish uchun login va parolingizni kiriting"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={submit}>
        <Stack spacing={2}>
          <TextField
            label="Login"
            size="small"
            fullWidth
            autoFocus
            autoComplete="username"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
          />
          <TextField
            label="Parol"
            type="password"
            size="small"
            fullWidth
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !form.login || !form.password}
          >
            {loading ? 'Tekshirilmoqda…' : 'Kirish'}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2.5 }}>
        Hisobingiz yo'qmi?{' '}
        <Link component={RouterLink} to="/register">
          Ro'yxatdan o'tish
        </Link>
      </Typography>
    </AuthShell>
  );
}
