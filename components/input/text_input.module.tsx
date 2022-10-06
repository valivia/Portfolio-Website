import styles from "./input.module.scss";
import { Component } from "react";

export default class TextInput extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value ?? "";

    return (
      <section className={styles.container}>
        <label htmlFor={name}>{text}</label>
        <input
          className={styles.input}
          id={name}
          name={name}
          type="text"
          onChange={onChange}
          value={value}
          required
        />
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  value: string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
