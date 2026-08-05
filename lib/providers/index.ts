import { MockNewsProvider } from "@/lib/providers/mock-news";
import type { NewsProvider } from "@/lib/providers/news-types";

export function getDataMode(): "mock" | "live" {
  return process.env.DATA_MODE === "live" ? "live" : "mock";
}

export function getNewsProvider(): NewsProvider {
  // live adapter placeholder: fall back to mock until wired
  return new MockNewsProvider();
}
