use rocket_okapi::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Responder, Debug, Deserialize, Serialize, JsonSchema)]
pub struct MessageResponse {
    pub message: String,
}
