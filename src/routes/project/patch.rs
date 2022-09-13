use crate::errors::response::MyError;
use crate::models::project::{ProjectInput, Project};
use crate::request_guards::basic::ApiKey;
use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;

use crate::db::project;

#[openapi(tag = "Project")]
#[patch("/project/<_id>", data = "<input>")]
pub async fn patch_project_by_id(
    db: &State<Database>,
    _key: ApiKey,
    _id: String,
    input: Json<ProjectInput>,
) -> Result<Json<Project>, MyError> {
    let oid = ObjectId::parse_str(&_id);

    if oid.is_err() {
        return Err(MyError::build(400, Some("Invalid _id format.".to_string())));
    }

    match project::update_project_by_id(db, oid.unwrap(), input).await {
        Ok(_project_doc) => {
            if _project_doc.is_none() {
                return Err(MyError::build(
                    400,
                    Some(format!("Project not found with _id {}", &_id)),
                ));
            }
            Ok(Json(_project_doc.unwrap()))
        }
        Err(_error) => {
            println!("{:?}", _error);
            return Err(MyError::build(
                400,
                Some(format!("Project not found with _id {}", &_id)),
            ));
        }
    }
}
