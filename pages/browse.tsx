import type { GetStaticProps } from "next";
import { useRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "../components/imageItem";
import React from "react";
import GalleryList from "../components/listItem";
import Footer from "../components/footer";
import { GalleryImage } from "../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default function Browse({ projects, repos }: { projects: GalleryImage[], repos: repo[] }): JSX.Element {
  const router = useRouter();

  function filter(filterList: GalleryImage) {
    const statusFilter = (data: GalleryImage): boolean => !router.query.status || data.Status === router.query.status;
    const TagFilter = (data: GalleryImage): boolean => !router.query.tag || data.Tags.find((x) => x.TagID === Number(router.query.tag)) !== undefined;
    const duplicateFilter = (data: GalleryImage): boolean => !router.query.duplicates || router.query.duplicates == "true" || (router.query.duplicates == "false" && data.Thumbnail);
    return statusFilter(filterList) && TagFilter(filterList) && duplicateFilter(filterList);
  }

  return (
    <>
      <Head>
        <title>Gallery</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Gallery with all artworks" />
      </Head>

      <NavBar />

      <div className={styles.subheader}>
        <div>Gallery</div>
        <div>ᐯ</div>
      </div>

      <main className={`${styles.squareContainer} ${styles.content}`}>
        {projects.map((data) => filter(data) && <ImageItem key={data.FileName} {...data} />)}
        <div className={styles.divider}>Github</div>
        {repos.map((repo) => <GalleryList key={repo.id}{...repo} />)}
        <div className={styles.divider}>Music</div>
        <div className={styles.divider}>Video</div>
      </main>

      <Footer />
    </>
  );

}


export const getStaticProps: GetStaticProps = async () => {
  const projectData = await fetch(`${cdn}/gallery`);
  const projects = await projectData.json() as GalleryImage[];
  const gitData = await fetch(`https://api.github.com/users/${process.env.NEXT_PUBLIC_GITHUB}/repos`);
  const repos = await gitData.json() as repo[];


  if (!projects && !repos) {
    return {
      notFound: true,
    };
  }

  return {
    props: { projects, repos },
  };
};

export interface repo {
  html_url: string;
  id: number
  name: string
}