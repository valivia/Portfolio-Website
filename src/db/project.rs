use crate::errors::database::DatabaseError;
use crate::models::project::Project;
use crate::models::project::ProjectDocument;
use crate::models::project::ProjectInput;

// use chrono::prelude::*;
use futures::stream::TryStreamExt;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Document};
use mongodb::options::FindOneAndUpdateOptions;
use mongodb::options::FindOptions;
use mongodb::options::ReturnDocument;
use mongodb::Database;
use rocket::serde::json::Json;

use anyhow::Result;

pub async fn find(db: &Database, limit: i64, page: i64) -> Result<Vec<Project>, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let find_options = FindOptions::builder()
        .limit(limit)
        .skip(u64::try_from((page - 1) * limit).unwrap())
        .build();

    let mut cursor = collection.find(None, find_options).await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })?;

    let mut projects: Vec<Project> = vec![];

    while let Some(result) = cursor.try_next().await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })? {
        let project_json = Project::from(result);
        projects.push(project_json);
    }

    Ok(projects)
}

pub async fn find_by_id(db: &Database, oid: ObjectId) -> Result<Project, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let project = Project::from(
        collection
            .find_one(doc! {"_id":oid }, None)
            .await
            .map_err(|error| {
                eprintln!("{error}");
                DatabaseError::Database
            })?
            .ok_or(DatabaseError::NotFound)?,
    );

    Ok(project)
}

pub async fn insert(db: &Database, input: Json<ProjectInput>) -> Result<ObjectId, DatabaseError> {
    let collection = db.collection::<Document>("project");

    let doc = input
        .into_inner()
        .into_insert_doc()
        .map_err(|_| DatabaseError::Input)?;

    let insert_one_result = collection
        .insert_one(doc, None)
        .await
        .map_err(|_| DatabaseError::Database)?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}

pub async fn update(
    db: &Database,
    oid: ObjectId,
    input: Json<ProjectInput>,
) -> Result<Project, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let update_doc = input
        .into_inner()
        .into_update_doc()
        .map_err(|_| DatabaseError::Input)?;

    Ok(collection
        .find_one_and_update(
            doc! {"_id": oid},
            doc! {"$set": update_doc},
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into())
}

pub async fn delete(db: &Database, oid: ObjectId) -> Result<Project, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let project = Project::from(
        collection
            .find_one_and_delete(doc! {"_id":oid }, None)
            .await
            .map_err(|error| {
                eprintln!("{error}");
                DatabaseError::Database
            })?
            .ok_or(DatabaseError::NotFound)?,
    );

    project.assets.iter().for_each(|asset| asset.delete_files());

    Ok(project)
}
