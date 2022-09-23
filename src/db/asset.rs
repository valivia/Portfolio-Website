use crate::models::asset::{Asset, AssetInsert, AssetUpdate};
use crate::models::project::ProjectDocument;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime};
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub enum InsertError {
    NotFound,
    Database,
    Input,
}

pub async fn insert(db: &Database, input: AssetInsert) -> Result<Asset, InsertError> {
    let projects = db.collection::<ProjectDocument>("project");
    let id = input.id.clone().to_string();

    let query_options = FindOneAndUpdateOptions::builder()
    .return_document(ReturnDocument::After)
    .build();

    let update_result = match projects
        .find_one_and_update(
            doc! {
                "_id": input.project_id,
            },
            doc! {
                "$push": { "assets": input.into_doc() }
            },
            query_options,
        )
        .await
    {
        Ok(data) => data,
        Err(error) => {
            eprintln!("{error}");
            return Err(InsertError::Database);
        }
    };

    match update_result {
        None => Err(InsertError::NotFound),
        Some(data) => match data.get_asset_by_id(id) {
            Some(data) => Ok(data),
            None => Err(InsertError::Database),
        },
    }
}

pub async fn delete(db: &Database, oid: ObjectId) -> Result<(), InsertError> {
    let collection = db.collection::<ProjectDocument>("project");

    let update_result = match collection
        .update_one(
            doc! {"assets._id": oid},
            doc! {"$pull": { "assets": { "_id": oid }}},
            None,
        )
        .await
    {
        Ok(data) => data,
        Err(error) => {
            eprintln!("{error}");
            return Err(InsertError::Database);
        }
    };

    match update_result.modified_count {
        0 => Err(InsertError::NotFound),
        1 => Ok(()),
        _ => unreachable!("delete_one should only delete one document"),
    }
}

pub async fn patch(db: &Database, oid: ObjectId, input: AssetUpdate) -> Result<Asset, InsertError> {
    let collection = db.collection::<ProjectDocument>("project");
    let created_at =
        DateTime::parse_rfc3339_str(&input.created_at).map_err(|_| InsertError::Input)?;

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let update_doc = doc! {
        "assets.$.created_at": created_at,

        "assets.$.alt": input.alt,
        "assets.$.description": input.description,

        "assets.$.is_displayed": input.is_displayed,
        "assets.$.is_pinned": input.is_pinned,
    };

    let update_result = match collection
        .find_one_and_update(
            doc! {"assets._id": oid},
            doc! {"$set": update_doc},
            query_options,
        )
        .await
    {
        Ok(data) => data,
        Err(error) => {
            eprintln!("{error}");
            return Err(InsertError::Database);
        }
    };

    match update_result {
        None => Err(InsertError::NotFound),
        Some(data) => match data.get_asset_by_id(oid.to_string()) {
            Some(data) => Ok(data),
            None => Err(InsertError::Database),
        },
    }
}
