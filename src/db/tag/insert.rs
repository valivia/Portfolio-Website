use crate::errors::database::DatabaseError;
use crate::models::tag::TagInput;

use mongodb::bson::oid::ObjectId;
use mongodb::bson::Document;
use mongodb::Database;
use rocket::serde::json::Json;

pub async fn insert(db: &Database, input: Json<TagInput>) -> Result<ObjectId, DatabaseError> {
    let collection = db.collection::<Document>("tag");

    let doc = input.into_inner().into_tag_doc();

    let insert_one_result = collection
        .insert_one(doc, None)
        .await
        .map_err(|_| DatabaseError::Database)?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}
