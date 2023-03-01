import { Button, styled } from '@mui/material';

export const CustomButton = styled(Button)(
  ({ theme, ...props }) => `
  &.button--icon {
    &.MuiButtonBase-root {
      padding: 0;
      min-width: 0;
    }
   }
   &.button--white {
      border: 1px solid ${theme.palette.white.main};
      color: ${theme.palette.white.main};
   }
   &.button-contain--white {
      background-color: ${theme.palette.white.main};
      color: ${theme.palette.primary.main};
   }
  `
);
