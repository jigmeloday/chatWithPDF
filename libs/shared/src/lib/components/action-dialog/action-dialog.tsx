import styles from './action-dialog.module.scss';

/* eslint-disable-next-line */
export interface ActionDialogProps {}

export function ActionDialog(props: ActionDialogProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ActionDialog!</h1>
    </div>
  );
}

export default ActionDialog;
