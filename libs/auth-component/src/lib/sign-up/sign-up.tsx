import styles from './sign-up.module.scss';
import { memo } from 'react';

export function SignUp(): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SignUp!</h1>
    </div>
  );
}

export default memo(SignUp);
