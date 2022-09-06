use std::env;
extern crate dotenv;
use bson::to_bson;
use dotenv::dotenv;
use rocket::futures::StreamExt;

use crate::models::{asset_model::Asset, project_model::ProjectBson, tag_model::Tag};
use mongodb::{
    bson::{doc, extjson::de::Error, oid::ObjectId},
    results::{InsertOneResult, UpdateResult},
    Client, Collection,
};

/// Mongo collections
pub struct MongoRepo {
    project: Collection<ProjectBson>,
    tag: Collection<Tag>,
}

impl MongoRepo {
    pub async fn init() -> Self {
        dotenv().ok();
        let uri = match env::var("MONGOURI") {
            Ok(v) => v,
            Err(_) => "Error loading env variable".to_string(),
        };
        let client = Client::with_uri_str(uri).await.unwrap();
        let db = client.database("portfolio");

        MongoRepo {
            project: db.collection("project"),
            tag: db.collection("tag"),
        }
    }

    pub async fn create_project(
        &self,
        new_project: impl Into<ProjectBson>,
    ) -> Result<InsertOneResult, Error> {
        let project = self
            .project
            .insert_one(new_project.into(), None)
            .await
            .expect("Error creating user");
        Ok(project)
    }

    pub async fn get_project<P: From<ProjectBson>>(&self, id: &String) -> Result<P, Error> {
        let obj_id = ObjectId::parse_str(id).unwrap();
        let filter = doc! {"_id": obj_id};
        let project = self
            .project
            .find_one(filter, None)
            .await
            .expect("Error finding project");

        Ok(project.unwrap().into())
    }

    pub async fn get_projects<P: From<ProjectBson>>(&self) -> Result<Vec<P>, Error> {
        let cursors = self
            .project
            .find(None, None)
            .await
            .expect("Error finding all projects");

        Ok(cursors.map(|doc| doc.unwrap().into()).collect().await)
    }

    pub async fn create_asset(&self, new_asset: Asset) -> Result<UpdateResult, Error> {
        let filter = doc! {"_id": new_asset.project_id};
        let new_doc = doc! {
            "$push": {
                "asset": to_bson(&new_asset).unwrap()
            }
        };
        let asset = self
            .project
            .update_one(filter, new_doc, None)
            .await
            .expect("Error creating asset");
        Ok(asset)
    }
}
