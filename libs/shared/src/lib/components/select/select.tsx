import styles from './select.module.scss';

/* eslint-disable-next-line */
export interface SelectProps {}

export function Select(props: SelectProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Select!</h1>
    </div>
  );
}

export default Select;
