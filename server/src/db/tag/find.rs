use crate::db::CursorToVec;
use crate::errors::database::DatabaseError;
use crate::models::project::ProjectDocument;
use crate::models::tag::Tag;
use crate::models::tag::TagDocument;

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

    let tags = collection
        .find(None, find_options)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .cursor_to_vec()
        .await?;

    Ok(tags)
}

pub async fn find_by_id(db: &Database, tag_id: ObjectId) -> Result<Tag, DatabaseError> {
    Ok(Tag::from(find_by_id_raw(db, tag_id).await?))
}

pub async fn find_by_id_raw(db: &Database, tag_id: ObjectId) -> Result<TagDocument, DatabaseError> {
    let collection = db.collection::<TagDocument>("tag");

    collection
        .find_one(doc! { "_id": tag_id }, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)
}

pub async fn find_projects(db: &Database, tag_id: ObjectId) -> Result<Vec<ProjectDocument>, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let projects = collection
        .find(doc! { "tags._id": tag_id }, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .cursor_to_vec()
        .await?;

    Ok(projects)
}
