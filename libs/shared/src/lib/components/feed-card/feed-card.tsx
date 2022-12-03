import styles from './feed-card.module.scss';

/* eslint-disable-next-line */
export interface FeedCardProps {}

export function FeedCard(props: FeedCardProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to FeedCard!</h1>
    </div>
  );
}

export default FeedCard;
