import Image from "next/image";
import styles from "./asset_gallery.module.scss";
import { useState } from "react";
import { motion } from "framer-motion";
import Asset from "@typeFiles/api/asset.type";


const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;


export default function AssetGalleryComponent({ assets }: Props): JSX.Element {
  const [current, setCurrent] = useState<undefined | number>(undefined);

  function changeIndex(change: number): void {
    if (current == undefined) return;
    let newIndex = current + change;
    newIndex = newIndex < 0 ? assets.length - 1 : (newIndex >= assets.length ? 0 : newIndex);
    setCurrent(newIndex);
  }

  const currentAsset = current !== undefined ? assets[current] : undefined;

  return (
    <>
      <section className={styles.main}>
        {assets.map(asset => {
          const size = Math.min(asset.width, asset.height);

          return (
            <article
              key={asset.id}
              className={styles.image}
              onClick={() => setCurrent(assets.indexOf(asset))}
            >

              <Image
                src={`${MEDIA}/content/${asset.id}_square.jpg`}
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

      {currentAsset &&
        <div
          className={styles.fullscreenMain}
        >
          <motion.div
            key={currentAsset.id}
            initial={{ x: "600px", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={styles.content}
            style={{ backgroundImage: `url("${MEDIA}/content/${currentAsset.id}.jpg")` }}
          />

          <div className={styles.buttons}>
            {assets.length > 1 && <button onClick={() => changeIndex(-1)}>&lt;</button>}
            <div
              className={styles.assetDescription}
              onClick={() => setCurrent(undefined)}
            >
              {currentAsset.description}
            </div>
            {assets.length > 1 && <button onClick={() => changeIndex(1)}>&gt;</button>}
          </div>

        </div>
      }
    </>
  );
}

interface Props {
  assets: Asset[];
}