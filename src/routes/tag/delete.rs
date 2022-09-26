use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::HTTPErr;
use crate::errors::database::DatabaseError;
use crate::models::tag::Tag;
use crate::db::tag;
use crate::errors::response::CustomError;
use crate::request_guards::basic::ApiKey;

#[delete("/tag/<_id>")]
pub async fn delete(
    db: &State<Database>,
    _id: String,
    _key: ApiKey,
) -> Result<Json<Tag>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    let result = tag::delete(db, oid)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No tag with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to delete tag from the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    Ok(Json(result))
}
