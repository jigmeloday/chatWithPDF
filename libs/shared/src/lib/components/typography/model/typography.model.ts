import { SxProps, Theme } from '@mui/material';

export type TypoVariants = | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' |
  'caption' | 'button' | 'overline';

export type MatAlign = 'center' | 'inherit' | 'justify' | 'left' | 'right';

export interface TypographyProps{
  label: string | number | undefined | any;
  variant: TypoVariants;
  align?: MatAlign;
  className?: any;
  sx?: SxProps<Theme>;
  color?: string;
  fontWeight?: any;
  fontSize?: number;
  click?: () => void;
  id?: string;
  noWrap?: boolean;
}
