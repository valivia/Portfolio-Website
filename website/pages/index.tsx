import NavigationBarComponent from "@components/global/navbar.module";
import React, { ReactNode } from "react";
import Head from "next/head";

import banner from "../public/images/index_banner.jpg";
import SubHeaderComponent from "@components/global/subheader.module";

export default function index(): ReactNode {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Portfolio website" />
      </Head>
      <NavigationBarComponent />

      <SubHeaderComponent image={banner} />
    </>
  );
}
