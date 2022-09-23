use mongodb::bson::{oid::ObjectId, doc};
use mongodb::bson::{DateTime, Document};
use rocket::fs::TempFile;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetDocument {
    pub _id: ObjectId,

    pub created_at: DateTime,

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

    pub created_at: String,

    pub alt: Option<String>,
    pub description: Option<String>,

    pub is_displayed: bool,
    pub is_pinned: bool,

    pub width: u32,
    pub height: u32,
}

impl From<AssetDocument> for Asset {
    fn from(x: AssetDocument) -> Self {
        Asset {
            _id: x._id.to_string(),

            created_at: x.created_at.try_to_rfc3339_string().unwrap(),

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
    pub created_at: String,

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

    pub created_at: DateTime,
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
        doc! {
            "_id": self.id,
            "created_at": self.created_at,
            "alt":  self.alt,
            "description": self.description,

            "is_displayed": self.is_displayed,
            "is_pinned": self.is_pinned,

            "width": self.width,
            "height": self.height,
        }
    }
}
