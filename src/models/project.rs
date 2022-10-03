use mongodb::bson::{doc, oid::ObjectId};
use rocket_validation::Validate;
use serde::{Deserialize, Serialize};

use chrono::{DateTime, Utc};
use strum::{Display, EnumIter};

use super::{
    asset::{Asset, AssetDocument},
    tag::{Tag, TagDocument},
};

#[derive(Debug, EnumIter, Display, Serialize, Deserialize, Clone, Copy)]
pub enum Status {
    InProgress,
    Abandoned,
    Finished,
    Unknown,
    OnHold,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,

    pub created_at: mongodb::bson::DateTime,
    pub updated_at: mongodb::bson::DateTime,

    pub banner_id: Option<ObjectId>,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub is_pinned: bool,
    pub is_project: bool,

    pub assets: Vec<AssetDocument>,
    pub tags: Vec<TagDocument>,
}

impl ProjectDocument {
    pub fn get_asset_by_id(self, id: ObjectId) -> Option<AssetDocument> {
        self.assets
            .iter()
            .find(|entry| entry.id == id)
            .map(|data| data.to_owned())
    }
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub banner_id: Option<String>,

    pub created_at: String,
    pub updated_at: String,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub is_pinned: bool,
    pub is_project: bool,

    pub tags: Vec<Tag>,
    pub assets: Vec<Asset>,
}

impl Project {
    pub fn get_asset_by_id(self, id: String) -> Option<Asset> {
        self.assets
            .iter()
            .find(|entry| entry.id == id)
            .map(|data| data.to_owned())
    }
}

impl From<ProjectDocument> for Project {
    fn from(x: ProjectDocument) -> Self {
        let assets_parsed: Vec<Asset> = x.assets.iter().map(|y| Asset::from(y.clone())).collect();
        let tags_parsed: Vec<Tag> = x.tags.iter().map(|y| Tag::from(y.clone())).collect();
        Project {
            id: x.id.to_string(),

            created_at: x.created_at.try_to_rfc3339_string().unwrap(),
            updated_at: x.updated_at.try_to_rfc3339_string().unwrap(),

            banner_id: x.banner_id.map(|a| a.to_string()),

            name: x.name,
            description: x.description,
            markdown: x.markdown,

            status: x.status,
            is_pinned: x.is_pinned,
            is_project: x.is_project,

            tags: tags_parsed,
            assets: assets_parsed,
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct ProjectInput {
    pub created_at: DateTime<Utc>,

    #[validate(length(min = 3, max = 32))]
    pub name: String,

    #[validate(length(min = 3))]
    pub description: Option<String>,

    #[validate(length(min = 3))]
    pub markdown: Option<String>,

    pub status: Status,
    pub is_pinned: bool,
    pub is_project: bool,

    pub tags: Option<Vec<ObjectId>>,
}
