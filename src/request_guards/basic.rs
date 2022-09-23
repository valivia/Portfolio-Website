use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};

use std::env;

// #[derive(OpenApiFromRequest)]
pub struct ApiKey(String);

#[derive(Debug)]
pub enum ApiKeyError {
    Missing,
    Invalid,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ApiKey {
    type Error = ApiKeyError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        fn is_valid(key: &str) -> bool {
            let api_key = env::var("API_KEY").expect("env.API_KEY is not found.");
            key == api_key
        }

        match req.headers().get_one("x-api-key") {
            None => Outcome::Failure((Status::Unauthorized, ApiKeyError::Missing)),
            Some(key) if is_valid(key) => Outcome::Success(ApiKey(key.to_owned())),
            Some(_) => Outcome::Failure((Status::Unauthorized, ApiKeyError::Invalid)),
        }
    }
}
