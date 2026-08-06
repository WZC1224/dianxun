import { describe, expect, it } from "vitest";
import {
  buildCryptoCalendarEvents,
  mergeCalendarEvents,
} from "@/lib/providers/crypto-calendar";
import { filterCalendarHorizon } from "@/lib/providers/ff-calendar";

describe("crypto-calendar", () => {
  it("builds relative unlock/listing events", () => {
    const now = new Date("2026-08-06T00:00:00Z");
    const events = buildCryptoCalendarEvents(now);
    expect(events.some((e) => e.type === "解锁")).toBe(true);
    expect(events.some((e) => e.type === "上币")).toBe(true);
    const in7 = filterCalendarHorizon(events, 7, now.getTime());
    expect(in7.length).toBeGreaterThan(0);
    expect(in7.every((e) => e.id.startsWith("crypto-"))).toBe(true);
  });

  it("merges by id and sorts", () => {
    const merged = mergeCalendarEvents(
      [
        {
          id: "a",
          title: "later",
          type: "宏观",
          startsAt: "2026-08-10T00:00:00.000Z",
        },
      ],
      [
        {
          id: "b",
          title: "earlier",
          type: "解锁",
          startsAt: "2026-08-07T00:00:00.000Z",
        },
        {
          id: "a",
          title: "later-dup",
          type: "宏观",
          startsAt: "2026-08-10T00:00:00.000Z",
        },
      ],
    );
    expect(merged.map((e) => e.id)).toEqual(["b", "a"]);
    expect(merged[1].title).toBe("later-dup");
  });
});
