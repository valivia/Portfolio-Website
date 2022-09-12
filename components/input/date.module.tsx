import styles from "./input.module.scss";
import { Component } from "react";

export default class DateInput extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value ?? new Date();

    return (
      <section className={styles.container}>
        <label htmlFor={name}>{text}</label>
        <input
          className={styles.input}
          id={name}
          name={name}
          type="date"
          onChange={onChange}
          defaultValue={value.toLocaleDateString("en-CA")}
          required
        />
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  value: Date | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
