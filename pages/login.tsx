import NavigationBarComponent from "@components/global/navbar.module";
import React, { useState } from "react";
import styles from "@styles/contact.module.scss";
import Head from "next/head";
import Footer from "@components/global/footer.module";
import { useRouter } from "next/router";
import { submitJson } from "@components/submit";
import { GetServerSideProps } from "next";

export default function Login(): JSX.Element {

  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [ratelimit, setRatelimit] = useState(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const parsedCode = code.replace(" ", "");

    if (parsedCode.length !== 6) {
      setCode("");
      setError("Invalid code format");
      return;
    }

    if (isNaN(Number(parsedCode))) {
      setCode("");
      setError("Code is not numeric");
      return;
    }

    const response = await submitJson({ code: parsedCode }, "auth/login", "POST");

    if (response.status !== 200) {
      let errorMessage = response.message ?? "Unknown error";
      if (response.status === 403) errorMessage = "Invalid code";
      if (response.status === 429) setRatelimit(true);
      setError(errorMessage);
      setCode("");
    } else {
      router.replace("/admin");
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <NavigationBarComponent />

      <main className={styles.main}>
        <h1>{error || "Login"}</h1>
        <form className={styles.form} onSubmit={submit}>
          <section>
            <label>code:</label>
            <input
              type="text"
              name="code"
              onChange={(e) => setCode(e.target.value)}
              value={code}
              disabled={ratelimit}
              required
            />
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

  // Check auth. (this is fine i promiseeeeee (the actual api POST endpoints have proper auth))
  if (req.cookies.token !== undefined) {
    return {
      redirect: {
        destination: "/admin",
        permanent: true,
      },
    };
  } else return { props: {} };

};
