use mongodb::bson::doc;
use mongodb::Database;
use mongodb::bson::oid::ObjectId;
use rocket::serde::json::Json;
use rocket::State;

use crate::models::project::Project;
use crate::db::project;
use crate::errors::response::CustomError;

#[get("/project?<limit>&<page>")]
pub async fn get_all(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Result<Json<Vec<Project>>, CustomError> {
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

    match project::find(db, limit, page).await {
        Ok(_project_docs) => Ok(Json(_project_docs)),
        Err(_error) => {
            println!("{:?}", _error);
            Err(CustomError::build(400, Some(_error.to_string())))
        }
    }
}

#[get("/project/<_id>")]
pub async fn get_by_id(
    db: &State<Database>,
    _id: String,
) -> Result<Json<Project>, CustomError> {
    let oid = ObjectId::parse_str(&_id);

    if oid.is_err() {
        return Err(CustomError::build(400, Some("Invalid _id format.".to_string())));
    }

    match project::find_by_id(db, oid.unwrap()).await {
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
            return Err(CustomError::build(
                400,
                Some(format!("Project not found with _id {}", &_id)),
            ));
        }
    }
}
