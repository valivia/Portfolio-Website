import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "@styles/admin.module.scss";
import List from "@components/admin/list.module";
import Search from "@components/admin/search.module";
import Selector from "@components/admin/selector.module";
import useProjects from "data/use_projects";
import { useRouter } from "next/router";
import useTags from "data/use_tags";

function Admin(): JSX.Element {
  const router = useRouter();
  const { loggedOut: loggedOutProjects, projects } = useProjects();
  const { loggedOut: loggedOutTags, tags } = useTags();

  const [query, setQuery] = useState("");
  const [path, setPath] = useState("project");

  useEffect(() => {
    const cookie = window.localStorage.getItem("adminPath");
    if (!cookie) return;
    setPath(cookie);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("adminPath", path);
  }, [path]);

  if (loggedOutProjects || loggedOutTags) {
    router.push("/login");
    return <></>;
  }

  function render(): JSX.Element {
    let list = [] as Entry[];
    if (path === "project") list = projects;
    if (path === "tag") list = tags;
    return (
      <>
        <Head>
          <title>admin panel</title>
          <meta name="theme-color" content="#B5A691" />
          <meta name="description" content="Admin panel" />
        </Head>
        <main className={styles.main}>
          <h1>Admin Panel</h1>
          <Selector path={path} setSearchSettings={setPath} />
          <Search path={path} search={setQuery} />
          <List path={path} entries={list} query={query} />
        </main>
      </>
    );
  }

  return render();
}

export default Admin;

interface Entry extends Record<string, any> {
  uuid: string;
  name: string;
  created: Date;
  description: string | null;
}
