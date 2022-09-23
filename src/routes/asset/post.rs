use chrono::DateTime;
use image::io::Reader as ImageReader;
use image::{self as Image, DynamicImage};
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use std::path::PathBuf;
use std::thread;
use std::time::Instant;
use tokio::fs::remove_file;

use mongodb::bson::oid::ObjectId;
use rocket::form::Form;

use crate::db::asset::{self, insert};
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::models::asset::{Asset, AssetInsert, AssetPost};
use crate::{HTTPErr, HTTPOption};

#[post("/asset", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    mut input: Form<AssetPost<'_>>,
) -> Result<Json<Asset>, CustomError> {
    let now = Instant::now();

    // input validation.
    let created_parsed = HTTPErr!(
        DateTime::parse_from_rfc3339(&input.created_at),
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
    let img = ImageReader::open(&archive_path)
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
        created_at: created_parsed.into(),
        project_id: project_id_parsed,
        alt: input.alt.to_owned(),
        description: input.description.to_owned(),
        is_displayed: input.is_displayed,
        is_pinned: input.is_pinned,
        height,
        width,
    };

    // insert into db.
    let result = insert(db, asset_input).await.map_err(|error| {
        let _ = remove_file(archive_path); // can't do anything if this fails.
        match error {
            DatabaseError::Database => CustomError::build(500, Some("Failed to create db entry.")),
            _ => CustomError::build(500, Some("Unexpected server error.")),
        }
    })?;

    println!("insert into db: {:?}", now.elapsed());
    let now = Instant::now();

    // Save images.
    save_images(id, img, width, height).await.map_err(|error| {
        dbg!(error);

        let _ = asset::delete(db, id);
        result.delete_files();

        CustomError::build(500, Some("Failed to process image."))
    })?;

    println!("img save/crop: {:?}", now.elapsed());

    Ok(Json(result))
}

async fn save_images(
    id: ObjectId,
    mut img: DynamicImage,
    width: u32,
    height: u32,
) -> Result<(), String> {
    // Normal image.
    let base_path = "media/content";
    let normal_path = format!("{base_path}/{id}.jpg");

    let img_clone = img.clone();

    let img1 = thread::spawn(move || {
        img_clone
            .into_rgba8()
            .save_with_format(normal_path, Image::ImageFormat::Jpeg)
            .unwrap();
    });

    // Square image.
    let square_path = format!("{base_path}/{id}_square.jpg");

    let img2 = thread::spawn(move || {
        let size = u32::min(width, height);
        let square = img.crop(width / 2 - size / 2, height / 2 - size / 2, size, size);
        square
            .into_rgba8()
            .save_with_format(square_path, Image::ImageFormat::Jpeg)
            .unwrap();
    });

    img1.join().map_err(|_| "couldnt join 1".to_string())?;
    img2.join().map_err(|_| "couldnt join 2".to_string())?;

    Ok(())
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
