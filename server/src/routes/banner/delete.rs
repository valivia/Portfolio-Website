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

use crate::db::project::delete_banner;

#[delete("/banner/<project_id>")]
pub async fn delete(
    db: &State<Database>,
    _user_info: UserInfo,
    project_id: String,
) -> Response<Project> {
    let project_id = HTTPErr!(
        ObjectId::parse_str(project_id),
        400,
        Some("Invalid id format.")
    );

    let data = delete_banner(db, project_id)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    let mut revalidated = Revalidator::new().add_project(data.id);

    // Check gallery should be re-rendered.
    if let Some(banner_id) = data.banner_id {
        if data
            .assets
            .iter()
            .any(|asset| asset.id == banner_id && asset.is_displayed)
        {
            revalidated = revalidated.add_gallery();
        }
    }

    let revalidated = Some(revalidated.send().await);

    let mut data = Project::from(data);
    data.banner_id = None;

    Ok(Json(ResponseBody { data, revalidated }))
}
