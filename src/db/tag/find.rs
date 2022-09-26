use crate::errors::database::DatabaseError;
use crate::models::tag::TagDocument;
use crate::models::tag::Tag;

use futures::stream::TryStreamExt;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOptions;
use mongodb::Database;

pub async fn find(db: &Database, limit: i64, page: i64) -> Result<Vec<Tag>, DatabaseError> {
    let collection = db.collection::<TagDocument>("tag");

    let find_options = FindOptions::builder()
        .limit(limit)
        .skip(u64::try_from((page - 1) * limit).unwrap())
        .build();

    let mut cursor = collection.find(None, find_options).await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })?;

    let mut tags: Vec<Tag> = vec![];

    while let Some(result) = cursor.try_next().await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })? {
        let tag_json = Tag::from(result);
        tags.push(tag_json);
    }

    Ok(tags)
}

pub async fn find_by_id(db: &Database, oid: ObjectId) -> Result<Tag, DatabaseError> {
    let collection = db.collection::<TagDocument>("tag");

    let tag = Tag::from(
        collection
            .find_one(doc! {"_id":oid }, None)
            .await
            .map_err(|error| {
                eprintln!("{error}");
                DatabaseError::Database
            })?
            .ok_or(DatabaseError::NotFound)?,
    );

    Ok(tag)
}
