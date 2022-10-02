use chrono::DateTime;
use image::io::Reader as ImageReader;
use image::{self as Image, DynamicImage};
use mongodb::Database;
use rocket::serde::json::Json;
use rocket::State;
use std::thread;
use std::time::Instant;
use tokio::fs::remove_file;

use mongodb::bson::oid::ObjectId;
use rocket::form::Form;

use crate::db::asset::{self, insert};
use crate::errors::database::DatabaseError;
use crate::errors::response::CustomError;
use crate::lib::revalidate::Revalidator;
use crate::models::asset::{Asset, AssetPost, AssetUpdate};
use crate::models::response::{Response, ResponseBody};
use crate::{HTTPErr, HTTPOption};

#[post("/asset/<project_id>", data = "<input>")]
pub async fn post(
    db: &State<Database>,
    project_id: String,
    input: Form<AssetPost<'_>>,
) -> Response<Asset> {
    let now = Instant::now();

    let AssetPost {
        created_at,
        alt,
        description,
        is_displayed,
        is_pinned,
        mut file,
    } = input.into_inner();

    // input validation.
    let created_at = HTTPErr!(
        DateTime::parse_from_rfc3339(&created_at),
        400,
        "Invalid created_at"
    );

    // Parse project id.
    let project_id = HTTPErr!(ObjectId::parse_str(project_id), 400, "Invalid project_id");

    // get image content type.
    let file_type = HTTPOption!(file.content_type(), 400, "No file type detected");

    // Check if image is acceptable format.
    if !(file_type.is_png() || file_type.is_jpeg() || file_type.is_webp()) {
        return Err(CustomError::build(401, Some("Invalid file type")));
    };

    let asset_id = ObjectId::new();
    let extension = file_type.extension().unwrap().to_string();
    let archive_path = format!("media/archive/{asset_id}.{extension}");

    // save image to disk
    file.persist_to(&archive_path).await.map_err(|error| {
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

    let db_data = AssetUpdate {
        created_at: created_at.into(),
        alt,
        description,
        is_displayed,
        is_pinned,
    };

    // insert into db.
    let data = insert(db, project_id, db_data, asset_id, width, height)
        .await
        .map_err(|error| {
            let _ = remove_file(archive_path); // can't do anything if this fails.
            match error {
                DatabaseError::Database => {
                    CustomError::build(500, Some("Failed to create db entry."))
                }
                _ => CustomError::build(500, Some("Unexpected server error.")),
            }
        })?;

    println!("insert into db: {:?}", now.elapsed());
    let now = Instant::now();

    // Save images.
    save_images(asset_id, img, width, height)
        .await
        .map_err(|error| {
            dbg!(error);

            let _ = asset::delete(db, asset_id);
            data.delete_files();

            CustomError::build(500, Some("Failed to process image."))
        })?;

    println!("img save/crop: {:?}", now.elapsed());

    // Revalidate paths on next.js.
    let mut revalidated = Revalidator::new().add_project(project_id);

    // Check if gallery page should be re-rendered.
    if data.is_displayed {
        revalidated = revalidated.add_gallery();
    }

    let revalidated = Some(revalidated.send().await);

    // Respond
    Ok(Json(ResponseBody { revalidated, data }))
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
