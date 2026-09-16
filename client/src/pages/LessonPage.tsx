import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import LessonView from '../components/LessonView';
import ShareDialog from '../components/ShareDialog';
import { useAuth } from '../context/AuthContext';
import type { Topic, TopicListItem } from '../types';

export default function LessonPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [siblings, setSiblings] = useState<TopicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    setError('');
    window.scrollTo({ top: 0 });
    api
      .getTopic(Number(topicId))
      .then(setTopic)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(() => {
    if (!subjectId) return;
    api.listTopics(Number(subjectId)).then(setSiblings).catch(() => setSiblings([]));
  }, [subjectId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!topic) return null;

  const index = siblings.findIndex((t) => t.id === topic.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  return (
    <LessonView
      topic={topic}
      header={
        <Breadcrumbs sx={{ mb: 1.5, displayPrint: 'none' }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" variant="body2">
            Fanlar
          </Link>
          <Link
            component={RouterLink}
            to={`/fan/${topic.subject_id}`}
            underline="hover"
            color="inherit"
            variant="body2"
          >
            {topic.subject_name ?? 'Fan'}
          </Link>
          <Typography variant="body2" color="text.primary">
            {index >= 0 ? `${index + 1}-mavzu` : 'Mavzu'}
          </Typography>
        </Breadcrumbs>
      }
      actions={
        <>
          {isAdmin && (
            <>
              <Button
                size="small"
                startIcon={<ShareIcon />}
                variant="contained"
                onClick={() => setShareOpen(true)}
              >
                Ulashish
              </Button>
              <Button
                size="small"
                startIcon={<EditIcon />}
                variant="outlined"
                component={RouterLink}
                to={`/admin/mavzu/${topic.id}`}
              >
                Tahrirlash
              </Button>
            </>
          )}
          <Button
            size="small"
            startIcon={<PrintIcon />}
            variant="outlined"
            onClick={() => window.print()}
          >
            Chop etish
          </Button>
        </>
      }
      footer={
        <>
          <Divider sx={{ my: 3 }} />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ displayPrint: 'none', mb: 2 }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              disabled={!prev}
              onClick={() => prev && navigate(`/fan/${subjectId}/mavzu/${prev.id}`)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.25 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Oldingi
                </Typography>
                <Typography variant="body2" noWrap>
                  {prev ? prev.title : 'Yo‘q'}
                </Typography>
              </Box>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              disabled={!next}
              onClick={() => next && navigate(`/fan/${subjectId}/mavzu/${next.id}`)}
              sx={{ justifyContent: 'flex-end', textAlign: 'right', py: 1.25 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Keyingi
                </Typography>
                <Typography variant="body2" noWrap>
                  {next ? next.title : 'Yo‘q'}
                </Typography>
              </Box>
            </Button>
          </Stack>

          <ShareDialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            scope="topic"
            targetId={topic.id}
            targetTitle={topic.title}
          />
        </>
      }
    />
  );
}
