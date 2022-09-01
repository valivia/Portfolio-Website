import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { ReactNode } from "react";
import { ProjectQuery } from "@typeFiles/api_project.type";
import styles from "@styles/admin.project.module.scss";
import { NextRouter, withRouter } from "next/router";
import { project_status, tag } from "@prisma/client";
import Link from "next/link";
import AssetAdmin from "@components/admin_project/asset.module";
import onChangeParser from "@components/onchange";
import { submitJson } from "@components/submit";
import Multiselector from "@components/admin_project/multiselector.module";
import TextInput from "@components/form/text_input.module";
import TextArea from "@components/form/textarea.module";
import Checkbox from "@components/form/checkbox.module";
import Markdown from "@components/admin_project/markdown.module";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class AdminProject extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let project: Project | Record<string, unknown> = {
      name: "",
      tags: [],
      assets: [],
      status: this.props.status[0],
    };

    if (Object.keys(props.project).length !== 0) project = props.project;

    this.state = {
      project: project as Project,
      new: this.props.router.query.id == "new",
      sending: false,
    };
  }

  public onChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value = onChangeParser(target);
    this.setState({ project: { ...this.state.project, [target.name]: value } });
  };

  public multiselectorChange = (selected: { uuid: string; name: string }[]) => {
    this.setState({ project: { ...this.state.project, tags: selected } });
  };

  public onSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    this.setState({ sending: true });

    const submitData = this.state.project as unknown as SubmitProject;
    submitData.tags = this.state.project.tags.map((x) => x.uuid);

    const method = this.state.new ? "POST" : "PATCH";

    const response = await submitJson(
      submitData as unknown as Record<string, unknown>,
      "project",
      method
    );

    if (response.status !== 200) {
      alert(response.message || "Unknown error");
      this.setState({ sending: false });
      return;
    }

    const { project } = response.data;

    if (this.state.new)
      await this.props.router.push(`/admin/project/${project.uuid}`);
    else {
      this.setState({ project: response.data.project });
      alert("Project updated");
    }

    this.setState({ sending: false });
  };

  public delete = async (): Promise<void> => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    if (this.state.new) {
      this.setState({ project: {} as Project });
      return;
    }
    const response = await submitJson(
      { uuid: this.state.project.uuid },
      "project",
      "DELETE"
    );

    if (response.status !== 200) return;

    await this.props.router.push("/admin");
  };

  public confirmProceed = (event: { preventDefault: () => void }): void => {
    const current = this.state.project;
    // const original = this.props.project;
    if (
      this.state.new &&
      Object.entries(current).find((x) => x[1] !== "") == undefined
    )
      return;

    if (confirm("Are you sure you want to proceed?")) return;
    event.preventDefault();
  };

  public stateChanger = (project: Project) => {
    this.setState({ project });
  };

  public render = (): ReactNode => {
    const project = this.state.project;

    return (
      <>
        <Head>
          <title>{project.name === "" ? "New Project" : project.name}</title>
          <meta name="theme-color" content="#B5A691" />
        </Head>
        <main className={styles.main}>
          <header>
            <Link href="/admin">
              <a onClick={this.confirmProceed}>〈</a>
            </Link>
            <Link href={`/project/${project.uuid}`}>
              <a onClick={this.confirmProceed}>Project</a>
            </Link>
          </header>

          <section className={styles.mainInput}>
            <header>
              <h2>Project</h2>
            </header>
            <form className={styles.form} onSubmit={(x) => this.onSubmit(x)}>
              <TextInput
                name={"name"}
                value={project.name}
                onChange={this.onChange}
              />

              <TextArea
                name={"description"}
                value={project.description}
                onChange={this.onChange}
                maxLength={1024}
              />

              <section>
                <label>Date</label>
                <input
                  type="date"
                  name="created"
                  onChange={this.onChange}
                  defaultValue={
                    new Date(project.created).toLocaleDateString("en-CA") ||
                    new Date().toLocaleDateString("en-CA")
                  }
                  required
                ></input>
              </section>

              <section>
                <label>Status:</label>
                <select
                  name="status"
                  onChange={this.onChange}
                  value={project.status || this.props.status[0]}
                  required
                >
                  {this.props.status.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </section>

              <section>
                <label>Tags:</label>
                <Multiselector
                  options={this.props.tags}
                  selected={this.state.project.tags || []}
                  onChange={this.multiselectorChange}
                />
              </section>

              <section className={styles.checkbox}>
                <Checkbox
                  name={"projects"}
                  text={"Display on projects page?"}
                  value={project.projects}
                  onChange={this.onChange}
                />

                <Checkbox
                  name={"pinned"}
                  text={"Display as pinned?"}
                  value={project.pinned}
                  onChange={this.onChange}
                />
              </section>

              <section className={styles.buttons}>
                <input
                  className={styles.submit}
                  type="submit"
                  value="Submit"
                  disabled={this.state.sending}
                />
                <button type="button" onClick={this.delete}>
                  Delete
                </button>
              </section>
            </form>

            {!this.state.new ? (
              <section className={styles.assets}>
                <header>
                  <h2>Assets</h2>
                </header>
                <AssetAdmin
                  key="new"
                  asset={undefined}
                  project={project as unknown as ProjectQuery}
                  stateChanger={this.stateChanger}
                />
                {project.assets.map((x) => (
                  <AssetAdmin
                    key={x.uuid}
                    asset={x}
                    project={project as unknown as ProjectQuery}
                    stateChanger={this.stateChanger}
                  />
                ))}
              </section>
            ) : (
              ""
            )}
          </section>

          <section className={styles.markdownInput}>
            <h2>Markdown</h2>
            <textarea
              name="markdown"
              value={project.markdown || ""}
              onChange={this.onChange}
            ></textarea>
          </section>

          <section className={styles.markdown}>
            <h2>Rendered Markdown</h2>
            <Markdown value={project.markdown} />
          </section>
        </main>
      </>
    );
  };
}

export default withRouter(AdminProject);

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  // Check auth. (this is fine i promiseeeeee (the actual api POST endpoints have proper auth))
  if (req.cookies.session === undefined) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

  const headers = {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  };

  const projectData = await fetch(
    `${apiServer}/project/${params?.id}`,
    headers
  ).then((x) => (x.ok ? x : false));

  const tagData = await fetch(`${apiServer}/tags`, headers).then((x) =>
    x.ok ? x : false
  );

  const statusData = await fetch(
    `${apiServer}/enum/project/status`,
    headers
  ).then((x) => (x.ok ? x : false));

  const tags = tagData ? ((await tagData.json()) as tag[]) : [];
  const status = statusData ? ((await statusData.json()) as string[]) : [];
  let project: Project | Record<string, unknown> | undefined;

  if (projectData) {
    const data = (await projectData.json()) as ProjectQuery;
    project = data as unknown as Project;
  }

  if (!project) {
    if (params?.id !== "new") return { notFound: true };
    else project = {};
  }

  return {
    props: { tags, project, status },
  };
};

interface Props {
  router: NextRouter;
  tags: tag[];
  status: project_status[];
  project: Project | Record<string, never>;
}

interface State {
  project: Project;
  new: boolean;
  sending: boolean;
}

interface Project extends Omit<ProjectQuery, "tags" | "links"> {
  tags: { uuid: string; name: string }[];
}
interface SubmitProject extends Omit<Project, "tags"> {
  tags: string[];
}
