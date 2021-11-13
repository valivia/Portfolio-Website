import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";
import global from "../../styles/main.module.scss";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class DeleteModule extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { confirm: false, failed: false };
  }

  public submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const response = await fetch(`${cdn}/${this.props.type}`, {
      mode: "cors",
      method: "DELETE",
      credentials: "include",
      body: JSON.stringify({ uuid: this.props.uuid }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    if (!response.ok) this.setState({ failed: true });

    setTimeout(() => { this.setState({ failed: false }); }, 3000);
  }

  public onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ confirm: e.target.checked });
  }


  render(): ReactNode {

    return (
      <form className={form.form} onSubmit={this.submit}>
        <div>

          <input
            type="checkbox"
            id={`del${this.props.uuid}`}
            onChange={this.onChange}
            defaultChecked={this.state.confirm || false}
            required
          />
          <label htmlFor={`del${this.props.uuid}`} className={global.noselect}>Delete this content?</label>
        </div>

        <div>
          <input className={form.submit} type="submit" value="Delete" disabled={!this.state.confirm} />
          <p>{this.state.failed ? "error" : ""}</p>
        </div>
      </form>
    );
  }
}

interface Props {
  uuid: string;
  type: string;
}

interface State {
  confirm: boolean;
  failed: boolean;
}