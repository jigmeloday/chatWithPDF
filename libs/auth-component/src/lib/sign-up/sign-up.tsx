import styles from './sign-up.module.scss';

/* eslint-disable-next-line */
export interface SignUpProps {}

export function SignUp(props: SignUpProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SignUp!</h1>
    </div>
  );
}

export default SignUp;
