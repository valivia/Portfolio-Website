use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::{Project, ProjectInput};
use mongodb::bson::doc;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project;

#[post("/project", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    input: Json<ProjectInput>,
) -> Result<Json<Project>, CustomError> {
    let oid = project::insert(db, input)
        .await
        .map_err(|error| match error {
            DatabaseError::Database => CustomError::build(500, Some("Failed to create db entry.")),
            DatabaseError::Mismatch => {
                CustomError::build(400, Some("Tags dont match with the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    let project = project::find_by_id(db, oid)
        .await
        .map_err(|_| CustomError::build(500, Some("Db entry created but couldnt fetch data.")))?;

    Ok(Json(project))
}
