use crate::db::project::collect_tags;
use crate::errors::database::DatabaseError;
use crate::models::project::{ProjectDocument, ProjectInput};
use crate::models::tag::TagDocument;

// use chrono::prelude::*;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;

pub async fn insert(db: &Database, input: Json<ProjectInput>) -> Result<ObjectId, DatabaseError> {
    let project_collection = db.collection::<ProjectDocument>("project");

    // Destructure input struct.
    let ProjectInput {
        created_at,
        name,
        description,
        markdown,
        status,
        is_pinned,
        is_project,
        tags,
    } = input.0;

    // Convert vec of objectIds to vec of Tags.
    let tags = match tags {
        Some(data) => collect_tags(db, data.clone())
            .await
            .map_err(|_| DatabaseError::Mismatch)?,
        None => vec![] as Vec<TagDocument>,
    };

    // Generate DB data struct.
    let doc = ProjectDocument {
        id: ObjectId::new(),

        created_at: created_at.into(),
        updated_at: created_at.into(),

        banner_id: None::<ObjectId>,
        status,

        name,
        description,
        markdown,

        is_pinned,
        is_project,

        assets: vec![],
        tags,
    };

    // Insert into the DB.
    let insert_one_result = project_collection
        .insert_one(doc, None)
        .await
        .map_err(|_| DatabaseError::Database)?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}
