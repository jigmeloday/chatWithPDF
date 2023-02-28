import CoreRoute from './main/core-route/core-route';
import { PaletteMode, ThemeProvider } from '@mui/material';
import { AppWrapper } from './main/shared/style/shared.style';
import { Toaster } from 'react-hot-toast';
import { theme } from '../../../../libs/shared/src/lib/theme/theme';

export function App(): JSX.Element {
  return (
      <ThemeProvider theme={theme('light' as PaletteMode)} >
         <AppWrapper >
           <Toaster />
           <CoreRoute />
         </AppWrapper>
      </ThemeProvider>

    );
}

export default App;
