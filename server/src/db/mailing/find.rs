use crate::errors::database::DatabaseError;
use crate::models::mail::Mail;

use futures::stream::TryStreamExt;
use mongodb::bson::doc;
use mongodb::Database;

pub async fn find(db: &Database) -> Result<Vec<Mail>, DatabaseError> {
    let collection = db.collection::<Mail>("mailing");

    let mut cursor = collection
        .find(doc! { "is_verified": true }, None)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })?;

    let mut entries: Vec<Mail> = vec![];

    while let Some(result) = cursor.try_next().await.map_err(|error| {
        eprintln!("{error}");
        DatabaseError::Database
    })? {
        entries.push(result);
    }

    Ok(entries)
}
