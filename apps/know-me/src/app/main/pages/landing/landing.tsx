import styles from './landing.module.scss';

/* eslint-disable-next-line */
export interface LandingProps {}

export function Landing(props: LandingProps):JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Landing!</h1>
    </div>
  );
}

export default Landing;
