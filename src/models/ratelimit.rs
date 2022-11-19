use std::{collections::HashMap, sync::{atomic::AtomicU32, Arc, Mutex}};

#[derive(Debug)]
pub struct Ratelimit {
    // TODO: use a concurrent hashmap
    inner: Arc<Mutex<HashMap<String, AtomicU32>>>,
    limit: u32,
}

impl Ratelimit {
    pub fn new(limit: u32, clear_interval: std::time::Duration) -> Self {
        let selv = Self {
            inner: Arc::new(Mutex::new(HashMap::new())),
            limit,
        };
        selv.spawn_clear_task(clear_interval);
        selv
    }

    pub fn access(&self, key: String) -> bool {
        println!("accessing key: {}", key);
        let mut map = self.inner.lock().unwrap();
        let counter = map.entry(key).or_insert(AtomicU32::new(0));
        let count = counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        count < self.limit
    }

    pub fn spawn_clear_task(&self, interval: std::time::Duration) {
        let inner = self.inner.clone();
        std::thread::spawn(move || loop {
            std::thread::sleep(interval);
            let mut map = inner.lock().unwrap();
            map.clear();
        });
    }
}
