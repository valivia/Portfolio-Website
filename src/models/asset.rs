use std::fs::remove_file;
use std::path::PathBuf;

use chrono::{DateTime, Utc};
use mongodb::bson;
use mongodb::bson::{doc, oid::ObjectId, Document};
use rocket::fs::TempFile;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDocument {
    pub _id: ObjectId,

    pub created_at: bson::DateTime,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub width: u32,
    pub height: u32,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Asset {
    #[serde(rename = "id")]
    pub _id: String,

    pub created_at: DateTime<Utc>,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub width: u32,
    pub height: u32,
}

impl Asset {
    pub fn delete_files(&self) {
        // Remove main image.
        let mut asset_path = PathBuf::from("media/content");
        asset_path.push(format!("{}.jpg", self._id));

        let _ = remove_file(&asset_path)
            .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));

        // Remove square image.
        asset_path.set_file_name(format!("{}_square.jpg", self._id));

        let _ = remove_file(&asset_path)
            .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));
    }
}

impl From<AssetDocument> for Asset {
    fn from(x: AssetDocument) -> Self {
        Asset {
            _id: x._id.to_string(),

            created_at: x.created_at.into(),

            alt: x.alt,
            description: x.description,

            is_displayed: x.is_displayed,
            is_pinned: x.is_pinned,

            width: x.width,
            height: x.height,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetUpdate {
    pub created_at: DateTime<Utc>,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,
}

#[derive(Debug, FromForm)]
pub struct AssetPost<'t> {
    pub created_at: String,
    pub project_id: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub file: TempFile<'t>,
}

#[derive(Debug)]
pub struct AssetInsert {
    pub id: ObjectId,

    pub created_at: DateTime<Utc>,
    pub project_id: ObjectId,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub width: u32,
    pub height: u32,
}

impl AssetInsert {
    pub fn into_doc(self) -> Document {
        let created_at: bson::DateTime = self.created_at.into();

        doc! {
            "_id": self.id,
            "created_at": created_at,
            "alt":  self.alt,
            "description": self.description,

            "is_displayed": self.is_displayed,
            "is_pinned": self.is_pinned,

            "width": self.width,
            "height": self.height,
        }
    }
}
