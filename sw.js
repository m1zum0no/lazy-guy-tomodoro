const cacheName = "v6";
const contentToCache = [
    "./",
    "./index.html", 
    "./style.css",

    "./sw.js", 
    "./worker.js",

    "./scripts/main.js",
    "./scripts/timer.js",
    "./scripts/profile_settings/timer_durations.js",
    "./scripts/profile_settings/stats.js",
    "./scripts/view.js",
    "./scripts/profile_settings/ui_settings.js",
    "./scripts/profile_settings/audio.js",

	"./icons/icon192.png",
	"./icons/icon512.png",
	"./icons/maskable192.png",
	"./icons/maskable512.png",
	"./icons/favicon.png",
	"./icons/appletouch.png",
];


self.addEventListener("install", (e) => {
	console.log("Service Worker installed");
	e.waitUntil(
		(async () => {
			const cache = await caches.open(cacheName);
			await cache.addAll(contentToCache).catch(err => console.log(err));
		})()
	);
});

self.addEventListener("fetch", function (event) {
	event.respondWith(fetch(event.request).then((res) => {
		let response = res.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, response);
        });
		return res
	}).catch((err) => {
		return caches.match(event.request)
	})
	);
});
