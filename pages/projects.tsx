import { withRouter } from "next/router";
import NavBar from "../components/navbar";
import styles from "../styles/projects.module.scss";
import Head from "next/head";
import React from "react";
import Footer from "../components/footer.module";
import Project from "../components/project.module";

class Projects extends React.Component<any> {

  render() {
    return (
      <>
        <Head>
          <title>Projects</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>

        <NavBar />

        <main className={styles.main}>
          <header></header>
          <div className={styles.title}>Projects</div>
          <div className={styles.container}>
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
            <Project />
          </div>
        </main>

        <Footer />
      </>
    );
  }

}


export default withRouter(Projects);