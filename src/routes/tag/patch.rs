use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::tag::{Tag, TagInput};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::tag;

#[patch("/tag/<_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _id: String,
    input: Json<TagInput>,
) -> Result<Json<Tag>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let tag = tag::update(db, oid, input)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No tag with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to update this data in the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(Json(tag))
}
