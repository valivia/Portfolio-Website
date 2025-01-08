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

use super::find_by_id_raw;

pub async fn update(
    db: &Database,
    tag_id: ObjectId,
    input: Json<TagInput>,
) -> Result<(Tag, Tag), DatabaseError> {
    let tag_collection = db.collection::<TagDocument>("tag");
    let project_collection = db.collection::<ProjectDocument>("project");

    let old_tag = find_by_id_raw(db, tag_id).await?;

    let TagInput {
        used_since,
        notable_project,
        name,
        description,
        website,
        score,
        category
    } = input.0;

    let updated_tag = TagDocument {
        id: old_tag.id,
        icon_updated_at: old_tag.icon_updated_at,
        used_since: used_since.into(),
        notable_project,
        name,
        description,
        website,
        score,
        category
    };

    let doc = bson::to_bson(&updated_tag).unwrap();

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let new_tag = tag_collection
        .find_one_and_update(doc! {"_id": tag_id}, doc! {"$set": &doc}, query_options)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into();

    project_collection
        .update_many(
            doc! {"tags._id": tag_id},
            doc! {"$set": { "tags.$": doc } },
            None,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    Ok((new_tag, old_tag.into()))
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
