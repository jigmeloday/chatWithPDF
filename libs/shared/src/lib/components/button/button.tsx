import styles from './button.module.scss';
import { ButtonProps } from './model/button.model';
import { CustomButton } from './style/button.style';
import { SxProps, Theme } from '@mui/material';

export function Button(props: ButtonProps): JSX.Element {
  return (
    <CustomButton
      color={props?.color}
      variant={props?.variant}
      onClick={props?.click}
      disabled={props?.disabled}
      className={props?.className}
      sx={props.sx as SxProps<Theme>}
      startIcon={props.startIcon}
      endIcon={props.endIcon}
      type={props?.type}
      id={props?.id}
    >
      {props?.label}
      {props?.child}
    </CustomButton>
  );
}

export default Button;
