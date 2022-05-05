import Link from "next/link";
import Image from "next/image";
import styles from "./imageItem.module.scss";
import { GalleryImage } from "../types/types";


export default function ImageItem(data: GalleryImage): JSX.Element {

  const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;

  if (data.type !== "image") return (<></>);


  return (
    <Link href={`/project/${data.project_uuid}`}>
      <a className={styles.main}>
        <div className={styles.info}>
          <h3>{data.name}</h3>
        </div>
        <div className={styles.image}>
          <Image
            src={`${mediaServer}/content/${data.uuid}_square.jpg`}
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