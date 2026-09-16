import { alpha, createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

const light = {
  primary: { main: '#1565c0', light: '#e3f0fc' },
  secondary: { main: '#2e7d32' },
  background: { default: '#f4f6f9', paper: '#ffffff' },
  divider: '#e3e7ed',
  text: { primary: '#101418', secondary: '#5a6472' },
};

const dark = {
  primary: { main: '#7cb6f5', light: '#1b2c44' },
  secondary: { main: '#7cc47f' },
  background: { default: '#0e1116', paper: '#161a21' },
  divider: '#252b35',
  text: { primary: '#e7ebf0', secondary: '#9aa4b2' },
};

export function buildTheme(mode: PaletteMode): Theme {
  const palette = mode === 'dark' ? dark : light;

  return createTheme({
    palette: { mode, ...palette },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', sans-serif",
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      button: { fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: palette.divider,
            borderRadius: 8,
          },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } },
      },
      MuiAppBar: { defaultProps: { elevation: 0, color: 'default' } },
      MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, mode === 'dark' ? 0.16 : 0.09),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, mode === 'dark' ? 0.22 : 0.13),
              },
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            fontWeight: 600,
            backgroundColor: theme.palette.mode === 'dark' ? '#1c212a' : '#f7f9fc',
          }),
        },
      },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}

/** Jadval/blok fonlari uchun ikkala rejimda ham mos yumshoq fon */
export function softBg(theme: Theme, intensity = 0.04): string {
  return theme.palette.mode === 'dark'
    ? alpha('#ffffff', intensity)
    : alpha('#0b1b33', intensity);
}
