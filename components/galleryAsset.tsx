import { Assets } from ".prisma/client";
import Link from "next/link"
import Image from "next/image";
import styles from "../styles/browse.module.scss"
import { Project } from "@prisma/client";

interface galleryQuery extends Assets {
    Project: Project
}

export default function GalleryAsset(data: galleryQuery) {

    const cdn = process.env.NEXT_PUBLIC_CDN_SERVER

    return (
        <Link key={data.Project.ID} href={`/project/${data.Project.ID}`} scroll={true}>
            <a className={styles.square}>
                <div className={styles.galleryInfo}>
                    <h3>{data.Project.Name}</h3>
                    <p>{data.Project.Description}</p>
                </div>
                <Image
                    className={styles.galleryContent}
                    src={`${cdn}/file/a/${data.FileName}_SDefault.jpg`}
                    layout="fill"
                    alt={data.Alt ?? ""}>
                </Image>
            </a>
        </Link>
    )
}