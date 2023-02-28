import styles from './table.module.scss';

/* eslint-disable-next-line */
export interface TableProps {}

export function Table(props: TableProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Table!</h1>
    </div>
  );
}

export default Table;
