use crate::errors::database::DatabaseError;
use crate::models::project::ProjectDocument;
use crate::models::tag::Tag;
use crate::models::tag::TagDocument;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;

pub async fn delete(db: &Database, oid: ObjectId) -> Result<Tag, DatabaseError> {
    let tag_collection = db.collection::<TagDocument>("tag");
    let project_collection = db.collection::<ProjectDocument>("project");

    // Delete the tag.
    let tag = Tag::from(
        tag_collection
            .find_one_and_delete(doc! {"_id":oid }, None)
            .await
            .map_err(|error| {
                eprintln!("{error}");
                DatabaseError::Database
            })?
            .ok_or(DatabaseError::NotFound)?,
    );

    // Delete the tag from the projects.
    project_collection
        .update_many(
            doc! {"tags._id": oid},
            doc! {"$pull": { "tags": { "_id": oid }}},
            None,
        )
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    Ok(tag)
}
