import NavBar from '../components/navbar'
import Head from "next/head"
import React from 'react'

import styles from "../styles/main.module.scss"

const cdn = process.env.NEXT_PUBLIC_CDN_SERVER

export default class notFound extends React.Component {
    render() {
        return (
            <>
                <Head>
                    <title>404</title>
                </Head>
                <main className={`${styles.notfound} ${styles.noselect}`}>
                    <h1>404</h1>
                    <p>not found</p>
                </main>
            </>
        )
    }
}