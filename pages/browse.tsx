import type { GetStaticProps } from "next";
import NavBar from "@components/global/navbar.module";
import styles from "@styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "@components/browse/imageItem";
import React, { ReactNode } from "react";
import Footer from "@components/global/footer.module";
import { GalleryImage } from "@typeFiles/gallery_image.type";
import MailingList from "@components/global/mailing.module";

const API = process.env.NEXT_PUBLIC_API_SERVER;

class Browse extends React.Component<Props> {
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
            {this.props.projects.map((data) => (
              <ImageItem key={data.uuid} {...data} />
            ))}
          </div>
        </main>

        <Footer />
      </>
    );
  }
}

export default Browse;

export interface Props {
  projects: GalleryImage[];
}

export const getStaticProps: GetStaticProps = async () => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  let projects = await fetch(`${API}/gallery`, headers)
    .then(async (data) => {
      if (!data.ok) return null;
      return (await data.json()) as GalleryImage[];
    })
    .catch(() => null);

  if (projects === null) return { notFound: true };

  const pinned = projects.filter((project) => project.pinned);
  const normal = projects.filter((project) => !project.pinned);
  projects = pinned.concat(normal);

  return {
    props: { projects },
  };
};

export interface repo {
  html_url: string;
  id: number;
  name: string;
}
