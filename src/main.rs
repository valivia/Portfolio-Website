#[macro_use]
extern crate rocket;

use dotenv::dotenv;
use rocket_okapi::swagger_ui::{make_swagger_ui, SwaggerUIConfig};

mod db;
mod errors;
mod fairings;
mod models;
mod request_guards;
mod routes;

#[launch]
fn rocket() -> _ {
    dotenv().ok();
    let r = rocket::build()
        .attach(db::init())
        .attach(fairings::cors::CORS)
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
