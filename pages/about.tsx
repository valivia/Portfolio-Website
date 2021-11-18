import NavBar from "../components/navbar";
import index from "../styles/index.module.scss";
import styles from "../styles/about.module.scss"
import Head from "next/head";
import React from "react";
import { NextRouter, withRouter } from "next/router";

class About extends React.Component<Props, State> {
  render() {
    return (
      <>
        <Head>
          <title>About</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>

        <NavBar />

        <div className={index.subheader}>
          <div>haii</div>
          <div>ᐯ</div>
        </div>
        <main className={styles.main}>
          <div><label>test</label></div>
          <section>

          </section>

          <div><label htmlFor="skills">skills</label></div>
          <section id="skills" className={styles.skills}>

            <div className={styles.iconCategory}>
              <img alt="typescript" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-plain.svg" />
              <img alt="javascript" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-plain.svg" />
              <img alt="python" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-plain.svg" />
              <img alt="java" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-plain.svg" />


              
            </div>

            <div className={styles.iconCategory}>
              <img alt="typescript" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-plain.svg" />
            </div>
          </section>

        </main>
      </>
    );
  }
}

export default withRouter(About);

export interface Props {
  router: NextRouter;
}

interface State {
  a: string;
}
