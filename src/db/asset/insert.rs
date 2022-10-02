use crate::errors::database::DatabaseError;
use crate::models::asset::{Asset, AssetDocument, AssetUpdate};
use crate::models::project::ProjectDocument;
use bson::oid::ObjectId;
use mongodb::bson::doc;
use mongodb::Database;

pub async fn insert(
    db: &Database,
    project_id: ObjectId,
    input: AssetUpdate,
    asset_id: ObjectId,
    width: u32,
    height: u32,
) -> Result<Asset, DatabaseError> {
    let projects = db.collection::<ProjectDocument>("project");

    let AssetUpdate {
        created_at,
        alt,
        description,
        is_displayed,
        is_pinned,
    } = input;

    let doc = AssetDocument {
        id: asset_id,
        created_at: created_at.into(),
        alt,
        description,
        is_displayed,
        is_pinned,
        width,
        height,
    };

    let doc = bson::to_bson(&doc).map_err(|_| DatabaseError::Input)?;

    let data = projects
        .find_one_and_update(
            doc! {
                "_id": project_id,
            },
            doc! {
                "$push": { "assets": doc }
            },
            None,
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
