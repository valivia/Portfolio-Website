use crate::db::project;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::project::Project;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

#[get("/project?<limit>&<page>")]
pub async fn get_all(
    db: &State<Database>,
    limit: Option<i64>,
    page: Option<i64>,
) -> Response<Vec<Project>> {
    if let Some(x) = limit {
        if x < 0 {
            return Err(CustomError::build(400, Some("limit cannot be less than 0")));
        }
    }

    if let Some(x) = page {
        if x < 0 {
            return Err(CustomError::build(400, Some("page cannot be less than 1")));
        }
    }

    // Setting default values
    let limit: i64 = limit.unwrap_or(300);
    let page: i64 = page.unwrap_or(1);

    // Fetch data from database.
    let data = project::find(db, limit, page)
        .await
        .map_err(|_| CustomError::build(500, None))?;

    // Respond
    Ok(Json(ResponseBody {
        revalidated: None,
        data,
    }))
}

#[get("/project/<project_id>")]
pub async fn get_by_id(db: &State<Database>, project_id: String) -> Response<Project> {
    let project_id = HTTPErr!(
        ObjectId::parse_str(project_id),
        400,
        Some("Invalid id format.")
    );

    // Fetch data from database.
    let data = project::find_by_id(db, project_id)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    // Respond
    Ok(Json(ResponseBody {
        revalidated: None,
        data,
    }))
}
