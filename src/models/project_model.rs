use bson::{uuid, DateTime};
use mongodb::bson::oid::ObjectId;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use super::{asset_model::Asset, tag_model::Tag};

pub type ProjectJson = Project<String, String>;
pub type ProjectBson = Project<ObjectId, DateTime>;

impl From<ProjectJson> for ProjectBson {
    fn from(json: ProjectJson) -> Self {
        ProjectBson {
            id: json.id.parse().expect("id is not a valid ObjectID"),
            updated: DateTime::from_millis(
                json.updated
                    .parse()
                    .expect("updated is not a valid unix timestamp"),
            ),

            mutable: json.mutable.into(),

            assets: json.assets,
            tags: json.tags,
        }
    }
}
impl From<ProjectBson> for ProjectJson {
    fn from(bson: ProjectBson) -> Self {
        ProjectJson {
            id: bson.id.to_hex(),
            updated: bson.updated.timestamp_millis().to_string(),

            mutable: bson.mutable.into(),

            assets: bson.assets,
            tags: bson.tags,
        }
    }
}

pub type ProjectMutableJson = ProjectMutable<String>;
pub type ProjectMutableBson = ProjectMutable<DateTime>;

impl From<ProjectMutableJson> for ProjectMutableBson {
    fn from(json: ProjectMutableJson) -> Self {
        ProjectMutableBson {
            created: DateTime::from_millis(
                json.created
                    .parse()
                    .expect("created is not a valid unix timestamp"),
            ),

            description: json.description,
            is_pinned: json.is_pinned,
            is_project: json.is_project,
            markdown: json.markdown,
            name: json.name,
            status: json.status,
        }
    }
}

impl From<ProjectMutableBson> for ProjectMutableJson {
    fn from(bson: ProjectMutableBson) -> Self {
        ProjectMutableJson {
            created: bson.created.timestamp_millis().to_string(),

            description: bson.description,
            is_pinned: bson.is_pinned,
            is_project: bson.is_project,
            markdown: bson.markdown,
            name: bson.name,
            status: bson.status,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Project<ID, DT> {
    #[serde(rename = "_id")]
    pub id: ID,

    pub updated: DT,

    pub assets: Vec<Asset>,
    pub tags: Vec<Tag>,

    #[serde(flatten)]
    pub mutable: ProjectMutable<DT>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMutable<DT> {
    pub created: DT,

    pub name: String,
    pub description: Option<String>,
    pub markdown: Option<String>,

    pub status: Status,
    pub is_pinned: bool,
    pub is_project: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum Status {
    Finished,
    InProgress,
}
