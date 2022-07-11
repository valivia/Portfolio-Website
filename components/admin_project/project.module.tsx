import styles from "./project.module.scss";
import Link from "next/link";
import { Component } from "react";
import { ExtendedProject } from "@typeFiles/extended_project.type";
import { motion } from "framer-motion";

export default class ProjectAdmin extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { projects } = this.props;
    const item = {
      visible: { opacity: 1, x: 0 },
      hidden: { opacity: 0, x: -10 },
    };
    const list = {
      visible: { opacity: 1 },
      hidden: { opacity: 0 },
    };

    return (
      <motion.table
        initial="hidden"
        animate="visible"
        variants={list}
        className={styles.main}
      >
        <tbody>
          {projects.map((project, index) => (
            <Link href={`/admin/project/${project.uuid}`} key={project.uuid} passHref={true}>
              <motion.tr
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.05 }}
                variants={item}
                key={project.uuid}
              >
                <td>{new Date(project.updated).toDateString()}</td>
                <td>
                  {project.name}
                </td>
                <td>{project.status}</td>
              </motion.tr>
            </Link>
          )
          )}
        </tbody>
      </motion.table >
    );
  }
}

interface Props {
  projects: ExtendedProject[];
}