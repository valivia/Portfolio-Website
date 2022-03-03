import { ApiError } from "next/dist/server/api-utils";
import Head from "next/head";
import React from "react";
import styles from "../styles/main.module.scss";

function Error({ statusCode }: { statusCode: string | number }): JSX.Element {
  return (
    <>
      <Head>
        <title>{statusCode}</title>
      </Head>
      <main className={`${styles.notfound} ${styles.noselect}`}>
        <h1>{statusCode}</h1>
        <p>{statusCode === 404 ? "Not found" : statusCode === 505 ? "If it's a seven-hour flight or a forty-five-minute drive" : "An error occurred"}</p>
      </main>
    </>
  );
}

Error.getInitialProps = ({ res, err }: { res: ApiError, err: ApiError }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
