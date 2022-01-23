import NavBar from "../components/navbar";
import React, { ReactNode } from "react";
import styles from "../styles/contact.module.scss";
import form from "../styles/form.module.scss";
import Head from "next/head";
import Footer from "../components/footer.module";
import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

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

    const response = await fetch(`${cdn}/login`, {
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
    const result = await fetch(`${cdn}/auth`, { credentials: "include", mode: "cors", method: "POST" })
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
          <h1 className={styles.contactH1}>{this.state.error || "Login"}</h1>
          <form className={`${styles.form} ${styles.half}`} onSubmit={this.submit} >

            <div>
              <label>code:</label>
              <input
                className={form.input}
                type="text"
                name="code"
                onChange={this.handleChange}
                value={this.state.code}
                disabled={this.state.ratelimit}
                required />
            </div>

            <div>
              <input className={form.submit} type="submit" value="Login" />
            </div>

          </form>
        </main>

        <Footer />
      </>
    );
  }
}

export default withRouter(Login);