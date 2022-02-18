import NavBar from "../components/navbar";
import React, { ReactNode } from "react";
import styles from "../styles/index.module.scss";
import stylesMain from "../styles/main.module.scss";

export default function index(): ReactNode {
  return (
    <>
      <NavBar />
      <div className={`${styles.subheader} ${stylesMain.subheader}`}>
      </div>
    </>
  );
}
