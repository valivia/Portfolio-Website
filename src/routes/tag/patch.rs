use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::auth::UserInfo;
use crate::models::response::{Response, ResponseBody};
use crate::models::tag::{Tag, TagInput};
use crate::HTTPErr;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use rocket_validation::Validated;

use crate::db::tag;

#[patch("/tag/<tag_id>", data = "<input>")]
pub async fn patch(
    db: &State<Database>,
    _user_info: UserInfo,
    tag_id: String,
    input: Validated<Json<TagInput>>,
) -> Response<Tag> {
    let input = input.into_inner();
    let tag_id = HTTPErr!(ObjectId::parse_str(tag_id), 400, "Invalid id format.");

    // Update database and fetch new.
    let (new_tag, old_tag) = tag::update(db, tag_id, input)
        .await
        .map_err(|error| match error {
            DatabaseError::NotFound => CustomError::build(404, Some("No tag with this ID exists")),
            DatabaseError::Database => {
                CustomError::build(500, Some("Failed to update this data in the database"))
            }
            _ => CustomError::build(500, Some("Unexpected server error.")),
        })?;

    // Fetch all the projects the tag is related to.
    let projects = match tag::find_projects(db, tag_id).await {
        Ok(data) => data,
        Err(_) => vec![],
    };

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
    if new_tag.is_experience() || old_tag.is_experience() {
        revalidated = revalidated.add_about();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond.
    Ok(Json(ResponseBody {
        revalidated,
        data: new_tag,
    }))
}
