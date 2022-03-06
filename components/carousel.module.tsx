import { asset } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Component, ReactNode } from "react";
import styles from "./carousel.module.scss";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class Carousel extends Component<Props, State> {
  state = { index: 0 }

  changeIndex = (index: number): void => {
    let x = this.state.index + index;
    const arrayLength = this.props.pictures.length - 1;
    if (x < 0) x = arrayLength;
    if (x > arrayLength) x = 0;
    this.setState({ index: x });
  }

  render(): ReactNode {
    const pictures = this.props.pictures;
    const current = pictures[this.state.index];
    const count = pictures.length;
    const url = `${cdn}/file/a/${current.uuid}_default.jpg`;

    return (
      <section className={styles.main}>
        <div className={styles.buttons}>
          {count > 1 ? <button onClick={() => this.changeIndex(-1)} className={styles.previous}>&lt;</button> : ""}
          <button onClick={() => window.open(url, "_blank")} className={styles.open}></button>
          {count > 1 ? <button onClick={() => this.changeIndex(1)} className={styles.next}>&gt;</button> : ""}
        </div>
        <motion.div
          key={this.state.index}
          initial={{ x: "600px", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Image
            src={url}
            alt={current.alt || "No description provided"}
            height={current.height}
            width={current.width}
            layout="responsive"
            sizes={"(orientation: portrait) 100vw, 70vw"}
            quality={95}
          />
        </motion.div>
      </section >
    );
  }
}

interface Props {
  pictures: asset[];
}

interface State {
  index: number
}