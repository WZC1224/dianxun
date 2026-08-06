import { describe, expect, it, vi } from "vitest";
import { errFields, log } from "@/lib/observability/log";

describe("observability log", () => {
  it("emits JSON with event and strips secret keys", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    log("warn", "provider_fallback", {
      provider: "gate",
      token: "should-not-appear",
      secret: "nope",
    });
    expect(spy).toHaveBeenCalledOnce();
    const line = String(spy.mock.calls[0][0]);
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed.event).toBe("provider_fallback");
    expect(parsed.provider).toBe("gate");
    expect(parsed.token).toBeUndefined();
    expect(parsed.secret).toBeUndefined();
    spy.mockRestore();
  });

  it("errFields keeps message bounded", () => {
    const fields = errFields(new Error("x".repeat(600)));
    expect(fields.errName).toBe("Error");
    expect(fields.errMessage).toHaveLength(500);
  });
});
