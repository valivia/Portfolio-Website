import styles from "./input.module.scss";
import { Component } from "react";

export default class Checkbox extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, value, onChange } = this.props;
    const text = this.props.text ?? name;

    return (
      <section className={styles.container}>
        <input
          className={styles.input}
          type="checkbox"
          id={name}
          name={name}
          onChange={onChange}
          defaultChecked={value}
        ></input>
        <label htmlFor={name}>{text}</label>
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
