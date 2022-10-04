use crate::db::project;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::auth::UserInfo;
use crate::models::project::Project;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

#[delete("/project/<id>")]
pub async fn delete(db: &State<Database>, _user_info: UserInfo, id: String) -> Response<Project> {
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, Some("Invalid id format."));

    // Fetch and delete data from the database.
    let data = project::delete(db, oid)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    let mut revalidated = Revalidator::new().add_project(oid);

    // Check projects page should be re-rendered.
    if data.is_project {
        revalidated = revalidated.add_projects();
    }

    // Check gallery should be re-rendered.
    if data.assets.iter().any(|asset| asset.is_displayed) {
        revalidated = revalidated.add_gallery();
    }

    // Check if about page should be re-rendered.
    if data.tags.iter().any(|tag| tag.is_experience()) {
        revalidated = revalidated.add_about();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond
    Ok(Json(ResponseBody { revalidated, data }))
}
