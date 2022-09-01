import styles from "./search.module.scss";
import Link from "next/link";
import { Component } from "react";

export default class Search extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: "",
    };
  }

  search = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ value: e.target.value });
    this.props.search(this.state.value);
  };

  public render(): React.ReactNode {
    const { path } = this.props;

    return (
      <section>
        <input
          className={styles.main}
          onInput={this.search}
          value={this.state.value}
          type="text"
          placeholder="search"
        />
        <Link href={`/admin/${path}/new`}>
          <a>+</a>
        </Link>
      </section>
    );
  }
}

interface Props {
  search: (value: string) => void;
  path: string;
}

interface State {
  value: string;
}
