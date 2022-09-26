use crate::errors::database::DatabaseError;

use bson::Document;
use futures::TryStreamExt;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;

pub mod delete;
pub use delete::*;

pub mod find;
pub use find::*;

pub mod insert;
pub use insert::*;

pub mod update;
pub use update::*;

async fn collect_tags(db: &Database, tags: Vec<ObjectId>) -> Result<Vec<Document>, DatabaseError> {
    let collection = db.collection::<Document>("tag");

    let mut result: Vec<Document> = vec![];

    let mut cursor = collection
        .find(doc! {"_id": {"$in": &tags}}, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    while let Some(data) = cursor.try_next().await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })? {
        result.push(data);
    }

    if result.len() != tags.len() {
        return Err(DatabaseError::Input);
    }

    Ok(result)
}
