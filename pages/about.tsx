import NavigationBarComponent from "@components/global/navbar.module";
import styles from "@styles/about.module.scss";
import Head from "next/head";
import React from "react";
import { GetStaticProps } from "next";
import Footer from "@components/global/footer.module";
import { Category, TagExperience } from "@typeFiles/api/tag.type";
import ExperienceComponent, { Categories } from "@components/about/experiences/experiences.module";
import Project from "@typeFiles/api/project.type";
import CountUp from "react-countup";
import Logo from "@components/about/logo.module";

import { MDXProvider } from "@mdx-js/react";
import AboutMeMarkdown from "@public/markdown/about_me.mdx";
import AboutWebsiteMarkdown from "@public/markdown/about_website.mdx";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
const MailingList = dynamic(() => import("@components/global/mailing.module"), {
  ssr: false,
});


const API = process.env.NEXT_PUBLIC_API_SERVER;

export default function About({ experiences, projectCount, assetCount }: Props): JSX.Element {

  const animation_list = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const animation_list_logo = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 },
  };

  const delay = 0.15;
  const stiffness = 260;
  const damping = 15;

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
      <NavigationBarComponent />

      <main className={styles.main} id="main">

        <motion.h1
          // Animations
          initial="hidden"
          animate="visible"
          transition={{ type: "spring", stiffness, damping, delay: delay * 1 }}
          variants={animation_list}
        >
          About
        </motion.h1>

        <motion.p
          // Animations
          initial="hidden"
          animate="visible"
          transition={{ type: "spring", stiffness, damping, delay: delay * 2 }}
          variants={animation_list}>
          This website currently contains <CountUp className={styles.countUp} end={projectCount} duration={1.5} /> projects with a total of <CountUp className={styles.countUp} end={assetCount} duration={2} /> assets.
        </motion.p>

        <motion.section
          className={styles.logo}

          // Animations
          initial="hidden"
          animate="visible"
          transition={{ type: "spring", stiffness, damping, delay: delay * 2.5 }}
          variants={animation_list_logo}
        >
          <Logo />
        </motion.section>

        <motion.section
          className={styles.introduction}

          // Animations
          initial="hidden"
          animate="visible"
          transition={{ type: "spring", stiffness, damping, delay: delay * 4 }}
          variants={animation_list}
        >
          <h2>About me</h2>
          <MDXProvider>
            <AboutMeMarkdown />
          </MDXProvider>
        </motion.section>

        <motion.section
          className={styles.introduction}

          // Animations
          initial="hidden"
          animate="visible"
          transition={{ type: "spring", stiffness, damping, delay: delay * 5 }}
          variants={animation_list}
        >
          <h2>Portfolio</h2>
          <MDXProvider>
            <AboutWebsiteMarkdown />
          </MDXProvider>
        </motion.section>

        {experiences.length !== 0 &&
          <motion.section
            // Animations
            initial="hidden"
            animate="visible"
            transition={{ type: "spring", stiffness, damping, delay: delay * 6 }}
            variants={animation_list}
          >
            <h2>Experiences</h2>
            <ExperienceComponent categories={experiences} />
          </motion.section>
        }

      </main>

      <Footer />
    </>
  );

}

export const getStaticProps: GetStaticProps = async () => {
  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  // Fetch projects from db.
  const projects: Project[] = await fetch(`${API}/project`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data;
    })
    .catch(() => []);

  const projectCount = projects.length;

  // Count amount of assets the visitor would be able to view.
  const assetCount = projects.reduce<number>((total, current) => {
    if (!(current.assets.filter(asset => asset.is_displayed).length === 0 && !current.is_project)) total += current.assets.length;
    return total;
  }, 0);

  // Fetch tags from db.
  let tags: TagExperience[] = await fetch(`${API}/tag`, headers)
    .then(async (data) => {
      if (!data.ok) return [];
      return (await data.json()).data;
    })
    .catch(() => []);

  // Filter out non experience tags.
  tags = tags?.filter(tag => tag.score !== undefined && tag.icon_updated_at !== null);

  let experiences: Categories[] = [];

  // Make a list of the available categories.
  const categories = new Set();
  tags.forEach((x) => categories.add(x.category));

  // Loop through all the tags and group them by category.
  for (const category of Array.from(categories) as Category[]) {
    experiences.push({
      category,
      tags: tags
        .filter((x) => x.category === category)
        .sort((a, b) => b.score - a.score),
    });
  }

  // Sort categories by amount of tags.
  experiences = experiences.sort(
    (a, b) => b.tags.length - a.tags.length
  );

  return {
    props: { experiences, projectCount, assetCount },
  };
};

export interface Props {
  experiences: Categories[];
  projectCount: number;
  assetCount: number;
}
