"use client";

import { useEffect } from "react";

const SW_MIGRATION_KEY = "wc-sw-migration";
const SW_MIGRATION_VERSION = 3;

/**
 * Registers the PWA service worker and migrates away from older builds
 * that intercepted third-party ad requests.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      const migrated = localStorage.getItem(SW_MIGRATION_KEY);
      if (migrated !== String(SW_MIGRATION_VERSION)) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        localStorage.setItem(SW_MIGRATION_KEY, String(SW_MIGRATION_VERSION));
      }

      const reg = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });
      await reg.update();
    };

    register().catch(() => {});
  }, []);

  return null;
}
