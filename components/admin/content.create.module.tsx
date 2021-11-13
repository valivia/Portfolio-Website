import prisma from ".prisma/client";
import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";

export default class ContentCreate extends Component<Props> {
  render(): ReactNode {

    const data = this.props.state.cache.contentCreate;

    return (
      <form className={form.form} id="contentCreate" onSubmit={(e) => this.props.onSubmit(e, "content", "POST")}>
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
          <input className={form.submit} type="submit" value="Submit!" />
        </div>
      </form>
    );
  }
}

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>, url: string, method: string) => void
  projects: prisma.project[]
  state: any;
}