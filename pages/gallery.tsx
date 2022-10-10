import type { GetStaticProps } from "next";
import NavigationBarComponent from "@components/global/navbar.module";
import styles from "@styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "@components/browse/imageItem";
import React, { useRef } from "react";
import Footer from "@components/global/footer.module";
import Project from "@typeFiles/api/project.type";
import { asset_to_gallery, GalleryAsset } from "@typeFiles/api/asset.type";

import dynamic from "next/dynamic";
const MailingList = dynamic(() => import("@components/global/mailing.module"), {
  ssr: false,
});

const API = process.env.NEXT_PUBLIC_API_SERVER;

export default function GalleryPage({ assets }: Props): JSX.Element {


  const mainElement = useRef<HTMLElement>(null);

  const scroll = () =>
    mainElement.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Head>
        <title>Gallery</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Art gallery." />
      </Head>

      <MailingList />
      <NavigationBarComponent />

      <header className={styles.subheader}>
        <div onClick={scroll}>Gallery</div>
        <div onClick={scroll}>﹀</div>
      </header>

      <main className={styles.content} ref={mainElement}>
        <div className={styles.squares} id="art">
          {assets.map((data) => (
            <ImageItem key={data.asset_id} {...data} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );

}


export interface Props {
  assets: GalleryAsset[];
}

export const getStaticProps: GetStaticProps = async () => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  const projects: Project[] = await fetch(`${API}/project`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data;
    })
    .catch(() => []);

  let assets: GalleryAsset[] = [];
  for (const project of projects) {
    for (const asset of project.assets) {
      if (!asset.is_displayed) continue;
      assets.push(asset_to_gallery(asset, project));
    }
  }

  const pinned = assets.filter((project) => project.is_pinned);
  const normal = assets.filter((project) => !project.is_pinned);
  assets = pinned.concat(normal);

  return {
    props: { assets },
  };
};

export interface repo {
  html_url: string;
  id: number;
  name: string;
}
