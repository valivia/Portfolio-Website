import styles from "./list.module.scss";
import Link from "next/link";
import { Component } from "react";
import { motion } from "framer-motion";
import { tag } from "@prisma/client";

export default class List extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  filter = (value: string) => {
    value = value.toLowerCase();
    if (this.props.entries.length === 0) return [];

    const result = this.props.entries.filter((entry) => {
      if (entry.name.toLowerCase().includes(value)) return true;
      if (entry.description?.toLowerCase().includes(value)) return true;
      if (entry.markdown?.toLowerCase().includes(value)) return true;
      if (entry.tags?.find((x: tag) => x.name.toLowerCase().includes(value)))
        return true;
    });

    return result;
  };

  public render(): React.ReactNode {
    const { path, query } = this.props;
    const item = {
      visible: { opacity: 1, x: 0 },
      hidden: { opacity: 0, x: -10 },
    };
    const list = {
      visible: { opacity: 1 },
      hidden: { opacity: 0 },
    };

    const entries = this.filter(query);
    if (entries.length === 0) return <p>No results</p>;
    return (
      <motion.table
        initial="hidden"
        animate="visible"
        variants={list}
        className={styles.main}
      >
        <tbody>
          {entries.map((entry, index) => (
            <motion.tr
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.02,
              }}
              variants={item}
              key={entry.uuid}
            >
              <td>
                <Link href={`/admin/${path}/${entry.uuid}`} key={entry.uuid}>
                  {new Date(entry.created).toDateString()}
                </Link>
              </td>
              <td>
                <Link href={`/admin/${path}/${entry.uuid}`} key={entry.uuid}>
                  {entry.name}
                </Link>
              </td>
              {entry.status && (
                <td>
                  <Link href={`/admin/${path}/${entry.uuid}`} key={entry.uuid}>
                    {entry.status}
                  </Link>
                </td>
              )}
              {entry.score && (
                <td>
                  <Link href={`/admin/${path}/${entry.uuid}`} key={entry.uuid}>
                    {`${entry.score}`}
                  </Link>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    );
  }
}

interface Props {
  entries: Entry[];
  path: string;
  query: string;
}

interface Entry extends Record<string, any> {
  uuid: string;
  name: string;
  created: Date;
  description: string | null;
}
