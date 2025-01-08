use bson::DateTime;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Mail {
    pub created_at: DateTime,
    pub email: String,
    pub is_verified: bool,
}