import Tag from "@typeFiles/api/tag.type";
import styles from "./tags.module.scss";

export default function TagsComponent({ tags }: Props): JSX.Element {
  return (
    <article className={styles.main}>
      {tags.map((data) => <p key={data.id}>{data.name}</p>)}
    </article>
  );
}

interface Props {
  tags: Tag[];
  clickable?: boolean;
}