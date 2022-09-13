use mongodb::bson::oid::ObjectId;
use mongodb::bson::DateTime;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDocument {
    pub _id: ObjectId,
    pub createdAt: DateTime,
    pub projectId: ObjectId,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub display: bool,

    pub width: Option<u64>,
    pub height: Option<u64>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct Asset {
    #[serde(rename = "id")]
    pub _id: String,

    pub createdAt: String,
    pub projectId: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub display: bool,

    pub width: Option<u8>,
    pub height: Option<u8>,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct AssetInput {
    pub createdAt: String,
    pub projectId: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub display: bool,
}
