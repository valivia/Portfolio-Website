use crate::errors::response::CustomError;
use crate::lib::env::Config;
use crate::models::auth::{LastLogin, UserInfo};

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
    config: &State<Config>,
    key: &State<HS512Key>,
    last_login: &State<LastLogin>,
    input: Validated<Json<LoginInput>>,
) -> Result<(), CustomError> {
    let data = input.0;
    let auth = GoogleAuthenticator::new();

    // Verify if the code is valid.
    if !auth.verify_code(&config.tfa_token, &data.code, 0, 0) {
        return Err(CustomError::build(403, Some("Invalid code")));
    }

    // Get previous login from arc mutex
    let mut last_code_lock = last_login.code.lock().unwrap();

    // Check if the code was already used
    if data.code == *last_code_lock {
        return Err(CustomError::build(403, Some("Code already used")));
    }

    // set new last_login value and drop the lock.
    *last_code_lock = data.code.clone();
    drop(last_code_lock);

    // Make jwt.
    let claims = Claims::with_custom_claims::<UserInfo>(
        UserInfo {
            test: String::from("a"),
        },
        Duration::from_mins(config.auth_timeout),
    );

    // Sign jwt.
    let token = key
        .authenticate(claims)
        .map_err(|_| CustomError::build(500, Some("Unexpected server error.")))?;

    // Make cookie.
    let cookie = Cookie::build("token", token)
        .max_age(time::Duration::minutes(config.auth_timeout as i64))
        .finish();

    // Set cookie.
    cookies.add(cookie);

    Ok(())
}
