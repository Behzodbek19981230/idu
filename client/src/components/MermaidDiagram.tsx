import { useEffect, useId, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useTheme } from '@mui/material/styles';

/** Mermaid kodini (flowchart, sequence va h.k.) grafik sxema ko'rinishida chiqaradi */
export default function MermaidDiagram({ code }: { code: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const id = 'mermaid-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const openFullscreen = () => {
    setZoom(1);
    setFullscreen(true);
  };

  useEffect(() => {
    let cancelled = false;
    // mermaid katta kutubxona — faqat kerak bo'lganda yuklanadi
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isDark ? 'dark' : 'default',
          fontFamily: theme.typography.fontFamily,
        });
        const { svg } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        // xato bo'lsa mermaid body'ga qoldirgan vaqtinchalik elementni tozalaymiz
        document.getElementById('d' + id)?.remove();
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [code, id, isDark, theme.typography.fontFamily]);

  if (error) {
    return (
      <Alert severity="warning" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
        Diagrammani chizib bo'lmadi: {error}
      </Alert>
    );
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          my: 2,
          p: 2,
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
          '& svg': { maxWidth: '100%', height: 'auto' },
          '&:hover .mermaid-fullscreen-btn': { opacity: 1 },
        }}
      >
        {svg ? (
          <>
            <Box
              onClick={openFullscreen}
              sx={{ cursor: 'zoom-in' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <Tooltip title="To'liq ekran">
              <IconButton
                className="mermaid-fullscreen-btn"
                size="small"
                onClick={openFullscreen}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: { xs: 1, md: 0.5 },
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <CircularProgress size={24} />
        )}
      </Paper>

      {svg && (
        <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
          <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar variant="dense">
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Diagramma
              </Typography>
              <Tooltip title="Kichiklashtirish">
                <span>
                  <IconButton onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} disabled={zoom <= 0.5}>
                    <ZoomOutIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography
                variant="body2"
                onClick={() => setZoom(1)}
                sx={{ minWidth: 48, textAlign: 'center', cursor: 'pointer' }}
              >
                {Math.round(zoom * 100)}%
              </Typography>
              <Tooltip title="Kattalashtirish">
                <span>
                  <IconButton onClick={() => setZoom((z) => Math.min(4, z + 0.25))} disabled={zoom >= 4}>
                    <ZoomInIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Yopish (Esc)">
                <IconButton edge="end" onClick={() => setFullscreen(false)} sx={{ ml: 1 }}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex' }}>
            {/* 100% da ekranga sig'adi, zoom bilan kattalashadi va scroll qilinadi */}
            <Box
              sx={{
                m: 'auto',
                width: `${zoom * 100}%`,
                height: `${zoom * 100}%`,
                flexShrink: 0,
                '& > svg': { width: '100%', height: '100%', maxWidth: 'none !important' },
              }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </Box>
        </Dialog>
      )}
    </>
  );
}
