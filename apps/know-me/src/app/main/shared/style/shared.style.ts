import { Paper, styled } from '@mui/material';

export const AppWrapper = styled( Paper )(
  () => (
    {
      borderRadius: '0px',
      boxShadow: 'none',
      border: 'none'
    }
  )
);
