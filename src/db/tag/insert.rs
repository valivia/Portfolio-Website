use crate::errors::database::DatabaseError;
use crate::models::tag::{TagDocument, TagInput};

use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;

pub async fn insert(db: &Database, input: Json<TagInput>) -> Result<ObjectId, DatabaseError> {
    let collection = db.collection::<TagDocument>("tag");

    let TagInput {
        used_since,
        notable_project,
        name,
        description,
        website,
        score,
    } = input.0;

    let doc = TagDocument {
        id: ObjectId::new(),
        icon_updated_at: None,
        used_since: used_since.into(),
        notable_project,
        name,
        description,
        website,
        score,
    };

    let insert_one_result = collection
        .insert_one(doc, None)
        .await
        .map_err(|_| DatabaseError::Database)?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}
