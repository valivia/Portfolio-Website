use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::HTTPErr;
use crate::db::project;
use crate::errors::response::CustomError;
use crate::models::project::Project;
use crate::request_guards::basic::ApiKey;

#[delete("/project/<_id>")]
pub async fn delete(
    db: &State<Database>,
    _id: String,
    _key: ApiKey,
) -> Result<Json<Project>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&_id), 400, "Invalid id format.");

    match project::delete(db, oid).await {
        Ok(_project_doc) => {
            if _project_doc.is_none() {
                return Err(CustomError::build(
                    400,
                    Some(format!("Project not found with _id {}", &_id)),
                ));
            }
            Ok(Json(_project_doc.unwrap()))
        }
        Err(_error) => {
            println!("{:?}", _error);
            Err(CustomError::build(
                400,
                Some(format!("Project not found with _id {}", &_id)),
            ))
        }
    }
}
