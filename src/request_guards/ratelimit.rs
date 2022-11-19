use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;

use crate::models::ratelimit::Ratelimit;

pub struct RatelimitGuard {}

#[derive(Debug)]
pub enum RatelimitError {
    Ratelimited,
    ServerError,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RatelimitGuard {
    type Error = RatelimitError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let ip = match req.client_ip() {
            Some(ip) => ip,
            None => {
                return Outcome::Failure((
                    rocket::http::Status::InternalServerError,
                    RatelimitError::Ratelimited,
                ))
            }
        };

        // Get the auth key from the rocket state.
        let ratelimit = match req.guard::<&State<Ratelimit>>().await {
            rocket::outcome::Outcome::Success(data) => data,
            _ => {
                return Outcome::Failure((Status::InternalServerError, RatelimitError::ServerError))
            }
        };

        // Check if the user is ratelimited.
        if ratelimit.access(ip.to_string()) {
            return Outcome::Success(RatelimitGuard {});
        } else {
            return Outcome::Failure((Status::TooManyRequests, RatelimitError::Ratelimited));
        }
    }
}
