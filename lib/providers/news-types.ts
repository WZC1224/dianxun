import type { NewsItem } from "@/lib/types";

export type { NewsItem };

export interface NewsProvider {
  listFlash(params: {
    limit: number;
    cursor?: string;
  }): Promise<{ items: NewsItem[]; nextCursor?: string }>;
}
