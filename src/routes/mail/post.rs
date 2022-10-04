use std::env;

use crate::{
    db::mailing::{self, find},
    errors::{database::DatabaseError, response::CustomError},
    lib::mailing::make_email,
    HTTPErr,
};
use bson::oid::ObjectId;
use lettre::SmtpTransport;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::{Validate, Validated};
use serde::{Deserialize, Serialize};

use lettre::Transport;

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct SignupInput {
    #[validate(email)]
    email: String,
}

#[post("/mailing/signup", data = "<input>")]
pub async fn signup(
    db: &State<Database>,
    mailer: &State<SmtpTransport>,
    input: Validated<Json<SignupInput>>,
) -> Result<(), CustomError> {
    let address = input.0.email.to_owned();

    let oid = mailing::insert(db, address.clone())
        .await
        .map_err(|err| match err {
            DatabaseError::Duplicate => {
                CustomError::build(409, Some("This email already exists in our database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    send_email(mailer, oid, address)?;

    Ok(())
}

fn send_email(mailer: &SmtpTransport, oid: ObjectId, address: String) -> Result<(), CustomError> {
    let body = format!(
        "Please click the following link to verify your subscription: \n\n {}/mailing/verify/{}",
        env::var("API_URL").unwrap(),
        oid
    );

    let message = make_email()
        .to(HTTPErr!(address.parse(), 400, Some("Failed to parse this email")))
        .subject("🦉 Verify your subscription.")
        .body(body)
        .map_err(|err| {
            eprintln!("{}", err);
            CustomError::build(500, Some("Couldn't construct email"))
        })?;

    mailer.send(&message).map_err(|err| {
        eprintln!("{}", err);
        CustomError::build(500, None)
    })?;

    Ok(())
}

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct SendInput {
    #[validate(length(min = 3, max = 32))]
    subject: String,
    #[validate(length(min = 12, max = 32_768))]
    body: String,
}

#[post("/mailing/send", data = "<input>")]
pub async fn send(
    db: &State<Database>,
    mailer: &State<SmtpTransport>,
    input: Validated<Json<SendInput>>,
) -> Result<String, CustomError> {
    todo!();

    let input = input.into_inner();
    let emails = find(db)
        .await
        .map_err(|_| CustomError::build(500, Some("Unexpected server error.")))?;

    let message_template = make_email().subject(format!("🦉 {}", input.subject));

    for email in emails.iter() {
        let message = message_template
            .clone()
            .to(HTTPErr!(
                email.email.parse(),
                400,
                Some("Failed to parse this email")
            ))
            .body(input.body.to_owned())
            .map_err(|err| {
                eprintln!("{}", err);
                CustomError::build(500, Some("Invalid email body"))
            })?;

        mailer.send(&message).map_err(|err| {
            eprintln!("{}", err);
            CustomError::build(500, None)
        })?;
    }

    Ok(emails.len().to_string())
}
