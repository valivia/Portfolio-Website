/// error type
#[derive(Debug, serde::Serialize)]
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
#[derive(Debug, serde::Serialize)]
pub struct CustomError {
    pub error: ErrorContent,
}

impl CustomError {
    /// building a custom error.
    pub fn build<S: Into<String>>(code: u16, description: Option<S>) -> CustomError {
        let reason = match code {
            400 => "Bad Request".to_string(),
            401 => "Unauthorized".to_string(),
            500 => "Server Error".to_string(),
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
