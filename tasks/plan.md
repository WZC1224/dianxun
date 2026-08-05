# Plan: 点讯 MVP

## Architecture

```
Browser (PWA)
    │
    ▼
Next.js App Router (RSC + Client islands)
    │
    ├── /api/news
    ├── /api/levels/[symbol]
    ├── /api/long-short
    └── /api/calendar
            │
            ▼
     Provider adapters ──► Mock | CoinGlass-like | News API | Calendar API
            │
            └── levels engine (OHLC in → levels out)
```

## Approaches (brainstorm)

| Approach | Pros | Cons |
|----------|------|------|
| A. Next.js PWA 单体 | 快、一仓、SSR 藏密钥 | 非原生体验 |
| B. Expo 原生 | 商店分发 | 双端+审核慢 |
| C. 静态前端 + 独立 API | 清晰拆分 | MVP 运维重 |

**推荐 A。** 小团队、先验证产品。

## Implementation order (vertical slices)

1. **骨架** — Next 工程、design tokens、四 Tab 壳、免责
2. **快讯切片** — types + MockNews + API + 列表 UI + 测试
3. **点位切片** — OHLC mock + 算法 + API + 点位卡 UI + 算法单测
4. **多空切片** — provider + API + 条形图 UI
5. **日历切片** — provider + API + 日分组列表
6. **真实适配占位** — `.env` 接线、错误降级 mock
7. **PWA + 打磨** — manifest、空态、加载、e2e smoke

## Risks

| Risk | Mitigation |
|------|------------|
| 数据源 TOS/限流 | adapter + cache + mock fallback |
| 点位被误解为投资建议 | 文案 + UI 层级；Ask first 改算法对外含义 |
| 范围膨胀 | Boundaries；Not Doing 列表 |

## Verification checkpoints

- After slice 1: 四 Tab 可切换，无数据占位
- After slice 2–3: 快讯+点位可演示
- After slice 4–5: 全功能 mock 演示
- After slice 6–7: build + test + e2e 绿

## Parallel opportunities

- UI 壳与 provider 契约可并行
- 多空与日历互不依赖（点位完成后可并行）
