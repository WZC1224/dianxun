"use client";

import { useEffect, useState } from "react";

/** Client-only; SSR / first paint assume online. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}

export function networkErrorMessage(fallback: string): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "网络已断开。恢复后下拉或点刷新。";
  }
  return fallback;
}
