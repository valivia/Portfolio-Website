import NavBar from "@components/global/navbar.module";
import styles from "@styles/about.module.scss";
import Head from "next/head";
import React from "react";
import { NextRouter } from "next/router";
import { GetStaticProps } from "next";
import Footer from "@components/global/footer.module";
import MailingList from "@components/global/mailing.module";

import { MDXProvider } from "@mdx-js/react";
import SkillsetMarkdown from "@public/markdown/skillset.mdx";
import ExperienceMenu from "@components/about_me/experience_menu.module";
import Tag, { TagExperience } from "@typeFiles/api/tag.type";

const API = process.env.NEXT_PUBLIC_API_SERVER;

export default function About({ tags }: Props): JSX.Element {
  const scroll = () => {
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>About</title>
        <meta name="theme-color" content="#B5A691" />
        <meta
          name="description"
          content="About the creator of this website and its purpose"
        />
      </Head>

      <MailingList />
      <NavBar />

      <header className={styles.subheader}>
        <div onClick={scroll}>About</div>
        <div onClick={scroll}>﹀</div>
      </header>
      <main className={styles.main} id="main">
        <article className={styles.textbox}>
          <header>About me</header>
          <section className={styles.markdown}>
            <MDXProvider>
              <SkillsetMarkdown />
            </MDXProvider>
          </section>
        </article>

        {tags.length !== 0 &&
          <article>
            <header>Skillset</header>
            <ExperienceMenu tags={tags} />
          </article>
        }

        <Footer />
      </main>
    </>
  );

}

export const getStaticProps: GetStaticProps = async () => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  // Fetch projects from db.
  let tags: Tag[] = await fetch(`${API}/tag`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data;
    })
    .catch(() => []);

  // Filter out non projects.
  tags = tags?.filter(project => project.score !== undefined && project.icon_updated_at !== null);

  return {
    props: { tags },
  };
};

export interface Props {
  router: NextRouter;
  tags: TagExperience[];
}
