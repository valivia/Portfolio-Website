#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use jwt_simple::prelude::*;
use rocket::serde::json::{json, Value};
use std::env;

mod db;
mod errors;
mod fairings;
mod lib;
mod models;
mod request_guards;
mod routes;

#[catch(404)]
fn not_found() -> Value {
    json!({
        "status": "error",
        "reason": "Resource was not found."
    })
}

#[launch]
fn rocket() -> _ {
    dotenv().ok();
    validate_env();

    let key_bytes = hex::decode(env::var("JWT_KEY").unwrap()).unwrap();
    let key = HS512Key::from_bytes(&key_bytes);

    let r = rocket::build()
        .register("/", catchers![not_found])
        .register("/", catchers![rocket_validation::validation_catcher])
        .manage(key)
        .attach(db::init())
        .attach(lib::mailing::init())
        .attach(fairings::cors::Cors);
    routes::mount(r)
}

fn validate_env() {
    env::var("MONGO_URI").expect("MONGO_URI is not found.");
    env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME is not found.");

    env::var("MAILING_HOST").expect("MAILING_PASS is not found.");
    env::var("MAILING_PORT").expect("MAILING_PORT is not found.");
    env::var("MAILING_USER").expect("MAILING_USER is not found.");
    env::var("MAILING_PASS").expect("MAILING_PASS is not found.");

    env::var("SERVER_URL").expect("SERVER_URL is not found.");
    env::var("TFA_TOKEN").expect("TFA_TOKEN is not found.");
    env::var("JWT_KEY").expect("JWT_KEY is not found.");

    env::var("AUTH_TIMEOUT")
        .expect("AUTH_TIMEOUT is not found.")
        .parse::<u64>()
        .expect("Invalid AUTH_TIMEOUT format");
}

// Unit testings
#[cfg(test)]
mod tests;
