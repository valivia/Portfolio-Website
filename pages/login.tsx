import NavBar from "../components/navbar";
import React, { ReactNode } from "react";
import styles from "../styles/contact.module.scss";
import form from "../styles/form.module.scss";
import Head from "next/head";
import Footer from "../components/footer";
import { withRouter } from "next/router";
import { WithRouterProps } from "next/dist/client/with-router";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

class Login extends React.Component<WithRouterProps> {
  state = { code: "" };
  error = "";
  ratelimit = false;

  public handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event == null) return;
    this.setState({ [event.target.name]: event.target.value });
  }


  public submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    this.state.code = this.state.code.replace(" ", "");

    const response = await fetch(`${cdn}/login`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(this.state),
    });

    if (!response.ok) {
      this.error = response.statusText;
      if (response.status === 429) this.ratelimit = true;
      for (const x in this.state) this.setState({ [x]: "" });
    } else {
      this.props.router.push("/admin");
    }
  }

  render(): ReactNode {
    return (
      <>
        <Head>
          <title>Login</title>
        </Head>

        <NavBar />

        <main className={styles.main}>
          <h1 className={styles.contactH1}>{this.error ? this.error : "Login"}</h1>
          <form className={`${styles.form} ${styles.half}`} onSubmit={this.submit} >

            <div>
              <label>code:</label>
              <input
                className={form.input}
                type="text"
                name="code"
                onChange={this.handleChange}
                value={this.state.code}
                disabled={this.ratelimit}
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