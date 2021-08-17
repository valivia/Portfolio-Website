import type { GetServerSideProps, NextPage } from 'next'
import NavBar from '../components/navbar'
import index from '../styles/index.module.scss'
import styles from "../styles/browse.module.scss"
import prisma from '../lib/db'
import { Prisma, Project } from '@prisma/client'
import Link from 'next/link'
import Image from "next/image"
import Head from "next/head"

const Browse = ({ projects }: { projects: Project[] }) => {
    return (
        <>
            <Head>
                <title>Gallery</title>
            </Head>
            <div className={index.subheader}>
                Gallery<br />ᐯ
            </div>
            <main className={styles.squareContainer}>
                {
                    projects.map((project, i) => (
                        <Link key={project.ID} href={`/project/${project.ID}`}>
                            <a className={styles.square}>
                                <Image
                                    className={styles.img}
                                    src={`http://localhost:3001/file/a/${project.FileName}_Default.jpg`}
                                    layout="fill"
                                    alt={project.Description ?? ""}>
                                </Image>
                            </a>
                        </Link>
                    ))
                }
            </main>
        </>
    )
}

export default Browse


export const getServerSideProps: GetServerSideProps = async (context) => {
    let query: Prisma.ProjectFindManyArgs = { include: { TagLink: { include: { Tags: { include: { Categories: true } } } } } };
    let data = await prisma.project.findMany(query);
    data = JSON.parse(JSON.stringify(data))
    return { props: { projects: data, }, revalidate: 3600 };
}

