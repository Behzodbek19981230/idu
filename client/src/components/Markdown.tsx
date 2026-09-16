import {
  Box,
  Divider,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Markdown matnini MUI komponentlari bilan ko'rsatadi (light/dark rejimga moslashadi) */
export default function Markdown({ children }: { children: string }) {
  return (
    <Box
      sx={{
        '& > *:first-of-type': { mt: 0 },
        '& img': { maxWidth: '100%', borderRadius: 1 },
        '& strong': { fontWeight: 600 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Typography variant="h5" sx={{ mt: 4, mb: 1.5 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              variant="h6"
              sx={{
                mt: 4,
                mb: 1.5,
                pb: 0.75,
                color: 'primary.main',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.8 }}>
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 3, mb: 2, '& li': { mb: 0.75, lineHeight: 1.75 } }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 3, mb: 2, '& li': { mb: 0.75, lineHeight: 1.75 } }}>
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              sx={(theme) => ({
                borderLeft: 4,
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.07),
                px: 2,
                py: 1,
                my: 2,
                borderRadius: '0 8px 8px 0',
                '& p:last-child': { mb: 0 },
              })}
            >
              {children}
            </Box>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className?.startsWith('language-'));
            if (!isBlock) {
              return (
                <Box
                  component="code"
                  sx={(theme) => ({
                    bgcolor: alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.18 : 0.1,
                    ),
                    color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.75,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.86em',
                  })}
                >
                  {children}
                </Box>
              );
            }
            return (
              <Paper
                component="pre"
                variant="outlined"
                sx={(theme) => ({
                  bgcolor: theme.palette.mode === 'dark' ? '#0b0e13' : '#1c2128',
                  color: '#e6edf3',
                  borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent',
                  p: 2,
                  my: 2,
                  overflowX: 'auto',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.86rem',
                  lineHeight: 1.65,
                })}
              >
                <code>{children}</code>
              </Paper>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
              <Table size="small">{children}</Table>
            </TableContainer>
          ),
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => <TableCell>{children}</TableCell>,
          td: ({ children }) => <TableCell>{children}</TableCell>,
          a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          hr: () => <Divider sx={{ my: 3 }} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
