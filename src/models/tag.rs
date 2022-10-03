use std::{fs::remove_file, path::PathBuf};

use chrono::{DateTime, Utc};
use mongodb::bson;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};
use rocket_validation::Validate;

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,

    pub icon_updated_at: Option<bson::DateTime>,
    pub used_since: bson::DateTime,
    pub notable_project: Option<ObjectId>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,

    pub icon_updated_at: Option<DateTime<Utc>>,
    pub used_since: DateTime<Utc>,
    pub notable_project: Option<ObjectId>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}

impl Tag {
    pub fn delete_file(&self) {
        // Remove main image.
        let path = PathBuf::from(format!("media/tag/{}.svg", self.id));
        let _ = remove_file(&path)
            .map_err(|_| eprintln!("Failed to delete \"{}\"", path.to_string_lossy()));
    }

    pub fn is_experience(&self) -> bool {
        self.icon_updated_at.is_some() && self.score.is_some()
    }
}

impl From<TagDocument> for Tag {
    fn from(x: TagDocument) -> Self {
        let icon_updated_at: Option<DateTime<Utc>> = x.icon_updated_at.map(|data| data.into());
        Tag {
            id: x.id.to_string(),
            icon_updated_at,
            used_since: x.used_since.into(),
            notable_project: x.notable_project,
            name: x.name,
            description: x.description,
            website: x.website,
            score: x.score,
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct TagInput {
    pub used_since: DateTime<Utc>,

    pub notable_project: Option<ObjectId>,

    #[validate(length(min = 3, max = 32))]
    pub name: String,

    #[validate(length(min = 3))]
    pub description: Option<String>,

    #[validate(url)]
    pub website: Option<String>,

    #[validate(range(min = 0, max = 100))]
    pub score: Option<u8>,
}