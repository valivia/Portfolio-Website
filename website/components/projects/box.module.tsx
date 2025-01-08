import Link from "next/link";
import styles from "./box.module.scss";
import { motion } from "framer-motion";
import Project, { StatusToString } from "@typeFiles/api/project.type";

export default function BoxItemComponent({ project, index }: Props): JSX.Element {
  const item = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 100 },
  };

  return (
    <Link href={`/project/${project.id}`} passHref={true}>
      <motion.article
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.2 }}
        className={styles.main}
        variants={item}
      >
        <header>
          <h1>{project.name}</h1>
        </header>

        <section>
          <label>Status:</label>
          <p>{StatusToString(project.status)}</p>
        </section>

        <section>
          <label>Created:</label>
          <p>{new Date(project.created_at).toDateString()}</p>
        </section>

        <section>
          <label>Description:</label>
          <p>{project.description}</p>
        </section>

      </motion.article>
    </Link>
  );
}

interface Props {
  project: Project;
  index: number;
}