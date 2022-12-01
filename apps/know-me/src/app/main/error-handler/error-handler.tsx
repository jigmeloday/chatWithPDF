import styles from './error-handler.module.scss';

/* eslint-disable-next-line */
export interface ErrorHandlerProps {}

export function ErrorHandler(props: ErrorHandlerProps): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ErrorHandler!</h1>
    </div>
  );
}

export default ErrorHandler;
