use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::Project;
use crate::HTTPErr;

#[get("/project?<limit>&<page>")]
pub async fn get_all(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Result<Json<Vec<Project>>, CustomError> {
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

    let projects = project::find(db, limit, page)
        .await
        .map_err(|error| match error {
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to fetch this data from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(Json(projects))
}

#[get("/project/<_id>")]
pub async fn get_by_id(db: &State<Database>, _id: String) -> Result<Json<Project>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let project = project::find_by_id(db, oid)
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

    Ok(Json(project))
}
