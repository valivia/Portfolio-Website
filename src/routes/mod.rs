use rocket::{Build, Rocket};

mod asset;
mod project;

pub fn mount(rocket: Rocket<Build>) -> Rocket<Build> {
    rocket
        .mount("/project", project::routes())
        .mount("/asset", asset::routes())
}
