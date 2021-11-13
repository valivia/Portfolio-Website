import prisma from "@prisma/client";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import ContentCreate from "../components/admin/content.create.module";
import ProjectCreate from "../components/admin/project.create.module";
import styles from "../styles/admin.module.scss";
import formStyles from "../styles/form.module.scss";
import DeleteModule from "../components/admin/delete.module";
import { Project } from "../types/types";
import ContentEdit from "../components/admin/content.edit.module";
import ProjectEdit from "../components/admin/project.edit.module";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Admin extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      project: "new_project",
      response: undefined,
      cache: {},
      loading: true,
      failed: false,
    };
  }

  public submit = async (event: React.FormEvent<HTMLFormElement>, url: string, method: string, extra?: Record<string, string>): Promise<void> => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    let data = this.state.cache[form.id];

    if (extra) data = { ...data, ...extra };

    let body: FormData | string;

    if (method === "POST") {

      body = new FormData();

      for (const x in data) {
        if (x === "tags") (data[x] as string[]).forEach(y => (body as FormData).append(`${x}[]`, y));
        else body.append(x, data[x] as string | File);
      }

    } else {
      body = JSON.stringify(data);
    }

    let options = {
      method: method,
      mode: "cors",
      credentials: "include",
      body: body,
    } as RequestInit;

    if (method !== "POST") options = { ...options, headers: new Headers({ "Content-Type": "application/json" }) };

    const response = await fetch(`${cdn}/${url}`, options);

    if (response.ok) {
      if (form.id === "new_project") this.setState({ cache: { [form.id]: {} } });
    }

    this.setState({ response: { code: response.status, message: response.statusText } });

    setTimeout(() => {
      this.setState({ response: undefined });
    }, 3000);
  }

  public projectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uuid = e.target.value;
    const data = this.props.projects.find(x => x.uuid === uuid);
    if (!data || this.state.cache[uuid]) return this.setState({ project: uuid });

    const newData = { ...data, tags: data.tags.map(x => x.uuid), assets: null };

    let assets = {};
    data.assets.forEach(x => {
      assets = { ...assets, [x.uuid]: x };
    });

    this.setState({ project: uuid, cache: { ...this.state.cache, [uuid]: newData, ...assets } });
  }

  public onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value;

    const target = e.target;
    const form = target.form;

    if (!form) return;

    if (!this.state.cache[form.id]) this.setState({ cache: { [form.id]: {} } });

    if ("options" in target && target.multiple) {
      const options = (target as HTMLSelectElement).options;
      value = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
    } else if ("files" in target && target.type === "file") {
      if (!target.files) return;
      value = target.files[0];
    } else if ("checked" in target && target.type == "checkbox") {
      value = target.checked;
    } else {
      value = target.value;
    }

    this.setState({ cache: { ...this.state.cache, [form.id]: { ...this.state.cache[form.id], [target.name]: value } } });
  }

  async componentDidMount() {
    const result = await fetch(`${cdn}/auth`, { credentials: "include", mode: "cors", method: "POST" })
      .then(x => { if (x.ok) return true; })
      .catch(() => false);


    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }


  public render = (): JSX.Element => {

    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.push("/login");
      return <></>;
    }

    const currentProject = this.props.projects.find(x => x.uuid === this.state.project) as Project;
    return (
      <div className={styles.wrapper}>
        <Head>
          <title>admin panel</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Admin panel" />
        </Head>

        <menu className={styles.menu}>
          <div className={styles.status}>
            {this.state.response?.code} {this.state.response?.message}
          </div>
          <select className={formStyles.input} onChange={this.projectSelect} defaultValue="new_project">
            <option value="new_project">new project</option>
            {this.props.projects.map(project => <option key={project.uuid} value={project.uuid}>{project.name}</option>)}
          </select>
        </menu>

        <main className={styles.main}>
          {this.state.project === "new_project" ?
            <ProjectCreate onChange={this.onChange} onSubmit={this.submit} tags={this.props.tags} identifier="projectCreate" method="POST" state={this.state} />
            :
            <>
              <ProjectEdit onChange={this.onChange} onSubmit={this.submit} tags={this.props.tags} identifier={this.state.project} state={this.state} />
              <DeleteModule uuid={currentProject?.uuid} type="project" />

              {currentProject.assets.map(x => <ContentEdit key={x.uuid} identifier={x.uuid} onChange={this.onChange} onSubmit={this.submit} state={this.state} />)}

              <ContentCreate onChange={this.onChange} onSubmit={this.submit} uuid={currentProject.uuid} state={this.state} />
            </>
          }
        </main>
      </div>
    );
  }

}

export default withRouter(Admin);

export interface Props {
  router: NextRouter;
  projects: Project[];
  tags: prisma.tag[];
}

export interface State {
  loading: boolean;
  failed: boolean;
  project: string;
  response: response | undefined
  cache: Record<string, Record<string, string | string[] | boolean | File>>;
}

interface response {
  code: number;
  message: string;
}


export const getServerSideProps: GetServerSideProps = async () => {
  const projectData = await fetch(`${cdn}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as Project;

  const tagData = await fetch(`${cdn}/tags`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const tags = await tagData.json() as prisma.tag[];

  if (!projects || !tags) {
    return {
      notFound: true,
    };
  }

  return {
    props: { projects, tags },
  };
};