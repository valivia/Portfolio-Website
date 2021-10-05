import NavBar from "../components/navbar";
import index from "../styles/index.module.scss";
import Head from "next/head";
import React from "react";

export default function Browse(): JSX.Element {
  return (
    <>
      <Head>
        <title>About</title>
        <meta name="theme-color" content="#B5A691" />
      </Head>

      <NavBar />

      <div className={index.subheader}>
        <div>haii</div>
        <div>ᐯ</div>
      </div>
      <main>
    aaa
      </main>
    </>
  );
}
