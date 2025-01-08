import "@styles/globals.scss";
import "@styles/button.scss";
import "@styles/input.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode } from "react";
import { SWRConfig } from "swr";

function app({ Component, pageProps }: AppProps): ReactNode {
  return (
    <>
      <Head>
        <link rel="Icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width"></meta>
      </Head>
      <SWRConfig
        value={{
          fetcher: (url: string) => fetch(url).then((res) => res.json()),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}

export default app;
