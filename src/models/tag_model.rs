use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub used_since: DateTime,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
    pub notable_project: Option<ObjectId>,
}