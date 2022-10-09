import React, { useState } from "react";
import styles from "./mailing.module.scss";
import { submitJson } from "@components/submit";

export default function MailingList(): JSX.Element | null {
  const [email, setEmail] = useState("");
  const [isClosed, setClosed] = useState(false);

  // Send email to server.
  const onsubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const response = await submitJson({ email }, "mailing/signup", "POST");

    if (response.status === 200 || response.status === 409) {
      window.localStorage.setItem("emailList", "true");
      setEmail("");
      setClosed(true);
      response.status === 200 ?
        alert("Email with instructions successfully sent!") :
        alert("You are already subscribed to the mailing list!");
    } else {
      alert("An error occurred");
    }
  };

  // Close component and save preference.
  const dismiss = (): void => {
    window.localStorage.setItem("emailList", "true");
    setEmail("");
    setClosed(true);
  };


  if (typeof window !== "undefined" && window.localStorage.getItem("emailList") !== null) return null;
  if (isClosed) return null;

  // return JSX.
  return (
    <div className={styles.main}>

      <form className={styles.form} onSubmit={onsubmit}>
        <label>
          Sign up to the
          <br />
          mailing list
        </label>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={e => setEmail(e.target.value)}
          value={email}
        />

        <input type="submit" value="subscribe" />

      </form>

      <button
        className={styles.dismiss}
        type="button"
        onClick={dismiss}
      >
        &#x2716;
      </button>

    </div>
  );
}