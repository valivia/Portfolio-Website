
use serde::{Deserialize, Serialize};

#[derive(Responder, Debug, Deserialize, Serialize)]
pub struct MessageResponse {
    pub message: String,
}
