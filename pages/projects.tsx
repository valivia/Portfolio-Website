import { NextRouter, withRouter } from "next/router";
import NavBar from "@components/global/navbar.module";
import styles from "@styles/projects.module.scss";
import Head from "next/head";
import React from "react";
import Footer from "@components/global/footer.module";
import PinnedProject from "@components/projects/pinned_project.module";
import { GetStaticProps } from "next";
import { motion } from "framer-motion";
import ListProject from "@components/projects/list_project.module";
import MailingList from "@components/global/mailing.module";
import Project from "@typeFiles/api/project.type";

const API = process.env.NEXT_PUBLIC_API_SERVER;

class Projects extends React.Component<Props> {

  render() {
    const animation_list = {
      visible: { opacity: 1 },
      hidden: { opacity: 0 },
    };

    const { pinned, list } = this.props;

    return (
      <>
        <Head>
          <title>Projects</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>

        <MailingList />
        <NavBar />

        <main className={styles.main}>
          <header>
            <h2>Projects</h2>
            {list.length == 0 && pinned.length == 0
              ? <p>There is nothing here yet, Please come back later...</p>
              : <p>this is the place for my more technical projects</p>
            }
          </header>

          {pinned.length !== 0 && <>
            <h2>Pinned Projects</h2>
            <motion.section
              className={styles.pinned}
              initial="hidden"
              animate="visible"
              variants={animation_list}
            >
              {this.props.pinned.map((x, y) => <PinnedProject key={y} index={y} project={x} />)}
            </motion.section>
          </>
          }

          {list.length !== 0 && <>
            <h2>All projects</h2>
            <section className={styles.list}>
              <motion.table
                initial="hidden"
                animate="visible"
                variants={animation_list}
              >
                {this.props.list.map((x, y) => <ListProject key={y} index={y} project={x} delay={this.props.pinned.length * 0.2} />)}
              </motion.table>
            </section>
          </>
          }

        </main>

        <Footer />
      </>
    );
  }

}

interface Props {
  pinned: Project[];
  list: Project[];
  router: NextRouter;
}


export default withRouter(Projects);

export const getStaticProps: GetStaticProps = async () => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  // Fetch projects from db.
  let projects: Project[] = await fetch(`${API}/project`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data;
    })
    .catch(() => []);

  // Filter out non projects.
  projects = projects?.filter(project => project.is_project);

  const pinned = [];
  const list = [];

  for (const project of projects) project.is_pinned ? pinned.push(project) : list.push(project);

  return {
    props: { pinned, list },
  };
};
