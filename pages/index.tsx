import NavBar from "@components/global/navbar.module";
import React, { ReactNode } from "react";
import Head from "next/head";
import Image from "next/image";

const MEDIASERVER = process.env.NEXT_PUBLIC_MEDIA_SERVER;

export default function index(): ReactNode {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta name="theme-color" content="#B5A691" />
        <meta name="description" content="Portfolio website" />
      </Head>
      <NavBar />
      <Image
        src={`${MEDIASERVER}/content/b5385d43-83a6-4f90-a092-0eacade08ceb_default.jpg`}
        alt=""
        layout="fill"
        width={3840}
        height={2160}
        objectFit="cover"
        objectPosition="center"
        quality={95}
      />
    </>
  );
}
