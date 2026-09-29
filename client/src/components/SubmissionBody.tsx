import AttachFileIcon from '@mui/icons-material/AttachFile';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { api } from '../api/client';
import { formatFileSize, type Submission } from '../types';
import CodeRunner, { detectLang } from './CodeRunner';

/** Brauzerda ochib, ishga tushirsa bo'ladigan fayllar */
const RUNNABLE_EXT = /\.(html?|m?js|css|txt)$/i;
const MAX_RUNNABLE_BYTES = 1024 * 1024;

const canOpenFile = (s: Submission) =>
  Boolean(s.file_name && RUNNABLE_EXT.test(s.file_name) && (s.file_size ?? 0) <= MAX_RUNNABLE_BYTES);

interface Props {
  submission: Submission;
  /** Berilsa — tahrirlangan kodni saqlash mumkin; saqlangan topshiriq shu orqali qaytadi */
  onSaved?: (submission: Submission) => void;
}

/** Yuborilgan matn/kod va fayl (yuklab olish; kod va .html/.js fayllarni tahrirlab ishga tushirish) */
export default function SubmissionBody({ submission, onSaved }: Props) {
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileCode, setFileCode] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const isCode = submission.content_kind === 'code';

  const openFile = () => {
    setError('');
    setOpening(true);
    api
      .getSubmissionFileText(submission.id)
      .then(setFileCode)
      .catch((e: Error) => setError(e.message))
      .finally(() => setOpening(false));
  };

  const saveCode = (target: 'content' | 'file') =>
    onSaved
      ? async (code: string) => {
          const updated = await api.saveSubmissionCode(submission.id, target, code);
          if (target === 'file') setFileCode(code);
          onSaved(updated);
        }
      : undefined;

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
      {isCode && submission.content.trim() && <CodeRunner code={submission.content} onSave={saveCode('content')} />}

      {!isCode && submission.content.trim() && (
        <Box sx={{ position: 'relative' }}>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              pr: 6,
              borderRadius: 1.5,
              border: 1,
              borderColor: 'divider',
              fontFamily: 'inherit',
              fontSize: 14.5,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowX: 'auto',
              maxHeight: 520,
            }}
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
          {canOpenFile(submission) && fileCode === null && (
            <Button size="small" startIcon={<CodeIcon />} onClick={openFile} disabled={opening}>
              {opening ? 'Ochilmoqda…' : 'Kodni ochish'}
            </Button>
          )}
        </Stack>
      )}

      {fileCode !== null && (
        <CodeRunner
          code={fileCode}
          defaultLang={detectLang(fileCode, submission.file_name)}
          onSave={saveCode('file')}
        />
      )}

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
