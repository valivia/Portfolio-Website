use rocket::{Build, Rocket};

pub mod project;

pub fn mount(rocket: Rocket<Build>) -> Rocket<Build> {
    rocket.mount("/project", project::routes())
}
