import prisma from ".prisma/client";
import { Component, ReactNode } from "react";
import form from "../../styles/form.module.scss";
import { parsedProject } from "../../types/types";
import Link from "next/link";

export default class ProjectEdit extends Component<Props> {
  render(): ReactNode {

    const data = this.props.state.cache[this.props.identifier] as parsedProject;

    return (
      <form className={form.form} id={this.props.identifier} onSubmit={(e) => this.props.onSubmit(e, "project", "PATCH")}>
        <Link href={`/project/${this.props.identifier}`}>
          <a><h2>{data?.name || "New project"}</h2></a>
        </Link>

        <div>
          <label>Name:</label>
          <input
            className={form.input}
            type="text"
            name="name"
            onChange={this.props.onChange}
            value={data?.name || ""}
          />
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
          <label>Markdown:</label>
          <textarea
            className={form.input}
            name="markdown"
            maxLength={4096}
            onChange={this.props.onChange}
            value={data?.markdown || ""}
          ></textarea>
        </div>

        <div>
          <label>Status:</label>
          <select
            className={form.input}
            name="status"
            onChange={this.props.onChange}
            value={data?.status || ""}
          >
            <option value="unknown">Unknown</option>
            <option value="abandoned">Abandoned</option>
            <option value="in_progress">In progress</option>
            <option value="finished">Finished</option>
          </select>
        </div>

        <div>
          <label>tag:</label>
          <select
            className={form.input}
            name="tags"
            onChange={this.props.onChange}
            value={data?.tags}
            multiple
          >
            {this.props.tags.map(tag => <option key={tag.uuid} value={tag.uuid}>{tag.name}</option>)}
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            className={form.input}
            type="date"
            name="created"
            onChange={this.props.onChange}
            defaultValue={new Date(data?.created).toLocaleDateString("en-CA") || new Date().toLocaleDateString("en-CA")}
          ></input>
        </div>

        <span>
          <input
            type="checkbox"
            name="projects"
            id={`projects${this.props.identifier}`}
            onChange={this.props.onChange}
            defaultChecked={data?.projects}
          />
          <label htmlFor={`projects${this.props.identifier}`}>Display on projects page?</label>
        </span>

        <span>
          <input
            type="checkbox"
            name="pinned"
            id={`pinned${this.props.identifier}`}
            onChange={this.props.onChange}
            defaultChecked={data?.pinned}
          />
          <label htmlFor={`pinned${this.props.identifier}`}>Display as pinned?</label>
        </span>

        <div>
          <input className={form.submit} type="submit" value="Submit!" />
        </div>
      </form >
    );
  }
}

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>, url: string, method: string) => void
  tags: prisma.tag[]
  state: any;
  identifier: string;
}