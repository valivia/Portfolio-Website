import { Tags } from ".prisma/client";
import Link from "next/link";
import React from "react";
import styles from "./tag.module.scss"

export default function Tag(tag: Tags) {
    return (
        <Link key={tag.TagID} href={`/browse?tag=${tag.TagID}`}>
            <a className={styles.tag}>{tag.Name}</a>
        </Link>
    )
}