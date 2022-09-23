use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::ProjectInput;
use mongodb::bson::doc;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project;

#[post("/project", data = "<input>")]
pub async fn post(db: &State<Database>, input: Json<ProjectInput>) -> Result<(), CustomError> {
    project::insert(db, input)
        .await
        .map_err(|error| match error {
            DatabaseError::Database => CustomError::build(500, Some("Failed to create db entry.")),
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(())
}
