# Project: 点讯 (DianXun)

中文零售加密 PWA：快讯、ATR 点位、多空比、大事日历。仓：https://github.com/WZC1224/dianxun

## Tech Stack

- Next.js 15 App Router, React 19, TypeScript, Tailwind v4
- Vitest (unit), Playwright (e2e, system Chrome `channel: "chrome"`)
- PWA：`public/sw.js` + `manifest.webmanifest`（生产注册 SW）

## Commands

- Dev: `npm run dev` → http://localhost:3000
- Test: `npm run test` · `npm run test:e2e` · `npm run build` · `npm run lint`
- Icons: `npm run icons`（从 `public/icon.svg` 栅格）

## Project Map

| Area | Path | Notes |
|------|------|--------|
| Tabs UI | `app/(tabs)/`, `components/{news,levels,sentiment,calendar,shell}/` | 壳：`AppShell` |
| API | `app/api/{news,levels,long-short,calendar}/` | Route Handlers；回 `dataSource` + `degraded` |
| Providers | `lib/providers/` | `resolve*` 统一 mock/live/降级；测跟源文件旁 |
| Levels algo | `lib/levels/engine.ts` | ATR(14) + 支撑阻力带 |
| Watchlist | `lib/watchlist.ts` | `localStorage` |
| Spec/ADR | `docs/specs/`, `docs/adrs/0001-mvp-architecture.md` | 改架构先看 ADR |
| Tasks | `tasks/todo.md` | MVP Checkpoint D 已勾；延期项在文件内 |

## Data mode

- `DATA_MODE=mock|live`（`.env.local`，勿提交）
- live：Binance OHLC（`data-api.binance.vision`）、快讯 WSCN→RSS、Gate 多空、FF 宏观 + 相对日程解锁/上币
- FF 拉取失败用 bootstrap 时 `fresh:false` → `source:"mock"` → UI Banner
- 解锁真 API 延期（付费/不可达）

## Conventions

- 中文 UI 文案；技术标识符英文
- Provider 失败必须可降级；UI 用 `DataSourceBanner` / `EmptyState` / `OfflineBanner`
- 主题跟系统 `prefers-color-scheme`；勿擅自加独立暗色开关
- 单测：`*.test.ts` 紧挨源文件；新行为先测（TDD）
- 改 UI 尽量不动 API 契约；扩展 provider 只动 `lib/providers`

## Boundaries

- 永不提交 `.env*` 密钥 / `.env.local`
- 不擅自 Vercel 部署（产品决策：先不）
- 不做撮合/下单/账户
- 勿把 `.cursor/skills` 大堆 skill 垃圾提交进产品仓
- 问清再改数据库/引入重依赖（本仓无 DB）

## Gotchas

- `api.binance.com` 常被墙 → 用 vision 数据域
- FF 易 429 → 内存缓存 + bootstrap JSON
- Cursor 浏览器注入 `data-cursor-ref` 可触发假 hydration「1 Issue」
- Playwright 浏览器 CDN 可能不通 → config 用本机 Chrome
