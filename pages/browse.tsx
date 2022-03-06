import type { GetStaticProps } from "next";
import { NextRouter, withRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "../components/imageItem";
import React from "react";
import Footer from "../components/footer.module";
import { GalleryImage } from "../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Browse extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { projects: this.props.projects };
  }

  private scroll = () => document.getElementById("main")?.scrollIntoView({ behavior: "smooth" })

  public filter = (filterList: GalleryImage) => {
    const router = this.props.router;
    const statusFilter = (data: GalleryImage): boolean => !router.query.status || data.status === router.query.status;
    const TagFilter = (data: GalleryImage): boolean => !router.query.tag || data.tags.find((x) => x.uuid === router.query.tag) !== undefined;
    const duplicateFilter = (data: GalleryImage): boolean => !router.query.duplicates || router.query.duplicates == "true" || (router.query.duplicates == "false" && data.thumbnail);
    return statusFilter(filterList) && TagFilter(filterList) && duplicateFilter(filterList);
  }

  render() {
    return (
      <>
        <Head>
          <title>Gallery</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Art gallery." />
        </Head>

        <NavBar />

        <header className={styles.subheader}>
          <div onClick={this.scroll}>Gallery</div>
          <div onClick={this.scroll}>﹀</div>
        </header>

        <main className={styles.content} id="main">
          <div className={styles.squares} id="art">
            {this.state.projects.map((data) => this.filter(data) && <ImageItem key={data.uuid} {...data} />)}
          </div>
        </main>

        <Footer />
      </>
    );
  }

}


export default withRouter(Browse);

export interface Props {
  router: NextRouter;
  projects: GalleryImage[];
}

interface State {
  projects: GalleryImage[]
}


export const getStaticProps: GetStaticProps = async () => {
  const projectData = await fetch(`${cdn}/gallery`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as GalleryImage[];

  if (!projects) return { notFound: true };

  return {
    props: { projects },
  };
};

export interface repo {
  html_url: string;
  id: number
  name: string
}