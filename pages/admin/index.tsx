import type { GetServerSideProps } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import styles from "@styles/admin.module.scss";
import { ExtendedProject } from "@typeFiles/extended_project.type";
import ProjectAdmin from "@components/admin_project/project.module";
import Link from "next/link";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class Admin extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
      projects: this.props.projects,
    };
  }

  async componentDidMount() {
    const result = await fetch(`${apiServer}/auth`, { credentials: "include", mode: "cors", method: "POST" })
      .then(x => { if (x.ok) return true; })
      .catch(() => false);


    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }

  public search = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    const { projects } = this.props;
    const result = [];
    value = value.toLowerCase();

    for (const project of projects) {
      if (project.name.toLowerCase().includes(value)
        || project.description?.toLowerCase().includes(value)
        || project.markdown?.toLowerCase().includes(value)
        || project.tags.find(x => x.name.toLowerCase().includes(value))
      ) result.push(project);
    }

    this.setState({ projects: result });
  }

  public render = (): JSX.Element => {

    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/login");
      return <></>;
    }

    return (
      <>
        <Head>
          <title>admin panel</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Admin panel" />
        </Head>
        <main className={styles.main}>
          <h1>Admin Panel</h1>
          <section className={styles.menu}>
            <Link href="/admin/experience">Experiences</Link>
            <Link href="/admin/markdown">Markdown</Link>
          </section>
          <section>
            <input className={styles.search} onInput={this.search} type="text" placeholder="search" />
            <Link href="/admin/project/new" ><a>+</a></Link>
          </section>
          <ProjectAdmin projects={this.state.projects} />
        </main>
      </>
    );
  }

}

export default withRouter(Admin);

export interface Props {
  router: NextRouter;
  projects: ExtendedProject[];
}

export interface State {
  loading: boolean;
  failed: boolean;
  projects: ExtendedProject[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const projectData = await fetch(`${apiServer}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as ExtendedProject;

  if (!projects) return { notFound: true };


  return {
    props: { projects },
  };
};