use rocket::serde::json::Json;
use strum::IntoEnumIterator;

use crate::models::{project::Status, tag::Category};

#[get("/enum/project/status")]
pub fn status() -> Json<Vec<String>> {
    Json(Status::iter().map(|x| x.to_string()).collect())
}

#[get("/enum/tag/category")]
pub fn category() -> Json<Vec<String>> {
    Json(Category::iter().map(|x| x.to_string()).collect())
}

