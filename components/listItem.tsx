/* eslint-disable no-shadow */
import Link from "next/link";
import { repo } from "../pages/browse";
import styles from "./listItem.module.scss";

export default function ListItem(repo: repo): JSX.Element {


  return (
    <Link href={repo.html_url} scroll={true}>
      <a className={styles.item}>
        • {repo.name}
      </a>
    </Link>
  );
}