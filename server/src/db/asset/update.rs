use crate::errors::database::DatabaseError;
use crate::models::asset::{Asset, AssetDocument, AssetUpdate};
use crate::models::project::ProjectDocument;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub async fn patch(
    db: &Database,
    project_id: ObjectId,
    asset_id: ObjectId,
    input: AssetUpdate,
) -> Result<(Asset, Asset), DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let old = collection
        .find_one(doc! {"assets._id": asset_id}, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .get_asset_by_id(asset_id)
        .ok_or(DatabaseError::Database)?;

    let AssetUpdate {
        created_at,
        alt,
        description,
        is_displayed,
        is_pinned,
    } = input;

    let doc = AssetDocument {
        id: old.id,
        created_at: created_at.into(),
        alt,
        description,
        is_displayed,
        is_pinned,
        width: old.width,
        height: old.height,
    };

    let doc = bson::to_bson(&doc).map_err(|_| DatabaseError::Input)?;

    let query_options = FindOneAndUpdateOptions::builder()
        .return_document(ReturnDocument::After)
        .build();

    let current = collection
        .find_one_and_update(
            doc! { "assets._id": asset_id, "_id": project_id },
            doc! {"$set": {"assets.$" : doc}},
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

    Ok((current, old.into()))
}
