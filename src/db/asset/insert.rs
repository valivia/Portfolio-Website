use crate::errors::database::DatabaseError;
use crate::models::asset::{Asset, AssetInsert};
use crate::models::project::ProjectDocument;
use mongodb::bson::doc;
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
