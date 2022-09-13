use super::rocket;
use crate::models::response::MessageResponse;
use rocket::http::Status;
use rocket::local::blocking::Client;

#[test]
fn hello_world() {
    let client = Client::tracked(rocket()).expect("valid rocket instance");
    let response = client.get("/").dispatch();
    assert_eq!(response.status(), Status::Ok);
    assert_eq!(
        response.into_string().unwrap(),
        serde_json::to_string(&MessageResponse {
            message: "Hello World!".to_string()
        })
        .unwrap()
    );
}
