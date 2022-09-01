import styles from "./text_input.module.scss";
import { Component } from "react";

export default class TextArea extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, maxLength, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value ?? "";

    return (
      <section className={styles.main}>
        <label htmlFor={name}>{text}</label>
        <textarea
          id={name}
          name={name}
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
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
