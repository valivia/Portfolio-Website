use std::sync::{Arc, Mutex};

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize,Clone)]
pub struct UserInfo {
    pub test: String,
}


pub struct LastLogin {
    pub code: Arc<Mutex<String>>,
}