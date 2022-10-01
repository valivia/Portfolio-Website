#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use jwt_simple::prelude::*;
use lib::env::validate_env;
use models::auth::LastLogin;
use rocket::serde::json::{json, Value};
use std::{sync::Arc, sync::Mutex};

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
    let env = validate_env();
    let key_bytes = hex::decode(&env.jwt_key).unwrap();
    let key = HS512Key::from_bytes(&key_bytes);

    let r = rocket::build()
        .register("/", catchers![not_found])
        .register("/", catchers![rocket_validation::validation_catcher])
        .manage(key)
        .manage(env)
        .manage(LastLogin {
            code: Arc::new(Mutex::new(String::from("000000"))),
        })
        .attach(db::init())
        .attach(lib::mailing::init())
        .attach(fairings::cors::Cors);
    routes::mount(r)
}
