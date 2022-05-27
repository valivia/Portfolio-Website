import Image from "next/image";
import styles from "./assetGallery.module.scss";
import prisma from "@prisma/client";
import { Component, ReactNode } from "react";
import { motion } from "framer-motion";


export default class AssetGallery extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      current: undefined,
    };
  }

  public changeIndex(change: number): void {
    if (this.state.current == undefined) return;
    let newIndex = this.state.current + change;
    newIndex = newIndex < 0 ? this.props.assets.length - 1 : (newIndex >= this.props.assets.length ? 0 : newIndex);
    this.setState({ current: newIndex });
  }

  render(): ReactNode {

    const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;
    const current = this.state.current;
    const assets = this.props.assets;
    const currentAsset = current !== undefined ? this.props.assets[current] : undefined;

    return (
      <>
        <section className={styles.main}>
          {this.props.assets.map(asset => {
            const size = asset.width > asset.height ? asset.width : asset.height;

            return (
              <article
                key={asset.uuid}
                className={styles.image}
                onClick={() => this.setState({ current: this.props.assets.indexOf(asset) })}>
                <Image
                  src={`${mediaServer}/content/${asset.uuid}_square.jpg`}
                  layout="responsive"
                  height={size}
                  width={size}
                  sizes={"(orientation: portrait) 50vw, 20vw"}
                  quality={95}
                  alt={asset.alt ?? ""}>
                </Image>
              </article>
            );
          })
          }
        </section >

        {currentAsset == undefined ? <></> :
          <div
            className={styles.fullscreenMain}
          >
            <motion.div
              key={currentAsset.uuid}
              initial={{ x: "600px", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={styles.content}
              style={{ backgroundImage: `url("${mediaServer}/content/${currentAsset.uuid}_high.jpg")` }}
            />

            <div className={styles.buttons}>
              {assets.length > 1 && <button onClick={() => this.changeIndex(-1)}>&lt;</button>}
              <div onClick={() => this.setState({ current: undefined })}></div>
              {assets.length > 1 && <button onClick={() => this.changeIndex(1)}>&gt;</button>}
            </div>

          </div>
        }
      </>
    );
  }
}

interface Props {
  assets: prisma.asset[];
}

interface State {
  current: number | undefined;
}