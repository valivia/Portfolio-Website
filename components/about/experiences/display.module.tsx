import styles from "./display.module.scss";
import { motion } from "framer-motion";
import timeSince from "@components/functions/time_since.module";
import { TagExperience } from "@typeFiles/api/tag.type";


const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function ExperienceDisplayComponent(props: Props): JSX.Element {
  const { current, tagCount, changeIndex } = props;
  const lastUpdated = Number(new Date(current.icon_updated_at));

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
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
  };

  const animation_icon = {
    hidden: { opacity: 0, rotate: 70 },
    visible: { opacity: 1, rotate: 0 },
  };

  const img =
    <motion.img
      src={`${MEDIA}/tag/${current.id}.svg?last_updated=${lastUpdated}`}
      key={current.id}
      width={64}
      height={64}
      alt={current.name}

      // Animation
      initial="hidden"
      animate="visible"
      variants={animation_icon}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}
    />;

  return (
    <article
      className={styles.wrapper}
    >

      <section className={styles.header}>
        {tagCount > 1 && <button className={styles.button} onClick={() => changeIndex(-1)}>&lt;</button>}

        {img}

        {tagCount > 1 && <button className={styles.button} onClick={() => changeIndex(1)}>&gt;</button>}
      </section>

      <motion.section
        className={styles.info}
        initial="hidden"
        animate="visible"
        key={current.id}
        variants={animation_list}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <h1>{current.name}</h1>

        <section className={styles.confidence}>

          <meter
            className={styles.meter}
            max={100}
            min={0}
            high={51}
            low={21}
            optimum={100}
            value={current.score}
            id="skillConfidence"
          />

          <label htmlFor="skillconfidence">
            {skillConfidence(current.score ?? 0)}
          </label>


        </section>

        <section className={styles.property}>
          <label>Used Since</label>
          <p>{`${months[date.getUTCMonth()]} ${date.getFullYear()} (${timeSince(date)})`}</p>
        </section>

        {current.website &&
          <section className={styles.property}>
            <label>Website</label>
            <a
              target="_blank"
              rel="noreferrer"
              href={current.website}
            >{current.website.split("/").slice(2, 3).join("/")}
            </a>
          </section>
        }
      </motion.section>

    </article>
  );

}

interface Props {
  current: TagExperience;
  tagCount: number;
  changeIndex: (change: number) => void;
}

{/* <section>
      <motion.article
        initial="hidden"
        animate="visible"
        key={current.id}
        variants={animation_list}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={styles.main}
      >

        <header className={styles.header}>
          {current.website ?
            <Link href={current.website || ""} passHref={true}>
              <a target="_blank" rel="noreferrer">
                <img src={`${MEDIA}/tag/${current.id}.svg?last_updated=${lastUpdated}`} key={current.id} width={64} height={64} alt={current.name} />
              </a>
            </Link> :
            <img src={`${MEDIA}/tag/${current.id}.svg?last_updated=${lastUpdated}`} key={current.id} width={64} height={64} alt={current.name} />
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
            <tbody>
              <tr>
                <th>Used since</th>
                <td>{`${months[date.getUTCMonth()]} ${date.getFullYear()} (${timeSince(date)})`}</td>
              </tr>
              {current.website &&
                <tr>
                  <th>Website</th>
                  <td>
                    <Link href={current.website}>
                      <a target="_blank" rel="noreferrer">
                        {current.name}
                      </a>
                    </Link>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <p>{current.description}</p>
        </main>

      </motion.article>
    </section> */}