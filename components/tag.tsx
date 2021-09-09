import { Tags } from ".prisma/client";
import Link from "next/link";
import styles from "./tag.module.scss";

export default function Tag(tag: Tags): JSX.Element {
  return (
    <Link key={tag.TagID} href={`/browse?tag=${tag.TagID}`}>
      <a className={styles.tag}>{tag.Name}</a>
    </Link>
  );
}