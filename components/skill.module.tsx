import { Component, ReactNode } from "react";
import { SkillCategory } from "../types/types";
import styles from "./skill.module.scss";

export default class SkillList extends Component<Props> {
  render(): ReactNode {
    return (
      <div>
        {this.props.skills.map(skill => (
          <>
            {skill.name}
            <div key={skill.name} className={styles.main}>
              {skill.items.map(x => <img key={x.name} title={x.name} alt={x.name} src={x.url} />)}
            </div>
          </>
        ))
        }
      </div>
    );
  }
}

export interface repo {
  html_url: string;
  id: number
  name: string
}

interface Props {
  skills: SkillCategory[];
}