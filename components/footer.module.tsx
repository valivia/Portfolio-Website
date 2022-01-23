import styles from "./footer.module.scss";
import Link from "next/link";

const git = process.env.NEXT_PUBLIC_GITHUB;

export default function Footer(): JSX.Element {

  const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

  return (
    <footer className={styles.main}>
      <Link href="/contact"><a>Contact</a></Link>
      <a href={`${cdn}/file/s/sad.mp4`} target="_blank" rel="noreferrer">beans</a>
      <Link href={`https://github.com/${git}`}><a>Github</a></Link>
    </footer >
  );
}