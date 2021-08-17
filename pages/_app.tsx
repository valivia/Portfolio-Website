import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import Head from "next/head"
import NavBar from '../components/navbar'

function app({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="Icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <Component {...pageProps} />
    </>
  )
}
export default app
