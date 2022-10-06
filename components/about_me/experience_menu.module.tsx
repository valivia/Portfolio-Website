import { useEffect, useState } from "react";
import styles from "./experience_menu.module.scss";
import { motion } from "framer-motion";
import Link from "next/link";
import timeSince from "@components/functions/time_since.module";
import { Category, TagExperience } from "@typeFiles/api/tag.type";

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function About({ tags }: Props): JSX.Element {

  const [current, setCurrent] = useState<TagExperience>(tags[0]);
  const [list, setList] = useState<List[]>([]);

  useEffect(() => {
    let result: List[] = [];

    const categories = new Set();
    tags.forEach((x) => categories.add(x.category));

    for (const category of Array.from(categories) as Category[]) {
      result.push({
        category,
        tags: tags
          .filter((x) => x.category === category)
          .sort((a, b) => b.score - a.score),
      });
    }

    result = result.sort(
      (a, b) => b.tags.length - a.tags.length
    );

    setList(result);
    setCurrent(result[0].tags[0]);
  }, [tags]);

  const skillConfidence = (score: number): string => {
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
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = new Date(current?.used_since);

  const animation_list = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: 100 },
  };

  return (
    <main className={styles.main}>
      <section className={styles.menu}>

        {list.map(x =>
          <article className={styles.category} key={x.category}>
            <label>{x.category}</label>
            <section className={styles.itemContainer}>
              {x.tags.map((exp) => (
                <article
                  key={exp.id}
                  className={styles.item}
                  data-active={exp.id == current.id}
                >
                  <img
                    src={`${MEDIA}/tag/${exp.id}.svg?last_updated=${Number(new Date(exp.icon_updated_at))}`}
                    width={48}
                    height={48}
                    alt={exp.name}
                    onClick={() => setCurrent(exp)}
                    className={styles.icon}
                  />
                </article>
              )
              )}

            </section>
          </article>)}

      </section>

      <section className={styles.articleContainer}>
        {current && (
          <motion.article
            initial="hidden"
            animate="visible"
            key={current.id}
            variants={animation_list}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={styles.experience}
          >
            <header>
              {current.website ?
                <Link href={current.website || ""} passHref={true}>
                  <a target="_blank" rel="noreferrer">
                    <img src={`${MEDIA}/tag/${current.id}.svg?last_updated=${Number(new Date(current.icon_updated_at))}`} key={current.id} width={64} height={64} alt={current.name} />
                  </a>
                </Link> :
                <img src={`${MEDIA}/tag/${current.id}.svg?last_updated=${Number(new Date(current.icon_updated_at))}`} key={current.id} width={64} height={64} alt={current.name} />
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
              <label htmlFor="skillconfidence">{skillConfidence(current.score ?? 0)}</label>
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
              </table>
              <p>{current.description}</p>
            </main>
          </motion.article>
        )}
      </section>
    </main>
  );

}

interface Props {
  tags: TagExperience[];
}

interface List {
  category: Category;
  tags: TagExperience[]
}