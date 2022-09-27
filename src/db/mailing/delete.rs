use bson::{doc, oid::ObjectId};
use mongodb::Database;

use crate::{errors::database::DatabaseError, models::mail::Mail};

pub async fn delete(db: &Database, id: ObjectId) -> Result<String, DatabaseError> {
    let collection = db.collection::<Mail>("mailing");

    let result = collection
        .find_one_and_delete(doc! {"_id": id}, None)
        .await
        .map_err(|err| {
            eprintln!("{}", err);
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?;

    Ok(result.email)
}
