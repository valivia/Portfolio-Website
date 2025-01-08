use std::fs::{self, set_permissions};
use std::os::unix::prelude::PermissionsExt;

use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::{RevalidateResult, Revalidator};
use crate::models::auth::UserInfo;
use crate::models::response::{Response, ResponseBody};
use crate::models::tag::{Tag, TagInput};
use crate::{HTTPErr, HTTPOption};
use bson::DateTime;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::fs::TempFile;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::Validated;

use crate::db::tag;

#[post("/tag", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    _user_info: UserInfo,
    input: Validated<Json<TagInput>>,
) -> Response<Tag> {
    let input = input.into_inner();

    // Insert into db.
    let tag_oid = tag::insert(db, input).await.map_err(|error| match error {
        DatabaseError::Database => CustomError::build(500, Some("Failed to create db entry.")),
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    // Get from db.
    let tag = tag::find_by_id(db, tag_oid).await.map_err(|_| {
        CustomError::build(500, Some("Tag was inserted but couldnt return the data."))
    })?;

    // Respond
    Ok(Json(ResponseBody {
        revalidated: None,
        data: tag,
    }))
}

#[post("/tag/icon/<tag_id>", data = "<file>")]
pub async fn post_icon(
    db: &State<Database>,
    _user_info: UserInfo,
    tag_id: String,
    file: TempFile<'_>,
) -> Response<Tag> {
    // Check if valid oid.
    let tag_id = HTTPErr!(ObjectId::parse_str(tag_id), 400, Some("Invalid id format."));

    // Check file validity.
    let file_type = HTTPOption!(file.content_type(), 415, None);

    // Check if its the right file type.
    if !file_type.is_svg() {
        return Err(CustomError::build(415, None));
    }

    // Save file.
    save_icon(file, tag_id)
        .await
        .map_err(|_| CustomError::build(500, Some("Failed to save file.")))?;

    // Update db.
    let data = tag::update_icon(db, tag_id, Some(DateTime::now()))
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    // todo , maybe delete file on fail but it isnt vital so this is ok for now.

    // Revalidate page if needed.
    let mut revalidated: Option<RevalidateResult> = None;

    if data.is_experience() {
        revalidated = Some(Revalidator::new().add_about().send().await);
    }

    // Response.
    Ok(Json(ResponseBody { data, revalidated }))
}

async fn save_icon(mut file: TempFile<'_>, tag_id: ObjectId) -> Result<(), ()> {
    let icon_path = std::env::current_dir().map_err(|_| ())?;
    let icon_path = icon_path
        .join("media")
        .join("tag")
        .join(format!("{}.svg", tag_id));

    // Save file.
    file.persist_to(&icon_path).await.map_err(|err| {
        eprintln!("{err}");
    })?;

    let mut perms = fs::metadata(&icon_path).map_err(|_| ())?.permissions();
    perms.set_mode(0o644);

    set_permissions(icon_path, perms).map_err(|_| ())?;

    Ok(())
}
