import styles from './forgot-password.module.scss';

/* eslint-disable-next-line */
export interface ForgotPasswordProps {}

export function ForgotPassword(props: ForgotPasswordProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ForgotPassword!</h1>
    </div>
  );
}

export default ForgotPassword;
