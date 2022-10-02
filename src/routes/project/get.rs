use crate::db::project;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::Project;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

#[get("/project?<limit>&<page>")]
pub async fn get_all(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Response<Vec<Project>> {
    if let Some(x) = limit {
        if x < 0 {
            return Err(CustomError::build(
                400,
                Some("limit cannot be less than 0".to_string()),
            ));
        }
    }

    if let Some(x) = page {
        if x < 0 {
            return Err(CustomError::build(
                400,
                Some("page cannot be less than 1".to_string()),
            ));
        }
    }

    // Setting default values
    let limit: i64 = limit.unwrap_or(12);
    let page: i64 = page.unwrap_or(1);

    // Fetch data from database.
    let data = project::find(db, limit, page)
        .await
        .map_err(|error| match error {
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to fetch this data from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    // Respond
    Ok(Json(ResponseBody {
        revalidated: None,
        data,
    }))
}

#[get("/project/<_id>")]
pub async fn get_by_id(db: &State<Database>, _id: String) -> Response<Project> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    // Fetch data from database.
    let data = project::find_by_id(db, oid)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No project with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to fetch this data from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    // Respond
    Ok(Json(ResponseBody {
        revalidated: None,
        data,
    }))
}
