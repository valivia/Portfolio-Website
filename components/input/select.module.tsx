import styles from "./input.module.scss";
import { Component } from "react";

export default class Select extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, list, datalist, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value === null ? "" : this.props.value;

    const options = list.map((entry) => {
      if (typeof entry === "string")
        return (
          <option key={entry} value={entry}>
            {entry}
          </option>
        );
      else
        return (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        );
    });

    return (
      <section className={styles.container}>
        <label htmlFor={name}>{text}</label>
        {datalist ? (
          <>
            <input
              id={name}
              name={name}
              onChange={onChange}
              value={value}
              list={`${name}_list`}
            />
            <datalist id={`${name}_list`}>{options}</datalist>
          </>
        ) : (
          <select id={name} name={name} onChange={onChange} value={value}>
            {options}
          </select>
        )}
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  value: string | null | undefined;
  list: string[] | { name: string; id: string }[];
  datalist?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
}
