import styles from "./projectAsset.module.scss";
import { asset } from "@prisma/client";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default function projectAsset(data: asset): JSX.Element {
  return (
    <>
      {data.description ? <p>{data.description}</p> : ""}
      <picture className={styles.projectContent}>
        <source srcSet={`${cdn}/file/a/${data.uuid}_default.jpg 3840w,
              ${cdn}/file/a/${data.uuid}_high.jpg 2880w,
              ${cdn}/file/a/${data.uuid}_medium.jpg 1440w,
              ${cdn}/file/a/${data.uuid}_low.jpg 1920w,
              ${cdn}/file/a/${data.uuid}_lowest.jpg 1080w`} />
        <img decoding="async" loading="lazy" id={data.uuid} src={`${cdn}/file/a/${data.uuid}_lowest.jpg`}
          alt={data.alt} />
      </picture>
    </>
  );
}