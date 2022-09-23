use rocket_okapi::gen::OpenApiGenerator;
use rocket_okapi::okapi;
use rocket_okapi::okapi::openapi3::{MediaType, Responses};
use rocket_okapi::response::OpenApiResponderInner;
use rocket_okapi::OpenApiError;

/// error type
#[derive(Debug, serde::Serialize, schemars::JsonSchema)]
pub struct ErrorContent {
    /// HTTP Status Code returned
    code: u16,
    /// Reason for an error
    reason: String,
    /// Description for an error if any
    description: Option<String>,
}

/// Returns HTTP error if functions returns a result error.
#[macro_export]
macro_rules! HTTPErr {
    ($e:expr, $code:expr, $msg:expr) => {
        match $e {
            Ok(x) => x,
            Err(_) => return Err(CustomError::build($code, Some($msg))),
        }
    };
}

/// Returns HTTP error if functions returns None.
#[macro_export]
macro_rules! HTTPOption {
    ($e:expr, $code:expr, $msg:expr) => {
        match $e {
            Some(x) => x,
            None => return Err(CustomError::build($code, Some($msg))),
        }
    };
}

/// Error messages returned to user
#[derive(Debug, serde::Serialize, schemars::JsonSchema)]
pub struct CustomError {
    pub error: ErrorContent,
}

impl CustomError {
    /// building a custom error.
    pub fn build<S: Into<String>>(code: u16, description: Option<S>) -> CustomError {
        let reason = match code {
            400 => "Bad Request".to_string(),
            401 => "Unauthorized".to_string(),
            _ => "Error".to_string(),
        };
        CustomError {
            error: ErrorContent {
                code,
                reason,
                description: description.map(S::into),
            },
        }
    }
}

/// Create my custom response
pub fn bad_request_response(gen: &mut OpenApiGenerator) -> okapi::openapi3::Response {
    let schema = gen.json_schema::<CustomError>();
    okapi::openapi3::Response {
        description: "\
        # 400 Bad Request\n\
        The request given is wrongly formatted or data was missing. \
        "
        .to_owned(),
        content: okapi::map! {
            "application/json".to_owned() => MediaType {
                schema: Some(schema),
                ..Default::default()
            }
        },
        ..Default::default()
    }
}

pub fn unauthorized_response(gen: &mut OpenApiGenerator) -> okapi::openapi3::Response {
    let schema = gen.json_schema::<CustomError>();
    okapi::openapi3::Response {
        description: "\
        # 401 Unauthorized\n\
        The authentication given was incorrect or insufficient. \
        "
        .to_owned(),
        content: okapi::map! {
            "application/json".to_owned() => MediaType {
                schema: Some(schema),
                ..Default::default()
            }
        },
        ..Default::default()
    }
}

impl<'r> rocket::response::Responder<'r, 'static> for CustomError {
    fn respond_to(self, _: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        // Convert object to json
        let body = serde_json::to_string(&self).unwrap();
        rocket::Response::build()
            .sized_body(body.len(), std::io::Cursor::new(body))
            .header(rocket::http::ContentType::JSON)
            .status(rocket::http::Status::new(self.error.code))
            .ok()
    }
}

impl OpenApiResponderInner for CustomError {
    fn responses(gen: &mut OpenApiGenerator) -> Result<Responses, OpenApiError> {
        use rocket_okapi::okapi::openapi3::RefOr;
        Ok(Responses {
            responses: okapi::map! {
                "400".to_owned() => RefOr::Object(bad_request_response(gen)),
                // Note: 401 is already declared for ApiKey. so this is not essential.
                // "401".to_owned() => RefOr::Object(unauthorized_response(gen)),
            },
            ..Default::default()
        })
    }
}
