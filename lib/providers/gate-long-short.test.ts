import { describe, expect, it } from "vitest";
import { parseGateContract } from "@/lib/providers/gate-long-short";

describe("parseGateContract", () => {
  it("computes long/short pct from user counts", () => {
    const { row, fundingRate, intervalHours } = parseGateContract("BTC", {
      long_users: 60,
      short_users: 40,
      funding_rate: "0.0001",
      funding_interval: 28_800,
    });
    expect(row.longPct).toBe(60);
    expect(row.shortPct).toBe(40);
    expect(fundingRate).toBe(0.0001);
    expect(intervalHours).toBe(8);
  });

  it("rejects empty users", () => {
    expect(() =>
      parseGateContract("ETH", { long_users: 0, short_users: 0 }),
    ).toThrow(/empty/i);
  });
});
