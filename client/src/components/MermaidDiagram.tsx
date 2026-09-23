import { useEffect, useId, useState } from 'react';
import { Alert, Box, CircularProgress, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/** Mermaid kodini (flowchart, sequence va h.k.) grafik sxema ko'rinishida chiqaradi */
export default function MermaidDiagram({ code }: { code: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const id = 'mermaid-' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <Paper
      variant="outlined"
      sx={{
        my: 2,
        p: 2,
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
        '& svg': { maxWidth: '100%', height: 'auto' },
      }}
    >
      {svg ? (
        <Box dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <CircularProgress size={24} />
      )}
    </Paper>
  );
}
