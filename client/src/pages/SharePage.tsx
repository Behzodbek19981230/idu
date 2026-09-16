import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import LessonView from '../components/LessonView';
import PlanTable from '../components/PlanTable';
import { useColorMode } from '../context/ColorModeContext';
import { lessonTypeColor, type SharePayload, type Topic } from '../types';

const DRAWER_WIDTH = 300;

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

/**
 * Ulashilgan material sahifasi. Faqat havolaga biriktirilgan obyekt ko'rsatiladi:
 * mavzu ulashilgan bo'lsa — boshqa mavzular, fan ulashilgan bo'lsa — boshqa fanlar
 * ko'rinmaydi va bu yerdan asosiy katalogga o'tish yo'li yo'q.
 */
export default function SharePage() {
  const { token, topicId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, toggle } = useColorMode();

  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    api
      .getShared(token)
      .then(setPayload)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !topicId) {
      setTopic(null);
      return;
    }
    window.scrollTo({ top: 0 });
    api
      .getSharedTopic(token, Number(topicId))
      .then(setTopic)
      .catch((e: Error) => setError(e.message));
  }, [token, topicId]);

  const themeButton = (
    <Tooltip title={mode === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}>
      <IconButton onClick={toggle} size="small">
        {mode === 'dark' ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );

  const printButton = (
    <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
      Chop etish
    </Button>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !payload) {
    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Havola noto'g'ri, o'chirilgan yoki muddati tugagan bo'lishi mumkin. O'qituvchingizdan
          yangi havola so'rang.
        </Typography>
      </Box>
    );
  }

  if (!payload) return null;

  // ─── Faqat bitta mavzu ulashilgan: yon panel umuman yo'q ───
  if (payload.scope === 'topic') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="sticky"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            backdropFilter: 'blur(10px)',
            borderBottom: 1,
            borderColor: 'divider',
            displayPrint: 'none',
          }}
        >
          <Toolbar>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1.5 }}>
              <ArticleOutlinedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {payload.topic.subject_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ulashilgan dars qo'llanmasi
              </Typography>
            </Box>
            {themeButton}
          </Toolbar>
        </AppBar>

        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
          <LessonView topic={payload.topic} actions={printButton} />
        </Box>
      </Box>
    );
  }

  // ─── Fan ulashilgan: faqat shu fanning mavzulari ───
  const { subject, topics } = payload;
  const index = topic ? topics.findIndex((t) => t.id === topic.id) : -1;
  const prev = index > 0 ? topics[index - 1] : null;
  const next = index >= 0 && index < topics.length - 1 ? topics[index + 1] : null;
  const totalHours = topics.reduce((sum, t) => sum + t.hours, 0);

  const go = (path: string) => {
    navigate(path);
    if (!isDesktop) setMobileOpen(false);
  };

  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <SchoolIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} noWrap>
              {subject.code}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ulashilgan fan
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
      <Divider />

      <List dense disablePadding sx={{ px: 1, py: 0.5 }}>
        <ListItemButton
          selected={!topicId}
          onClick={() => go(`/s/${token}`)}
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

      <Stack direction="row" justifyContent="space-between" sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
        <Typography variant="overline" color="text.secondary" lineHeight={1}>
          Mavzular
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {topics.length} ta · {totalHours} soat
        </Typography>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        <List dense disablePadding>
          {topics.map((item, i) => {
            const color = lessonTypeColor(item.lesson_type, theme.palette.mode);
            const active = item.id === Number(topicId);
            return (
              <ListItemButton
                key={item.id}
                selected={active}
                onClick={() => go(`/s/${token}/mavzu/${item.id}`)}
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
                  primary={`${i + 1}. ${item.title}`}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    lineHeight: 1.35,
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    borderRight: 1,
    borderColor: 'divider',
    bgcolor: 'background.paper',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          displayPrint: 'none',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
            {subject.name}
          </Typography>
          {themeButton}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 }, displayPrint: 'none' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': drawerPaperSx }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': drawerPaperSx }}
        >
          {sidebar}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Toolbar sx={{ displayPrint: 'none' }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {topicId && topic ? (
          <LessonView
            topic={topic}
            actions={printButton}
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
                    onClick={() => prev && navigate(`/s/${token}/mavzu/${prev.id}`)}
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
                    onClick={() => next && navigate(`/s/${token}/mavzu/${next.id}`)}
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
              </>
            }
          />
        ) : (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label={subject.code} size="small" color="primary" variant="outlined" />
              {subject.semester != null && (
                <Chip label={`${subject.semester}-semestr`} size="small" variant="outlined" />
              )}
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Typography variant="h4" gutterBottom>
                {subject.name}
              </Typography>
              <Box sx={{ flexShrink: 0, displayPrint: 'none' }}>{printButton}</Box>
            </Stack>

            {subject.description && (
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 900, lineHeight: 1.7 }}>
                {subject.description}
              </Typography>
            )}

            <Grid container spacing={1.5} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Stat label="Mavzular" value={topics.length} />
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
            {topics.length === 0 ? (
              <Alert severity="info">Bu fanda hali mavzu qo'shilmagan.</Alert>
            ) : (
              <PlanTable topics={topics} onSelect={(t) => go(`/s/${token}/mavzu/${t.id}`)} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
