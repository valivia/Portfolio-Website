import NavBar from "../components/navbar";
import Head from "next/head";
import styles from "../styles/contact.module.scss";
import React, { ReactNode } from "react";

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


  public submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    console.log(this.state);
    for (const x in this.state) this.setState({ [x]: "" });
    /*
    const res = fetch(url, {
      method: "POST",
      body: this.state,
    })
      .then(response => response);
      */
  }

  render(): ReactNode {
    return (
      <>
        <Head>
          <title>Contact</title>
        </Head>

        <NavBar />

        <main className={styles.contactContainer}>
          <h1 className={styles.contactH1}>Contact</h1> <br />
          <form className={styles.contactForm} onSubmit={this.submit}>
            <fieldset className={styles.fieldset}>
              <legend>Name:</legend>
              <input
                className={styles.textInput}
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
                className={styles.textInput}
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
                className={styles.textInput}
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
                className={styles.textInput}
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
                className={styles.textInput}
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
              <input className={styles.submit} type="submit" value="Submit" />
            </div>
          </form>
        </main>
      </>
    );
  }
}
