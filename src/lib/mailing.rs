use std::env;
use std::time::Duration;

use anyhow::Result;
use lettre::message::MessageBuilder;
use lettre::transport::smtp::authentication::Credentials;
use lettre::transport::smtp::PoolConfig;
use lettre::Message;
use lettre::SmtpTransport;
use rocket::fairing::AdHoc;

pub fn init() -> AdHoc {
    AdHoc::on_ignite("Connecting to mailing server", |rocket| async {
        match connect().await {
            Ok(mailing) => rocket.manage(mailing),
            Err(error) => {
                panic!("Cannot connect to instance:: {:?}", error)
            }
        }
    })
}

async fn connect() -> Result<SmtpTransport> {
    let creds = Credentials::new(
        env::var("MAILING_USER").expect("MAILING_USER is not found."),
        env::var("MAILING_PASS").expect("MAILING_PASS is not found."),
    );

    let pool_config = PoolConfig::default();

    let mailer =
        SmtpTransport::relay(&env::var("MAILING_HOST").expect("MAILING_PASS is not found."))?
            .timeout(Some(Duration::new(5, 0)))
            .credentials(creds)
            .port(
                env::var("MAILING_PORT")
                    .expect("MAILING_PORT is not found.")
                    .parse()
                    .unwrap(),
            )
            .pool_config(pool_config)
            .build();

    println!("Mailing server connected!");

    Ok(mailer)
}

pub fn make_email() -> MessageBuilder {
    Message::builder().from(
        env::var("MAILING_FROM")
            .expect("MAILING_FROM is not found.")
            .parse()
            .unwrap(),
    )
}
