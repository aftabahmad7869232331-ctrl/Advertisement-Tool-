export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      if (import.meta.env.DEV) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/sw.js",
        { updateViaCache: "none" }
      );
      void registration.update();
    } catch (error) {
      console.warn("Offline acceleration is unavailable:", error);
    }
  });
}
