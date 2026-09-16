import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Subject } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listSubjects()
      .then(setSubjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalTopics = subjects.reduce((sum, s) => sum + (s.topic_count ?? 0), 0);
  const totalHours = subjects.reduce((sum, s) => sum + (s.planned_hours ?? 0), 0);

  return (
    <Box>
      <Box
        sx={(theme) => ({
          p: { xs: 2.5, md: 4 },
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(
            theme.palette.secondary.main,
            0.08,
          )})`,
        })}
      >
        <Typography variant="h4" gutterBottom>
          Fanlar
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Har bir fan uchun kalendar-tematik ish reja va mavzular bo'yicha to'liq dars
          qo'llanmalari. Fanni tanlang — chap panelda mavzular ro'yxati ochiladi.
        </Typography>

        {!loading && subjects.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Chip icon={<MenuBookIcon />} label={`${subjects.length} ta fan`} size="small" />
            <Chip label={`${totalTopics} ta mavzu`} size="small" variant="outlined" />
            <Chip
              icon={<AccessTimeIcon />}
              label={`${totalHours} soat`}
              size="small"
              variant="outlined"
            />
          </Stack>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Grid container spacing={2}>
          {[0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={190} />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && subjects.length === 0 && !error && (
        <Alert severity="info">
          Hali fan qo'shilmagan. Adminka orqali birinchi fanni qo'shing.
        </Alert>
      )}

      <Grid container spacing={2}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} key={subject.id}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                transition: 'border-color .2s, transform .2s',
                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
              }}
            >
              <CardActionArea
                sx={{ height: '100%', alignItems: 'stretch' }}
                onClick={() => navigate(`/fan/${subject.id}`)}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip label={subject.code} size="small" color="primary" variant="outlined" />
                    {subject.semester != null && (
                      <Chip label={`${subject.semester}-semestr`} size="small" variant="outlined" />
                    )}
                  </Stack>

                  <Typography variant="h6" sx={{ mb: 1, lineHeight: 1.3 }}>
                    {subject.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {subject.description || 'Tavsif kiritilmagan'}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {subject.topic_count ?? 0} mavzu · {subject.planned_hours ?? 0} soat
                      {subject.credits != null ? ` · ${subject.credits} kredit` : ''}
                    </Typography>
                    <ArrowForwardIcon fontSize="small" color="primary" />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
