import styles from './typography.module.scss';

/* eslint-disable-next-line */
export interface TypographyProps {}

export function Typography(props: TypographyProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Typography!</h1>
    </div>
  );
}

export default Typography;
