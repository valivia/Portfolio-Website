import NavBar from "../components/navbar";
import index from "../styles/index.module.scss";
import styles from "../styles/about.module.scss";
import Head from "next/head";
import React from "react";
import { NextRouter, withRouter } from "next/router";
import SkillList from "../components/skill.module";
import skillData from "../public/skills.json";
import { SkillCategory } from "../types/types";
import { GetStaticProps } from "next";

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
            <SkillList skills={this.props.skills}/>
          </section>

          <div><label>amogus</label></div>
          <section>

          </section>

        </main>
      </>
    );
  }
}

export default withRouter(About);

export const getStaticProps: GetStaticProps = async () => {
  if (!skillData) return { notFound: true };
  return {
    props: { skills: skillData },
  };
};


export interface Props {
  router: NextRouter;
  skills: SkillCategory[]
}

interface State {
  a: string;
}