import React, { ReactNode } from "react";
import Error from "./_error";

export default class NotFound extends React.Component {
  render(): ReactNode {
    return <Error statusCode={404}></Error>;
  }
}