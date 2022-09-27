use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use tokio::fs::remove_file;

use crate::db::tag;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::tag::Tag;
use crate::HTTPErr;

#[delete("/tag/<_id>")]
pub async fn delete(
    db: &State<Database>,
    _id: String,
) -> Result<Json<Tag>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let result = tag::delete(db, oid).await.map_err(|error| match error {
        DatabaseError::NotFound => CustomError::build(404, Some("No tag with this ID exists")),
        DatabaseError::Database => {
            CustomError::build(500, Some("Failed to delete tag from the database"))
        }
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    Ok(Json(result))
}

#[delete("/tag/icon/<id>")]
pub async fn delete_icon(db: &State<Database>, id: String) -> Result<Json<Tag>, CustomError> {
    // Check if valid oid.
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    let tag = tag::update_icon(db, oid, None)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, Some("No tag with this ID exists")),
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to fetch this data from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    let _ = remove_file(format!("media/tag/{}.svg", tag._id)).await;

    Ok(Json(tag))
}
