use rocket::{Build, Rocket};
use rocket_okapi::openapi_get_routes;

pub mod asset;
pub mod project;
pub mod tag;

pub fn mount(rocket: Rocket<Build>) -> Rocket<Build> {
    rocket
        .mount(
            "/",
            openapi_get_routes![
                // Project
                project::get::get_all,
                project::get::get_by_id,
                project::delete::delete,
                // Tag
                tag::post::post,
                tag::get::get_all,
                tag::patch::patch,
                tag::get::get_by_id,
                tag::delete::delete,
                tag::post::post_icon,
                // Asset
                asset::delete::delete,
                asset::patch::patch,
            ],
        )
        .mount(
            "/",
            routes![
                asset::post::post,
                project::post::post,
                project::patch::patch,
            ],
        )
}
