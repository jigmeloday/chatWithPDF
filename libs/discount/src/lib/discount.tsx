import styles from './discount.module.scss';

/* eslint-disable-next-line */
export interface DiscountProps {}

export function Discount(props: DiscountProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Discount!</h1>
    </div>
  );
}

export default Discount;
