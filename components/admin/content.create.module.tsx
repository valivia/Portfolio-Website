import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";

export default class ContentCreate extends Component<Props> {
  render(): ReactNode {

    const uuid = this.props.uuid;
    const data = this.props.state.cache[`cc${uuid}`];

    return (
      <form className={form.form} id={`cc${uuid}`} onSubmit={(e) => this.props.onSubmit(e, "content", "POST", { uuid: uuid })}>
        <h2>Add content</h2>

        <div>
          <label htmlFor="image">Image</label>
          <input
            className={form.input}
            type="file"
            name="image"
            onChange={this.props.onChange}
          />
        </div>

        <div>
          <label>Alt-text:</label>
          <textarea
            className={form.input}
            name="alt"
            maxLength={128}
            rows={1}
            onChange={this.props.onChange}
            value={data?.alt || ""}
          ></textarea>
        </div>

        <div>
          <label>Display in gallery?</label>
          <input
            type="checkbox"
            name="display"
            onChange={this.props.onChange}
            defaultChecked={data?.display}
          />
        </div>

        <div>
          <input className={form.submit} type="submit" value="Submit!" />
        </div>
      </form>
    );
  }
}

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>, url: string, method: string, extra?: Record<string, string>) => void
  state: any;
  uuid: string;
}