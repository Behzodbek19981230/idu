import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../api/client';
import { formatDateTime, type MyJournal, type MyJournalDay } from '../types';
import { formatScore } from './JournalCells';

/** 2026-09-28 → 28.09.2026 */
const fullDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

/** Kunlik ball — admin jurnalidagi katak bilan bir xil hisob */
function dayTotal(d: MyJournalDay) {
  if (d.score_override) return d.score;
  return (d.present ? d.score : 0) + (d.task_score ?? 0);
}

function Stat({ label, value, color = 'primary.main' }: { label: string; value: string | number; color?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="h5" color={color} lineHeight={1.2}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

const Dash = () => (
  <Typography component="span" variant="body2" color="text.disabled">
    —
  </Typography>
);

/** Talaba uchun: fan bo'yicha davomati, kunlik ballari va yuborgan topshiriqlari bali */
export default function StudentGrades({ subjectId }: { subjectId: number }) {
  const [data, setData] = useState<MyJournal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getMyJournal(subjectId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) return <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>;
  if (!data) return null;

  const { days, submissions } = data;
  const present = days.filter((d) => d.present === true).length;
  const absent = days.filter((d) => d.present === false).length;
  const marked = present + absent;
  const total = days.reduce((sum, d) => sum + dayTotal(d), 0) + data.unassigned_task_score;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Mening baholarim
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Stat label="Jami ball" value={formatScore(total)} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Stat label="Qatnashgan darslar" value={present} color="success.main" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Stat label="Qoldirilgan (NB)" value={absent} color={absent ? 'error.main' : 'text.secondary'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Stat label="Davomat" value={marked ? `${Math.round((present / marked) * 100)}%` : '—'} />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Davomat va kunlik ballar
      </Typography>
      {days.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Jurnalda hali dars yo'q.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Sana</TableCell>
                <TableCell>Mavzu</TableCell>
                <TableCell align="center">Davomat</TableCell>
                <TableCell align="center">Darsdagi ball</TableCell>
                <TableCell align="center">Topshiriq bali</TableCell>
                <TableCell align="center">Kunlik ball</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map((d) => (
                <TableRow key={d.session_id} hover>
                  <TableCell>{fullDate(d.lesson_date)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'normal !important', minWidth: 180 }}>
                    {d.topic_title ?? <Dash />}
                  </TableCell>
                  <TableCell align="center">
                    {d.present === null ? (
                      <Dash />
                    ) : d.present ? (
                      <Chip size="small" color="success" variant="outlined" label="Keldi" />
                    ) : (
                      <Chip size="small" color="error" label="NB" />
                    )}
                  </TableCell>
                  <TableCell align="center">{d.present ? formatScore(d.score) : <Dash />}</TableCell>
                  <TableCell align="center">
                    {d.task_score === null ? (
                      <Dash />
                    ) : d.score_override ? (
                      <Tooltip title="O‘qituvchi shu kun uchun yakuniy ball qo‘ygan — topshiriq bali alohida qo‘shilmaydi">
                        <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                          {formatScore(d.task_score)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`${d.task_count} ta baholangan topshiriq`}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          +{formatScore(d.task_score)}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {formatScore(dayTotal(d))}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {data.unassigned_task_count > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: 'text.secondary' }}>
                    Darsi hali jurnalda yo'q mavzular bo'yicha topshiriqlar ({data.unassigned_task_count} ta)
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'success.main', fontWeight: 600 }}>
                    +{formatScore(data.unassigned_task_score)}
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {formatScore(data.unassigned_task_score)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Yuborgan topshiriqlarim
      </Typography>
      {submissions.length === 0 ? (
        <Alert severity="info">Hali topshiriq yubormagansiz.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Mavzu</TableCell>
                <TableCell>Yuborilgan</TableCell>
                <TableCell align="center">Holat</TableCell>
                <TableCell align="center">Ball</TableCell>
                <TableCell>O'qituvchi izohi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ whiteSpace: 'normal !important', minWidth: 180 }}>
                    <Link component={RouterLink} to={`/fan/${subjectId}/mavzu/${s.topic_id}`} underline="hover">
                      {s.topic_title}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(s.submitted_at)}</TableCell>
                  <TableCell align="center">
                    {s.status === 'graded' ? (
                      <Chip size="small" color="success" variant="outlined" label="Baholandi" />
                    ) : (
                      <Chip size="small" variant="outlined" label="Tekshirilmoqda" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {s.status === 'graded' ? (
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {formatScore(s.score ?? 0)}
                      </Typography>
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'normal !important', minWidth: 200, maxWidth: 400 }}>
                    {s.status === 'graded' && s.feedback.trim() ? (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {s.feedback}
                      </Typography>
                    ) : (
                      <Dash />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
