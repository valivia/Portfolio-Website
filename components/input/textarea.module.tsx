import styles from "./input.module.scss";
import { Component } from "react";

export default class TextArea extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, maxLength, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value ?? "";
    const rows = this.props.rows ?? 2;

    return (
      <section className={styles.container}>
        <label htmlFor={name}>{text}</label>
        <textarea
          className={styles.input}
          id={name}
          name={name}
          rows={rows}
          maxLength={maxLength}
          onChange={onChange}
          value={value}
        ></textarea>
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  value: string | null;
  rows?: number;
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
