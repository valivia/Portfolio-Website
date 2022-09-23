use mongodb::bson::oid::ObjectId;
use mongodb::bson::DateTime;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagDocument {
    pub _id: ObjectId,

    pub used_since: DateTime,
    pub notable_project: Option<ObjectId>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct Tag {
    #[serde(rename = "id")]
    pub _id: String,

    pub used_since: String,
    pub notable_project: Option<String>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}

impl From<TagDocument> for Tag {
    fn from(x: TagDocument) -> Self {
        Tag {
            _id: x._id.to_string(),
            used_since: x.used_since.try_to_rfc3339_string().unwrap(),
            notable_project: x.notable_project.map(|id| id.to_string()),
            name: x.name,
            description: x.description,
            website: x.website,
            score: x.score,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub struct TagInput {
    pub used_since: String,
    pub notable_project: Option<String>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}
