import { tag } from ".prisma/client";
import Link from "next/link";
import styles from "./tag.module.scss";

export default function Tag(data: tag): JSX.Element {
  return (
    <Link key={data.uuid} href={`/browse?tag=${data.uuid}`}>
      <a className={styles.tag}>{data.name}</a>
    </Link>
  );
}