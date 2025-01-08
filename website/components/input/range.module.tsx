import styles from "./input.module.scss";
import { Component } from "react";

export default class RangeInput extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    const { name, min, max, onChange } = this.props;
    const text = this.props.text ?? name;
    const value = this.props.value ?? min;

    return (
      <section className={styles.container}>
        <label htmlFor={name}>{text}</label>
        <input
          className={styles.slider}
          id={name}
          name={name}
          type="range"
          min={min}
          max={max}
          onChange={onChange}
          value={value}
          required
        />
        <span>{value}</span>
      </section>
    );
  }
}

interface Props {
  name: string;
  text?: string;
  required?: boolean;
  min: number;
  max: number;
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
