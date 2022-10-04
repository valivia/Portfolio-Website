use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::project::Project;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project::update_banner;

#[post("/banner/<project_id>/<asset_id>")]
pub async fn post(db: &State<Database>, project_id: String, asset_id: String) -> Response<Project> {
    let asset_id = HTTPErr!(
        ObjectId::parse_str(asset_id),
        400,
        Some("Invalid id format.")
    );
    let project_id = HTTPErr!(
        ObjectId::parse_str(project_id),
        400,
        Some("Invalid id format.")
    );

    let data = update_banner(db, project_id, asset_id)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    let mut revalidated = Revalidator::new().add_project(data.id);

    // Check gallery should be re-rendered.
    if data
        .assets
        .iter()
        .any(|asset| asset.id == asset_id && asset.is_displayed)
    {
        revalidated = revalidated.add_gallery();
    }

    let revalidated = Some(revalidated.send().await);

    Ok(Json(ResponseBody {
        data: data.into(),
        revalidated,
    }))
}
