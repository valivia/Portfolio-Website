use json::Json;
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json;
use rocket::State;

use crate::db::asset;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::asset::Asset;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

#[delete("/asset/<id>")]
pub async fn delete(db: &State<Database>, id: String) -> Response<Asset> {
    let oid = HTTPErr!(ObjectId::parse_str(&id), 400, "Invalid id format.");

    // Delete from DB.
    let data = asset::delete(db, oid).await.map_err(|error| match error {
        DatabaseError::NotFound => CustomError::build(404, Some("No asset with this ID exists")),
        DatabaseError::Database => {
            CustomError::build(500, Some("Failed to delete asset from the database"))
        }
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    data.delete_files();

    // Revalidate paths on next.js.
    let mut revalidated = Revalidator::new().add_project(oid);

    // Check if gallery page should be re-rendered.
    if data.is_displayed {
        revalidated = revalidated.add_gallery();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond
    Ok(Json(ResponseBody { revalidated, data }))
}
