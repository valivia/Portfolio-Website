import { Assets } from ".prisma/client";
import styles from "./projectAsset.module.scss"

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER

export default function projectAsset(asset: Assets) {
    return (
        <>
            {asset.Description ? <p>{asset.Description}</p> : undefined}
            <picture className={styles.projectContent}>
                <source srcSet={`${cdn}/file/a/${asset.FileName}_Default.jpg 3840w,
              ${cdn}/file/a/${asset.FileName}_High.jpg 2880w,
              ${cdn}/file/a/${asset.FileName}_MediumHigh.jpg 1440w,
              ${cdn}/file/a/${asset.FileName}_Medium.jpg 1920w,
              ${cdn}/file/a/${asset.FileName}_Low.jpg 1080w`} />
                <img decoding="async" loading="lazy" id={asset.ID.toString()} src={`${cdn}/file/a/${asset.FileName}_Low.jpg`}
                    alt={asset.Alt} />
            </picture>
        </>
    )
}