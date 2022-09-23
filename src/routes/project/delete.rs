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

#[delete("/project/<_id>")]
pub async fn delete(
    db: &State<Database>,
    _id: String,
) -> Result<Json<Project>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let result = project::delete(db, oid)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No project with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to delete project from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(Json(result))
}
