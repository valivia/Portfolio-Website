import Link from "next/link";
import styles from "./navbar.module.scss";


export default function AdminNavBar({ path, hasChanged }: Props): JSX.Element {

  const confirmProceed = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    if (!hasChanged) return;

    if (confirm("Are you sure you want to proceed?")) return;

    e.preventDefault();
  };


  return (
    <nav className={styles.navbar}>
      <Link href="/admin" passHref={true}>
        <a onClick={confirmProceed}>〈</a>
      </Link>
      {path &&
        <Link href={path}>
          <a target="_blank" rel="noreferrer">
            View as guest
          </a>
        </Link>
      }
    </nav>
  );
}


interface Props {
  path?: string;
  hasChanged: boolean;
}