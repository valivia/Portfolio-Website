use crate::{errors::response::CustomError, lib::env::Config};

use google_authenticator::GoogleAuthenticator;
use rocket::State;

#[get("/auth/qr")]
pub async fn qr(config: &State<Config>) -> Result<String, CustomError> {
    let auth = GoogleAuthenticator::new();

    let code = auth
        .qr_code(&config.tfa_token, "Portfolio", "Owl Corp", 200, 200, 'M')
        .map_err(|_| CustomError::build(500, None))?;

    Ok(code)
}
