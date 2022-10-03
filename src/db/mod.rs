use futures::TryStreamExt;
use mongodb::bson::doc;
// use mongodb::bson::{doc, Document};
use mongodb::options::{ClientOptions, IndexOptions};
use mongodb::{Client, Cursor, Database, IndexModel};
use rocket::fairing::AdHoc;
use std::env;
use std::fmt::Display;

use crate::errors::database::DatabaseError;
use crate::models::mail::Mail;
use crate::models::project::ProjectDocument;
use crate::models::tag::TagDocument;

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
    let mongo_uri = env::var("MONGO_URL").expect("MONGO_URI is not found.");
    let mongo_db_name = env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME is not found.");

    let client_options = ClientOptions::parse(mongo_uri).await?;
    let client = Client::with_options(client_options)?;
    let database = client.database(mongo_db_name.as_str());

    let _ = prepare_db(&database).await;

    println!("MongoDB Connected!");

    Ok(database)
}

async fn prepare_db(db: &Database) -> Result<(), DatabaseError> {
    let index_options = IndexOptions::builder().unique(true).build();
    let mailing_collection = db.collection::<Mail>("mailing");
    let project_collection = db.collection::<ProjectDocument>("project");
    let tag_collection = db.collection::<TagDocument>("project");

    let mailing_index = IndexModel::builder()
        .keys(doc! {"email": 1})
        .options(index_options.clone())
        .build();

    mailing_collection
        .create_index(mailing_index, None)
        .await
        .unwrap();

    // let project_index = IndexModel::builder()
    //     .keys(doc! {"name": 1})
    //     .options(index_options.clone())
    //     .build();

    // project_collection
    //     .create_index(project_index, None)
    //     .await
    //     .unwrap();

    // let tag_index = IndexModel::builder()
    //     .keys(doc! {"name": 1})
    //     .options(index_options.clone())
    //     .build();

    // tag_collection.create_index(tag_index, None).await.unwrap();

    Ok(())
}

#[async_trait]
trait CursorToVec<O> {
    async fn cursor_to_vec(self) -> Result<Vec<O>, DatabaseError>;
}

#[async_trait]
impl<I, O> CursorToVec<O> for Cursor<I>
where
    mongodb::Cursor<I>: futures::TryStream,
    <mongodb::Cursor<I> as futures::TryStream>::Error: Display,
    I: Unpin + Send,
    O: Send,
    O: From<<mongodb::Cursor<I> as futures::TryStream>::Ok>,
{
    async fn cursor_to_vec(mut self) -> Result<Vec<O>, DatabaseError> {
        let mut output: Vec<O> = vec![];

        while let Some(result) = self.try_next().await.map_err(|error| {
            eprintln!("{error}");
            DatabaseError::Database
        })? {
            output.push(O::from(result));
        }

        Ok(output)
    }
}
