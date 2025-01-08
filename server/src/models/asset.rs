use std::fs::remove_file;
use std::path::PathBuf;

use chrono::{DateTime, Utc};
use mongodb::bson;
use mongodb::bson::{doc, oid::ObjectId};
use rocket::fs::TempFile;
use rocket_validation::Validate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,

    pub created_at: bson::DateTime,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Asset {
    pub id: String,

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
        asset_path.push(format!("{}.jpg", self.id));

        let _ = remove_file(&asset_path)
            .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));

        // Remove square image.
        asset_path.set_file_name(format!("{}_square.jpg", self.id));

        let _ = remove_file(&asset_path)
            .map_err(|_| eprintln!("Failed to delete \"{}\"", asset_path.to_string_lossy()));
    }
}

impl From<AssetDocument> for Asset {
    fn from(x: AssetDocument) -> Self {
        Asset {
            id: x.id.to_string(),

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

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct AssetUpdate {
    pub created_at: DateTime<Utc>,

    #[validate(length(min = 3))]
    pub alt: Option<String>,
    #[validate(length(min = 3))]
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,
}

#[derive(Debug, FromForm)]
pub struct AssetPost<'t> {
    pub created_at: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub file: TempFile<'t>,
}
