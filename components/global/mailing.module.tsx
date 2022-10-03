import React, { ReactNode } from "react";
import styles from "./mailing.module.scss";
import { submitJson } from "@components/submit";

export default class MailingList extends React.Component<
  Record<string, never>,
  State
> {
  state = { email: "" };

  onsubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const response = await submitJson(this.state, "mailing", "POST");

    if (response.status === 200) {
      window.localStorage.setItem("emailList", "true");
      this.setState({ email: "" });
      alert("Email with instructions successfully sent!");
    } else if (response.status === 409) {
      window.localStorage.setItem("emailList", "true");
      this.setState({ email: "" });
      alert("You are already subscribed to the mailing list!");
    } else {
      alert("An error occurred");
    }
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ email: e.target.value });
  };

  dismiss = (): void => {
    window.localStorage.setItem("emailList", "true");
    this.setState({ email: "" });
  };

  render(): ReactNode {
    if (typeof window === "undefined") return <></>;
    const emailList = window.localStorage.getItem("emailList");

    if (emailList) {
      return null;
    }

    return (
      <section className={styles.main} onSubmit={this.onsubmit}>
        <form className={styles.form}>
          <label>
            Sign up to the
            <br />
            mailing list
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={this.onChange}
            value={this.state.email}
          />
          <input type="submit" value="subscribe" />
        </form>
        <button className={styles.dismiss + " exclude"} onClick={this.dismiss}>
          &#x2716;
        </button>
      </section>
    );
  }
}

interface State {
  email: string;
}
