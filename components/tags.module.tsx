import { tag } from ".prisma/client";
import Link from "next/link";
import { Component, ReactNode } from "react";
import styles from "./tags.module.scss";

export default class Tags extends Component<Props> {
  Tag = (data: tag): JSX.Element => (
    this.props.clickable ? <Link key={data.uuid} href={`/browse?tag=${data.uuid}`}>{data.name}</Link> : <p>{data.name}</p>
  )

  render(): ReactNode {
    return (
      <section className={styles.main}>
        {this.props.tags.map((x, y) => <this.Tag key={y} {...x} />)}
      </section>
    );
  }
}

interface Props {
  tags: tag[];
  clickable?: boolean;
}