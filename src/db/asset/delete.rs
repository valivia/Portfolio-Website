use crate::errors::database::DatabaseError;
use crate::models::asset::Asset;
use crate::models::project::ProjectDocument;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub async fn delete(db: &Database, oid: ObjectId) -> Result<Asset, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::Before)
        .build();

    let data = collection
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
        .ok_or(DatabaseError::NotFound)?
        .get_asset_by_id(oid)
        .ok_or(DatabaseError::Database)?
        .into();

    Ok(data)
}
