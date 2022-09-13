use mongodb::bson::oid::ObjectId;
use mongodb::bson::DateTime;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagDocument {
    pub _id: ObjectId,

    pub createdAt: DateTime,
    pub usedSince: DateTime,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
    pub notableProject: Option<ObjectId>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct Tag {
    #[serde(rename = "id")]
    pub _id: String,

    pub createdAt: String,
    pub usedSince: String,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
    pub notableProject: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct TagInput {
    pub usedSince: String,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
    pub notableProject: Option<String>,
}
