import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import Head from "next/head"

function app({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="Icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
export default app
