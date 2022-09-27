use crate::errors::database::DatabaseError;
use crate::models::project::ProjectDocument;
use crate::models::tag::Tag;
use crate::models::tag::TagDocument;
use crate::models::tag::TagInput;

use bson::DateTime;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::FindOneAndUpdateOptions;
use mongodb::options::ReturnDocument;
use mongodb::Database;
use rocket::serde::json::Json;

pub async fn update(
    db: &Database,
    oid: ObjectId,
    input: Json<TagInput>,
) -> Result<Tag, DatabaseError> {
    let tag_collection = db.collection::<TagDocument>("tag");
    let project_collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let update_tag_doc = input.clone().into_inner().into_tag_doc();
    let update_project_doc = input.into_inner().into_project_doc();

    let tag = tag_collection
        .find_one_and_update(
            doc! {"_id": oid},
            doc! {"$set": update_tag_doc},
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into();

    project_collection
        .update_many(
            doc! {"tags._id": oid},
            doc! {"$set": update_project_doc},
            None,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    Ok(tag)
}

pub async fn update_icon(
    db: &Database,
    oid: ObjectId,
    icon_updated_at: Option<DateTime>,
) -> Result<Tag, DatabaseError> {
    let tag_collection = db.collection::<TagDocument>("tag");
    let project_collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let tag = tag_collection
        .find_one_and_update(
            doc! {"_id": oid},
            doc! {"$set": { "icon_updated_at": icon_updated_at }},
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into();

    project_collection
        .update_many(
            doc! {"tags._id": oid},
            doc! {"$set": { "tags.$.icon_updated_at": icon_updated_at}},
            None,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    Ok(tag)
}
