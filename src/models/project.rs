use std::fmt::{Display, Formatter};

use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};

use chrono::{DateTime, Utc};

use super::{
    asset::{Asset, AssetDocument},
    tag::{Tag, TagDocument},
};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum Status {
    Finished,
    InProgress,
}

impl Display for Status {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Status::Finished => write!(f, "Finished"),
            Status::InProgress => write!(f, "InProgress"),
        }
    }
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,

    pub created_at: mongodb::bson::DateTime,
    pub updated_at: mongodb::bson::DateTime,

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
    pub fn get_asset_by_id(self, id: String) -> Option<Asset> {
        let project: Project = self.into();
        project
            .assets
            .iter()
            .find(|entry| entry._id == id)
            .map(|data| data.to_owned())
    }
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    // #[serde(rename = "id")]
    pub id: String,
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

impl From<ProjectDocument> for Project {
    fn from(x: ProjectDocument) -> Self {
        let assets_parsed: Vec<Asset> = x.assets.iter().map(|y| Asset::from(y.clone())).collect();
        let tags_parsed: Vec<Tag> = x.tags.iter().map(|y| Tag::from(y.clone())).collect();
        Project {
            id: x.id.to_string(),
            created_at: x.created_at.try_to_rfc3339_string().unwrap(),
            updated_at: x.updated_at.try_to_rfc3339_string().unwrap(),
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInput {
    pub created_at: DateTime<Utc>,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub is_pinned: bool,
    pub is_project: bool,

    pub tags: Option<Vec<ObjectId>>,
}