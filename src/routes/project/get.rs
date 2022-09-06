use crate::{database::mongo::MongoRepo, models::project_model::ProjectJson};
use rocket::{http::Status, serde::json::Json, State};

#[get("/")]
pub async fn get_projects(db: &State<MongoRepo>) -> Result<Json<Vec<ProjectJson>>, Status> {
    let project_detail = db.get_projects().await;
    
    match project_detail {
        Ok(projects) => Ok(Json(dbg!(projects))),
        Err(_) => Err(Status::InternalServerError),
    }
}
