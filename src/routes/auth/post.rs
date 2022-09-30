use std::env;

use crate::errors::response::CustomError;
use crate::models::auth::UserInfo;
use google_authenticator::GoogleAuthenticator;
use jwt_simple::prelude::*;
use rocket::http::{Cookie, CookieJar};
use rocket::serde::json::Json;
use rocket::time;
use rocket::State;
use rocket_validation::{Validate, Validated};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct LoginInput {
    code: String,
}

#[post("/auth/login", data = "<input>")]
pub async fn login(
    cookies: &CookieJar<'_>,
    key: &State<HS512Key>,
    input: Validated<Json<LoginInput>>,
) -> Result<(), CustomError> {
    let data = input.0;
    let auth = GoogleAuthenticator::new();
    let secret = env::var("TFA_TOKEN").expect("TFA_TOKEN is not found.");

    if !auth.verify_code(&secret, &data.code, 3, 0) {
        return Err(CustomError::build(403, Some("Invalid code")));
    }

    let max_age = env::var("AUTH_TIMEOUT").unwrap().parse::<u64>().unwrap();

    let claims = Claims::with_custom_claims::<UserInfo>(
        UserInfo {
            test: String::from("a"),
        },
        Duration::from_mins(max_age),
    );

    let token = key
        .authenticate(claims)
        .map_err(|_| CustomError::build(500, Some("Unexpected server error.")))?;

    let cookie = Cookie::build("token", token)
        .max_age(time::Duration::hours(max_age as i64))
        .finish();

    cookies.add(cookie);

    Ok(())
}
