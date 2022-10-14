import styles from './auth-component.module.scss';

/* eslint-disable-next-line */
export interface AuthComponentProps {}

export function AuthComponent():JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to AuthComponent!</h1>
    </div>
  );
}

export default AuthComponent;
