import styles from "./footer.module.scss";
import Link from "next/link";

const GIT = process.env.NEXT_PUBLIC_GITHUB;
const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function Footer(): JSX.Element {


  return (
    <footer className={styles.main}>
      <a href="mailto: valivia@xayania.com?subject = contact">Contact</a>
      <a href={`${MEDIA}/video/sad.mp4`} target="_blank" rel="noreferrer">beans</a>
      <Link href={`https://github.com/${GIT}`}><a>Github</a></Link>
    </footer >
  );
}