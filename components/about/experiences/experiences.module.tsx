import { useState } from "react";
import styles from "./experiences.module.scss";
import { Category, TagExperience } from "@typeFiles/api/tag.type";
import ExperienceCatalogueComponent from "./catalogue.module";
import ExperienceDisplayComponent from "./display.module";

export default function ExperienceComponent({ categories }: Props): JSX.Element {
  const [current, setCurrent] = useState<TagExperience>(categories[0].tags[0]);

  function changeIndex(change: number) {
    let newCategory = 0;
    let newTag = 0;

    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const category = categories[categoryIndex];

      for (let tagIndex = 0; tagIndex < category.tags.length; tagIndex++) {
        const tag = category.tags[tagIndex];

        if (current.id !== tag.id) continue;

        newCategory = categoryIndex;
        newTag = tagIndex += change;


        if (newTag + 1 > category.tags.length) {
          newTag = 0;

          newCategory = categoryIndex + 1;

          if (newCategory + 1 > categories.length) newCategory = 0;

          break;
        }

        if (newTag < 0) {
          newCategory = categoryIndex - 1;
          if (newCategory < 0) newCategory = categories.length - 1;

          newTag = categories[newCategory].tags.length - 1;
          break;
        }

        break;
      }
    }

    setCurrent(categories[newCategory].tags[newTag]);
  }

  return (
    <main className={styles.main}>
      <ExperienceCatalogueComponent categories={categories} current={current} setCurrent={setCurrent} />

      <ExperienceDisplayComponent current={current} tagCount={2} changeIndex={changeIndex} />
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