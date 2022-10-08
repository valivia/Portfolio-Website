import styles from "./catalogue.module.scss";
import { TagExperience } from "@typeFiles/api/tag.type";
import { Categories } from "./experiences.module";
import { motion } from "framer-motion";

const MEDIA = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function ExperienceCatalogueComponent(props: Props): JSX.Element {
  const { categories, current, setCurrent } = props;

  const animation_category = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: -100 },
  };

  const animation_list = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  return (
    <motion.section
      className={styles.main}
      initial="hidden"
      animate="visible"
      variants={animation_list}
    >

      {categories.map((category, categoryIndex) =>
        <motion.article
          key={category.category}
          className={styles.category}
          //  Animation
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: categoryIndex * 0.10 }}
          variants={animation_category}
        >

          <p>{category.category}</p>
          <motion.section
            className={styles.tagWrapper}
            initial="hidden"
            animate="visible"
            variants={animation_list}
          >

            {category.tags.map((tag) => (
              <article
                key={tag.id}
                className={styles.tag}
                data-active={tag.id == current.id}
              >
                <img
                  src={`${MEDIA}/tag/${tag.id}.svg?last_updated=${Number(new Date(tag.icon_updated_at))}`}
                  width={48}
                  height={48}
                  alt={tag.name}
                  onClick={() => setCurrent(tag)}
                />
              </article>
            )
            )}

          </motion.section>
        </motion.article>
      )}

    </motion.section>
  );

}

interface Props {
  categories: Categories[];
  current: TagExperience;
  setCurrent: (experience: TagExperience) => void
}