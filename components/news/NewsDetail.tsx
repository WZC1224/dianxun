"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react";
import type { NewsItem } from "@/lib/types";
import { getNewsItem } from "@/lib/news-cache";
import { formatRelativeTime } from "@/lib/time";
import { Disclaimer } from "@/components/shell/Disclaimer";
import { EmptyState } from "@/components/shell/EmptyState";

export function NewsDetail({ id }: { id: string }) {
  const [item, setItem] = useState<NewsItem | null | undefined>(undefined);

  useEffect(() => {
    setItem(getNewsItem(id));
  }, [id]);

  if (item === undefined) {
    return <p className="py-10 text-center text-sm text-mute">加载中...</p>;
  }

  if (!item) {
    return (
      <div className="py-6">
        <BackLink />
        <div className="mt-4">
          <EmptyState
            title="找不到这条快讯"
            detail="可能已刷新页面。回列表再点一次。"
          />
          <div className="mt-3 text-center">
            <Link href="/" className="text-sm text-live">
              回快讯
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="flex min-h-full flex-col py-3">
      <BackLink />
      <div className="panel mt-3 px-3.5 py-4">
        <p className="text-[11px] text-mute">
          {item.source} · {formatRelativeTime(item.publishedAt)}
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">
          {item.title}
        </h2>
        {item.symbols && item.symbols.length > 0 ? (
          <p className="font-data mt-2 text-[11px] text-live">
            {item.symbols.join(" · ")}
          </p>
        ) : null}
        <p className="mt-4 text-[15px] leading-relaxed text-ink">
          {item.summary?.trim() ? item.summary : "暂无摘要"}
        </p>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-[length:var(--radius)] bg-slip px-3 py-2 text-sm text-live transition-colors hover:bg-rule"
          >
            看原文
            <ArrowSquareOut size={16} aria-hidden />
          </a>
        ) : null}
      </div>
      <div className="pb-4 pt-4">
        <Disclaimer />
      </div>
    </article>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 text-sm text-mute transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} aria-hidden />
      返回快讯
    </Link>
  );
}
