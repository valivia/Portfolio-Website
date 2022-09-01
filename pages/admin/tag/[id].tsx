import { GetServerSideProps } from "next";
import React, { ReactNode } from "react";
import { NextRouter, withRouter } from "next/router";
import { tag as Tag } from "@prisma/client";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class AdminTag extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      failed: false,
    };
  }

  public render = (): ReactNode => {
    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/login");
      return <></>;
    }
    return <></>;
  };

  async componentDidMount(): Promise<void> {
    const result = await fetch(`${apiServer}/auth`, {
      credentials: "include",
      mode: "cors",
      method: "POST",
    })
      .then((x) => {
        if (x.ok) return true;
      })
      .catch(() => false);

    if (result) this.setState({ loading: false });
    else this.setState({ loading: false, failed: true });
  }
}

export default withRouter(AdminTag);

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const tagData = await fetch(`${apiServer}/tag/${params?.id}`, {
    headers: { authorization: process.env.CLIENT_SECRET as string },
  });

  const tag = await tagData.json();

  return {
    props: { tag },
  };
};

interface Props {
  router: NextRouter;
  tag: Tag;
}

interface State {
  loading: boolean;
  failed: boolean;
}
