import { Component, ReactNode } from "react";
import Link from "next/link";
import { ProjectQuery } from "@typeFiles/api_project.type";
import styles from "./pinned_project.module.scss";
import { motion } from "framer-motion";

export default class PinnedProject extends Component<Props> {
  render(): ReactNode {
    const project = this.props.project;

    const item = {
      visible: { opacity: 1, y: 0 },
      hidden: { opacity: 0, y: 100 },
    };


    return (
      <Link href={`/project/${project.uuid}`} passHref={true}>
        <motion.article
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: this.props.index * 0.2 }}
          className={styles.main}
          variants={item}>
          <header>
            <h1>{project.name}</h1>
          </header>
          <section>
            <label>Status:</label>
            <p>{project.status}</p>
            <label>Created:</label>
            <p>{new Date(project.created).toDateString()}</p>
            <label>Description:</label>
            <p>{project.description}</p>
          </section>
        </motion.article>
      </Link>
    );
  }
}

interface Props {
  project: ProjectQuery;
  index: number;
}