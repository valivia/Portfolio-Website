import { Assets, TagLink, Tags, Project } from '.prisma/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';
import NavBar from '../../components/navbar';
import Tag from "../../components/tag";
import ProjectAsset from "../../components/projectAsset"

import styles from "../../styles/project.module.scss";
import maincss from "../../styles/main.module.scss"

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER

interface ProjectQuery extends Project {
    Assets: Assets[]
    TagLink: (TagLink & {
        Tags: Tags;
    })[];
}

export default class Projects extends React.Component<ProjectQuery, {}> {
    private scroll() {
        document.getElementById("main")?.scrollIntoView({ behavior: "smooth" })
    }

    render() {
        const { Assets, TagLink } = this.props;
        const project = this.props;
        const tags = TagLink.map(r => r.Tags);
        const banner = Assets.find(asset => asset.Thumbnail === true);
        return (
            <>
                <Head>
                    <title>{project.Name}</title>
                    <meta name="theme-color" content="#B5A691" />
                    <meta name="description" content="Gallery with all artworks" />
                </Head>
                <NavBar />

                <div className={styles.projectHeader}
                    style={{ backgroundImage: `url("${cdn}/file/a/${banner?.FileName}_MediumHigh.jpg")` }}>
                    <h1 className={`${styles.projectBannerText} ${maincss.noselect}`}
                        onClick={this.scroll}>ᐯ</h1>
                </div>

                <main className={`${styles.content} ${styles.project}`} id="main">
                    <div className={styles.projectInfo}>
                        <h1>{project.Name}</h1>
                        {project.Description}
                        <div className={styles.tags}>
                            {tags.map((tag) => <Tag {...tag} />)}
                        </div>

                        status: {project.Status}
                        <br />
                        created: {project.Created}
                    </div>

                    <div className={styles.projectContentContainer}>
                        {project.Assets.map((asset) => <ProjectAsset {...asset} />)};
                    </div>


                </main>
            </>
        )
    }

}

export const getStaticPaths: GetStaticPaths = async () => {
    const res = await fetch(`${cdn}/gallery?assets=no`)
    const data = await res.json() as (Assets & { Project: Project; })[];

    const paths = data.map((project) => { return { params: { id: project.ID.toString() } } });

    return {
        paths: paths,
        fallback: false
    };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const res = await fetch(`${cdn}/project/${params?.id}`)
    const data = await res.json() as (Assets & { Project: Project; })[];

    if (!data) {
        return {
            notFound: true,
        }
    }

    return {
        props: data
    }
}
