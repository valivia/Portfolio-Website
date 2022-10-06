import styles from "./list.module.scss";
import Link from "next/link";
import { motion } from "framer-motion";
import { Status } from "@typeFiles/api/project.type";
import Tag from "@typeFiles/api/tag.type";

export default function AdminPageList({ entries: entries_data, path, query }: Props): JSX.Element {

  // Do a full text search on dataset.
  const filter = (value: string): Entry[] => {
    value = value.toLowerCase();
    if (entries_data.length === 0) return [];

    const result = entries_data.filter((entry) => {
      if (entry.name.toLowerCase().includes(value)) return true;
      if (entry.description?.toLowerCase().includes(value)) return true;
      if (entry.markdown?.toLowerCase().includes(value)) return true;
      if (entry.tags?.find((x) => x.name.toLowerCase().includes(value)))
        return true;
    });

    return result;
  };

  const animation_item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  };
  const animation_list = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const entries = filter(query);

  if (entries.length === 0) return <p>No results</p>;

  return (
    <motion.table
      initial="hidden"
      animate="visible"
      variants={animation_list}
      className={styles.main}
    >
      <tbody>
        {entries.map((entry, index) => (
          <motion.tr
            key={entry.id}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.02,
            }}
            variants={animation_item}
          >
            {entry.created_at &&
              <td>
                <Link href={`/admin/${path}/${entry.id}`}>
                  {new Date(entry.created_at).toDateString()}
                </Link>
              </td>
            }
            <td>
              <Link href={`/admin/${path}/${entry.id}`}>
                {entry.name}
              </Link>
            </td>
            {entry.status &&
              <td>
                <Link href={`/admin/${path}/${entry.id}`}>
                  {entry.status}
                </Link>
              </td>
            }
            {entry.score &&
              <td>
                <Link href={`/admin/${path}/${entry.id}`}>
                  {`${entry.score}`}
                </Link>
              </td>
            }
          </motion.tr>
        ))}
      </tbody>
    </motion.table>
  );

}

interface Props {
  entries: Entry[];
  path: string;
  query: string;
}

export interface Entry {
  id: string;
  name: string;
  created_at?: string;
  description?: string;
  score?: number;
  status?: Status;
  markdown?: string;
  tags?: Tag[];
}