import styles from "./selector.module.scss";

export default function AdminPageSelector({ setSearchSettings, path }: Props): JSX.Element {

  return (
    <section className={`${styles.main} exclude`}>
      <button
        className={(path === "project" ? styles.active : "") + " exclude"}
        onClick={() => setSearchSettings("project")}
      >
        Projects
      </button>

      <button
        className={(path === "tag" ? styles.active : "") + " exclude"}
        onClick={() => setSearchSettings("tag")}
      >
        Tags
      </button>
      <button
        className={(path === "markdown" ? styles.active : "") + " exclude"}
        onClick={() => setSearchSettings("markdown")}
      >
        Markdown
      </button>
    </section>
  );

}

interface Props {
  path: string;
  setSearchSettings: (x: string) => void;
}
