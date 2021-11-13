import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import React, { ReactNode } from "react";
import NavBar from "../../components/navbar";
import Tag from "../../components/tag";
import ProjectAsset from "../../components/projectAsset";

import styles from "../../styles/project.module.scss";
import maincss from "../../styles/main.module.scss";
import { ProjectQuery } from "../../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class Projects extends React.Component<ProjectQuery, never> {
  private scroll() {
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  }

  render(): ReactNode {
    const { assets, tags } = this.props;
    const project = this.props;
    const banner = assets.find(asset => asset.thumbnail === true);
    return (
      <>
        <Head>
          <title>{project.name}</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content={project.description || ""} />
          <meta property="og:image" content={`${cdn}/file/a/${banner?.uuid}_medium.jpg`} />
        </Head>
        <NavBar />

        <div className={styles.projectHeader}
          style={{ backgroundImage: `url("${cdn}/file/a/${banner?.uuid}_medium.jpg")` }}>
          <h1 className={`${styles.projectBannerText} ${maincss.noselect}`}
            onClick={this.scroll}>ᐯ</h1>
        </div>

        <main className={`${styles.content} ${styles.project}`} id="main">

          <div className={styles.projectInfo}>
            <h1>{project.name}</h1>
            <p>{project.description}</p>

            <div className={styles.tags}>
              {tags.map((tag) => <Tag key={tag.uuid} {...tag} />)}
            </div>

            <p> status: {project.status} </p>
            <p> created: {new Date(project.created).toDateString()} </p>

          </div>

          <div className={styles.projectContentContainer}>
            {project.assets.map((asset) => <ProjectAsset key={asset.uuid} {...asset} />)}
          </div>

        </main>
      </>
    );
  }

}


export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(`${cdn}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const data = await res.json() as ProjectQuery[];

  const paths = data.map((project) => { return { params: { id: project.uuid } }; });

  return {
    paths: paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch(`${cdn}/project/${params?.id}`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const data = await res.json() as ProjectQuery;

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: data,
  };
};
