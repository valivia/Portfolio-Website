import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";
import DeleteModule from "./delete.module";

export default class ContentEdit extends Component<Props> {
  render(): ReactNode {

    const data = this.props.state.cache[this.props.identifier];

    return (
      <>
        <form className={form.form} id={this.props.identifier} onSubmit={(e) => this.props.onSubmit(e, "content", "PATCH")}>
          <h2>Edit Content</h2>

          <div>

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
            <label>Description:</label>
            <textarea
              className={form.input}
              name="description"
              maxLength={1024}
              onChange={this.props.onChange}
              value={data?.description || ""}
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
            <label>Thumbnail?</label>
            <input
              type="checkbox"
              name="thumbnail"
              onChange={this.props.onChange}
              defaultChecked={data?.thumbnail}
            />
          </div>

          <div>
            <input className={form.submit} type="submit" value="Submit!" />
          </div>
        </form>


        <DeleteModule uuid={this.props.identifier} type="content" />
      </>
    );
  }
}

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>, url: string, method: string) => void
  identifier: string;
  state: any;
}