use std::env;

use crate::errors::response::CustomError;
use google_authenticator::GoogleAuthenticator;

#[get("/auth/qr")]
pub async fn qr() -> Result<String, CustomError> {
    todo!();
    let auth = GoogleAuthenticator::new();
    let secret = env::var("TFA_TOKEN").unwrap();

    let code = auth
        .qr_code(&secret, "qr_code", "name", 200, 200, 'M')
        .map_err(|_| CustomError::build(500, Some("Unexpected server error.")))?;

    Ok(code)
}
