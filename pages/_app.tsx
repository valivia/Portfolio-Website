import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode } from "react";

function app({ Component, pageProps }: AppProps): ReactNode {
  return (
    <>
      <Head>
        <link rel="Icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default app;
