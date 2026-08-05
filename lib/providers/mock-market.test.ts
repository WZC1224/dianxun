import { describe, expect, it } from "vitest";
import { mockOhlc } from "@/lib/providers/mock-market";

describe("mockOhlc", () => {
  it("returns identical series for same symbol", () => {
    expect(mockOhlc("BTC")).toEqual(mockOhlc("BTC"));
  });

  it("differs across symbols", () => {
    expect(mockOhlc("BTC").at(-1)?.close).not.toEqual(
      mockOhlc("ETH").at(-1)?.close,
    );
  });
});
