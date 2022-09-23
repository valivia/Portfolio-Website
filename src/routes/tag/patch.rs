use crate::HTTPErr;
use crate::errors::response::CustomError;
use crate::models::tag::{TagInput, Tag};
use crate::request_guards::basic::ApiKey;
use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::tag;

#[patch("/tag/<_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _key: ApiKey,
    _id: String,
    input: Json<TagInput>,
) -> Result<Json<Tag>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    match tag::update(db, oid, input).await {
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
