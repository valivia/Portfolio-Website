import { GetServerSideProps } from "next";
import Head from "next/head";

import React, { AnchorHTMLAttributes, DetailedHTMLProps, ImgHTMLAttributes, ReactNode } from "react";

import { ProjectQuery } from "../../types/types";

import styles from "../../styles/admin.project.module.scss";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { NextRouter, withRouter } from "next/router";
import { tag } from "@prisma/client";
import { serialize } from "next-mdx-remote/serialize";
import Link from "next/link";
import Image from "next/image";
import AssetAdmin from "../../components/admin/asset.module";
import onChangeParser from "../../components/onchange";
import submit from "../../components/submit";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class AdminProject extends React.Component<Props, State> {
  private update: NodeJS.Timeout | undefined;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
      project: this.props.project,
      new: this.props.router.query.id == "new",
      sending: false,
    };
  }

  public onChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = onChangeParser(target);
    if (target.name === "markdown") this.update = setTimeout(this.updateMD, 200);
    this.setState({ project: { ...this.state.project, [target.name]: value } });
  }

  public updateMD = async () => {
    if (!this.state.project.markdown) return;
    const markdownParsed = await serialize(this.state.project.markdown);
    this.setState({ project: { ...this.state.project, markdownParsed } });
  }

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    this.setState({ sending: true });
    const data = this.state.project;
    const method = this.state.new ? "POST" : "PATCH";

    const response = await submit(data as unknown as Record<string, unknown>, "project", method, method == "POST" ? "multipart/form-data" : "application/json");

    if (response.ok) {
      const project = (await response.json()).project as ProjectQuery | Project;
      if (this.state.new) await this.props.router.push(`/admin/${project.uuid}`);
      else {
        project.tags = data.tags;
        this.setState({ project: project as Project });
        this.updateMD();
      }
    } else alert((await response.json()).message || "Unknown error");

    this.setState({ sending: false });
  }

  public delete = async (): Promise<void> => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    if (this.state.new) {
      this.setState({ project: {} as Project });
      return;
    }
    const response = await submit({ uuid: this.state.project.uuid }, "project", "DELETE", "application/json");
    if (response.ok) await this.props.router.push("/admin");
  }

  public confirmProceed = (event: { preventDefault: () => void; }): void => {
    const current = this.state.project;
    // const original = this.props.project;
    if (this.state.new && Object.entries(current).find(x => x[1] !== "") == undefined) return;

    if (confirm("Are you sure you want to proceed?")) return;
    event.preventDefault();
  }


  public stateChanger = (project: Project) => {
    this.setState({ project });
  }

  public render = (): ReactNode => {
    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/login");
      return <></>;
    }

    const project = this.state.project;

    return (
      <>
        <Head>
          <title>{this.state.new ? "New Project" : project.name}</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>
        <main className={styles.main}>
          <header>
            <Link href="/admin"><a onClick={this.confirmProceed}>〈</a></Link>
            <Link href={`/project/${project.uuid}`}><a onClick={this.confirmProceed}>Project</a></Link>
          </header>
          <section className={styles.mainInput}>
            <header><h2>Project</h2></header>
            <form className={styles.form} onSubmit={x => this.onSubmit(x)}>
              <section>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  onChange={this.onChange}
                  value={project.name || ""}
                  required
                />
              </section>

              <section>
                <label>Description:</label>
                <textarea
                  name="description"
                  maxLength={1024}
                  onChange={this.onChange}
                  value={project.description || ""}
                ></textarea>
              </section>

              <section>
                <label>Date</label>
                <input
                  type="date"
                  name="created"
                  onChange={this.onChange}
                  defaultValue={new Date(project.created).toLocaleDateString("en-CA") || new Date().toLocaleDateString("en-CA")}
                  required
                ></input>
              </section>

              {this.state.new ?
                <section>
                  <label>Banner</label>
                  <input
                    type="file"
                    name="banner"
                    onChange={this.onChange}
                  />
                </section>
                : ""
              }

              <section>
                <label>Status:</label>
                <select
                  name="status"
                  onChange={this.onChange}
                  value={project.status || ""}
                  required
                >
                  <option value="unknown">Unknown</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="on_hold">On hold</option>
                  <option value="in_progress">In progress</option>
                  <option value="finished">Finished</option>
                </select>
              </section>

              <section>
                <label>tag:</label>
                <select
                  name="tags"
                  onChange={this.onChange}
                  value={project.tags}
                  multiple
                >
                  {this.props.tags.map(x => <option key={x.uuid} value={x.uuid}>{x.name}</option>)}
                </select>
              </section>

              <section className={styles.checkbox}>
                <section>
                  <input
                    type="checkbox"
                    name="projects"
                    id="projects"
                    onChange={this.onChange}
                    defaultChecked={project.projects}
                  />
                  <label htmlFor="projects">Display on projects page?</label>
                </section>

                <section>
                  <input
                    type="checkbox"
                    name="pinned"
                    id="pinned"
                    onChange={this.onChange}
                    defaultChecked={project.pinned}
                  />
                  <label htmlFor="pinned">Display as pinned?</label>
                </section>
              </section>

              <section className={styles.buttons}>
                <input className={styles.submit} type="submit" value="Submit" disabled={this.state.sending} />
                <button type="button" onClick={this.delete}>Delete</button>
              </section>
            </form>

            {!this.state.new ?
              <section className={styles.assets}>
                <header><h2>Assets</h2></header>
                {project.assets.map(x => <AssetAdmin key={x.uuid} asset={x} project={project as unknown as ProjectQuery} stateChanger={this.stateChanger} />)}
                <AssetAdmin key="new" asset={undefined} project={project as unknown as ProjectQuery} stateChanger={this.stateChanger} />
              </section>
              : ""
            }
          </section>

          <section className={styles.markdownInput}>
            <header><h2>Markdown</h2></header>
            <textarea name="markdown" value={project.markdown || ""} onChange={this.onChange}></textarea>
          </section>

          <section className={styles.markdown}>
            <header><h2>Rendered Markdown</h2></header>
            {project.markdownParsed ? <MDXRemote {...project.markdownParsed} components={this.components} /> : ""}
          </section>
        </main>
      </>
    );
  }

  async componentDidMount(): Promise<void> {
    const result = await fetch(`${apiServer}/auth`, { credentials: "include", mode: "cors", method: "POST" })
      .then(x => { if (x.ok) return true; })
      .catch(() => false);

    this.updateMD();
    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }

  ResponsiveImage = (props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>): JSX.Element => {
    if (props.src?.endsWith(".mp4")) {
      return (<video controls><source src={props.src} type="video/mp4" /></video>);
    }
    return (<Image alt={props.alt} layout="fill" src={props.src as string} />);
  }
  LinkElement = (props: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>): JSX.Element => (<Link href={props.href as string}><a target="_blank">{props.children}</a></Link>);

  components = {
    img: this.ResponsiveImage,
    a: this.LinkElement,
  }

}

