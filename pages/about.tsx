import NavBar from "../components/navbar";
import index from "../styles/index.module.scss";
import styles from "../styles/about.module.scss";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import { NextRouter, withRouter } from "next/router";
import SkillList from "../components/skill.module";
import skillData from "../public/skills.json";
import { SkillCategory } from "../types/types";
import { GetStaticProps } from "next";
import Footer from "../components/footer.module";
import Link from "next/link";

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
          <div><label>About me</label></div>
          <section className={styles.textbox}>
            <div className={styles.sectionText}>
              <h1>aaaaa</h1>
              <p>
                Expedita iste cum velit ipsum aut qui. Tempora tempora nihil omnis animi possimus ut non quia. Praesentium ratione natus temporibus consequatur
                doloremque et voluptates. Aut odio animi deserunt voluptatem veritatis non et deserunt. Excepturi consequuntur explicabo vitae officia.
              </p>
              <p>
                Placeat et quos qui voluptatem quibusdam voluptatem ad dolorem. Tempore mollitia voluptates id. Est maxime ea omnis explicabo est alias cupiditate. Et aspernatur quibusdam consequuntur ut.
              </p>
              <p>
                Natus quia facilis sed. Velit odio eum in iusto aut. Labore aut sequi tempora incidunt eos ea veritatis. Numquam qui quia et sit voluptates laboriosam eum. Et voluptatibus quia totam perspiciatis.
              </p>
              <h3>hobbies</h3>
              <p>
                Ratione veritatis modi fuga quam beatae. Laborum debitis et et. Et sint minus eaque quisquam non mollitia animi.
              </p>
              <p>
                Animi natus culpa veritatis corrupti voluptatum. Modi est voluptas nemo. Illo totam dolores beatae quia aut et cum. Vero vitae qui quas. Sunt perferendis nihil dolores atque consequatur.
              </p>
              <ul>
                <li><Link href="/browse#art"><a>art</a></Link></li>
                <li><Link href="/browse#github"><a>github</a></Link></li>
                <li><Link href="/projects"><a>projects</a></Link></li>
              </ul>
            </div>
            <div className={styles.aboutPic}>
              <Image
                src="https://cdn.discordapp.com/attachments/742497830249431062/920115152907538452/IMG_20211214_013131.jpg"
                height={480}
                width={240}
                alt=""
              ></Image>
            </div>
          </section>

          <div><label htmlFor="skills">skillset</label></div>
          <section id="skills" className={styles.skillSection}>
            <div className={styles.skills}>
              <SkillList skills={this.props.skills} />
            </div>
            <div className={styles.sectionText}>
              <h2>Skills</h2>
              <p>
                Expedita iste cum velit ipsum aut qui. Tempora tempora nihil omnis animi possimus ut non quia. Praesentium ratione natus temporibus consequatur
                doloremque et voluptates. Aut odio animi deserunt voluptatem veritatis non et deserunt. Excepturi consequuntur explicabo vitae officia.
              </p>
              <p>
                Placeat et quos qui voluptatem quibusdam voluptatem ad dolorem. Tempore mollitia voluptates id. Est maxime ea omnis explicabo est alias cupiditate. Et aspernatur quibusdam consequuntur ut.
              </p>
              <p>
                Natus quia facilis sed. Velit odio eum in iusto aut. Labore aut sequi tempora incidunt eos ea veritatis. Numquam qui quia et sit voluptates laboriosam eum. Et voluptatibus quia totam perspiciatis.
              </p>
              <p>
                Ratione veritatis modi fuga quam beatae. Laborum debitis et et. Et sint minus eaque quisquam non mollitia animi.
              </p>
              <p>
                Animi natus culpa veritatis corrupti voluptatum. Modi est voluptas nemo. Illo totam dolores beatae quia aut et cum. Vero vitae qui quas. Sunt perferendis nihil dolores atque consequatur.
              </p>
            </div>
          </section>

          <div><label>Previous experiences</label></div>
          <section className={styles.textbox}>
            <div className={styles.sectionText}>
              <h2>Experiences</h2>
              <p>
                Expedita iste cum velit ipsum aut qui. Tempora tempora nihil omnis animi possimus ut non quia. Praesentium ratione natus temporibus consequatur
                doloremque et voluptates. Aut odio animi deserunt voluptatem veritatis non et deserunt. Excepturi consequuntur explicabo vitae officia.
              </p>
              <p>
                Placeat et quos qui voluptatem quibusdam voluptatem ad dolorem. Tempore mollitia voluptates id. Est maxime ea omnis explicabo est alias cupiditate. Et aspernatur quibusdam consequuntur ut.
              </p>
              <h3>among us?</h3>
              <p>
                Natus quia facilis sed. Velit odio eum in iusto aut. Labore aut sequi tempora incidunt eos ea veritatis. Numquam qui quia et sit voluptates laboriosam eum. Et voluptatibus quia totam perspiciatis.
                Ratione veritatis modi fuga quam beatae. Laborum debitis et et. Et sint minus eaque quisquam non mollitia animi.
                Animi natus culpa veritatis corrupti voluptatum. Modi est voluptas nemo. Illo totam dolores beatae quia aut et cum. Vero vitae qui quas. Sunt perferendis nihil dolores atque consequatur.
              </p>
            </div>
          </section>

          <div><label>notable projects</label></div>
          <section className={styles.textbox}>
          </section>

          <Footer />
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