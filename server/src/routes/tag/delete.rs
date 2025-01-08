use bson::oid::ObjectId;
use mongodb::bson::doc;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;

use crate::db::tag;
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::{RevalidateResult, Revalidator};
use crate::models::auth::UserInfo;
use crate::models::response::{Response, ResponseBody};
use crate::models::tag::Tag;
use crate::HTTPErr;

#[delete("/tag/<tag_id>")]
pub async fn delete(db: &State<Database>, _user_info: UserInfo, tag_id: String) -> Response<Tag> {
    let tag_id = HTTPErr!(
        ObjectId::parse_str(&tag_id),
        400,
        Some("Invalid id format.")
    );

    // Fetch all the projects the tag is related to.
    let projects = match tag::find_projects(db, tag_id).await {
        Ok(data) => data,
        Err(_) => vec![],
    };

    // Delete tag from db
    let data = tag::delete(db, tag_id).await.map_err(|error| match error {
        DatabaseError::NotFound => CustomError::build(404, Some("No tag with this ID exists")),
        _ => CustomError::build(500, None),
    })?;

    // Delete icon if it exists.
    if data.icon_updated_at.is_some() {
        data.delete_file();
    }

    let mut revalidated = Revalidator::new();

    // Check every project that contains this tag.
    for project in &projects {
        revalidated = revalidated.add_project(project.id);
    }

    // Check projects page and gallery should be re-rendered.
    if !projects.is_empty() {
        revalidated = revalidated.add_projects();
        revalidated = revalidated.add_gallery();
    }

    // Check if about page should be re-rendered.
    if data.is_experience() {
        revalidated = revalidated.add_about();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond.
    Ok(Json(ResponseBody { data, revalidated }))
}

#[delete("/tag/icon/<tag_id>")]
pub async fn delete_icon(
    db: &State<Database>,
    _user_info: UserInfo,
    tag_id: String,
) -> Response<Tag> {
    // Check if valid tag_id.
    let tag_id = HTTPErr!(ObjectId::parse_str(tag_id), 400, Some("Invalid id format."));

    // Update db entry.
    let data = tag::update_icon(db, tag_id, None)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, None),
            _ => CustomError::build(500, None),
        })?;

    // Remove file.
    data.delete_file();

    // Revalidate page if needed.
    let mut revalidated: Option<RevalidateResult> = None;

    if data.is_experience() {
        revalidated = Some(Revalidator::new().add_about().send().await);
    }

    // Response.
    Ok(Json(ResponseBody { data, revalidated }))
}
