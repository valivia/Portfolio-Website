use mongodb::bson::oid::ObjectId;
use mongodb::bson::DateTime;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDocument {
    pub _id: ObjectId,
    pub created_at: DateTime,
    pub project_id: ObjectId,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,

    pub width: Option<u64>,
    pub height: Option<u64>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct Asset {
    #[serde(rename = "id")]
    pub _id: String,

    pub created_at: String,
    pub project_id: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,

    pub width: Option<u64>,
    pub height: Option<u64>,
}

impl From<AssetDocument> for Asset {
    fn from(x: AssetDocument) -> Self {
        Asset {
            _id: x._id.to_string(),
            created_at: x.created_at.try_to_rfc3339_string().unwrap(),
            project_id: x.project_id.to_string(),
            alt: x.alt,
            description: x.description,
            is_displayed: x.is_displayed,
            width: x.width,
            height: x.height,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct AssetInput {
    pub created_at: String,
    pub project_id: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
}
