use rocket::Route;
pub mod post;

pub fn routes() -> Vec<Route> {
    routes![post::post_asset]
}
