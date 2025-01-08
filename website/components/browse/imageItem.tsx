import Link from "next/link";
import Image from "next/image";
import styles from "./imageItem.module.scss";
import { GalleryAsset } from "@typeFiles/api/asset.type";

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function ImageItem(data: GalleryAsset): JSX.Element {
  return (
    <Link href={`/project/${data.project_id}`}>
      <a className={styles.main}>
        <div className={styles.info}>
          <h3>{data.project_name}</h3>
        </div>
        <div className={styles.image}>
          <Image
            src={`${MEDIA}/content/${data.asset_id}_square.jpg`}
            layout="responsive"
            height={data.size}
            width={data.size}
            sizes={"(orientation: portrait) 50vw, 20vw"}
            quality={95}
            alt={data.alt ?? ""}>
          </Image>
        </div>
      </a>
    </Link>
  );
}