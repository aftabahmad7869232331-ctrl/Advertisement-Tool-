import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let active = true;
    navigator.serviceWorker.ready.then(() => {
      if (active) setIsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { isSupported: "serviceWorker" in navigator, isReady };
}
