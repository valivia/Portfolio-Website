use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Asset {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub project_id: ObjectId,

    pub created: DateTime,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub width: Option<u64>,
    pub height: Option<u64>,
    pub display: bool,
}
