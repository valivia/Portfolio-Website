use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::HTTPErr;
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

    match tag::delete(db, oid).await {
        Ok(_tag_doc) => {
            if _tag_doc.is_none() {
                return Err(CustomError::build(
                    400,
                    Some(format!("Tag not found with _id {}", &_id)),
                ));
            }
            Ok(Json(_tag_doc.unwrap()))
        }
        Err(_error) => {
            println!("{:?}", _error);
            Err(CustomError::build(
                400,
                Some(format!("Tag not found with _id {}", &_id)),
            ))
        }
    }
}
