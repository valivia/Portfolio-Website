import styles from "./footer.module.scss";
import Link from "next/link";

const git = process.env.NEXT_PUBLIC_GITHUB;

export default function Footer(): JSX.Element {

  const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;

  return (
    <footer className={styles.main}>
      <a href="mailto: valivia@xayania.com?subject = contact">Contact</a>
      <a href={`${mediaServer}/video/sad.mp4`} target="_blank" rel="noreferrer">beans</a>
      <Link href={`https://github.com/${git}`}><a>Github</a></Link>
    </footer >
  );
}