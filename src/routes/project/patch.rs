use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::{Project, ProjectInput};
use crate::HTTPErr;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project;

#[patch("/project/<_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _id: String,
    input: Json<ProjectInput>,
) -> Result<Json<Project>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let project = project::update(db, oid, input)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No project with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to update this data in the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(Json(project))
}
