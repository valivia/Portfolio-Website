use rocket::{Build, Rocket};

pub mod asset;
pub mod auth;
pub mod banner;
pub mod mail;
pub mod project;
pub mod tag;
pub mod webook;

pub fn mount(rocket: Rocket<Build>) -> Rocket<Build> {
    rocket.mount(
        "/",
        routes![
            // Project
            project::post::post,
            project::patch::patch,
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
            tag::delete::delete_icon,
            // Asset
            asset::delete::delete,
            asset::patch::patch,
            asset::post::post,
            // Banner
            banner::post::post,
            banner::delete::delete,
            // Mailing
            mail::post::signup,
            mail::post::send,
            mail::get::verify,
            mail::get::delete,
            // Auth
            auth::post::login,
            auth::get::qr,
            // Webhook
        ],
    )
}
