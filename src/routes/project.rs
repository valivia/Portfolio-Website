use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::response::status::BadRequest;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;

use crate::models::project::Project;
use crate::models::project::ProjectDocument;
use crate::models::project::ProjectInput;

use crate::models::response::MessageResponse;
use crate::request_guards::basic::ApiKey;

use crate::db::project;

use crate::errors::response::MyError;

/// get project documents
#[openapi(tag = "Project")]
#[get("/project?<limit>&<page>")]
pub async fn get_projects(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Result<Json<Vec<Project>>, MyError> {
    // Error handling
    // This is also valid when strict checking is necessary.
    // if limit < 0 {
    //     return Err(BadRequest(Some(Json(MessageResponse {
    //         message: "limit cannot be less than 0".to_string(),
    //     }))));
    // }
    // if !page.is_none() && page.unwrap() < 1 {
    //     return Err(BadRequest(Some(Json(MessageResponse {
    //         message: "page cannot be less than 1".to_string(),
    //     }))));
    // }

    // Setting default values
    let limit: i64 = limit.unwrap_or(12);
    let page: i64 = page.unwrap_or(1);
    match project::find_project(&db, limit, page).await {
        Ok(_project_docs) => Ok(Json(_project_docs)),
        Err(_error) => {
            println!("{:?}", _error);
            return Err(MyError::build(400, Some(_error.to_string())));
        }
    }
}

/// create a project document
#[openapi(tag = "Project")]
#[post("/project", data = "<input>")]
pub async fn post_project(
    db: &State<Database>,
    input: Json<ProjectInput>,
) -> Result<Json<String>, BadRequest<Json<MessageResponse>>> {
    // can set with a single error like this.
    match project::insert_project(&db, input.into()).await {
        Ok(_project_doc_id) => {
            return Ok(Json(_project_doc_id));
        }
        Err(_error) => {
            println!("{:?}", _error);
            return Err(BadRequest(Some(Json(MessageResponse {
                message: format!("Invalid input"),
            }))));
        }
    }
}
