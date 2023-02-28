import styles from './login.module.scss';
import { memo } from 'react';

/* eslint-disable-next-line */
export interface LoginProps {}

export function LoginComponent(props: LoginProps): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Login!</h1>
    </div>
  );
}

export default memo(LoginComponent);
