import styles from "./logo.module.scss";

export default function Logo(): JSX.Element {

  return (
    <svg className={styles.main} viewBox="0 0 200 123.5">

      <polygon className={styles.right} points="138 20.67 104 80.67 172 80.67 138 20.67 138 20.67" />
      <polygon className={styles.right} points="138 30.28 112.58 75.14 163.42 75.14 138 30.28 138 30.28" />

      <polygon className={styles.top} points="100 70.67 134 10.67 66 10.67 100 70.67" />

      <polygon className={styles.left} points="62 20.67 28 80.67 96 80.67 62 20.67" />

    </svg>
  );
}