use crate::errors::response::CustomError;
use crate::models::tag::{TagInput, Tag};
use crate::request_guards::basic::ApiKey;
use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;

use crate::db::tag;

#[openapi(tag = "Tag")]
#[patch("/tag/<_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _key: ApiKey,
    _id: String,
    input: Json<TagInput>,
) -> Result<Json<Tag>, CustomError> {
    let oid = ObjectId::parse_str(&_id);

    if oid.is_err() {
        return Err(CustomError::build(400, Some("Invalid _id format.".to_string())));
    }

    match tag::update(db, oid.unwrap(), input).await {
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
            return Err(CustomError::build(
                400,
                Some(format!("Tag not found with _id {}", &_id)),
            ));
        }
    }
}
