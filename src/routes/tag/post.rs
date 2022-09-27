use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
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
    input: Validated<Json<TagInput>>,
) -> Result<Json<Tag>, CustomError> {
    let data = input.into_inner();
    let tag_oid = tag::insert(db, data).await.map_err(|error| match error {
        DatabaseError::Database => CustomError::build(500, Some("Failed to create db entry.")),
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    let tag = tag::find_by_id(db, tag_oid).await.map_err(|_| {
        CustomError::build(500, Some("Tag was inserted but couldnt return the data."))
    })?;

    Ok(Json(tag))
}

#[post("/tag/icon/<_id>", data = "<file>")]
pub async fn post_icon(
    db: &State<Database>,
    _id: String,
    mut file: TempFile<'_>,
) -> Result<Json<Tag>, CustomError> {
    // Check if valid oid.
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    // Check file validity.
    let file_type = HTTPOption!(file.content_type(), 400, "No file type detected");

    // Check if its the right file type.
    if !file_type.is_svg() {
        return Err(CustomError::build(401, Some("Invalid file type")));
    }

    let tag = tag::update_icon(db, oid, Some(DateTime::now()))
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, Some("No tag with this ID exists")),
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to fetch this data from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    // Save file.
    file.persist_to(format!("media/tag/{}.svg", _id))
        .await
        .map_err(|err| {
            eprintln!("{err}");
            CustomError::build(500, Some("Failed to save file"))
        })?;

    Ok(Json(tag))
}
