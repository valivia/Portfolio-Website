import { tag } from ".prisma/client";
import { Component, ReactNode } from "react";
import styles from "./tags.module.scss";

export default class Tags extends Component<Props> {
  render(): ReactNode {
    return (
      <section className={styles.main}>
        {this.props.tags.map((data) => <p key={data.uuid}>{data.name}</p>)}
      </section>
    );
  }
}

interface Props {
  tags: tag[];
  clickable?: boolean;
}