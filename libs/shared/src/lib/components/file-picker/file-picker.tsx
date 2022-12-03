import styles from './file-picker.module.scss';

/* eslint-disable-next-line */
export interface FilePickerProps {}

export function FilePicker(props: FilePickerProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to FilePicker!</h1>
    </div>
  );
}

export default FilePicker;
