import styles from './card.module.scss';
import { Card, Grid } from '@mui/material';

/* eslint-disable-next-line */
export interface CardProps {
  children: any
}

export function CustomCard(props: CardProps): JSX.Element {
  return (
    <Card>
      {props?.children}
    </Card>
  );
}

export default CustomCard;
