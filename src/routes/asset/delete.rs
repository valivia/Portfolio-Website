use std::path::PathBuf;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::State;
use tokio::fs::remove_file;

use crate::db::asset;
use crate::db::asset::InsertError;
use crate::errors::response::CustomError;
use crate::HTTPErr;

#[delete("/asset/<id>")]
pub async fn delete(db: &State<Database>, id: String) -> Result<(), CustomError> {
    dbg!(&id);
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    // Delete from DB.
    asset::delete(db, oid).await.map_err(|error| match error {
        InsertError::NotFound => CustomError::build(404, Some("No asset with this ID exists")),
        InsertError::Database => {
            CustomError::build(500, Some("Failed to delete asset from the database"))
        },
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    // Remove main image.
    let mut asset_path = PathBuf::from("media/content");
    asset_path.push(format!("{oid}.jpg"));

    let _ = remove_file(&asset_path)
        .await
        .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));

    // Remove square image.
    asset_path.set_file_name(format!("{oid}_square.jpg"));

    let _ = remove_file(&asset_path)
        .await
        .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));

    Ok(())
}
