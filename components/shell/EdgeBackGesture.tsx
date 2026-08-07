"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

const EDGE_PX = 28;
const COMMIT_PX = 72;
const EXIT_WINDOW_MS = 2000;
const ROOT_TABS = new Set(["/", "/levels", "/long-short", "/calendar"]);

function atAppRoot(pathname: string) {
  return ROOT_TABS.has(pathname);
}

export function EdgeBackGesture() {
  const pathname = usePathname();
  const router = useRouter();
  const [dragX, setDragX] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const dragXRef = useRef(0);
  const tracking = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastExitPromptAt = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), EXIT_WINDOW_MS);
  }, []);

  const goBackOrExit = useCallback(async () => {
    const path = pathnameRef.current;
    if (!atAppRoot(path)) {
      router.back();
      return;
    }

    const now = Date.now();
    if (now - lastExitPromptAt.current < EXIT_WINDOW_MS) {
      lastExitPromptAt.current = 0;
      if (Capacitor.isNativePlatform()) {
        await App.exitApp();
      } else {
        showToast("网页无法退出，请关闭标签页");
      }
      return;
    }

    lastExitPromptAt.current = now;
    showToast("再滑一次退出应用");
  }, [router, showToast]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let removed = false;
    let handle: { remove: () => Promise<void> } | undefined;
    void App.addListener("backButton", () => {
      void goBackOrExit();
    }).then((h) => {
      if (removed) {
        void h.remove();
        return;
      }
      handle = h;
    });
    return () => {
      removed = true;
      void handle?.remove();
    };
  }, [goBackOrExit]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE_PX) return;
      tracking.current = true;
      startX.current = t.clientX;
      startY.current = t.clientY;
      dragXRef.current = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      const t = e.touches[0];
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);
      if (dy > 40 && dy > Math.abs(dx)) {
        tracking.current = false;
        setDragX(0);
        dragXRef.current = 0;
        return;
      }
      if (dx > 0) {
        const clamped = Math.min(dx, 120);
        dragXRef.current = clamped;
        setDragX(clamped);
        if (dx > 8) e.preventDefault();
      }
    };

    const onEnd = () => {
      if (!tracking.current) return;
      tracking.current = false;
      const dx = dragXRef.current;
      setDragX(0);
      dragXRef.current = 0;
      if (dx >= COMMIT_PX) {
        void goBackOrExit();
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [goBackOrExit]);

  const progress = Math.min(dragX / COMMIT_PX, 1);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-0 z-[60] w-1 bg-live/40 transition-opacity"
        style={{
          opacity: progress > 0 ? 0.35 + progress * 0.65 : 0,
          boxShadow:
            progress > 0
              ? `${dragX * 0.35}px 0 24px rgba(45, 212, 191, 0.25)`
              : "none",
          transform: `scaleX(${Math.max(progress, 0.15)})`,
          transformOrigin: "left center",
        }}
      />
      {toast ? (
        <div
          role="status"
          className="pointer-events-none fixed bottom-24 left-1/2 z-[70] max-w-[90%] -translate-x-1/2 rounded-[length:var(--radius)] bg-ink/90 px-3.5 py-2 text-center text-sm text-board shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
