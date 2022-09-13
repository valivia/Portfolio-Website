use mongodb::bson::doc;
use mongodb::Database;
use rocket::response::status::BadRequest;
use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;
use crate::models::project::ProjectInput;

use crate::models::response::MessageResponse;

use crate::db::project;

#[openapi(tag = "Project")]
#[post("/", data = "<input>")]
pub async fn post_project(
    db: &State<Database>,
    input: Json<ProjectInput>,
) -> Result<Json<String>, BadRequest<Json<MessageResponse>>> {
    // can set with a single error like this.
    match project::insert_project(db, input).await {
        Ok(_project_doc_id) => Ok(Json(_project_doc_id)),
        Err(_error) => {
            println!("{:?}", _error);
            Err(BadRequest(Some(Json(MessageResponse {
                message: "Invalid input".to_string(),
            }))))
        }
    }
}
