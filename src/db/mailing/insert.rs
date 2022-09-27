use bson::{doc, oid::ObjectId, DateTime, Document};
use mongodb::Database;

use crate::errors::database::DatabaseError;

pub async fn insert(db: &Database, address: String) -> Result<ObjectId, DatabaseError> {
    let collection = db.collection::<Document>("mailing");

    let doc = doc! {
        "created_at": DateTime::now(),
        "email": address,
        "is_verified": false,
    };

    let insert_one_result = collection.insert_one(doc, None).await.map_err(|err| {
        eprintln!("{}", err);
        DatabaseError::Duplicate
    })?;

    Ok(insert_one_result.inserted_id.as_object_id().unwrap())
}
