import Tag from "@typeFiles/api/tag.type";
import { Component, ReactNode } from "react";
import styles from "./tags.module.scss";

export default class Tags extends Component<Props> {
  render(): ReactNode {
    return (
      <article className={styles.main}>
        {this.props.tags.map((data) => <p key={data.id}>{data.name}</p>)}
      </article>
    );
  }
}

interface Props {
  tags: Tag[];
  clickable?: boolean;
}