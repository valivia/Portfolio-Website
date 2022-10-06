import type { GetStaticProps } from "next";
import NavBar from "@components/global/navbar.module";
import styles from "@styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "@components/browse/imageItem";
import React, { ReactNode } from "react";
import Footer from "@components/global/footer.module";
import MailingList from "@components/global/mailing.module";
import Project from "@typeFiles/api/project.type";
import { asset_to_gallery, GalleryAsset } from "@typeFiles/api/asset.type";

const API = process.env.NEXT_PUBLIC_API_SERVER;

class GalleryPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private scroll = () =>
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });

  render(): ReactNode {
    return (
      <>
        <Head>
          <title>Gallery</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Art gallery." />
        </Head>

        <MailingList />
        <NavBar />

        <header className={styles.subheader}>
          <div onClick={this.scroll}>Gallery</div>
          <div onClick={this.scroll}>﹀</div>
        </header>

        <main className={styles.content} id="main">
          <div className={styles.squares} id="art">
            {this.props.assets.map((data) => (
              <ImageItem key={data.asset_id} {...data} />
            ))}
          </div>
        </main>

        <Footer />
      </>
    );
  }
}

export default GalleryPage;

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
