import type { GetStaticProps } from "next";
import { NextRouter, withRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "../components/imageItem";
import React, { createRef } from "react";
import GalleryList from "../components/listItem";
import Footer from "../components/footer";
import { GalleryImage } from "../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Browse extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { mainref: createRef(), projects: this.props.projects.slice(0, 35) };
  }

  public scroll = () => (this.state.mainref.current as HTMLElement).scrollIntoView({ behavior: "smooth" });

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

        <div className={styles.subheader}>
          <div onClick={this.scroll}>Gallery</div>
          <div onClick={this.scroll}>ᐯ</div>
        </div>

        <main className={styles.content} ref={this.state.mainref}>
          <div className={styles.squares}>
            {this.state.projects.map((data) => this.filter(data) && <ImageItem key={data.uuid} {...data} />)}
          </div>
          <div className={styles.divider}>Github</div>
          <ul className={styles.list}>
            {this.props.repos.map((repo) => <GalleryList key={repo.id}{...repo} />)}
          </ul>
          <div className={styles.divider}>Music</div>
          <div className={styles.divider}>Video</div>
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
  repos: repo[];
}

interface State {
  mainref: React.RefObject<HTMLElement>
  projects: GalleryImage[]
}


export const getStaticProps: GetStaticProps = async () => {
  const projectData = await fetch(`${cdn}/gallery`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as GalleryImage[];
  const gitData = await fetch(`https://api.github.com/users/${process.env.NEXT_PUBLIC_GITHUB}/repos`);
  const repos = await gitData.json() as repo[];

  if (!projects && !repos) {
    return {
      notFound: true,
    };
  }

  return {
    props: { projects, repos }, revalidate: 3600,
  };
};

export interface repo {
  html_url: string;
  id: number
  name: string
}