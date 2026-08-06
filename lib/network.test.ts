import { describe, expect, it, vi, afterEach } from "vitest";
import { networkErrorMessage } from "@/lib/network";

describe("networkErrorMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses offline copy when navigator.onLine is false", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(networkErrorMessage("通用失败")).toBe(
      "网络已断开。恢复后下拉或点刷新。",
    );
  });

  it("keeps fallback when online", () => {
    vi.stubGlobal("navigator", { onLine: true });
    expect(networkErrorMessage("通用失败")).toBe("通用失败");
  });
});
