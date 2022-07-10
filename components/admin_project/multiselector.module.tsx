import { Component, ReactNode } from "react";
import styles from "./multiselector.module.scss";


export default class Multiselector extends Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const options = this.props.options.filter(option =>
      !props.selected.find(selected =>
        selected.uuid === option.uuid
      )
    );

    this.state = {
      options,
      search: "",
    };
  }

  public selected = (option: entry): ReactNode => {
    return (
      <span
        key={option.uuid}
        className={styles.selected}
        onClick={() => this.remove(option)}
      >
        {option.name}
      </span>);
  }

  public remove = (option: entry): void => {
    const selected = this.props.selected.filter((o) => o.uuid !== option.uuid);
    this.props.onChange(selected);
  }

  public onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target;
    const option = this.props.options.find((o) => o.uuid === target.value);

    if (option) {
      const options = this.state.options.filter((o) => o.uuid !== target.value);
      this.setState({ options, search: "" });

      this.props.onChange(this.props.selected.concat(option));
    } else {
      this.setState({ search: target.value });
    }
  }

  render(): ReactNode {
    const selected = this.props.selected.map((option) =>
      this.selected(option)
    );
    const options = this.state.options.map(x =>
      <option key={x.uuid} value={x.uuid}>{x.name}</option>
    );

    return (
      <section className={styles.main}>

        <section className={styles.active}>
          {selected.length > 0 ? selected : <span>Empty</span>}
        </section>

        <input
          id="search"
          name="search"
          list="options"
          type="search"
          placeholder="Search"
          autoComplete="off"
          onChange={this.onChange}
          value={this.state.search}
        />

        <datalist id="options">
          {options}
        </datalist>

      </section>
    );
  }
}

interface Props {
  options: entry[];
  selected: entry[];
  onChange: (selected: entry[]) => void;
}

interface State {
  options: entry[];
  search: string;
}

interface entry {
  uuid: string;
  name: string;
}