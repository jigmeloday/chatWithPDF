import styles from './login.module.scss';

/* eslint-disable-next-line */
export interface LoginProps {}

export function Login(props: LoginProps): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Login!</h1>
    </div>
  );
}

export default Login;
