import Link from "next/link";
import styles from "./navbar.module.scss";

const git = process.env.NEXT_PUBLIC_GITHUB;

export default function NavBar(): JSX.Element {
  return (
    <nav className={styles.navbar}>
      <Link href={`https://github.com/${git}`}>
        <a target="_blank" rel="noreferrer">Github</a>
      </Link>
      <Link href="/browse">
        <a>Gallery</a>
      </Link>
      <Link href="/projects">
        <a>Projects</a>
      </Link>
      <Link href="/about">
        <a>About</a>
      </Link>
      <Link href="/">
        <a className={styles.icon}>home</a>
      </Link>
    </nav >
  );
}