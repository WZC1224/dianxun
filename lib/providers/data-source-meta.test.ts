import { afterEach, describe, expect, it, vi } from "vitest";
import { dataSourceMeta } from "@/lib/providers/data-source-meta";

describe("dataSourceMeta", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks degraded when live mode serves mock", () => {
    vi.stubEnv("DATA_MODE", "live");
    expect(dataSourceMeta("mock")).toEqual({
      dataSource: "mock",
      degraded: true,
    });
  });

  it("is not degraded for intentional mock mode", () => {
    vi.stubEnv("DATA_MODE", "mock");
    expect(dataSourceMeta("mock")).toEqual({
      dataSource: "mock",
      degraded: false,
    });
  });

  it("is not degraded for live source", () => {
    vi.stubEnv("DATA_MODE", "live");
    expect(dataSourceMeta("live")).toEqual({
      dataSource: "live",
      degraded: false,
    });
  });
});
