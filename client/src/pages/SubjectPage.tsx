import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import PlanTable from '../components/PlanTable';
import ShareDialog from '../components/ShareDialog';
import { useAuth } from '../context/AuthContext';
import type { SubjectWithTopics } from '../types';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="h5" color="primary.main" lineHeight={1.2}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [subject, setSubject] = useState<SubjectWithTopics | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setError('');
    api
      .getSubject(Number(subjectId))
      .then(setSubject)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!subject) return null;

  const totalHours = subject.topics.reduce((sum, t) => sum + t.hours, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip label={subject.code} size="small" color="primary" variant="outlined" />
            {subject.semester != null && (
              <Chip label={`${subject.semester}-semestr`} size="small" variant="outlined" />
            )}
          </Stack>
          <Typography variant="h4" gutterBottom>
            {subject.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, displayPrint: 'none' }}>
          {isAdmin && (
            <Button
              startIcon={<ShareIcon />}
              variant="contained"
              size="small"
              onClick={() => setShareOpen(true)}
            >
              Ulashish
            </Button>
          )}
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            size="small"
            onClick={() => window.print()}
          >
            Chop etish
          </Button>
        </Stack>
      </Stack>

      {subject.description && (
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 900, lineHeight: 1.7 }}>
          {subject.description}
        </Typography>
      )}

      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Stat label="Mavzular" value={subject.topics.length} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Stat label="Rejadagi soat" value={totalHours} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Stat label="Ma'ruza soati" value={subject.lecture_hours} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Stat label="Amaliy soati" value={subject.practice_hours} />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Stat label="Mustaqil ta'lim" value={subject.independent_hours} />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Kalendar-tematik reja
      </Typography>

      {subject.topics.length === 0 ? (
        <Alert severity="info">Bu fanda hali mavzu qo'shilmagan.</Alert>
      ) : (
        <PlanTable
          topics={subject.topics}
          onSelect={(topic) => navigate(`/fan/${subject.id}/mavzu/${topic.id}`)}
        />
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Mavzu ustiga bosing — to'liq dars qo'llanmasi ochiladi.
      </Typography>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        scope="subject"
        targetId={subject.id}
        targetTitle={`${subject.code} — ${subject.name}`}
      />
    </Box>
  );
}
