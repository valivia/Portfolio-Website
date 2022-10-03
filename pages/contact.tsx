import NavBar from "@components/global/navbar.module";
import Head from "next/head";
import styles from "@styles/contact.module.scss";
import React, { ReactNode } from "react";
import Footer from "@components/global/footer.module";
import { submitJson } from "../components/submit";

export default class contact extends React.Component<State> {
  state = {
    sending: false,
    form: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  };

  public handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    this.setState({
      form: { ...this.state.form, [event.target.name]: event.target.value },
    });
  };

  public onSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    this.setState({ sending: true });

    const response = await submitJson(
      this.state.form as unknown as Record<string, string>,
      "/contact",
      "POST"
    );

    if (response.status === 200) {
      alert("Email successfully sent!");
      this.setState({ form: {} });
      return;
    } else alert(response.message || "Unknown error");

    this.setState({ sending: false });
  };

  render(): ReactNode {
    const formData = this.state.form;

    return (
      <>
        <Head>
          <title>Contact</title>
        </Head>

        <NavBar />

        <main className={styles.main}>
          <h1>Contact</h1> <br />
          <form onSubmit={this.onSubmit} className={styles.form}>
            <fieldset>
              <legend>Name:</legend>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                autoComplete="given-name"
                minLength={2}
                maxLength={32}
                onChange={this.handleChange}
                value={formData.firstName}
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                autoComplete="family-name"
                minLength={2}
                maxLength={32}
                onChange={this.handleChange}
                value={formData.lastName}
                required
              />
            </fieldset>

            <section>
              <label htmlFor="email">Email: </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={this.handleChange}
                value={formData.email}
                required
              />
            </section>

            <section>
              <label htmlFor="subject">Subject: </label>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                autoComplete="off"
                minLength={3}
                maxLength={32}
                onChange={this.handleChange}
                value={formData.subject}
                required
              />
            </section>

            <section>
              <label htmlFor="message">Message: </label>
              <textarea
                name="message"
                placeholder="Message"
                autoComplete="off"
                minLength={16}
                maxLength={512}
                rows={6}
                onChange={this.handleChange}
                value={formData.message}
                required
              ></textarea>
            </section>

            <section>
              <input
                type="submit"
                value="Submit"
                disabled={this.state.sending}
              />
            </section>
          </form>
        </main>

        <Footer />
      </>
    );
  }
}

interface State {
  form: FormInputs;
  sending: boolean;
}

interface FormInputs {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}
