use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub struct Config {
    // Database.
    pub mongo_url: String,
    pub mongo_db_name: String,

    // Mailing.
    pub mailing_host: String,
    pub mailing_port: u64,
    pub mailing_user: String,
    pub mailing_pass: String,
    pub mailing_from: String,

    // Module urls.
    pub app_url: String,

    // auth
    pub tfa_token: String,
    pub jwt_key: String,
    pub auth_timeout: u64,
}

pub fn validate_env() -> Config {
    match envy::from_env::<Config>() {
        Ok(data) => data,
        Err(error) => {
            eprintln!("{:#?}", error);
            panic!();
        }
    }
}
