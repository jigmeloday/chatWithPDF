import { OutlinedInputProps } from '@mui/material';

export type MatInputVariants = 'filled' | 'outlined' | 'standard';

export interface InputProps {
  InputProps?: Partial<OutlinedInputProps>;
  label?: string;
  placeholder?: string;
  variant?: MatInputVariants;
  id?: string;
  className?: string;
  type?: string;
  value?: string;
  onChange?: any;
}
