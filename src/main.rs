#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use rocket::serde::json::{Value, json};

mod db;
mod errors;
mod fairings;
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
    let r = rocket::build()
        .register("/", catchers![not_found])
        .register("/", catchers![rocket_validation::validation_catcher])
        .attach(db::init())
        .attach(fairings::cors::Cors);
    routes::mount(r)
}

// Unit testings
#[cfg(test)]
mod tests;
