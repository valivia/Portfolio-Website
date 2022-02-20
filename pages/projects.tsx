import { NextRouter, withRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/projects.module.scss";
import Head from "next/head";
import React from "react";
import Footer from "../components/footer.module";
import PinnedProject from "../components/pinned_project.module";
import { GetStaticProps } from "next";
import { ProjectQuery } from "../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Projects extends React.Component<Props> {

  render() {
    return (
      <>
        <Head>
          <title>Projects</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>

        <NavBar />

        <main className={styles.main}>
          <header>
            <h2>Projects</h2>
            <p>this is the place for my more technical projects</p>
          </header>
          <h2>Pinned Projects</h2>
          <section className={styles.pinned}>
            {this.props.pinned.map((x, y) => <PinnedProject key={y} project={x} />)}
          </section>
          <h2>All projects</h2>
          <section className={styles.list}>
            {this.props.list.map((x, y) => <PinnedProject key={y} project={x} />)}
          </section>
        </main>

        <Footer />
      </>
    );
  }

}

interface Props {
  pinned: ProjectQuery[];
  list: ProjectQuery[];
  router: NextRouter;
}


export default withRouter(Projects);

export const getStaticProps: GetStaticProps = async () => {
  const projectData = await fetch(`${cdn}/project?projects=true`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as ProjectQuery[];

  if (!projects) return { notFound: true };

  const pinned = [];
  const list = [];

  for (const project of projects) project.pinned ? pinned.push(project) : list.push(project);

  return {
    props: { pinned, list }, revalidate: 3600,
  };
};
