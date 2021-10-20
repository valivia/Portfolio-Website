import Link from "next/link";
import Image from "next/image";
import styles from "./imageItem.module.scss";
import { GalleryImage } from "../types/types";


export default function ImageItem(data: GalleryImage): JSX.Element {

  const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

  if (data.Type !== "Image") return (<></>);

  return (
    <Link href={`/project/${data.ID}`} scroll={true}>
      <a className={styles.square}>
        <div className={styles.galleryInfo}>
          <h3>{data.Name}</h3>
          <p>{data.Description}</p>
        </div>
        <Image
          className={styles.galleryContent}
          src={`${cdn}/file/a/${data.FileName}_SDefault.jpg`}
          layout="fill"
          alt={data.Alt ?? ""}>
        </Image>
      </a>
    </Link>
  );
}