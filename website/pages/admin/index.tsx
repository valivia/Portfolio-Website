import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import List, { Entry } from "@components/admin/index/list.module";
import Search from "@components/admin/index/search.module";
import Selector from "@components/admin/index/selector.module";
import useProjects from "data/use_projects";
import { useRouter } from "next/router";
import useTags from "data/use_tags";
import Cookies from "js-cookie";
import { GetServerSideProps } from "next";

function Admin(): JSX.Element {
  const router = useRouter();
  const { loggedOut: loggedOutProjects, projects } = useProjects();
  const { loggedOut: loggedOutTags, tags } = useTags();

  const [query, setQuery] = useState("");
  const [path, setPath] = useState("");

  // Load last path from local storage on load.
  useEffect(() => {
    const cookie = window.localStorage.getItem("adminPath");
    if (cookie === null) setPath("project");
    else setPath(cookie);
  }, []);

  // Update path in state and local storage on change.
  function updatePath(newPath: string) {
    window.localStorage.setItem("adminPath", newPath);
    setPath(newPath);
  }

  if (loggedOutProjects || loggedOutTags) {
    Cookies.remove("token");
    router.push("/login");
    return <></>;
  }

  // Set data set.
  let list = [] as Entry[];
  if (path === "project") list = projects;
  if (path === "tag") list = tags;

  // Return the JSX.
  return (
    <>
      <Head>
        <title>admin panel</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Admin panel" />
      </Head>
      <main className={styles.main}>
        <h1>Admin Panel</h1>
        <Selector path={path} setSearchSettings={updatePath} />
        <Search path={path} search={setQuery} />
        <List path={path} entries={list} query={query} />
      </main>
    </>
  );
}

export default Admin;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

  // Check auth. (this is fine i promiseeeeee (the actual api POST endpoints have proper auth))
  if (req.cookies.token === undefined) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  } else return { props: {} };

};
