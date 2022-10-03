use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::Validated;

use crate::db::asset;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::asset::{Asset, AssetUpdate};
use crate::models::auth::UserInfo;
use crate::models::response::{Response, ResponseBody};
use crate::HTTPErr;

#[patch("/asset/<project_id>/<asset_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _user_info: UserInfo,
    input: Validated<Json<AssetUpdate>>,
    project_id: String,
    asset_id: String,
) -> Response<Asset> {
    let input = input.into_inner();
    let project_id = HTTPErr!(ObjectId::parse_str(project_id), 400, "Invalid id format.");
    let asset_id = HTTPErr!(ObjectId::parse_str(asset_id), 400, "Invalid id format.");

    // update DB entry.
    let (new_asset, old_asset) = asset::patch(db, project_id, asset_id, input.into_inner())
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

    // Revalidate paths on next.js.
    let mut revalidated = Revalidator::new().add_project(project_id);

    // Check if gallery page should be re-rendered.
    if new_asset.is_displayed || old_asset.is_displayed {
        revalidated = revalidated.add_gallery();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond
    Ok(Json(ResponseBody {
        revalidated,
        data: new_asset,
    }))
}
