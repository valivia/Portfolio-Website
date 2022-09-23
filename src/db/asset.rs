use crate::errors::database::DatabaseError;
use crate::models::asset::{Asset, AssetInsert, AssetUpdate};
use crate::models::project::{ProjectDocument, Project};
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime};
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub async fn insert(db: &Database, input: AssetInsert) -> Result<Asset, DatabaseError> {
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
            return Err(DatabaseError::Database);
        }
    };

    match update_result {
        None => Err(DatabaseError::NotFound),
        Some(data) => match data.get_asset_by_id(id) {
            Some(data) => Ok(data),
            None => Err(DatabaseError::Database),
        },
    }
}

pub async fn delete(db: &Database, oid: ObjectId) -> Result<Asset, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::Before)
        .build();

    let project_doc = collection
        .find_one_and_update(
            doc! {"assets._id": oid},
            doc! {"$pull": { "assets": { "_id": oid }}},
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?;

    let project = Project::from(project_doc);

    let asset = project.assets.iter().find(|entry| entry._id == oid.to_string()).ok_or(DatabaseError::Database)?.to_owned();

    Ok(asset)
}

pub async fn patch(db: &Database, oid: ObjectId, input: AssetUpdate) -> Result<Asset, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let update_doc = doc! {
        "assets.$.created_at": DateTime::from(input.created_at),

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
            return Err(DatabaseError::Database);
        }
    };

    match update_result {
        None => Err(DatabaseError::NotFound),
        Some(data) => match data.get_asset_by_id(oid.to_string()) {
            Some(data) => Ok(data),
            None => Err(DatabaseError::Database),
        },
    }
}
