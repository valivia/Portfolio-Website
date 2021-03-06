import { Component, ReactNode } from "react";
import Link from "next/link";
import styles from "./list_project.module.scss";
import { motion } from "framer-motion";
import { ProjectQuery } from "@typeFiles/api_project.type";

export default class ListProject extends Component<Props> {
  render(): ReactNode {
    const project = this.props.project;

    const item = {
      visible: { opacity: 1, x: 0 },
      hidden: { opacity: 0, x: -100 },
    };

    return (
      <Link key={project.uuid} href={`/project/${project.uuid}`} passHref={true}>
        <motion.tr
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: this.props.index * 0.1 + this.props.delay }}
          className={styles.main}
          variants={item}
        >
          <td>{new Date(project.created).toDateString()}</td>
          <td id="name">{project.name}</td>
          <td id="description">{project.description?.substring(0, 127)}</td>
          <td data-status={project.status}>{project.status}</td>
        </motion.tr>
      </Link>
    );
  }
}

interface Props {
  project: ProjectQuery;
  index: number;
  delay: number;
}