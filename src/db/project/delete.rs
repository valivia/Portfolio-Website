use crate::errors::database::DatabaseError;
use crate::models::project::Project;
use crate::models::project::ProjectDocument;

use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;
use mongodb::Database;

pub async fn delete(db: &Database, oid: ObjectId) -> Result<Project, DatabaseError> {
    let collection = db.collection::<ProjectDocument>("project");

    let project: Project = collection
        .find_one_and_delete(doc! {"_id":oid }, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?
        .into();

    project.assets.iter().for_each(|asset| asset.delete_files());

    Ok(project)
}
