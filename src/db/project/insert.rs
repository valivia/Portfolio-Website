use crate::db::project::collect_tags;
use crate::errors::database::DatabaseError;
use crate::models::project::ProjectInput;

// use chrono::prelude::*;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Document};
use mongodb::Database;
use rocket::serde::json::Json;

pub async fn insert(db: &Database, input: Json<ProjectInput>) -> Result<ObjectId, DatabaseError> {
    let project_collection = db.collection::<Document>("project");

    let tags = match &input.tags {
        Some(data) => collect_tags(db, data.clone())
            .await
            .map_err(|_| DatabaseError::Mismatch)?,
        None => vec![] as Vec<Document>,
    };

    let created_at: bson::DateTime = input.created_at.into();

    let doc = doc! {
        "created_at": created_at,
        "updated_at": created_at,

        "name": input.name.clone(),
        "description": input.description.clone(),
        "markdown": input.markdown.clone(),

        "status": input.status.to_string(),

        "is_pinned": input.is_pinned,
        "is_project": input.is_project,

        "assets": [],
        "tags": tags
    };

    let insert_one_result = project_collection
        .insert_one(doc, None)
        .await
        .map_err(|_| DatabaseError::Database)?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}
