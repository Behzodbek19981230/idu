import AttachFileIcon from '@mui/icons-material/AttachFile';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import {
  Alert,
  Box,
  Breadcrumbs,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatScore } from '../components/JournalCells';
import StudentSubmissionsDialog, { type SubmissionsStudent } from '../components/StudentSubmissionsDialog';
import { formatDateTime, type Subject, type SubmissionWithContext } from '../types';

type StatusFilter = 'submitted' | 'graded' | 'all';

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('holat') as StatusFilter | null) ?? 'submitted';
  const subjectId = searchParams.get('fan') ? Number(searchParams.get('fan')) : undefined;

  const [rows, setRows] = useState<SubmissionWithContext[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<SubmissionsStudent | null>(null);

  useEffect(() => {
    api.listSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    api
      .listSubmissions({ status: status === 'all' ? undefined : status, subject_id: subjectId })
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, [status, subjectId]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/admin" underline="hover" color="inherit" variant="body2">
          Adminka
        </Link>
        <Typography variant="body2" color="text.primary">
          Topshiriqlar
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Topshiriqlar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-end' }}
        spacing={1.5}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs value={status} onChange={(_e, v: StatusFilter) => setParam('holat', v)}>
          <Tab value="submitted" label="Tekshirilmagan" />
          <Tab value="graded" label="Baholangan" />
          <Tab value="all" label="Barchasi" />
        </Tabs>
        <FormControl size="small" sx={{ minWidth: 240, mb: 1 }}>
          <InputLabel id="sub-subject">Fan</InputLabel>
          <Select
            labelId="sub-subject"
            label="Fan"
            value={subjectId ? String(subjectId) : ''}
            onChange={(e) => setParam('fan', e.target.value || null)}
          >
            <MenuItem value="">Barcha fanlar</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.code} — {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {rows.length === 0 ? (
        <Alert severity="info">
          {status === 'submitted' ? 'Tekshirilmagan topshiriq yo‘q.' : 'Topshiriq topilmadi.'}
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={16} />
                <TableCell>Talaba</TableCell>
                <TableCell>Fan / mavzu</TableCell>
                <TableCell width={150}>Yuborilgan</TableCell>
                <TableCell width={90} align="center">Mazmun</TableCell>
                <TableCell width={140} align="center">Holat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/topshiriqlar/${r.id}`)}
                >
                  <TableCell sx={{ pr: 0 }}>
                    {!r.seen_at && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} title="Yangi" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      color="inherit"
                      underline="hover"
                      fontWeight={r.seen_at ? 400 : 700}
                      title="Talabaning barcha topshiriqlari"
                      sx={{ display: 'block', textAlign: 'left' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudent({ id: r.student_id, first_name: r.first_name, last_name: r.last_name, course: r.course });
                      }}
                    >
                      {r.last_name} {r.first_name}
                    </Link>
                    <Typography variant="caption" color="text.secondary">
                      {r.course}-kurs
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="caption" color="text.secondary">
                      {r.subject_code}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {r.topic_title}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(r.submitted_at)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center" color="text.secondary">
                      {r.content.trim() &&
                        (r.content_kind === 'code' ? <CodeIcon fontSize="small" /> : <NotesIcon fontSize="small" />)}
                      {r.file_name && <AttachFileIcon fontSize="small" />}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {r.status === 'graded' ? (
                      <Chip size="small" color="success" label={`${formatScore(r.score ?? 0)} ball`} />
                    ) : (
                      <Chip size="small" variant="outlined" label="Tekshirilmagan" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <StudentSubmissionsDialog student={student} onClose={() => setStudent(null)} />
    </Box>
  );
}
