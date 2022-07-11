import { Component, ReactNode } from "react";
import styles from "./experience_menu.module.scss";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import timeSince from "@components/functions/time_since.module";
import { experience_category } from "@prisma/client";
import experience from "@typeFiles/experience";

const mediaServer = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default class ExperienceMenu extends Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      current: this.props.sorted[0].experiences[0].uuid,
    };


  }

  private skillConfidence(score: number): string {
    if (score <= 10) {
      return "Interested";
    } else if (score <= 20) {
      return "Beginner";
    } else if (score <= 30) {
      return "Novice";
    } else if (score <= 50) {
      return "Intermediate";
    } else if (score <= 90) {
      return "Experienced";
    } else {
      return "Advanced";
    }
  }

  private setCurrent(current: string) {
    this.setState({ current });
  }

  render(): ReactNode {
    const current = this.props.experiences.find(x => x.uuid == this.state.current) || {} as experience;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(current?.used_since);

    const list = {
      visible: { opacity: 1, x: 0 },
      hidden: { opacity: 0, x: 100 },
    };

    return (
      <main className={styles.main}>
        <section className={styles.menu}>
          {this.props.sorted.map(x =>
            <article className={styles.category} key={x.category}>
              <label>{x.category}</label>
              <section className={styles.itemContainer}>
                {x.experiences.map((exp) => (
                  <article
                    key={exp.uuid}
                    className={styles.item}
                    data-active={exp.uuid == this.state.current}
                  >
                    <Image
                      src={`${mediaServer}/icon/${exp.uuid}.svg`}
                      width={48}
                      height={48}
                      alt={exp.name}
                      onClick={() => this.setCurrent(exp.uuid)}
                      className={styles.icon}
                    />
                  </article>
                ))
                }
              </section>
            </article>)}

        </section>
        <section className={styles.articleContainer}>
          {current && (
            <motion.article
              initial="hidden"
              animate="visible"
              key={current.uuid}
              variants={list}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={styles.experience}
            >
              <header>
                {current.website ?
                  <Link href={current.website || ""} passHref={true}>
                    <a target="_blank" rel="noreferrer">
                      <Image src={`${mediaServer}/icon/${current.uuid}.svg`} key={current.uuid} width={64} height={64} alt={current.name} />
                    </a>
                  </Link> :
                  <Image src={`${mediaServer}/icon/${current.uuid}.svg`} key={current.uuid} width={64} height={64} alt={current.name} />
                }
                <h1>{current.name}</h1>
                <meter
                  max={100}
                  min={0}
                  high={51}
                  low={21}
                  optimum={100}
                  value={current.score}
                  id="skillConfidence"
                ></meter>
                <label htmlFor="skillconfidence">{this.skillConfidence(current.score)}</label>
              </header>
              <main className={styles.info}>
                <table>
                  <tr>
                    <th>Used since</th>
                    <td>{`${months[date.getUTCMonth()]} ${date.getFullYear()} (${timeSince(date)})`}</td>
                  </tr>
                  {current.website &&
                    <tr>
                      <th>Website</th>
                      <td><Link href={current.website}><a>{current.name}</a></Link></td>
                    </tr>
                  }
                  {current.notable_project &&
                    <tr>
                      <th>used in</th>
                      <td><Link href={`/project/${current.notable_project.uuid}`}><a>{current.notable_project.name}</a></Link></td>
                    </tr>
                  }
                </table>
                <ul>
                  {current.projects.map(x => <li key={x.uuid}><Link href={`/project/${x.uuid}`}><a>{x.name}</a></Link></li>)}
                </ul>
                <p>{current.description}</p>
              </main>
            </motion.article>
          )}
        </section>
      </main>
    );
  }
}

interface Props {
  experiences: experience[];
  sorted: list[];
}

interface list {
  category: experience_category;
  experiences: experience[]
}

interface State {
  current: string;
}