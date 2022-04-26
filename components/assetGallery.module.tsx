import Image from "next/image";
import styles from "./assetGallery.module.scss";
import prisma from "@prisma/client";
import { Component, ReactNode } from "react";


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

    const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;
    const current = this.state.current;
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
                  src={`${cdn}/file/a/${asset.uuid}_square.jpg`}
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
            <div
              className={styles.content}
              style={{ backgroundImage: `url("${cdn}/file/a/${currentAsset.uuid}_high.jpg")` }}
            >
            </div>

            <div className={styles.buttons}>
              <button onClick={() => this.changeIndex(-1)}>&lt;</button>
              <div onClick={() => this.setState({ current: undefined })}></div>
              <button onClick={() => this.changeIndex(1)}>&gt;</button>
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