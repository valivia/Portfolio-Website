use std::env;

use bson::oid::ObjectId;
use futures::future;
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

pub struct Revalidator {
    paths: Vec<String>,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct RevalidateResult {
    success: Vec<String>,
    failed: Vec<String>,
}

impl Revalidator {
    pub fn new() -> Revalidator {
        Revalidator { paths: vec![] }
    }

    pub fn add<S: Into<String>>(mut self, url: S) -> Revalidator {
        self.paths.push(url.into());
        self
    }

    pub fn add_projects(self) -> Revalidator {
        self.add("projects")
    }

    pub fn add_gallery(self) -> Revalidator {
        self.add("gallery")
    }

    pub fn add_about(self) -> Revalidator {
        self.add("about")
    }

    pub fn add_project(self, oid: ObjectId) -> Revalidator {
        self.add(format!("project/{oid}"))
    }

    pub async fn send(self) -> RevalidateResult {
        let client = reqwest::Client::new();

        let mut result = RevalidateResult {
            success: vec![],
            failed: vec![],
        };

        let responses = future::join_all(self.paths.into_iter().map(|path| {
            let client = &client;
            let base_url = env::var("APP_URL").unwrap();
            let api_key = env::var("API_KEY").unwrap();

            async move {
                match client
                    .get(format!("{base_url}/api/revalidate/{path}"))
                    .header("authorization", api_key)
                    .send()
                    .await
                {
                    Ok(resp) => {
                        if resp.status() == StatusCode::OK {
                            Ok(path)
                        } else {
                            Err(path)
                        }
                    }
                    Err(err) => {
                        eprintln!("{err}");
                        Err(path)
                    }
                }
            }
        }))
        .await;

        for resp in responses {
            match resp {
                Ok(path) => result.success.push(path),
                Err(path) => result.failed.push(path),
            }
        }

        result
    }
}
