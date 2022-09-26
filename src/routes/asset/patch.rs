use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::asset;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::asset::{Asset, AssetUpdate};
use crate::HTTPErr;

#[patch("/asset/<id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    id: String,
    input: Json<AssetUpdate>,
) -> Result<Json<Asset>, CustomError> {
    dbg!(&id);
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    // update DB entry.
    let result = asset::patch(db, oid, input.into_inner())
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => {
                CustomError::build(404, Some("No asset with this ID exists"))
            }
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to update asset in the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error")),
        })?;

    Ok(Json(result))
}
