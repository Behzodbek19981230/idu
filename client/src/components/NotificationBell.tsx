import AttachFileIcon from '@mui/icons-material/AttachFile';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatDateTime, type SubmissionNotification } from '../types';

const POLL_MS = 30_000;

/** O'qituvchi uchun: yangi (hali ochilmagan) topshiriqlar */
export default function NotificationBell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<SubmissionNotification[]>([]);

  const refresh = useCallback(() => {
    api
      .getNotifications()
      .then((data) => {
        setUnread(data.unread);
        setItems(data.items);
      })
      .catch(() => undefined);
  }, []);

  // Sahifa almashganda (masalan, topshiriq ochilgach) va har 30 soniyada yangilanadi
  useEffect(refresh, [refresh, pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  const open = (path: string) => {
    setAnchor(null);
    navigate(path);
  };

  const readAll = async () => {
    await api.readAllNotifications().catch(() => undefined);
    refresh();
  };

  return (
    <>
      <Tooltip title="Yangi topshiriqlar">
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchor(e.currentTarget);
            refresh();
          }}
        >
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">Yangi topshiriqlar</Typography>
          {unread > 0 && (
            <Button size="small" onClick={readAll}>
              Hammasi ko'rildi
            </Button>
          )}
        </Stack>
        <Divider />

        {items.length === 0 && (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Yangi topshiriq yo'q
            </Typography>
          </Box>
        )}

        {items.map((n) => (
          <MenuItem key={n.id} onClick={() => open(`/admin/topshiriqlar/${n.id}`)} sx={{ alignItems: 'flex-start', py: 1.25 }}>
            <Box
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.9, mr: 1.5, flexShrink: 0 }}
            />
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={600} noWrap>
                  {n.last_name} {n.first_name}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    · {n.course}-kurs
                  </Typography>
                </Typography>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', whiteSpace: 'normal' }}>
                    {n.subject_code} · {n.topic_title}
                  </Typography>
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {formatDateTime(n.submitted_at)}
                    {n.file_name && <AttachFileIcon sx={{ fontSize: 14 }} />}
                  </Typography>
                </>
              }
            />
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={() => open('/admin/topshiriqlar')} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            Barcha topshiriqlar
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
