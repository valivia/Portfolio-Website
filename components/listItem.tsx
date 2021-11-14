/* eslint-disable no-shadow */
import Link from "next/link";
import { repo } from "../pages/browse";
import styles from "./listItem.module.scss";

export default function ListItem(repo: repo): JSX.Element {


  return (
    <Link href={repo.html_url} passHref={true}>
      <li className={styles.item}>{repo.name}</li>
    </Link>
  );
}