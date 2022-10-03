import { Component, ReactNode } from "react";
import styles from "./item.module.scss";
import Image from "next/image";
import { tag } from "@prisma/client";

const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default class Item extends Component<Props> {
  render(): ReactNode {
    const data = this.props.data;
    return (
      <article
        className={styles.main}
        data-active={this.props.active}
        onClick={() => this.props.setActive(data.uuid)}
      >
        <Image
          src={`${mediaServer}/icon/${data.uuid}.svg`}
          width={90}
          height={90}
          alt={data.name}
        />
        <main className={styles.info}>
          <h1>{data.name}</h1>
        </main>
      </article>
    );
  }
}

interface Props {
  data: tag;
  active: boolean;
  setActive: (id: string) => void;
}