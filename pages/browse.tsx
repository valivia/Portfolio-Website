import type { GetStaticProps } from "next";
import NavBar from "../components/navbar";
import index from "../styles/index.module.scss";
import styles from "../styles/browse.module.scss";
import { Project, Assets } from "@prisma/client";
import Head from "next/head";
import GalleryAsset from "../components/galleryAsset";
import React, { ReactNode } from "react";
import { GalleryQuery } from "../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class Browse extends React.Component<{ projects: GalleryQuery[] }, never> {
  render(): ReactNode {
    const { projects } = this.props;
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
          {projects.map((data) => <GalleryAsset key={ data.FileName } {...data} />)}
        </main>
      </>
    );
  }
}


export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch(`${cdn}/gallery`);
  const data = await res.json() as (Assets & { Project: Project; })[];

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { projects: data },
  };
};
