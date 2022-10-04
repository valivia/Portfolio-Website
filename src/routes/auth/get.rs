use crate::{errors::response::CustomError, lib::env::Config};

use rocket::State;
use google_authenticator::GoogleAuthenticator;

#[get("/auth/qr")]
pub async fn qr(config: &State<Config>) -> Result<String, CustomError> {
    let auth = GoogleAuthenticator::new();

    let code = auth
        .qr_code(&config.tfa_token, "qr_code", "name", 200, 200, 'M')
        .map_err(|_| CustomError::build(500, None))?;

    Ok(code)
}
