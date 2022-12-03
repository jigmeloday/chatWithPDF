import styles from './checkbox.module.scss';

/* eslint-disable-next-line */
export interface CheckboxProps {}

export function Checkbox(props: CheckboxProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Checkbox!</h1>
    </div>
  );
}

export default Checkbox;
