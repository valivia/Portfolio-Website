use database::mongo::MongoRepo;

mod database;
mod models;
mod routes;

#[macro_use]
extern crate rocket;

#[launch]
async fn rocket() -> _ {
    let db = MongoRepo::init().await;
    let rocket = rocket::build().manage(db);
    routes::mount(rocket)
}
