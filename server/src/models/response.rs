
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};

use crate::{lib::revalidate::RevalidateResult, errors::response::CustomError};

#[derive(Responder, Debug, Deserialize, Serialize)]
pub struct MessageResponse {
    pub message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ResponseBody<T> {
   pub revalidated: Option<RevalidateResult>,
   pub data: T 
}

pub type Response<T> = Result<Json<ResponseBody<T>>, CustomError>;