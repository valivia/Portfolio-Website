import styles from "./selector.module.scss";
import { Component } from "react";

export default class Selector extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { path, setSearchSettings } = this.props;

    return (
      <section className={styles.main}>
        <button
          className={path === "project" ? styles.active : undefined}
          onClick={() => setSearchSettings("project")}
        >
          Projects
        </button>

        <button
          className={path === "tag" ? styles.active : undefined}
          onClick={() => setSearchSettings("tag")}
        >
          Tags
        </button>
        <button
          className={path === "markdown" ? styles.active : undefined}
          onClick={() => setSearchSettings("markdown")}
        >
          Markdown
        </button>
      </section>
    );
  }
}

interface Props {
  path: string;
  setSearchSettings: (x: string) => void;
}
