use jwt_simple::prelude::*;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;

use crate::models::auth::UserInfo;

#[derive(Debug)]
pub enum AuthError {
    Missing,
    Invalid,
    Server,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for UserInfo {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        // Try to get cookie from user.
        let cookie = match req.cookies().get("token") {
            Some(data) => data,
            None => return Outcome::Failure((Status::Unauthorized, AuthError::Missing)),
        };

        let token = cookie.value();

        // Get the auth key from the rocket state.
        let key = match req.guard::<&State<HS512Key>>().await {
            rocket::outcome::Outcome::Success(data) => data,
            _ => return Outcome::Failure((Status::InternalServerError, AuthError::Server)),
        };

        // Verify token integrity.
        let claims = match key.verify_token::<UserInfo>(token, None) {
            Ok(data) => data,
            Err(err) => {
                println!("{}", err);
                req.cookies().remove(cookie.clone());
                return Outcome::Failure((Status::Unauthorized, AuthError::Invalid));
            }
        };

        let user_info = claims.custom;

        return Outcome::Success(user_info);
    }
}
