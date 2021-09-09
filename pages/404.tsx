import Head from "next/head";
import React, { ReactNode } from "react";

import styles from "../styles/main.module.scss";

export default class notFound extends React.Component {
  render(): ReactNode {
    return (
      <>
        <Head>
          <title>404</title>
        </Head>
        <main className={`${styles.notfound} ${styles.noselect}`}>
          <h1>404</h1>
          <p>not found</p>
        </main>
      </>
    );
  }
}