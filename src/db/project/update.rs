use crate::errors::database::DatabaseError;
use crate::models::project::Project;
use crate::models::project::ProjectDocument;
use crate::models::project::ProjectInput;

use bson::Document;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOneAndUpdateOptions;
use mongodb::options::ReturnDocument;
use mongodb::Database;
use rocket::serde::json::Json;

use super::collect_tags;

pub async fn update(
    db: &Database,
    oid: ObjectId,
    input: Json<ProjectInput>,
) -> Result<Project, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let tags = match &input.tags {
        Some(data) => collect_tags(db, data.clone())
            .await
            .map_err(|_| DatabaseError::Mismatch)?,
        None => vec![] as Vec<Document>,
    };

    let created_at: bson::DateTime = input.created_at.into();

    let doc = doc! {
        "created_at": created_at,
        "updated_at": bson::DateTime::now(),

        "name": input.name.clone(),
        "description": input.description.clone(),
        "markdown": input.markdown.clone(),

        "status": input.status.to_string(),

        "is_pinned": input.is_pinned,
        "is_project": input.is_project,

        "tags": tags
    };

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    Ok(collection
        .find_one_and_update(doc! {"_id": oid}, doc! {"$set": doc}, query_options)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into())
}
