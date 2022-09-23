use crate::errors::response::CustomError;
use crate::models::project::{ProjectInput, Project};
use crate::request_guards::basic::ApiKey;
use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::project;

#[patch("/project/<_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _key: ApiKey,
    _id: String,
    input: Json<ProjectInput>,
) -> Result<Json<Project>, CustomError> {
    let oid = ObjectId::parse_str(&_id);

    if oid.is_err() {
        return Err(CustomError::build(400, Some("Invalid _id format.".to_string())));
    }

    match project::update(db, oid.unwrap(), input).await {
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
