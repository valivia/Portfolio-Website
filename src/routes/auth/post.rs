use std::env;
use std::sync::Arc;

use crate::errors::response::CustomError;
use crate::models::auth::{LastLogin, UserInfo};
use google_authenticator::GoogleAuthenticator;
use jwt_simple::prelude::*;
use rocket::http::{Cookie, CookieJar};
use rocket::serde::json::Json;
use rocket::time;
use rocket::State;
use rocket_validation::{Validate, Validated};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;

#[derive(Debug, Deserialize, Serialize, Validate, Clone)]
#[serde(crate = "rocket::serde")]
pub struct LoginInput {
    code: String,
}

#[post("/auth/login", data = "<input>")]
pub async fn login(
    cookies: &CookieJar<'_>,
    key: &State<HS512Key>,
    last_login: &State<LastLogin>,
    input: Validated<Json<LoginInput>>,
) -> Result<(), CustomError> {
    let data = input.0;
    let auth = GoogleAuthenticator::new();
    let secret = env::var("TFA_TOKEN").unwrap();
    let max_age = env::var("AUTH_TIMEOUT").unwrap().parse::<u64>().unwrap();

    // todo!();
    // let code_u64 = data
    //     .code
    //     .parse::<u64>()
    //     .map_err(|_| CustomError::build(403, Some("Invalid code")))?;

    // let last_code = last_login.code.try_lock();

    // if code_u64 == last_code {
    //     return Err(CustomError::build(403, Some("Invalid code")));
    // }

    if !auth.verify_code(&secret, &data.code, 0, 0) {
        return Err(CustomError::build(403, Some("Invalid code")));
    }



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
