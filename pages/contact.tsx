import NavBar from '../components/navbar'
import Head from "next/head"
import styles from "../styles/contact.module.scss"

const Browse = () => {
    return (
        <>
            <Head>
                <title>Contact</title>
            </Head>
            <main className={styles.contactContainer}>
                <h1 className={styles.contactH1}>Contact</h1> <br />
                <form className={styles.contactForm} /*onSubmit={submit(this)}*/>
                    <fieldset className={styles.fieldset}>
                        <legend>Name:</legend>
                        <input className={styles.textInput} type="text" name="firstName" id="firstName" placeholder="First name" autoComplete="given-name"
                            minLength={2} maxLength={32} required />
                        <input className={styles.textInput} type="text" name="lastName" id="lastName" placeholder="Last name" autoComplete="family-name"
                            minLength={2} maxLength={32} required />
                    </fieldset>

                    <div>
                        <label htmlFor="email">Email: </label>
                        <input className={styles.textInput} type="email" name="email" id="email" placeholder="Email" required />
                    </div>

                    <div>
                        <label htmlFor="subject">Subject: </label>
                        <input className={styles.textInput} type="text" name="subject" id="subject" placeholder="Subject" autoComplete="off" minLength={3} maxLength={32} required />
                    </div>

                    <div>
                        <label htmlFor="message">Message: </label>
                        <textarea className={styles.textInput} name="message" id="message" placeholder="Message" autoComplete="off" minLength={16} maxLength={512}
                            rows={6} required></textarea>
                    </div>

                    <div>
                        <input className={styles.submit} type="submit" value="Submit" />
                    </div>
                </form>
            </main>
        </>
    )
}

export default Browse


/*
const submit = async (event: unknown) => {
event.preventDefault()

const data = new URLSearchParams();

for (const pair of new FormData(form)) {
    data.append(pair[0], pair[1]);
}

const response = await sendData("/contact", data);

if (response.ok) {
    event.target.reset()
    window.alert("Email sent!");
}
else window.alert(response.statusText);

}


async function sendData(url: string, data: URLSearchParams) {
return fetch(url, {
    method: 'POST',
    body: data
})
    .then(response => response)
}
*/