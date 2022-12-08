import { useSelector } from 'react-redux';
import CoreRoute from './main/core-route/core-route';
import { PaletteMode, ThemeProvider } from '@mui/material';
import { theme }  from '../assets/theme/theme';
import { AppWrapper } from './main/shared/style/shared.style';
import { selectCurrentTheme } from '@know-me/shared';
import { Toaster } from 'react-hot-toast';

export function App(): JSX.Element {
  const currentTheme = useSelector(selectCurrentTheme);
  return (
      <ThemeProvider theme={theme(currentTheme as PaletteMode)} >
         <AppWrapper >
           <Toaster />
           <CoreRoute />
         </AppWrapper>
      </ThemeProvider>

    );
}

export default App;
