use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub struct Config {
    // Database.
    mongo_url: String,
    mongo_db_name: String,

    // Mailing.
    mailing_host: String,
    mailing_port: u64,
    mailing_user: String,
    mailing_pass: String,
    mailing_from: String,

    // Module urls.
    api_url: String,

    tfa_token: String,
    jwt_key: String,
    auth_timeout: u64,
}

pub fn validate_env() {
    match envy::from_env::<Config>() {
        Ok(_) => (), //println!("{:#?}", config),
        Err(error) => {
            eprintln!("{:#?}", error);
            panic!("{error}")
        }
    }
}
