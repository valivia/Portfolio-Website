use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;

use crate::models::project::Project;
use crate::db::project;
use crate::errors::response::MyError;
use crate::request_guards::basic::ApiKey;

#[openapi(tag = "Project")]
#[delete("/project/<_id>")]
pub async fn delete_project_by_id(
    db: &State<Database>,
    _id: String,
    _key: ApiKey,
) -> Result<Json<Project>, MyError> {
    let oid = ObjectId::parse_str(&_id);

    if oid.is_err() {
        return Err(MyError::build(400, Some("Invalid _id format.".to_string())));
    }

    match project::delete_project_by_id(db, oid.unwrap()).await {
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
