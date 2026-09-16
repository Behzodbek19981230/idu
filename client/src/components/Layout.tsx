import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink, matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 300;

/** URL dan joriy fan va mavzu id sini ajratib oladi */
function useCurrentIds() {
  const { pathname } = useLocation();
  const topicMatch = matchPath('/fan/:subjectId/mavzu/:topicId', pathname);
  const subjectMatch =
    matchPath('/fan/:subjectId/*', pathname) ?? matchPath('/fan/:subjectId', pathname);
  const adminMatch =
    matchPath('/admin/fan/:subjectId/*', pathname) ?? matchPath('/admin/fan/:subjectId', pathname);
  const params = subjectMatch?.params.subjectId ?? adminMatch?.params.subjectId;
  return {
    subjectId: params ? Number(params) : null,
    topicId: topicMatch?.params.topicId ? Number(topicMatch.params.topicId) : null,
  };
}

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { subjectId, topicId } = useCurrentIds();
  const { isAdmin, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const navigate = useNavigate();

  const sidebar = (
    <Sidebar
      subjectId={subjectId}
      topicId={topicId}
      onNavigate={() => !isDesktop && setMobileOpen(false)}
    />
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
          bgcolor: alpha(theme.palette.background.paper, 0.82),
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          displayPrint: 'none',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="subtitle1"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}
          >
            O'quv jarayoni platformasi
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={mode === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}>
              <IconButton onClick={toggle} size="small">
                {mode === 'dark' ? (
                  <LightModeOutlinedIcon fontSize="small" />
                ) : (
                  <DarkModeOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Adminka tugmasi faqat tizimga kirgan admin uchun ko'rinadi.
                Mehmon /admin manzilini o'zi yozsa — login sahifasiga yo'naltiriladi. */}
            {isAdmin && (
              <>
                <Button
                  size="small"
                  startIcon={<SettingsOutlinedIcon />}
                  component={RouterLink}
                  to="/admin"
                >
                  Adminka
                </Button>
                <Tooltip title="Chiqish">
                  <IconButton
                    size="small"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 }, displayPrint: 'none' }}
      >
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
        <Outlet />
      </Box>
    </Box>
  );
}