export default withRouter(AdminProject);

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const projectData = await fetch(`${apiServer}/project/${params?.id}`, { headers: { authorization: process.env.CLIENT_SECRET as string } })
    .then(x => x.ok ? x : false);

  const tagData = await fetch(`${apiServer}/tags`, { headers: { authorization: process.env.CLIENT_SECRET as string } })
    .then(x => x.ok ? x : false);

  const tags = tagData ? await tagData.json() as tag[] : [];
  let project: Project | Record<string, unknown> | undefined;

  if (projectData) {
    const data = await projectData.json() as ProjectQuery;
    project = data as unknown as Project;
    project.tags = data.tags.map(x => x.uuid);
    if (data.markdown) project.markdownParsed = await serialize(data.markdown as string);
  }

  if (!project) {
    if (params?.id !== "new") return { notFound: true };
    else project = {};
  }

  return {
    props: { tags, project },
  };
};


interface Props {
  router: NextRouter;
  tags: tag[];
  project: Project;
}

interface State {
  loading: boolean;
  failed: boolean;
  project: Project;
  new: boolean;
  sending: boolean;
}

interface link {
  name: string;
  url: string;
}

interface Project extends Omit<ProjectQuery, "tags" | "links"> {
  markdownParsed: MDXRemoteSerializeResult<Record<string, unknown>>
  tags: string[];
  links: link[];
}