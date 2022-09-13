use rocket::Route;
use rocket_okapi::openapi_get_routes;

pub mod get;
pub mod post;
pub mod patch;
pub mod delete;

pub fn routes() -> Vec<Route> {
    openapi_get_routes![
        get::get_projects,
        post::post_project,
        get::get_project_by_id,
        patch::patch_project_by_id,
        delete::delete_project_by_id
    ]
}
