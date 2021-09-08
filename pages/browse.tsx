import type { GetServerSideProps, GetStaticProps, NextPage } from 'next'
import NavBar from '../components/navbar'
import index from '../styles/index.module.scss'
import styles from "../styles/browse.module.scss"
import { Project, Assets } from '@prisma/client'
import Link from 'next/link'
import Image from "next/image"
import Head from "next/head"
import GalleryAsset from '../components/galleryAsset'

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER

const Browse = ({ projects }: { projects: (Assets & { Project: Project; })[] }) => {
    return (
        <>
            <Head>
                <title>Gallery</title>
                <meta name="theme-color" content="#B5A691" />
                <meta name="description" content="Gallery with all artworks" />
            </Head>

            <NavBar />

            <div className={index.subheader}>
                <div>Gallery</div>
                <div>ᐯ</div>
            </div>
            <main className={styles.squareContainer}>
                {projects.map((data) => <GalleryAsset {...data} />)}
            </main>
        </>
    )
}

export default Browse


export const getStaticProps: GetStaticProps = async (context) => {
    const res = await fetch(`${cdn}/gallery`)
    const data = await res.json() as (Assets & { Project: Project; })[]

    if (!data) {
        return {
            notFound: true,
        }
    }

    return {
        props: { projects: data }
    }
}
