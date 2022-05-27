import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.scss";
import icon from "@public/icon.svg";

const git = process.env.NEXT_PUBLIC_GITHUB;

export default function NavBar(): JSX.Element {
  return (
    <nav className={styles.navbar}>
      <Link href={`https://github.com/${git}`}>
        <a target="_blank" rel="noreferrer">Github</a>
      </Link>
      <Link href="/browse">Gallery</Link>
      <Link href="/" passHref={true}><Image src={icon} layout="fill" alt="Icon" className={styles.icon} /></Link>
      <Link href="/projects">Projects</Link>
      <Link href="/about">About</Link>
    </nav >
  );
}