use crate::models::tag::Tag;
use crate::models::tag::TagDocument;
use crate::models::tag::TagInput;

use futures::stream::TryStreamExt;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime, Document};
use mongodb::options::FindOneAndUpdateOptions;
use mongodb::options::FindOptions;
use mongodb::options::ReturnDocument;
use mongodb::Database;
use rocket::serde::json::Json;

use anyhow::Result;

pub async fn find(db: &Database, limit: i64, page: i64) -> mongodb::error::Result<Vec<Tag>> {
    let collection = db.collection::<TagDocument>("tag");

    let find_options = FindOptions::builder()
        .limit(limit)
        .skip(u64::try_from((page - 1) * limit).unwrap())
        .build();

    let mut cursor = collection.find(None, find_options).await?;

    let mut tags: Vec<Tag> = vec![];
    while let Some(result) = cursor.try_next().await? {
        let tag_json = Tag::from(result);
        tags.push(tag_json);
    }

    Ok(tags)
}

pub async fn find_by_id(db: &Database, oid: ObjectId) -> mongodb::error::Result<Option<Tag>> {
    let collection = db.collection::<TagDocument>("tag");

    let tag_doc = collection.find_one(doc! {"_id":oid }, None).await?;
    if tag_doc.is_none() {
        return Ok(None);
    }
    let unwrapped_doc = tag_doc.unwrap();

    let tag_json = Tag::from(unwrapped_doc);

    Ok(Some(tag_json))
}

pub async fn insert(db: &Database, input: Json<TagInput>) -> Result<String> {
    let collection = db.collection::<Document>("tag");

    let insert_one_result = collection
        .insert_one(
            doc! {
                "used_since": DateTime::parse_rfc3339_str(input.used_since.clone())?,

                "name": input.name.clone(),
                "description": input.description.clone(),
                "website": input.website.clone(),

                "notable_project": input.notable_project.clone().map(|y| ObjectId::parse_str(y).unwrap()),

                "score": input.score.map(i32::from),
            },
            None,
        )
        .await?;

    Ok(insert_one_result.inserted_id.to_string())
}

pub async fn update(
    db: &Database,
    oid: ObjectId,
    input: Json<TagInput>,
) -> mongodb::error::Result<Option<Tag>> {
    let collection = db.collection::<TagDocument>("tag");
    let find_one_and_update_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let created_at: DateTime = DateTime::now();

    let tag_doc = collection
        .find_one_and_update(
            doc! {"_id":oid },
            doc! {"$set": {"name": input.name.clone(), "createdAt": created_at}},
            find_one_and_update_options,
        )
        .await?;

    if tag_doc.is_none() {
        return Ok(None);
    }
    let unwrapped_doc = tag_doc.unwrap();

    let tag_json = Tag::from(unwrapped_doc);

    Ok(Some(tag_json))
}

pub async fn delete(db: &Database, oid: ObjectId) -> mongodb::error::Result<Option<Tag>> {
    let collection = db.collection::<TagDocument>("tag");

    // if you just unwrap,, when there is no document it results in 500 error.
    let tag_doc = collection
        .find_one_and_delete(doc! {"_id":oid }, None)
        .await?;
    if tag_doc.is_none() {
        return Ok(None);
    }

    let unwrapped_doc = tag_doc.unwrap();

    let tag_json = Tag::from(unwrapped_doc);

    Ok(Some(tag_json))
}
