import styles from './file-uploader.module.scss';

/* eslint-disable-next-line */
export interface FileUploaderProps {}

export function FileUploader(props: FileUploaderProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to FileUploader!</h1>
    </div>
  );
}

export default FileUploader;
