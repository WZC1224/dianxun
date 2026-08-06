import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyFfEvent,
  fetchFfCalendar,
  filterCalendarHorizon,
  parseFfCalendar,
} from "@/lib/providers/ff-calendar";

describe("ff-calendar", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("classifies meeting vs macro", () => {
    expect(classifyFfEvent("FOMC Meeting")).toBe("会议");
    expect(classifyFfEvent("Non-Farm Payrolls")).toBe("宏观");
    expect(classifyFfEvent("Bank Holiday")).toBe("其他");
  });

  it("parses FF rows", () => {
    const events = parseFfCalendar([
      {
        title: "CPI m/m",
        country: "USD",
        date: "2026-08-10T08:30:00-04:00",
        impact: "High",
        forecast: "0.2%",
        previous: "0.1%",
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("宏观");
    expect(events[0].detail).toContain("USD");
    expect(events[0].id).toMatch(/^ff-/);
  });

  it("filters by horizon with lookback", () => {
    const now = Date.parse("2026-08-06T00:00:00Z");
    const events = parseFfCalendar([
      {
        title: "Yesterday",
        country: "USD",
        date: "2026-08-05T12:00:00Z",
        impact: "Low",
      },
      {
        title: "Soon",
        country: "USD",
        date: "2026-08-07T12:00:00Z",
        impact: "Low",
      },
      {
        title: "Far",
        country: "USD",
        date: "2026-09-01T12:00:00Z",
        impact: "Low",
      },
    ]);
    expect(filterCalendarHorizon(events, 7, now)).toHaveLength(2);
    expect(filterCalendarHorizon(events, 30, now)).toHaveLength(3);
  });

  it("marks fresh false when network fails and bootstrap used", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { events, fresh } = await fetchFfCalendar(7);
    expect(fresh).toBe(false);
    expect(events.length).toBeGreaterThan(0);
  });
});
