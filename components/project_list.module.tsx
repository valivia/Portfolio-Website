import { Component, ReactNode } from "react";
import Link from "next/link";
import { ProjectQuery } from "../types/types";
import styles from "./pinned_project.module.scss";
import Tags from "./tags.module";

export default class PinnedProject extends Component<{ project: ProjectQuery; }> {
  render(): ReactNode {
    const project = this.props.project;
    return (
      <Link href={`/project/${project.uuid}`} passHref={true}>
        <article className={styles.main}>
          <header>
            <h1>{project.name}</h1>
          </header>
          <section>
            {project.description}
          </section>
          <Tags tags={project.tags} clickable={false} />
        </article>
      </Link>
    );
  }
}