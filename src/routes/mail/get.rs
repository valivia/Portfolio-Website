use crate::{
    db::mailing,
    errors::{database::DatabaseError, response::CustomError},
    HTTPErr,
};
use bson::oid::ObjectId;
use mongodb::Database;
use rocket::State;

#[get("/mailing/delete/<id>")]
pub async fn delete(db: &State<Database>, id: String) -> Result<(), CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(id), 400, "Invalid id format.");

    mailing::delete(db, oid).await.map_err(|err| match err {
        DatabaseError::NotFound => CustomError::build(404, Some("There is no email with this ID")),
        DatabaseError::Database => {
            CustomError::build(500, Some("Failed to delete this data from the database"))
        }
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    Ok(())
}

#[get("/mailing/verify/<id>")]
pub async fn verify(db: &State<Database>, id: String) -> Result<(), CustomError> {
    let oid = HTTPErr!(ObjectId::parse_str(id), 400, "Invalid id format.");

    mailing::verify(db, oid).await.map_err(|err| match err {
        DatabaseError::NotFound => {
            CustomError::build(404, Some("There is no pending email with this ID"))
        }
        DatabaseError::Database => {
            CustomError::build(500, Some("Failed to update this data in the database"))
        }
        _ => CustomError::build(500, Some("Unexpected server error.")),
    })?;

    Ok(())
}
