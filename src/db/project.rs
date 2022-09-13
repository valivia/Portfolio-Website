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

pub async fn find_project(
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
        // transform ObjectId to String
        let project_json = Project {
            _id: result._id.to_string(),
            name: result.name.to_string(),
            createdAt: result.createdAt.to_string(),
            description: result.description.into(),
            markdown: result.markdown.into(),
            status: result.status.into(),
            isPinned: result.isPinned.into(),
            isProject: result.isProject.into(),
            tags: vec![],
            assets: vec![],
            updatedAt: todo!(),
        };
        projects.push(project_json);
    }

    Ok(projects)
}

pub async fn find_project_by_id(
    db: &Database,
    oid: ObjectId,
) -> mongodb::error::Result<Option<Project>> {
    let collection = db.collection::<ProjectDocument>("project");

    let project_doc = collection.find_one(doc! {"_id":oid }, None).await?;
    if project_doc.is_none() {
        return Ok(None);
    }
    let unwrapped_doc = project_doc.unwrap();
    // transform ObjectId to String
    let project_json = Project {
        _id: unwrapped_doc._id.to_string(),
        name: unwrapped_doc.name.to_string(),
        createdAt: unwrapped_doc.createdAt.to_string(),
        description: todo!(),
        markdown: todo!(),
        status: todo!(),
        isPinned: todo!(),
        isProject: todo!(),
        tags: todo!(),
        assets: todo!(),
        updatedAt: todo!(),
    };

    Ok(Some(project_json))
}

pub async fn insert_project(
    db: &Database,
    input: Json<ProjectInput>,
) -> mongodb::error::Result<String> {
    let collection = db.collection::<Document>("project");
    let createdAt = if let Ok(date) = DateTime::parse_rfc3339_str(input.createdAt.clone()) {
        date
    } else {
        return Err(????);
    };

    let insert_one_result = collection
        .insert_one(
            doc! {"name": input.name.clone(), "createdAt": createdAt, "description": input.description.clone(), "markdown": input.markdown.clone(), "isPinned": input.isPinned, "isProject": input.isProject},
            None,
        )
        .await?;

    Ok(insert_one_result.inserted_id.to_string())
}

pub async fn update_project_by_id(
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
    // transform ObjectId to String
    let project_json = Project {
        _id: unwrapped_doc._id.to_string(),
        name: unwrapped_doc.name.to_string(),
        createdAt: unwrapped_doc.createdAt.to_string(),
        updatedAt: todo!(),
        description: todo!(),
        markdown: todo!(),
        status: todo!(),
        isPinned: todo!(),
        isProject: todo!(),
        tags: todo!(),
        assets: todo!(),
    };

    Ok(Some(project_json))
}

pub async fn delete_project_by_id(
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
    // transform ObjectId to String
    let project_json = Project {
        _id: unwrapped_doc._id.to_string(),
        name: unwrapped_doc.name.to_string(),
        createdAt: unwrapped_doc.createdAt.to_string(),
        updatedAt: todo!(),
        description: todo!(),
        markdown: todo!(),
        status: todo!(),
        isPinned: todo!(),
        isProject: todo!(),
        tags: todo!(),
        assets: todo!(),
    };

    Ok(Some(project_json))
}
