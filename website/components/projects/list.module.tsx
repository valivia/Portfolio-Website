import Link from "next/link";
import styles from "./list.module.scss";
import { motion } from "framer-motion";
import Project, { StatusToString } from "@typeFiles/api/project.type";

export default function ListItemcomponent({ project, index, delay }: Props): JSX.Element {
  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -100 },
  };

  return (
    <Link key={project.id} href={`/project/${project.id}`} passHref={true}>
      <motion.tr
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 + delay }}
        className={styles.main}
        variants={item}
      >
        <td>{new Date(project.created_at).toDateString()}</td>
        <td id="name">{project.name}</td>
        <td id="description">{project.description?.substring(0, 127)}</td>
        <td data-status={project.status}>{StatusToString(project.status)}</td>
      </motion.tr>
    </Link>
  );

}

interface Props {
  project: Project;
  index: number;
  delay: number;
}