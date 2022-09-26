use crate::errors::database::DatabaseError;
use crate::models::asset::{Asset, AssetUpdate};
use crate::models::project::ProjectDocument;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, DateTime};
use mongodb::options::{FindOneAndUpdateOptions, ReturnDocument};
use mongodb::Database;

pub async fn patch(
    db: &Database,
    oid: ObjectId,
    input: AssetUpdate,
) -> Result<Asset, DatabaseError> {
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

    collection
        .find_one_and_update(
            doc! {"assets._id": oid},
            doc! {"$set": update_doc},
            query_options,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .get_asset_by_id(oid.to_string())
        .ok_or(DatabaseError::Database)
}
