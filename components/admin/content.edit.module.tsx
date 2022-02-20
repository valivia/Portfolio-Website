import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";
import styles from "./content.edit.module.scss";
import DeleteModule from "./delete.module";
import Image from "next/image";
import { asset } from ".prisma/client";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class ContentEdit extends Component<Props> {
  render(): ReactNode {

    const data = this.props.state.cache[this.props.identifier] as asset;
    const size = Math.min(data.width, data.height);

    return (
      <>
        <form className={styles.main} id={this.props.identifier} onSubmit={(e) => this.props.onSubmit(e, "content", "PATCH")}>

          <div className={styles.form}>

            <h2>Edit Content</h2>

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

            <span>
              <input
                type="checkbox"
                name="display"
                id={`display${this.props.identifier}`}
                onChange={this.props.onChange}
                defaultChecked={data?.display}
              />
              <label htmlFor={`display${this.props.identifier}`}>Display in gallery?</label>
            </span>

            <span>
              <input
                type="checkbox"
                name="thumbnail"
                id={`thumbnail${this.props.identifier}`}
                onChange={this.props.onChange}
                defaultChecked={data?.thumbnail}
              />
              <label htmlFor={`thumbnail${this.props.identifier}`}>Thumbnail?</label>
            </span>

            <div>
              <input className={form.submit} type="submit" value="Submit!" />
            </div>
          </div>

          <div className={styles.image}>
            <Image
              src={`${cdn}/file/a/${data.uuid}_square.jpg`}
              width={size}
              height={size}
              layout="responsive"
              alt={data.alt ?? ""}>
            </Image>
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