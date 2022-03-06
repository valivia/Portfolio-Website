import type { GetServerSideProps } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import Link from "next/link";
import React from "react";
import styles from "../../styles/admin.module.scss";
import { Project } from "../../types/types";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Admin extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
    };
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
          <Link href="/admin/new">+ new</Link>
          <ul>
            {this.props.projects.map(x => (<li key={x.uuid}><Link href={`/admin/${x.uuid}`} >{x.name}</Link></li>))}
          </ul>
        </main>
      </>
    );
  }

}

export default withRouter(Admin);

export interface Props {
  router: NextRouter;
  projects: Project[];
}

export interface State {
  loading: boolean;
  failed: boolean;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const projectData = await fetch(`${cdn}/project`, { headers: { authorization: process.env.CLIENT_SECRET as string } });
  const projects = await projectData.json() as Project;

  if (!projects) return { notFound: true };


  return {
    props: { projects },
  };
};