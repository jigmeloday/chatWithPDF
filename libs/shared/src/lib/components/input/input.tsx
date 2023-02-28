import styles from './input.module.scss';

/* eslint-disable-next-line */
export interface InputProps {}

export function Input(props: InputProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Input!</h1>
    </div>
  );
}

export default Input;
