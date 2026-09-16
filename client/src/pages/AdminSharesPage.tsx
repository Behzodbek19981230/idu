import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { shareUrl, type Share } from '../types';

/** Barcha ulashish havolalari: bekor qilish, nusxalash, o'chirish */
export default function AdminSharesPage() {
  const [shares, setShares] = useState<Share[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => {
    api.listShares().then(setShares).catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

  const toggle = async (share: Share, active: boolean) => {
    try {
      await api.updateShare(share.id, { is_active: active });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (share: Share) => {
    if (!confirm("Havola o'chiriladi va ishlamay qoladi. Davom etasizmi?")) return;
    try {
      await api.deleteShare(share.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copy = async (share: Share) => {
    try {
      await navigator.clipboard.writeText(shareUrl(share.token));
      setCopied(true);
    } catch {
      setError("Nusxalab bo'lmadi");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ulashish havolalari
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Har bir havola faqat o'ziga biriktirilgan fan yoki mavzuni ochadi.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {shares.length === 0 ? (
        <Alert severity="info">
          Hali havola yaratilmagan. Fan yoki mavzu qatoridagi "ulashish" belgisini bosing.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={110}>Turi</TableCell>
                <TableCell>Nima ulashilgan</TableCell>
                <TableCell width={90} align="center">
                  Ochilgan
                </TableCell>
                <TableCell width={90} align="center">
                  Faol
                </TableCell>
                <TableCell width={110} align="right">
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shares.map((share) => (
                <TableRow key={share.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={share.scope === 'subject' ? 'Fan' : 'Mavzu'}
                      color={share.scope === 'subject' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {share.scope === 'subject' ? share.subject_name : share.topic_title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {share.scope === 'topic' ? `${share.subject_name} · ` : ''}
                        /s/{share.token}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">{share.view_count}</TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={share.is_active}
                      onChange={(e) => toggle(share, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Nusxalash">
                      <IconButton size="small" onClick={() => copy(share)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ochish">
                      <IconButton
                        size="small"
                        component="a"
                        href={shareUrl(share.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O'chirish">
                      <IconButton size="small" color="error" onClick={() => remove(share)}>
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

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Havola nusxalandi"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
