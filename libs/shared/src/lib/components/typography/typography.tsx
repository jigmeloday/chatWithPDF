import { CustomTypography } from './style/typography.style';
import { TypographyProps } from './model/typography.model';


export function Typography( props: TypographyProps ): JSX.Element {
  return (
    <CustomTypography
      variant={ props.variant }
      align={ props.align }
      className={ props.className }
      sx={ props.sx }
      color={ props.color }
      fontWeight={ props.fontWeight }
      fontSize={ props.fontSize }
      onClick={ props.click }
      id={ props?.id } noWrap={ props?.noWrap }
    >
      {props?.label}
    </CustomTypography>
  );
}

export default Typography;
