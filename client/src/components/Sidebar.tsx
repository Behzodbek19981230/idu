import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SchoolIcon from '@mui/icons-material/School';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { lessonTypeColor, lessonTypeLabel, type Subject, type TopicListItem } from '../types';

interface SidebarProps {
  subjectId: number | null;
  topicId: number | null;
  onNavigate?: () => void;
}

export default function Sidebar({ subjectId, topicId, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    setLoading(true);
    api
      .listTopics(subjectId)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const totalHours = topics.reduce((sum, t) => sum + t.hours, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={() => go('/')}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <SchoolIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
              Ish reja
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dars qo'llanmalari
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
      <Divider />

      <Box sx={{ p: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="fan-select">Fan</InputLabel>
          <Select
            labelId="fan-select"
            label="Fan"
            value={subjects.some((s) => s.id === subjectId) ? String(subjectId) : ''}
            onChange={(e) => go(`/fan/${e.target.value}`)}
          >
            {subjects.length === 0 && (
              <MenuItem value="" disabled>
                Fan qo'shilmagan
              </MenuItem>
            )}
            {subjects.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.code} — {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {subjectId && (
        <>
          <Divider />
          <List dense disablePadding sx={{ px: 1, py: 0.5 }}>
            <ListItemButton
              selected={!topicId}
              onClick={() => go(`/fan/${subjectId}`)}
              sx={{ borderRadius: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <TableChartOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Ish reja (jadval)"
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          </List>
          <Divider />
          {topics.length > 0 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}
            >
              <Typography variant="overline" color="text.secondary" lineHeight={1}>
                Mavzular
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topics.length} ta · {totalHours} soat
              </Typography>
            </Stack>
          )}
        </>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        )}

        {!loading && subjectId && topics.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Bu fanda hali mavzu yo'q. Adminka orqali qo'shing.
          </Typography>
        )}

        {!loading && !subjectId && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Yuqoridan fanni tanlang.
          </Typography>
        )}

        <List dense disablePadding>
          {topics.map((topic, index) => {
            const color = lessonTypeColor(topic.lesson_type, theme.palette.mode);
            const active = topic.id === topicId;
            return (
              <ListItemButton
                key={topic.id}
                selected={active}
                onClick={() => go(`/fan/${topic.subject_id}/mavzu/${topic.id}`)}
                sx={{
                  alignItems: 'flex-start',
                  borderRadius: 1.5,
                  mb: 0.25,
                  borderLeft: 3,
                  borderColor: active ? color : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.4 }}>
                  <ArticleOutlinedIcon fontSize="small" sx={{ color }} />
                </ListItemIcon>
                <ListItemText
                  primary={`${index + 1}. ${topic.title}`}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    lineHeight: 1.35,
                    fontWeight: active ? 600 : 400,
                  }}
                  secondary={
                    <Box
                      component="span"
                      sx={{ display: 'flex', gap: 0.5, mt: 0.6, flexWrap: 'wrap' }}
                    >
                      {topic.week != null && (
                        <Chip
                          component="span"
                          label={`${topic.week}-hafta`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 19, fontSize: 10.5 }}
                        />
                      )}
                      <Chip
                        component="span"
                        label={lessonTypeLabel(topic.lesson_type)}
                        size="small"
                        sx={{
                          height: 19,
                          fontSize: 10.5,
                          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.12),
                          color,
                        }}
                      />
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'span' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
