import { useState } from "react";
import styles from "./experiences.module.scss";
import { Category, TagExperience } from "@typeFiles/api/tag.type";
import ExperienceCatalogueComponent from "./catalogue.module";
import ExperienceDisplayComponent from "./display.module";

export default function ExperienceComponent({ categories }: Props): JSX.Element {
  const [current, setCurrent] = useState<TagExperience>(categories[0].tags[0]);

  return (
    <main className={styles.main}>
      <ExperienceCatalogueComponent categories={categories} current={current} setCurrent={setCurrent} />

      <ExperienceDisplayComponent current={current} />
    </main>
  );

}

interface Props {
  categories: Categories[];
}

export interface Categories {
  category: Category;
  tags: TagExperience[]
}