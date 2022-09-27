use mongodb::bson::doc;
// use mongodb::bson::{doc, Document};
use mongodb::options::{ClientOptions, IndexOptions};
use mongodb::{Client, Database, IndexModel};
use rocket::fairing::AdHoc;
use std::env;

use crate::errors::database::DatabaseError;
use crate::models::mail::Mail;

pub mod asset;
pub mod mailing;
pub mod project;
pub mod tag;

pub fn init() -> AdHoc {
    AdHoc::on_ignite("Connecting to MongoDB", |rocket| async {
        match connect().await {
            Ok(database) => rocket.manage(database),
            Err(error) => {
                panic!("Cannot connect to instance:: {:?}", error)
            }
        }
    })
}

async fn connect() -> mongodb::error::Result<Database> {
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI is not found.");
    let mongo_db_name = env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME is not found.");

    let client_options = ClientOptions::parse(mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database(mongo_db_name.as_str());

    prepare_db(&database).await;

    println!("MongoDB Connected!");

    Ok(database)
}

async fn prepare_db(db: &Database) -> Result<(), DatabaseError> {
    let index_options = IndexOptions::builder().unique(true).build();
    let mailing_collection = db.collection::<Mail>("mailing");

    let mailing_index = IndexModel::builder()
        .keys(doc! {"email": 1})
        .options(index_options)
        .build();

    mailing_collection
        .create_index(mailing_index, None)
        .await
        .unwrap();

    Ok(())
}
