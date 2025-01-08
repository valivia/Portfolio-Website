use crate::db::project;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::auth::UserInfo;
use crate::models::project::{Project, ProjectInput};
use crate::models::response::{Response, ResponseBody};

use mongodb::bson::doc;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::Validated;

#[post("/project", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    _user_info: UserInfo,
    input: Validated<Json<ProjectInput>>,
) -> Response<Project> {
    let input = input.into_inner();

    // Update the DB.
    let oid = project::insert(db, input.clone())
        .await
        .map_err(|error| match error {
            DatabaseError::Database => CustomError::build(500, None),
            DatabaseError::Mismatch => {
                CustomError::build(400, Some("Tags dont match with the database"))
            }
            _ => CustomError::build(500, None),
        })?;

    // Get data from DB.
    let data = project::find_by_id(db, oid).await.map_err(|_| {
        CustomError::build(500, Some("Database entry created but couldnt fetch data."))
    })?;

    // Revalidate paths on next.js.
    let mut revalidated = Revalidator::new().add_project(oid).add_about();

    // Check if projects page should be re-rendered.
    if data.is_project {
        revalidated = revalidated.add_projects();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond
    Ok(Json(ResponseBody { revalidated, data }))
}
