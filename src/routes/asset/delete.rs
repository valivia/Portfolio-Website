use json::Json;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::State;
use rocket::serde::json;

use crate::db::asset;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::HTTPErr;
use crate::models::asset::Asset;

#[delete("/asset/<id>")]
pub async fn delete(db: &State<Database>, id: String) -> Result<Json<Asset>, CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    // Delete from DB.
    let asset = asset::delete(db, oid).await.map_err(|error| match error {
        DatabaseError::NotFound => CustomError::build(404, Some("No asset with this ID exists")),
        DatabaseError::Database => {
            CustomError::build(500, Some("Failed to delete asset from the database"))
        },
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    asset.delete_files();

    Ok(Json(asset))
}
