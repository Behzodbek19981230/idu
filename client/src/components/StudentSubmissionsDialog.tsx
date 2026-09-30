import AttachFileIcon from '@mui/icons-material/AttachFile';
import CodeIcon from '@mui/icons-material/Code';
import NotesIcon from '@mui/icons-material/Notes';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatDateTime, type SubmissionWithContext } from '../types';
import { formatScore } from './JournalCells';

export interface SubmissionsStudent {
  id: number;
  first_name: string;
  last_name: string;
  course: number;
}

interface Props {
  student: SubmissionsStudent | null;
  onClose: () => void;
  /** Hozir ochiq topshiriq — ro'yxatda belgilanadi */
  currentId?: number;
}

/** Talabaning barcha yuborgan topshiriqlari (admin). Qatorga bosilsa — topshiriq ochiladi */
export default function StudentSubmissionsDialog({ student, onClose, currentId }: Props) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SubmissionWithContext[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;
    setRows(null);
    setError('');
    api
      .listSubmissions({ student_id: student.id })
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, [student]);

  const graded = rows?.filter((r) => r.status === 'graded') ?? [];
  const totalScore = graded.reduce((sum, r) => sum + (r.score ?? 0), 0);

  return (
    <Dialog open={Boolean(student)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {student?.last_name} {student?.first_name}
        <Typography variant="body2" color="text.secondary">
          {student?.course}-kurs · yuborgan topshiriqlari
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : !rows ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : rows.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            Bu talaba hali topshiriq yubormagan.
          </Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fan / mavzu</TableCell>
                  <TableCell width={150}>Yuborilgan</TableCell>
                  <TableCell width={80} align="center">Mazmun</TableCell>
                  <TableCell width={130} align="center">Holat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    selected={r.id === currentId}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      onClose();
                      navigate(`/admin/topshiriqlar/${r.id}`);
                    }}
                  >
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="caption" color="text.secondary">
                        {r.subject_code}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {r.topic_title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.submitted_at)}</TableCell>
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
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {rows && rows.length > 0 &&
            `Jami: ${rows.length} ta · baholangan: ${graded.length} ta · ${formatScore(totalScore)} ball`}
        </Typography>
        <Button onClick={onClose}>Yopish</Button>
      </DialogActions>
    </Dialog>
  );
}
