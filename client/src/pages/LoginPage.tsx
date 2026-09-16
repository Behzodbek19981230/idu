import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      await login(form.login, form.password);
      navigate('/admin');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: { xs: 2, md: 6 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h6">Adminka kirish</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Fanlar va dars qo'llanmalarini tahrirlash uchun tizimga kiring
          </Typography>
        </Stack>

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
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
            <TextField
              label="Parol"
              type="password"
              size="small"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Tekshirilmoqda…' : 'Kirish'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
