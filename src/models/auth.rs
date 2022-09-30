use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize,Clone)]
pub struct UserInfo {
    pub test: String,
}
