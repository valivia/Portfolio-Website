import React, { ReactNode } from "react";
import styles from "./mailing.module.scss";
import submit from "@components/submit";
import Cookies from "js-cookie";

export default class MailingList extends React.Component<Record<string, never>, State> {
  state = { email: "" };

  onsubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const response = await submit(this.state, "mailing", "POST", "application/json");

    if (response.ok) {
      Cookies.set("emailList", "true");
      this.setState({ email: "" });
      alert("Email with instructions successfully sent!");
    } else if (response.status === 409) {
      Cookies.set("emailList", "true");
      this.setState({ email: "" });
      alert("You are already subscribed to the mailing list!");
    } else {
      alert("An error occurred");
    }
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ email: e.target.value });
  }

  render(): ReactNode {
    const emailList = Cookies.get("emailList");

    if (emailList) {
      return <></>;
    }

    return (
      <section className={styles.main} onSubmit={this.onsubmit}>
        <form className={styles.form}>
          <label>Sign up to the<br />mailing list</label>
          <input type="email" name="email" placeholder="Enter your email" onChange={this.onChange} value={this.state.email} />
          <input type="submit" value="subscribe" />
        </form>
      </section>
    );
  }
}

interface State {
  email: string;
}