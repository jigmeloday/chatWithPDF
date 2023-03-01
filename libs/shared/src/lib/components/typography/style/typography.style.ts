import { styled, Typography } from '@mui/material';

export const CustomTypography = styled(Typography)(
  ({ theme, ...props }) => `
    color: ${props.color || theme.palette.black.dark}
    fontSize: ${props.fontSize || theme.typography.htmlFontSize}
    fontWeight: ${props.fontWeight || theme.typography.fontWeightRegular}

  `
);
