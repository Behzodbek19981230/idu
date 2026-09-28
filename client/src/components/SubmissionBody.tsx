import AttachFileIcon from '@mui/icons-material/AttachFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { api } from '../api/client';
import { formatFileSize, type Submission } from '../types';

/** Yuborilgan matn/kod va fayl (yuklab olish tugmasi bilan) */
export default function SubmissionBody({ submission }: { submission: Submission }) {
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isCode = submission.content_kind === 'code';

  const download = () => {
    setError('');
    api
      .downloadSubmissionFile(submission.id, submission.file_name ?? 'fayl')
      .catch((e: Error) => setError(e.message));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(submission.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Stack spacing={1.5}>
      {submission.content.trim() && (
        <Box sx={{ position: 'relative' }}>
          <Box
            component="pre"
            sx={(theme) => ({
              m: 0,
              p: 2,
              pr: 6,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              bgcolor: isCode ? alpha(theme.palette.text.primary, 0.04) : 'transparent',
              fontFamily: isCode ? '"JetBrains Mono", "Fira Code", Consolas, monospace' : 'inherit',
              fontSize: isCode ? 13 : 14.5,
              lineHeight: 1.6,
              whiteSpace: isCode ? 'pre' : 'pre-wrap',
              wordBreak: isCode ? 'normal' : 'break-word',
              overflowX: 'auto',
              maxHeight: 520,
            })}
          >
            {submission.content}
          </Box>
          <Tooltip title={copied ? 'Nusxa olindi' : 'Nusxa olish'}>
            <IconButton size="small" onClick={copy} sx={{ position: 'absolute', top: 6, right: 6 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {submission.file_name && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <AttachFileIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {submission.file_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(submission.file_size)}
          </Typography>
          <Button size="small" startIcon={<DownloadIcon />} onClick={download}>
            Yuklab olish
          </Button>
        </Stack>
      )}

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
