import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { buildTheme } from '../theme';

type Mode = 'light' | 'dark';
const STORAGE_KEY = 'idu_color_mode';

interface ColorModeState {
  mode: Mode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeState | null>(null);

function readStored(): Mode | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [stored, setStored] = useState<Mode | null>(() => readStored());

  // Foydalanuvchi tanlamagan bo'lsa — tizim sozlamasiga ergashadi
  const mode: Mode = stored ?? (prefersDark ? 'dark' : 'light');

  const toggle = useCallback(() => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setStored(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage mavjud bo'lmasa — sessiya davomida ishlayveradi */
    }
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorMode(): ColorModeState {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode faqat ColorModeProvider ichida ishlaydi');
  return ctx;
}
