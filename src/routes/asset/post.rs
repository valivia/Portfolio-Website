use std::thread;

use image as Image;
use image::io::Reader as ImageReader;
use mongodb::bson::DateTime;
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use std::path::PathBuf;
use std::time::Instant;
use tokio::fs::remove_file;

use mongodb::bson::oid::ObjectId;
use rocket::form::Form;

use crate::db::asset::{insert, InsertError};
use crate::errors::response::CustomError;
use crate::models::asset::{AssetInsert, AssetPost, Asset};
use crate::{HTTPErr, HTTPOption};

#[post("/asset", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    mut input: Form<AssetPost<'_>>,
) -> Result<Json<Asset>, CustomError> {
    let now = Instant::now();

    // input validation.
    let created_parsed = HTTPErr!(
        DateTime::parse_rfc3339_str(&input.created_at),
        400,
        "Invalid created_at"
    );

    let project_id_parsed = HTTPErr!(
        ObjectId::parse_str(&input.project_id),
        400,
        "Invalid project_id"
    );

    // get image content type.
    let file_type = HTTPOption!(input.file.content_type(), 400, "No file type detected");

    // Check if image is acceptable format.
    if !(file_type.is_png() || file_type.is_jpeg() || file_type.is_webp()) {
        return Err(CustomError::build(401, Some("Invalid file type")));
    };

    let id = ObjectId::new();
    let extension = file_type.extension().unwrap().to_string();

    // make path.
    let media_path = PathBuf::from("media");

    let mut archive_path = media_path.clone();
    archive_path.push("archive");
    archive_path.push(id.to_string());
    archive_path.set_extension(extension);

    // save image to disk
    input
        .file
        .persist_to(&archive_path)
        .await
        .map_err(|error| {
            eprintln!("{error}");
            CustomError::build(500, Some("Failed to persist file.".to_string()))
        })?;

    // open image for editing
    let mut img = ImageReader::open(&archive_path)
        .map_err(|error| {
            eprintln!("{error}");
            CustomError::build(500, Some("Failed to read image.".to_string()))
        })?
        .decode()
        .map_err(|error| {
            eprintln!("{error}");
            CustomError::build(500, Some("Failed to decode image.".to_string()))
        })?;

    println!("img open: {:?}", now.elapsed());
    let now = Instant::now();

    let width = img.width();
    let height = img.height();

    let asset_input = AssetInsert {
        id,
        created_at: created_parsed,
        project_id: project_id_parsed,
        alt: input.alt.to_owned(),
        description: input.description.to_owned(),
        is_displayed: input.is_displayed,
        is_pinned: input.is_pinned,
        height,
        width,
    };

    // insert into db.
    let result = match insert(db, asset_input).await {
        Ok(data) => data,
        Err(error) => {
            let _ = remove_file(archive_path).await; // can't do anything if this fails.
            match error {
                InsertError::NotFound => {
                    return Err(CustomError::build(
                        400,
                        Some("No project with this ID exists"),
                    ))
                }
                InsertError::Database => {
                    return Err(CustomError::build(500, Some("Failed to create db entry.")))
                }
                _ => return Err(CustomError::build(500, Some("Unexpected server error."))),
            }
        }
    };

    println!("insert into db: {:?}", now.elapsed());
    let now = Instant::now();

    let mut content_path = media_path.clone();
    content_path.push("content");

    // Save images.
    thread::scope(|s| {
        // Normal image.
        let mut normal_path = content_path.clone();
        normal_path.push(format!("{id}.jpg"));
        let img_clone = img.clone();

        s.spawn(move || {
            img_clone
                .save_with_format(normal_path, Image::ImageFormat::Jpeg)
                .unwrap();
        });

        // Square image.
        let mut square_path = content_path.clone();
        square_path.push(format!("{id}_square.jpg"));

        s.spawn(|| {
            let size = u32::min(width, height);
            let square = img.crop(width / 2 - size / 2, height / 2 - size / 2, size, size);
            square
                .save_with_format(square_path, Image::ImageFormat::Jpeg)
                .unwrap();
        });
    });

    println!("img save/crop: {:?}", now.elapsed());

    Ok(Json(result))
}

// old scale code
// let pixels = width * height;
// let scale = (3840 * 2160) as f32 / pixels as f32;
// let scale = scale.sqrt();
// let width = (width as f32 * scale) as u32;
// let height = (height as f32 * scale) as u32;

// println!("calculations: {:?}", now.elapsed());
// let now = Instant::now();

// let scaled = img.resize(width, height, image::imageops::FilterType::Lanczos3);
