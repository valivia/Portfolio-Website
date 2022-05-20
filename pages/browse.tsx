import type { GetStaticProps } from "next";
import { NextRouter, withRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/browse.module.scss";
import Head from "next/head";
import ImageItem from "../components/imageItem";
import React from "react";
import Footer from "../components/footer.module";
import { GalleryImage } from "../types/types";
import MailingList from "../components/mailing.module";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class Browse extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { projects: this.props.projects };
  }

  private scroll = () => document.getElementById("main")?.scrollIntoView({ behavior: "smooth" })

  render() {
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
            {this.state.projects.map((data) => <ImageItem key={data.uuid} {...data} />)}
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
  const projectData = await fetch(`${apiServer}/gallery`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
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