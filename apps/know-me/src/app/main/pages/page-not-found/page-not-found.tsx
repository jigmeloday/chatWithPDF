import styles from './page-not-found.module.scss';

/* eslint-disable-next-line */
export interface PageNotFoundProps {}

export function PageNotFound(props: PageNotFoundProps): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to PageNotFound!</h1>
    </div>
  );
}

export default PageNotFound;
