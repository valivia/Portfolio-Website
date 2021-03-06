import NavBar from "@components/global/navbar.module";
import React, { ReactNode } from "react";
import styles from "@styles/contact.module.scss";
import Head from "next/head";
import Footer from "@components/global/footer.module";
import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";

const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

class Login extends React.Component<WithRouterProps> {
  state = { code: "", error: "", ratelimit: false, loading: true, failed: false };

  public handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event == null) return;
    this.setState({ code: event.target.value });
  }


  public submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    this.state.code = this.state.code.replace(" ", "");

    if (this.state.code.length > 6) {
      this.setState({ code: "", error: "invalid code" });
      return;
    }

    const code = Number(this.state.code);
    if (isNaN(code)) {
      this.setState({ code: "", error: "Not a number" });
      return;
    }

    const response = await fetch(`${apiServer}/login`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(this.state),
    });

    if (!response.ok) {
      let error = response.statusText;
      if (response.status === 403) error = "Invalid code";
      if (response.status === 429) this.setState({ ratelimit: true });
      this.setState({ error: error, code: "" });
    } else {
      this.props.router.push("/admin");
    }
  }

  async componentDidMount() {
    const result = await fetch(`${apiServer}/auth`, { credentials: "include", mode: "cors", method: "POST" })
      .then(x => { if (x.ok) return true; })
      .catch(() => false);


    if (result) this.setState({ loading: false, failed: true });
    else this.setState({ loading: false });
  }

  render(): ReactNode {

    if (this.state.loading) return <> </>;
    if (this.state.failed) {
      this.props.router.replace("/admin");
      return <></>;
    }

    return (
      <>
        <Head>
          <title>Login</title>
        </Head>

        <NavBar />

        <main className={styles.main}>
          <h1>{this.state.error || "Login"}</h1>
          <form className={styles.form} onSubmit={this.submit} >
            <section>
              <label>code:</label>
              <input
                type="text"
                name="code"
                onChange={this.handleChange}
                value={this.state.code}
                disabled={this.state.ratelimit}
                required />
            </section>

            <section>
              <input type="submit" value="Login" />
            </section>

          </form>
        </main>

        <Footer />
      </>
    );
  }
}

export default withRouter(Login);