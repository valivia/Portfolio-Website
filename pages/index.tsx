import NavBar from "@components/global/navbar.module";
import React, { ReactNode } from "react";
import styles from "@styles/index.module.scss";
import Head from "next/head";

export default function index(): ReactNode {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Portfolio website" />
      </Head>
      <NavBar />
      <main className={styles.subheader}>
      </main>
    </>
  );
}
