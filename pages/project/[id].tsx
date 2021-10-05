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
    const { Assets, Tags } = this.props;
    const project = this.props;
    const tags = Tags;
    const banner = Assets.find(asset => asset.Thumbnail === true);
    return (
      <>
        <Head>
          <title>{project.Name}</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content={project.Description || ""} />
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
            <p>{project.Description}</p>

            <div className={styles.tags}>
              {tags.map((tag) => <Tag key={tag.TagID} {...tag} />)}
            </div>

            <p> status: {project.Status} </p>
            <p> created: {new Date(project.Created).toDateString()} </p>

          </div>

          <div className={styles.projectContentContainer}>
            {project.Assets.map((asset) => <ProjectAsset key={asset.ID} {...asset} />)};
          </div>

        </main>
      </>
    );
  }

}


export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(`${cdn}/project`);
  const data = await res.json() as ProjectQuery[];

  const paths = data.map((project) => { return { params: { id: project.ID.toString() } }; });

  return {
    paths: paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch(`${cdn}/project/${params?.id}`);
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
