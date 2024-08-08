self.addEventListener("install", (event) => {
    console.log("Service Worker installing.");
    // Add a call to skipWaiting here if you want to force the waiting service worker to become the active service worker
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activating.");
    // Perform some task
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  