import NavBar from "../components/navbar";
import Head from "next/head";
import styles from "../styles/contact.module.scss";
import form from "../styles/form.module.scss";
import React, { ReactNode } from "react";
import Footer from "../components/footer";

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default class contact extends React.Component {
  state = {
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  }

  public handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (event == null) return;
    this.setState({ [event.target.name]: event.target.value });
  }


  public submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const response = await fetch(`${cdn}/contact`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(this.state),
    });

    if (response.ok) {
      for (const x in this.state) this.setState({ [x]: "" });

      return;
    }
  }

  render(): ReactNode {
    return (
      <>
        <Head>
          <title>Contact</title>
        </Head>

        <NavBar />

        <main className={styles.main}>
          <h1 className={styles.contactH1}>Contact</h1> <br />
          <form className={styles.form} onSubmit={this.submit}>
            <fieldset className={styles.fieldset}>
              <legend>Name:</legend>
              <input
                className={form.input}
                type="text"
                name="firstName"
                placeholder="First name"
                autoComplete="given-name"
                minLength={2}
                maxLength={32}
                onChange={this.handleChange}
                value={this.state.firstName}
                required
              />

              <input
                className={form.input}
                type="text"
                name="lastName"
                placeholder="Last name"
                autoComplete="family-name"
                minLength={2}
                maxLength={32}
                onChange={this.handleChange}
                value={this.state.lastName}
                required
              />
            </fieldset>

            <div>
              <label htmlFor="email">Email: </label>
              <input
                className={form.input}
                type="email"
                name="email"
                placeholder="Email"
                onChange={this.handleChange}
                value={this.state.email}
                required
              />
            </div>

            <div>
              <label htmlFor="subject">Subject: </label>
              <input
                className={form.input}
                type="text"
                name="subject"
                placeholder="Subject"
                autoComplete="off"
                minLength={3}
                maxLength={32}
                onChange={this.handleChange}
                value={this.state.subject}
                required
              />
            </div>

            <div>
              <label htmlFor="message">Message: </label>
              <textarea
                className={form.input}
                name="message"
                placeholder="Message"
                autoComplete="off"
                minLength={16}
                maxLength={512}
                rows={6}
                onChange={this.handleChange}
                value={this.state.message}
                required
              ></textarea>
            </div>

            <div>
              <input className={form.submit} type="submit" value="Submit" />
            </div>
          </form>
        </main>

        <Footer />
      </>
    );
  }
}
