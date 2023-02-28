import { createTheme, PaletteMode, Theme } from '@mui/material';

export const theme = ( mode?: PaletteMode ): Theme => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: '#5fa800',
      light: 'rgba(95,168,0,0.6)',
      dark: '#287655',
    },
    success: {
      main: '#00C256',
      light: 'rgba(0, 178, 79, 0.12)',
      dark: '#488100'

    },
    error: {
      main: '#E74C3C',
      light: 'rgba(235, 3, 0, 0.08)',
      dark: '#EB0300'
    },
    warning: {
      main: '#F39C12',
      light: '#FDF1E2',
      dark: '#FF8E05'
    },
    black: {
      main: '#000000',
      light: 'rgba(0, 0, 0, 0.54)',
      dark: 'rgba(0, 0, 0, 0.87)',
      contrastText: 'rgba(0, 0, 0, 0.24)',
    },
    altoGray: {
      light: '#F3F4F8',
      main: '#F5F5F5',
      dark: '#F6F8FB',
      contrastText: '#979A9D',
    } ,
    white: {
      main: '#FFFFFF',
      dark: 'rgba(255,255,255,0.24)'
    },
  },

  typography: {
    fontFamily: 'Inter, sans-serif',

    body2: {
      fontSize: '0.875rem',
    }
  },

  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontWeight: '400',
        },
      },
    },
  },
});

declare module '@mui/material/styles' {
  interface Palette {
    altoGray: Palette['primary'];
  }

  interface PaletteOptions {
    altoGray?: PaletteOptions['primary'];
  }

  interface Palette {
    black: Palette['primary'];
  }

  interface PaletteOptions {
    black?: PaletteOptions['primary'];
  }

  interface Palette {
    white: Palette['primary'];
  }

  interface PaletteOptions {
    white?: PaletteOptions['primary'];
  }
}
