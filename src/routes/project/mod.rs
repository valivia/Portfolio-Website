use rocket::Route;

mod get;
mod post;

pub fn routes() -> Vec<Route> {
    routes![get::get_projects, post::post_project]
}
