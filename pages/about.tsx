import NavBar from "@components/global/navbar.module";
import styles from "@styles/about.module.scss";
import Head from "next/head";
import React from "react";
import { NextRouter, withRouter } from "next/router";
import { GetStaticProps } from "next";
import Footer from "@components/global/footer.module";
import MailingList from "@components/global/mailing.module";

import { MDXProvider } from "@mdx-js/react";
import SkillsetMarkdown from "@public/markdown/skillset.mdx";
import ExperienceMenu from "@components/about_me/experience_menu.module";
import experience from "@typeFiles/experience";
import { tag_category } from "@prisma/client";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class About extends React.Component<Props, State> {
  private scroll() {
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth" });
  }

  render() {
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
          <div onClick={this.scroll}>About</div>
          <div onClick={this.scroll}>﹀</div>
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

          <article>
            <header>Skillset</header>
            <ExperienceMenu
              experiences={this.props.experiences}
              sorted={this.props.sortedExperiences}
            />
          </article>

          <article className={styles.textbox}>
            <header>Previous experiences</header>
            <section>
              <h2>Experiences</h2>
              <p>
                Expedita iste cum velit ipsum aut qui. Tempora tempora nihil
                omnis animi possimus ut non quia. Praesentium ratione natus
                temporibus consequatur doloremque et voluptates. Aut odio animi
                deserunt voluptatem veritatis non et deserunt. Excepturi
                consequuntur explicabo vitae officia.
              </p>
              <p>
                Placeat et quos qui voluptatem quibusdam voluptatem ad dolorem.
                Tempore mollitia voluptates id. Est maxime ea omnis explicabo
                est alias cupiditate. Et aspernatur quibusdam consequuntur ut.
              </p>
              <h3>among us?</h3>
              <p>
                Natus quia facilis sed. Velit odio eum in iusto aut. Labore aut
                sequi tempora incidunt eos ea veritatis. Numquam qui quia et sit
                voluptates laboriosam eum. Et voluptatibus quia totam
                perspiciatis. Ratione veritatis modi fuga quam beatae. Laborum
                debitis et et. Et sint minus eaque quisquam non mollitia animi.
                Animi natus culpa veritatis corrupti voluptatum. Modi est
                voluptas nemo. Illo totam dolores beatae quia aut et cum. Vero
                vitae qui quas. Sunt perferendis nihil dolores atque
                consequatur.
              </p>
            </section>
          </article>

          <article className={styles.textbox}>
            <header>Notable Projects</header>
          </article>

          <Footer />
        </main>
      </>
    );
  }
}

export default withRouter(About);

export const getStaticProps: GetStaticProps = async () => {
  const rawData = await fetch(`${apiServer}/tag`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  });
  let experiences = (await rawData.json()) as experience[];
  if (!experiences) return { notFound: true };
  experiences = experiences.filter((tag) => tag.score !== null);

  let sortedExperiences: list[] = [];

  const categories = new Set();
  experiences.forEach((x) => categories.add(x.category));

  for (const category of Array.from(categories) as tag_category[]) {
    sortedExperiences.push({
      category,
      experiences: experiences
        .filter((x) => x.category === category)
        .sort((a, b) => b.score - a.score),
    });
  }

  sortedExperiences = sortedExperiences.sort(
    (a, b) => b.experiences.length - a.experiences.length
  );

  return {
    props: { experiences, sortedExperiences },
  };
};

export interface Props {
  router: NextRouter;
  experiences: experience[];
  sortedExperiences: list[];
}

interface State {
  a: string;
}

interface list {
  category: tag_category;
  experiences: experience[];
}
