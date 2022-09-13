use mongodb::bson::oid::ObjectId;
use mongodb::bson::DateTime;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use super::{
    asset::{Asset, AssetDocument},
    tag::{Tag, TagDocument},
};

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema, Copy)]
pub enum Status {
    Finished,
    InProgress,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectDocument {
    pub _id: ObjectId,

    pub createdAt: DateTime,
    pub updatedAt: DateTime,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub isPinned: bool,
    pub isProject: bool,

    pub assets: Vec<AssetDocument>,
    pub tags: Vec<TagDocument>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct Project {
    #[serde(rename = "id")]
    pub _id: String,
    pub createdAt: String,
    pub updatedAt: String,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub isPinned: bool,
    pub isProject: bool,

    pub tags: Vec<Tag>,
    pub assets: Vec<Asset>,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct ProjectInput {
    #[serde(rename = "id")]
    pub _id: String,
    pub createdAt: String,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub isPinned: bool,
    pub isProject: bool,
}
