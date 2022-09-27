use bson::{doc, Document};
use chrono::{DateTime, Utc};
use mongodb::bson;
use mongodb::bson::oid::ObjectId;
use rocket::serde::{Deserialize, Serialize};
use rocket_validation::Validate;

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagDocument {
    pub _id: ObjectId,

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
    #[serde(rename = "id")]
    pub _id: String,

    pub icon_updated_at: Option<DateTime<Utc>>,
    pub used_since: DateTime<Utc>,
    pub notable_project: Option<ObjectId>,

    pub name: String,
    pub description: Option<String>,
    pub website: Option<String>,

    pub score: Option<u8>,
}

impl From<TagDocument> for Tag {
    fn from(x: TagDocument) -> Self {
        let icon_updated_at: Option<DateTime<Utc>> = x.icon_updated_at.map(|data| data.into());
        Tag {
            _id: x._id.to_string(),
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

impl Tag {
    pub fn is_experience(&self) -> bool {
        self.icon_updated_at.is_some() && self.score.is_some()
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

// pub struct Validated<T>(T);

// #[rocket::async_trait]
// impl<'fr, T> rocket::request::FromRequest<'fr> for Validated<Json<T>>
// where
//     T: Validate + DeserializeOwned,
// {
//     type Error = ValidationError;

//     fn from_request<'r>(
//         request: &'fr rocket::Request<'r>,
//     ) -> rocket::request::Outcome<Self, Self::Error> {
//         todo!()
//     }
// }

impl TagInput {
    pub fn into_tag_doc(self) -> Document {
        doc! {
            "used_since": bson::DateTime::from(self.used_since),
            "icon_updated_at": None::<bson::DateTime>,

            "name": self.name.clone(),
            "description": self.description.clone(),
            "website": self.website.clone(),

            "notable_project": self.notable_project,

            "score": self.score.map(i32::from),
        }
    }

    pub fn into_project_doc(self) -> Document {
        doc! {
            "tags.$.used_since": bson::DateTime::from(self.used_since),
            "tags.$.name": self.name.clone(),
            "tags.$.description": self.description.clone(),
            "tags.$.website": self.website.clone(),

            "tags.$.notable_project": self.notable_project,

            "tags.$.score": self.score.map(i32::from),
        }
    }
}
