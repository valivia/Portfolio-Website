use std::env;

use crate::{
    db::mailing,
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
pub struct Input {
    #[validate(email)]
    email: String,
}

#[post("/mailing", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    mailer: &State<SmtpTransport>,
    input: Validated<Json<Input>>,
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
        env::var("SERVER_URL").expect("SERVER_URL is not found."),
        oid
    );

    let message = make_email()
        .to(HTTPErr!(address.parse(), 400, "Failed to parse this email"))
        .subject("🦉 Verify your subscription.")
        .body(body)
        .map_err(|err| {
            eprintln!("{}", err);
            CustomError::build(500, Some("Couldn't construct email"))
        })?;

    mailer.send(&message).map_err(|err| {
        eprintln!("{}", err);
        CustomError::build(500, Some("A server error occured"))
    })?;

    Ok(())
}
