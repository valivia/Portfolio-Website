import prisma from "@prisma/client";
import { Component, ReactNode } from "react";
import styles from "./asset.module.scss";
import onChangeParser from "../onchange";
import { ProjectQuery } from "../../types/types";
import submit from "../submit";


export default class AssetAdmin extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    const asset = this.props.asset;

    this.state = {
      asset: asset || { uuid: this.props.project.uuid } as prisma.asset,
      new: asset ? false : true,
      sending: false,
    };

  }

  public onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target;
    const value = onChangeParser(target);
    this.setState({ asset: { ...this.state.asset, [target.name]: value } });
  }

  public onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    this.setState({ sending: true });
    const data = this.state.asset;
    const method = this.state.new ? "POST" : "PATCH";

    let response = null;

    if (method === "POST") {
      response = await submit(data as Record<string, unknown>, "content", method, "multipart/form-data").catch(null);
    } else {
      response = await submit(data as Record<string, unknown>, "content", method, "application/json").catch(null);
    }

    if (response.ok) {
      const asset = (await response.json()).asset as prisma.asset;
      this.setState({ asset, sending: false });

      if (this.state.new) {
        this.setState({ asset: { uuid: this.props.project.uuid } as prisma.asset });
        this.props.stateChanger({ ...this.props.project, assets: [...this.props.project.assets, asset] });
      } else {
        this.props.stateChanger({ ...this.props.project, assets: this.props.project.assets.map((a) => a.uuid === asset.uuid ? asset : a) });
      }

      return;
    }

    this.setState({ sending: false });
  }

  public delete = async (): Promise<void> => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    const response = await submit({ uuid: this.state.asset.uuid }, "content", "DELETE", "application/json").catch(null);

    if (response.ok) {
      await response.json();
      this.props.stateChanger({ ...this.props.project, assets: this.props.project.assets.filter((a) => a.uuid !== (this.props.asset as prisma.asset).uuid) });
    } else alert((await response.json()).message || "Unknown error");

  }

  public makeBanner = async (): Promise<void> => {
    const response = await submit({ asset: this.state.asset.uuid, project: this.props.project.uuid }, "banner", "PATCH", "application/json").catch(null);

    if (response.ok) {
      this.props.stateChanger({ ...this.props.project, banner_id: this.state.asset.uuid });
    } else alert((await response.json()).message || "Unknown error");


  }

  render(): ReactNode {
    const newAsset = this.state.new;
    const asset = this.state.asset;
    const data = this.props.asset as prisma.asset;

    return (
      <article className={styles.main} x-new={String(newAsset)} onSubmit={this.onSubmit}>
        <form className={styles.form}>
          <h2>{this.state.new ? "New" : "Edit"} asset</h2>

          {this.state.new ?
            <section>
              <label htmlFor="image">Image</label>
              <input
                type="file"
                name="image"
                onChange={this.onChange}
              />
            </section>
            : ""
          }

          <section>
            <label>Description:</label>
            <textarea
              name="description"
              maxLength={128}
              rows={1}
              onChange={this.onChange}
              value={asset?.description || ""}
            ></textarea>
          </section>

          <section>
            <label>Alt-text:</label>
            <textarea
              name="alt"
              maxLength={128}
              rows={1}
              onChange={this.onChange}
              value={asset?.alt || ""}
            ></textarea>
          </section>

          <section className={styles.checkbox}>
            <input
              type="checkbox"
              name="display"
              id={`display${data?.uuid || "new"}`}
              onChange={this.onChange}
              defaultChecked={asset?.display}
            />
            <label htmlFor={`display${data?.uuid || "new"}`}>Display in gallery?</label>
          </section>

          <section className={styles.buttons}>
            <input className={styles.submit} type="submit" value="submit" disabled={this.state.sending} />
            {!newAsset ?
              <button type="button" onClick={this.delete}>Delete</button>
              : ""
            }
            {!newAsset && this.props.project.banner_id !== asset.uuid ?
              <button type="button" onClick={this.makeBanner}>Set banner</button>
              : ""
            }
          </section>

        </form>
        {!newAsset ?
          <figure style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_SERVER}/file/a/${data.uuid}_medium.jpg)` }}>
          </figure>
          : ""
        }
      </article>
    );
  }
}

interface Props {
  asset: prisma.asset | undefined;
  project: ProjectQuery;
  stateChanger: any;
}

interface State {
  asset: prisma.asset;
  new: boolean;
  sending: boolean;
}