import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import LessonTypeChip from '../components/LessonTypeChip';
import ShareDialog from '../components/ShareDialog';
import type { SubjectWithTopics, TopicListItem } from '../types';

export default function AdminTopicsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<SubjectWithTopics | null>(null);
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState<TopicListItem | null>(null);

  const load = useCallback(() => {
    if (!subjectId) return;
    api
      .getSubject(Number(subjectId))
      .then((data) => {
        setSubject(data);
        setTopics(data.topics);
      })
      .catch((e: Error) => setError(e.message));
  }, [subjectId]);

  useEffect(load, [load]);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= topics.length) return;
    const next = [...topics];
    [next[index], next[target]] = [next[target], next[index]];
    setTopics(next);
    try {
      await api.reorderTopics(Number(subjectId), next.map((t) => t.id));
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  };

  const remove = async (topic: TopicListItem) => {
    if (!confirm(`"${topic.title}" mavzusi o'chiriladi. Davom etasizmi?`)) return;
    try {
      await api.deleteTopic(topic.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!subject) {
    return error ? <Alert severity="error">{error}</Alert> : null;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/admin" underline="hover" color="inherit" variant="body2">
          Fanlar
        </Link>
        <Typography variant="body2" color="text.primary">
          {subject.name}
        </Typography>
      </Breadcrumbs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{subject.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subject.code} · {topics.length} ta mavzu ·{' '}
            {topics.reduce((sum, t) => sum + t.hours, 0)} soat
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/admin/fan/${subject.id}/mavzu/yangi`)}
        >
          Mavzu qo'shish
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {topics.length === 0 ? (
        <Alert severity="info">Bu fanda hali mavzu yo'q.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}>№</TableCell>
                <TableCell width={70}>Hafta</TableCell>
                <TableCell>Mavzu</TableCell>
                <TableCell width={130}>Turi</TableCell>
                <TableCell width={60} align="center">Soat</TableCell>
                <TableCell width={240} align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topics.map((topic, index) => (
                <TableRow key={topic.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{topic.week ?? '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{topic.title}</Typography>
                    {topic.summary && (
                      <Typography variant="caption" color="text.secondary">
                        {topic.summary.slice(0, 90)}
                        {topic.summary.length > 90 ? '…' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <LessonTypeChip type={topic.lesson_type} />
                  </TableCell>
                  <TableCell align="center">{topic.hours}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Yuqoriga">
                      <span>
                        <IconButton size="small" disabled={index === 0} onClick={() => move(index, -1)}>
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Pastga">
                      <span>
                        <IconButton
                          size="small"
                          disabled={index === topics.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Ulashish havolasi">
                      <IconButton size="small" onClick={() => setSharing(topic)}>
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ko'rish">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/fan/${subject.id}/mavzu/${topic.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Tahrirlash">
                      <IconButton size="small" onClick={() => navigate(`/admin/mavzu/${topic.id}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O'chirish">
                      <IconButton size="small" color="error" onClick={() => remove(topic)}>
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
        scope="topic"
        targetId={sharing?.id ?? 0}
        targetTitle={sharing?.title ?? ''}
      />
    </Box>
  );
}
