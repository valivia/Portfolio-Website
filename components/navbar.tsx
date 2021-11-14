import Link from "next/link";
import styles from "./navbar.module.scss";

const git = process.env.NEXT_PUBLIC_GITHUB;

export default function NavBar(): JSX.Element {
  return (
    <nav className={styles.navbar}>
      <Link href={`https://github.com/${git}`}>
        <a className={styles.button1} target="_blank" rel="noreferrer">Github</a>
      </Link>
      <Link href="/browse">
        <a className={styles.button2}>Gallery</a>
      </Link>
      <Link href="/about">
        <a className={styles.button3}>About</a>
      </Link>
      <Link href="/contact">
        <a className={styles.button4}>Contact</a>
      </Link>
      <Link href="/">
        <a className={styles.icon}>home</a>
      </Link>
    </nav >
  );
}