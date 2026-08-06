"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "dianxun-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !chrome;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    if (isIosSafari()) {
      setShowIos(true);
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    setDeferred(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div
      className="border-b border-rule bg-slip px-3.5 py-2.5"
      role="region"
      aria-label="安装应用"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">安装点讯到主屏幕</p>
          <p className="mt-0.5 text-[11px] leading-snug text-mute">
            {showIos && !deferred
              ? "Safari：分享 → 添加到主屏幕"
              : "更快打开，全屏浏览快讯与点位"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {deferred ? (
            <button
              type="button"
              className="rounded-[length:var(--radius)] bg-live px-2.5 py-1.5 text-xs font-medium text-board"
              onClick={() => void install()}
            >
              安装
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-[length:var(--radius)] px-2 py-1.5 text-xs text-mute hover:text-ink"
            onClick={dismiss}
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
}
