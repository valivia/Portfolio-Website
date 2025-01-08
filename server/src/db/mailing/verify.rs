use bson::{doc, oid::ObjectId};
use mongodb::Database;

use crate::{errors::database::DatabaseError, models::mail::Mail};

pub async fn verify(db: &Database, id: ObjectId) -> Result<String, DatabaseError> {
    let collection = db.collection::<Mail>("mailing");

    let doc = doc! {
        "$set": { "is_verified": true },
    };

    let result = collection
        .find_one_and_update(doc! {"_id": id, "is_verified": false}, doc, None)
        .await
        .map_err(|err| {
            eprintln!("{}", err);
            DatabaseError::Database
        })?
        .ok_or(DatabaseError::NotFound)?;

    Ok(result.email)
}
