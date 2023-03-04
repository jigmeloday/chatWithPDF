import { SxProps, Theme } from '@mui/material';

export type MatColors = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
export type MatVariants = 'text' | 'outlined' | 'contained';

export interface ButtonProps {
  label?: string;
  sx?: SxProps<Theme>;
  child?: JSX.Element;
  color?: MatColors;
  variant?: MatVariants;
  disabled?: boolean;
  click?: () => void;
  className?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  type?: 'submit' | 'reset' | 'button';
  id?: string;
}
