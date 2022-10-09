import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

import React from "react";
import NavigationBarComponent from "@components/global/navbar.module";

import styles from "../../styles/project.module.scss";

import Footer from "@components/global/footer.module";
import TagsComponent from "@components/project/tags.module";
import AssetGalleryComponent from "@components/project/asset_gallery.module";
import MarkdownComponent from "@components/global/markdown.module";
import Project, { StatusToString } from "@typeFiles/api/project.type";

const API = process.env.NEXT_PUBLIC_API_SERVER;
const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function ProjectPage({ project }: Props): JSX.Element {
  const scroll = () => {
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  };

  const { assets, tags, markdown } = project;
  const banner = assets.find((asset) => asset.id === project.banner_id);

  let BannerElement = <header className={styles.spacer}></header>;

  if (banner)
    BannerElement = (
      <header
        className={styles.header}
        style={{
          backgroundImage: `url("${MEDIA}/content/${banner?.id}.jpg")`,
        }}
      >
        <p onClick={scroll}>﹀</p>
      </header>
    );

  return (
    <>
      <Head>
        <title>{project.name}</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content={project.description || ""}></meta>
      </Head>
      <NavigationBarComponent />
      {BannerElement}
      <article className={styles.content} id="main">

        <header>
          <h1>{project.name}</h1>
        </header>

        <section className={styles.info}>
          <TagsComponent tags={tags} />
          <table>
            <tbody>
              <tr>
                <td>Name</td>
                <td>{project.name}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{StatusToString(project.status)}</td>
              </tr>
              <tr>
                <td>Last updated</td>
                <td>{project.updated_at}</td>
              </tr>
              <tr>
                <td>Created</td>
                <td>{project.created_at}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {(markdown || project.description) && (
          <section className={styles.markdown}>
            {markdown ? (
              <MarkdownComponent markdownString={markdown} />
            ) : (
              project.description
            )}
          </section>
        )}

        {assets.length > 0 && (
          <section className={styles.assets}>
            <header>
              <h2>Gallery</h2>
            </header>
            <AssetGalleryComponent assets={assets} />
          </section>
        )}
      </article>
      <Footer />
    </>
  );

}

interface Props {
  project: Project
}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(`${API}/project`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  });
  const data = (await res.json()).data as Project[];

  const paths = data.map((project) => {
    return { params: { id: project.id } };
  });

  return {
    paths: paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = await fetch(`${API}/project/${params?.id}`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  })
    .then(async (x) => {
      if (x.ok) return (await x.json()).data as Project;
      else return null;
    })
    .catch(() => null);

  if (!project) {
    return {
      notFound: true,
    };
  }

  project.created_at = new Date(project.created_at).toDateString();
  project.updated_at = new Date(project.updated_at).toDateString();

  return {
    props: { project },
  };
};
