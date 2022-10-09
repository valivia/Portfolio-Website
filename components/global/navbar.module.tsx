import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./navbar.module.scss";

const GIT = process.env.NEXT_PUBLIC_GITHUB;

export default function NavBar(): JSX.Element {
  const router = useRouter();
  const path = router.route;
  return (
    <nav className={styles.navbar}>
      <Link href={GIT as string}>
        <a target="_blank" rel="noreferrer">
          Github
        </a>
      </Link>
      <Link href="/gallery">
        <a className={path === "/browse" ? styles.active : undefined}>
          Gallery
        </a>
      </Link>
      <Link href="/" passHref={true}>
        <svg className={styles.logo} viewBox="0 0 1920 1080">
          <path
            className={styles.outer}
            d="M960,990L210,765V315L960,90l750,225v450l-750,225Z"
          />
          <polygon
            className={styles.middle}
            points="1644 718.33 1644 361.33 959 156.33 276 361.33 276 719.33 959 924.33 1644 718.33"
          />
          <polygon
            className={styles.inner}
            points="1345 655.53 1345 425.13 961 309.93 577 425.13 577 655.53 961 770.73 1345 655.53"
          />
        </svg>
      </Link>
      <Link href="/projects">
        <a className={path === "/projects" ? styles.active : undefined}>
          Projects
        </a>
      </Link>
      <Link href="/about">
        <a className={path === "/about" ? styles.active : undefined}>About</a>
      </Link>
    </nav>
  );
}
