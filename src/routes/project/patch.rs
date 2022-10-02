use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::auth::UserInfo;
use crate::models::project::{Project, ProjectInput};
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::Validated;

use crate::db::project;

#[patch("/project/<id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _user_info: UserInfo,
    id: String,
    input: Validated<Json<ProjectInput>>,
) -> Response<Project> {
    let input = input.into_inner();
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    // Update the DB.
    let (new_project, old_project) =
        project::update(db, oid, input)
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

    let mut revalidated = Revalidator::new().add_project(oid);

    // Check projects page should be re-rendered.
    if new_project.is_project || old_project.is_project {
        revalidated = revalidated.add_projects();
    }

    // Check gallery should be re-rendered.
    if new_project.assets.iter().any(|asset| asset.is_displayed)
        || old_project.assets.iter().any(|asset| asset.is_displayed)
    {
        revalidated = revalidated.add_gallery();
    }

    // Check if about page should be re-rendered.
    if new_project.tags.iter().any(|tag| tag.is_experience())
        || old_project.tags.iter().any(|tag| tag.is_experience())
    {
        revalidated = revalidated.add_about();
    }

    let revalidated = Some(revalidated.send().await);

    Ok(Json(ResponseBody {
        data: new_project,
        revalidated,
    }))
}
