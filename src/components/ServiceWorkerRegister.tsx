"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log(
            "PWA: Service worker registered"
          );
        })
        .catch((error) => {
          console.error(
            "PWA: Service worker registration failed:",
            error
          );
        });
    }
  }, []);

  return null;
}