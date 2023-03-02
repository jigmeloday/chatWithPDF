import styles from './banner.module.scss';

export function Banner(): JSX.Element {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Banner!</h1>
    </div>
  );
}

export default Banner;
