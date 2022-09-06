use crate::{
    database::mongo::MongoRepo,
    models::{
        asset_model::Asset,
        project_model::{ProjectBson, ProjectMutableJson},
        tag_model::Tag,
    },
};
use bson::{DateTime, oid::ObjectId};
use mongodb::results::InsertOneResult;
use rocket::{http::Status, serde::json::Json, State};

#[post("/", data = "<new_project>")]
pub async fn post_project(
    db: &State<MongoRepo>,
    new_project: Json<ProjectMutableJson>,
) -> Result<Json<InsertOneResult>, Status> {
    let data = ProjectBson {
        id: ObjectId::new(),

        updated: DateTime::now(),

        assets: vec![] as Vec<Asset>,
        tags: vec![] as Vec<Tag>,

        mutable: new_project.into_inner().into(),
    };

    let project_detail = db.create_project(data).await;
    match project_detail {
        Ok(project) => Ok(Json(project)),
        Err(_) => Err(Status::InternalServerError),
    }
}
