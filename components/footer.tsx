import styles from "./footer.module.scss";

export default function Footer(): JSX.Element {

  const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

  return (
    <footer className={styles.footer}>
      <a href={`${cdn}/file/s/sad.mp4`} target="_blank" rel="noreferrer">beans</a>
    </footer >
  );
}