use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::HTTPErr;
use crate::models::tag::Tag;
use crate::db::tag;
use crate::errors::response::CustomError;

#[get("/tag?<limit>&<page>")]
pub async fn get_all(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Result<Json<Vec<Tag>>, CustomError> {
    if let Some(x) = limit {
        if x < 0 {
            return Err(CustomError::build(
                400,
                Some("limit cannot be less than 0".to_string()),
            ));
        }
    }

    if let Some(x) = page {
        if x < 0 {
            return Err(CustomError::build(
                400,
                Some("page cannot be less than 1".to_string()),
            ));
        }
    }

    // Setting default values
    let limit: i64 = limit.unwrap_or(12);
    let page: i64 = page.unwrap_or(1);

    match tag::find(db, limit, page).await {
        Ok(_tag_docs) => Ok(Json(_tag_docs)),
        Err(_error) => {
            println!("{:?}", _error);
            Err(CustomError::build(400, Some(_error.to_string())))
        }
    }
}

#[get("/tag/<_id>")]
pub async fn get_by_id(
    db: &State<Database>,
    _id: String,
) -> Result<Json<Tag>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    match tag::find_by_id(db, oid).await {
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
