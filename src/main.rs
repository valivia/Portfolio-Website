#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use rocket::serde::json::{Value, json};
use rocket_okapi::swagger_ui::{make_swagger_ui, SwaggerUIConfig};

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
        .attach(db::init())
        .attach(fairings::cors::Cors)
        .mount(
            "/api-docs",
            make_swagger_ui(&SwaggerUIConfig {
                url: "../openapi.json".to_owned(),
                ..Default::default()
            }),
        );
    routes::mount(r)
}

// Unit testings
#[cfg(test)]
mod tests;
