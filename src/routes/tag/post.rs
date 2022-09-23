use crate::errors::response::CustomError;
use crate::models::tag::TagInput;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::fs::TempFile;
use rocket::response::status::BadRequest;
use rocket::serde::json::Json;
use rocket::State;

use crate::models::response::MessageResponse;
use crate::db::tag;

#[post("/tag", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    input: Json<TagInput>,
) -> Result<Json<String>, BadRequest<Json<MessageResponse>>> {
    match tag::insert(db, input).await {
        Ok(_tag_doc_id) => Ok(Json(_tag_doc_id)),
        Err(_error) => {
            println!("{:?}", _error);
            Err(BadRequest(Some(Json(MessageResponse {
                message: "Invalid input".to_string(),
            }))))
        }
    }
}

#[post("/tag/<_id>", data = "<file>")]
pub async fn post_icon(
    db: &State<Database>,
    _id: String,
    mut file: TempFile<'_>,
) -> Result<String, CustomError> {
    // Check file validity.
    match file.content_type() {
        Some(x) => {
            if !x.is_svg() {
                return Err(CustomError::build(
                    401,
                    Some("Invalid file type".to_string()),
                ));
            }
        }
        None => {
            return Err(CustomError::build(
                401,
                Some("No file type detected".to_string()),
            ));
        }
    };

    // Check if valid oid.
    let oid = ObjectId::parse_str(&_id)
        .map_err(|_| CustomError::build(401, Some(String::from("Invalid id"))))?;

    let not_found = CustomError::build(401, Some(String::from("This tag doesnt exist")));

    
    // Check if tag exists.
    match tag::find_by_id(db, oid).await {
        Ok(data) => {
            if data.is_none() {
                return Err(not_found);
            }
        }
        Err(_) => return Err(not_found),
    }

    // Save file.
    file.persist_to(format!("media/tag/{}.svg", _id))
        .await
        .unwrap();

    Ok(String::from("gdfgdf"))
}
