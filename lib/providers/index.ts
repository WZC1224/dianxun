import { getDataMode } from "@/lib/providers/data-mode";
import { resolveNewsProvider } from "@/lib/providers/resolve";
import type { NewsProvider } from "@/lib/providers/news-types";

export { getDataMode } from "@/lib/providers/data-mode";
export { resolveOhlc } from "@/lib/providers/resolve";

export function getNewsProvider(): NewsProvider {
  return resolveNewsProvider();
}

export function isLiveMode(): boolean {
  return getDataMode() === "live";
}
