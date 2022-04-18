import styles from "../pinned_project.module.scss";
import Link from "next/link";
import { Component } from "react";
import { Project } from "../../types/types";

export default class ProjectAdmin extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { project } = this.props;
    if (!project) return (
      <Link href={`/admin/new`} passHref={true}>
        <article style={{ display: "flex", justifyContent: "center" }} className={styles.main}>
          <h1 style={{ fontSize: "400%" }}>+</h1>
        </article >
      </Link >
    );

    return (
      <Link href={`/admin/${project.uuid}`} passHref={true}>
        <article className={styles.main}>
          <header>
            <h1>{project.name}</h1>
          </header>
          <section>
            <label>Status:</label>
            <p>{project.status}</p>
            <label>Last Updated:</label>
            <p>{new Date(project.updated).toDateString()}</p>
            {project.description && <label>Description:</label>}
            <p>{project.description}</p>
          </section>
        </article>
      </Link>
    );
  }
}

interface Props {
  project: Project | undefined
}