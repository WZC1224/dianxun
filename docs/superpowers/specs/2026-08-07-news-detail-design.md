# Design: 快讯应用内详情

**Date:** 2026-08-07  
**Status:** Approved (user: 干)  
**Approach:** A — `/news/[id]` + sessionStorage 缓存

## Goal

快讯列表点击进应用内详情：标题、摘要、来源/时间；有 `url` 时「看原文」外链。无全文爬取。

## Out of scope

- `GET /api/news/[id]`  
- 抓取原文 body  
- 改底栏 IA  

## UX

1. 列表整行可点 → `/news/[id]`  
2. 详情顶：返回快讯  
3. 无摘要：「暂无摘要」  
4. 缓存未命中（刷新深链）：提示回列表  

## Tech

- `lib/news-cache.ts`：`putNewsItems` / `getNewsItem`（sessionStorage）  
- 列表拉取后写入缓存  
- `app/(tabs)/news/[id]/page.tsx` + 详情组件  
- Mock 补 `summary`  

## Acceptance

- Mock 下点任一条进详情可见标题  
- 有 summary 显示正文区；有 url 显示原文按钮  
- 浏览器返回 / 「返回」回首页列表  
