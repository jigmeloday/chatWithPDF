import { InputProps } from './model/input.model';
import { CustomInput } from './style/input.style';

export function Input(props: InputProps): JSX.Element {
  return (
    <CustomInput
      fullWidth
      className={props?.className}
      id={props?.id}
      variant={props?.variant}
      placeholder={props?.placeholder}
      label={props?.label}
      InputProps={props?.InputProps}
      type={props.type}
      value={props.value}
      onChange={props.onChange}
    />
  );
}

export default Input;
