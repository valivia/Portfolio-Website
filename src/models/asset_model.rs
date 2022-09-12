use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Asset {
    pub id: ObjectId,
    pub width: Option<u64>,
    pub height: Option<u64>,

    #[serde(flatten)]
    pub mutable: AssetMutable,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetMutable {
    pub project_id: ObjectId,
    pub created: DateTime,
    pub alt: Option<String>,
    pub description: Option<String>,
    pub display: bool,
}
