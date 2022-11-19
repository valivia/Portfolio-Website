pub mod response;

pub mod asset;
pub mod auth;
pub mod mail;
pub mod project;
pub mod tag;
pub mod ratelimit;
// this reads yyyy-mm-dd
// mod date_input_format {
//     use chrono::{DateTime, NaiveDate, TimeZone, Utc};
//     use serde::{self, Deserialize, Deserializer, Serializer};
//     const DATE_FORMAT: &str = "%Y-%m-%d";

//     pub fn serialize<S>(date: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
//     where
//         S: Serializer,
//     {
//         let s = format!("{}", date.format(DATE_FORMAT));
//         serializer.serialize_str(&s)
//     }

//     pub fn deserialize<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
//     where
//         D: Deserializer<'de>,
//     {
//         let s = String::deserialize(deserializer)?;
//         let date = NaiveDate::parse_from_str(&s, DATE_FORMAT).map_err(serde::de::Error::custom)?;
//         let date_time = date.and_hms(0, 0, 0);
//         Ok(Utc.from_utc_datetime(&date_time))
//     }
// }
