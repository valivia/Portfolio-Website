use crate::db::project::find_by_id;
use crate::errors::database::DatabaseError;
use crate::models::asset::Asset;
use crate::models::project::ProjectDocument;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub async fn delete(
    db: &Database,
    project_id: ObjectId,
    asset_id: ObjectId,
) -> Result<Asset, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::Before)
        .build();

    let project = find_by_id(db, project_id).await?;

    let mut doc = doc! { "$pull": { "assets": { "_id": asset_id } } };
    if project.banner_id == Some(asset_id.to_string()) {
        doc = doc! { "$pull": { "assets": { "_id": asset_id } }, "$set": { "banner_id": None::<ObjectId> } };
    }

    let data = collection
        .find_one_and_update(
            doc! { "assets._id": asset_id, "_id": project_id },
            doc,
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .get_asset_by_id(asset_id)
        .ok_or(DatabaseError::Database)?
        .into();

    Ok(data)
}
