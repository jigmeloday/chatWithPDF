import styles from './auth.module.scss';

/* eslint-disable-next-line */
export interface AuthProps {}

export function Auth(props: AuthProps): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Auth!</h1>
    </div>
  );
}

export default Auth;
