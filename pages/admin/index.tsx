import type { GetServerSideProps } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import styles from "@styles/admin.module.scss";
import { ExtendedProject } from "@typeFiles/extended_project.type";
import { tag } from "@prisma/client";
import List from "@components/admin/list.module";
import Search from "@components/admin/search.module";
import Selector from "@components/admin/selector.module";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class Admin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
      search: {
        list: this.props.projects,
        result: this.props.projects,
        path: "project",
      },
    };
  }

  async componentDidMount() {
    const result = await fetch(`${apiServer}/auth`, {
      credentials: "include",
      mode: "cors",
      method: "POST",
    })
      .then((x) => {
        if (x.ok) return true;
      })
      .catch(() => false);

    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }

  public search = async (value: string) => {
    const search = this.state.search;
    value = value.toLowerCase();

    const result = search.list.filter((entry) => {
      if (entry.name.toLowerCase().includes(value)) return true;
      if (entry.description?.toLowerCase().includes(value)) return true;
      if (entry.markdown?.toLowerCase().includes(value)) return true;
      if (entry.tags?.find((x: tag) => x.name.toLowerCase().includes(value)))
        return true;
    });

    this.setState({ search: { ...search, result } });
  };

  public setSearchSettings = (path: string) => {
    let list: searchEntry[] = [];

    if (path === "project") {
      list = this.props.projects;
    } else if (path === "tag") {
      list = this.props.tags;
    }
    const search = {
      list,
      result: list,
      path,
    };

    this.setState({ search });
  };

  public render = (): JSX.Element => {
    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/login");
      return <></>;
    }

    const search = this.state.search;

    return (
      <>
        <Head>
          <title>admin panel</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Admin panel" />
        </Head>
        <main className={styles.main}>
          <h1>Admin Panel</h1>
          <Selector
            path={search.path}
            setSearchSettings={this.setSearchSettings}
          />
          <Search path={search.path} search={this.search} />
          <List path={search.path} entries={search.result} />
        </main>
      </>
    );
  };
}

export default withRouter(Admin);

export interface Props {
  router: NextRouter;
  projects: ExtendedProject[];
  tags: tag[];
}

export interface State {
  loading: boolean;
  failed: boolean;
  search: {
    list: searchEntry[];
    result: searchEntry[];
    path: string;
  };
}

interface searchEntry extends Record<string, any> {
  uuid: string;
  name: string;
  created: Date;
  description: string | null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const projectData = await fetch(`${apiServer}/project`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  });
  const projects = (await projectData.json()) as ExtendedProject;

  const tagData = await fetch(`${apiServer}/experience`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  });
  const tags = (await tagData.json()) as ExtendedProject;

  if (!projects) return { notFound: true };
  if (!tags) return { notFound: true };

  return {
    props: { projects, tags },
  };
};
