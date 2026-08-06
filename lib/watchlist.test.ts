import { describe, expect, it } from "vitest";
import {
  DEFAULT_WATCHLIST,
  normalizeWatchlist,
  orderSymbolsByWatchlist,
  toggleWatchlist,
} from "@/lib/watchlist";

describe("watchlist", () => {
  it("normalizes and defaults", () => {
    expect(normalizeWatchlist(null)).toEqual(DEFAULT_WATCHLIST);
    expect(normalizeWatchlist(["btc", "FOO", "ETH"])).toEqual(["BTC", "ETH"]);
  });

  it("toggles without dropping last symbol", () => {
    const one = toggleWatchlist("BTC", ["BTC"]);
    expect(one).toEqual(["BTC"]);
    const two = toggleWatchlist("ETH", ["BTC"]);
    expect(two).toEqual(["BTC", "ETH"]);
    const back = toggleWatchlist("ETH", two);
    expect(back).toEqual(["BTC"]);
  });

  it("orders starred first", () => {
    expect(orderSymbolsByWatchlist(["SOL", "BNB"])).toEqual([
      "SOL",
      "BNB",
      "BTC",
      "ETH",
      "XRP",
    ]);
  });
});
