import styles from './landing.module.scss';

export function Home():JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Landing!</h1>
    </div>
  );
}

export default Home;
