import Link from "next/link";
import Image from "next/image";
import styles from "./imageItem.module.scss";
import { GalleryImage } from "../types/types";


export default function ImageItem(data: GalleryImage): JSX.Element {

  const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

  if (data.type !== "image") return (<></>);

  return (
    <Link href={`/project/${data.project_uuid}`} scroll={true}>
      <a className={styles.square}>
        <div className={styles.galleryInfo}>
          <h3>{data.name}</h3>
          <p>{data.description}</p>
        </div>
        <Image
          className={styles.galleryContent}
          src={`${cdn}/file/a/${data.uuid}_square.jpg`}
          layout="fill"
          alt={data.alt ?? ""}>
        </Image>
      </a>
    </Link>
  );
}