use crate::db::asset::InsertError;
use crate::errors::response::CustomError;
use crate::models::project::{Project, ProjectInput};
use crate::HTTPErr;
use mongodb::bson::{doc, DateTime};
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;

use crate::db::project;

#[openapi(tag = "Project")]
#[post("/project", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    input: Json<ProjectInput>,
) -> Result<(), CustomError> {
    HTTPErr!(
        DateTime::parse_rfc3339_str(&input.created_at),
        400,
        "Invalid date format"
    );

    let result = project::insert(db, input)
        .await
        .map_err(|error| match error {
            InsertError::Database => CustomError::build(500, Some("Failed to create db entry.")),
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(())
}
