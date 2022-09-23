use crate::models::project::Project;
use crate::models::project::ProjectDocument;
use crate::models::project::ProjectInput;

// use chrono::prelude::*;
use futures::stream::TryStreamExt;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime, Document};
use mongodb::options::FindOneAndUpdateOptions;
use mongodb::options::FindOptions;
use mongodb::options::ReturnDocument;
use mongodb::Database;
use rocket::serde::json::Json;

use anyhow::Result;

pub async fn find(
    db: &Database,
    limit: i64,
    page: i64,
) -> mongodb::error::Result<Vec<Project>> {
    let collection = db.collection::<ProjectDocument>("project");

    let find_options = FindOptions::builder()
        .limit(limit)
        .skip(u64::try_from((page - 1) * limit).unwrap())
        .build();

    let mut cursor = collection.find(None, find_options).await?;

    let mut projects: Vec<Project> = vec![];
    while let Some(result) = cursor.try_next().await? {
        let project_json = Project::from(result);
        projects.push(project_json);
    }

    Ok(projects)
}

pub async fn find_by_id(
    db: &Database,
    oid: ObjectId,
) -> mongodb::error::Result<Option<Project>> {
    let collection = db.collection::<ProjectDocument>("project");

    let project_doc = collection.find_one(doc! {"_id":oid }, None).await?;
    if project_doc.is_none() {
        return Ok(None);
    }
    let unwrapped_doc = project_doc.unwrap();

    let project_json = Project::from(unwrapped_doc);

    Ok(Some(project_json))
}

pub async fn insert(db: &Database, input: Json<ProjectInput>) -> Result<String> {
    let collection = db.collection::<Document>("project");
    let created_at = DateTime::parse_rfc3339_str(input.created_at.clone())?;
    let insert_one_result = collection
        .insert_one(
            doc! {
                "created_at": created_at,
                "updated_at": created_at,

                "name": input.name.clone(),
                "description": input.description.clone(),
                "markdown": input.markdown.clone(),

                "status": input.status.to_string(),

                "is_pinned": input.is_pinned,
                "is_project": input.is_project,

                "assets": [],
                "tags": []
            },
            None,
        )
        .await?;

    Ok(insert_one_result.inserted_id.to_string())
}

pub async fn update(
    db: &Database,
    oid: ObjectId,
    input: Json<ProjectInput>,
) -> mongodb::error::Result<Option<Project>> {
    let collection = db.collection::<ProjectDocument>("project");
    let find_one_and_update_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let created_at: DateTime = DateTime::now();

    let project_doc = collection
        .find_one_and_update(
            doc! {"_id":oid },
            doc! {"$set": {"name": input.name.clone(), "createdAt": created_at}},
            find_one_and_update_options,
        )
        .await?;

    if project_doc.is_none() {
        return Ok(None);
    }
    let unwrapped_doc = project_doc.unwrap();

    let project_json = Project::from(unwrapped_doc);

    Ok(Some(project_json))
}

pub async fn delete(
    db: &Database,
    oid: ObjectId,
) -> mongodb::error::Result<Option<Project>> {
    let collection = db.collection::<ProjectDocument>("project");

    // if you just unwrap,, when there is no document it results in 500 error.
    let project_doc = collection
        .find_one_and_delete(doc! {"_id":oid }, None)
        .await?;
    if project_doc.is_none() {
        return Ok(None);
    }

    let unwrapped_doc = project_doc.unwrap();

    let project_json = Project::from(unwrapped_doc);

    Ok(Some(project_json))
}
