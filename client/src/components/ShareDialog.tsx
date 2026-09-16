import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { shareUrl, type Share, type ShareScope } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  scope: ShareScope;
  targetId: number;
  targetTitle: string;
}

/** Fan yoki mavzu uchun ommaviy havola yaratish/boshqarish oynasi */
export default function ShareDialog({ open, onClose, scope, targetId, targetTitle }: Props) {
  const [share, setShare] = useState<Share | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setShare(null);
      setError('');
      setCopied(false);
      return;
    }
    setLoading(true);
    api
      .createShare(
        scope === 'subject'
          ? { scope: 'subject', subject_id: targetId }
          : { scope: 'topic', topic_id: targetId },
      )
      .then(setShare)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, scope, targetId]);

  const url = share ? shareUrl(share.token) : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Nusxalab bo‘lmadi — havolani qo‘lda belgilab oling');
    }
  };

  const toggleActive = async (active: boolean) => {
    if (!share) return;
    try {
      setShare(await api.updateShare(share.id, { is_active: active }));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async () => {
    if (!share) return;
    if (!confirm('Havola butunlay o‘chiriladi va ishlamay qoladi. Davom etasizmi?')) return;
    try {
      await api.deleteShare(share.id);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <ShareIcon color="primary" fontSize="small" />
          <span>{scope === 'subject' ? 'Fanni ulashish' : 'Mavzuni ulashish'}</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>{targetTitle}</strong>
          {scope === 'subject'
            ? " — havola orqali faqat shu fan va uning mavzulari ko'rinadi, boshqa fanlar ko'rinmaydi."
            : " — havola orqali faqat shu mavzu ko'rinadi, boshqa mavzular ko'rinmaydi."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {share && (
          <>
            <TextField
              fullWidth
              size="small"
              label="Student uchun havola"
              value={url}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copied ? 'Nusxalandi' : 'Nusxalash'}>
                      <IconButton onClick={copy} edge="end" size="small">
                        <ContentCopyIcon fontSize="small" color={copied ? 'success' : 'inherit'} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Yangi oynada ochish">
                      <IconButton
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        edge="end"
                        size="small"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              onFocus={(e) => e.target.select()}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={share.is_active}
                    onChange={(e) => toggleActive(e.target.checked)}
                    size="small"
                  />
                }
                label={share.is_active ? 'Havola faol' : 'Faolsizlantirilgan'}
              />
              <Typography variant="caption" color="text.secondary">
                {share.view_count} marta ochilgan
              </Typography>
            </Stack>

            {!share.is_active && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Hozir havola ochilmaydi. Studentlar uchun qayta yoqing.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={remove}
          disabled={!share}
          sx={{ mr: 'auto' }}
        >
          O'chirish
        </Button>
        <Button onClick={onClose}>Yopish</Button>
      </DialogActions>
    </Dialog>
  );
}
