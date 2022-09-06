use std::str::FromStr;

use crate::{database::mongo::MongoRepo, models::asset_model::Asset};
use bson::{oid::ObjectId, DateTime};
use image::{DynamicImage, ImageBuffer};
use mongodb::results::UpdateResult;
use rocket::form::Form;
use rocket::serde::json::Json;
use rocket::{fs::TempFile, http::Status, State};

#[derive(Debug, FromForm)]
pub struct AssetForm<'r> {
    pub file: TempFile<'r>,
    pub project_id: String,
    pub created: String,
    pub alt: String,
    pub description: String,
    pub width: u64,
    pub height: u64,
    pub display: bool,
}

#[post("/", data = "<new_asset>")]
pub async fn post_asset(
    db: &State<MongoRepo>,
    new_asset: Form<AssetForm<'_>>,
) -> Result<Json<UpdateResult>, Status> {
    let file_type = match new_asset.file.content_type() {
        Some(x) => x,
        None => return Err(Status::NotAcceptable),
    };

    if !(file_type.is_png() || file_type.is_jpeg() || file_type.is_webp()) {
        return Err(Status::NotAcceptable);
    };

    let data = Asset {
        id: None,
        project_id: ObjectId::from_str(&new_asset.project_id).unwrap(),
        created: DateTime::parse_rfc3339_str(&new_asset.created)
            .ok()
            .unwrap(),
        alt: Some(new_asset.alt.to_owned()),
        description: Some(new_asset.description.to_owned()),
        width: None,
        height: None,
        display: new_asset.display,
    };
    let response = db.create_asset(data).await.unwrap();
    Ok(Json(response))
}
