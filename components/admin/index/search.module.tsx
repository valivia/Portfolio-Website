import styles from "./search.module.scss";
import Link from "next/link";
import { useState } from "react";

export default function AdminPageSearch({ search, path }: Props): JSX.Element {
  const [query, setQuery] = useState("");

  // Set state and update parent on change.
  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    search(value);
  };

  return (
    <section className={styles.main}>
      <input
        className={`${styles.input} exclude`}
        onInput={onChange}
        value={query}
        type="text"
        placeholder="search"
      />
      {(path === "tag" || path === "project") &&
        <Link href={`/admin/${path}/new`}>
          <a>+</a>
        </Link>
      }
    </section>
  );

}

interface Props {
  search: (value: string) => void;
  path: string;
}