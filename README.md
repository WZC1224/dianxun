# 点讯 DianXun

加密快讯 + 交易参考点位 + 多空比 + 大事日历（Next.js PWA）。

Agent / 协作者先读 [`AGENTS.md`](./AGENTS.md)（栈、地图、边界、坑）。

## 本地开发

```bash
npm install
npm run dev
```

http://localhost:3000

## 命令

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
npm start
```

## 部署（Vercel 推荐）

1. 代码推 GitHub / GitLab
2. Vercel → New Project → 选本仓库（Root 保持仓库根）
3. Build Command 默认 `next build`；Output `.next`
4. 环境变量（可选）：

| 名 | 说明 |
|----|------|
| `DATA_MODE` | `mock` 默认；`live` 接真源 |
| `BINANCE_API_BASE` | 点位 K 线，默认 `data-api.binance.vision` |
| `NEWS_RSS_URL` | 快讯 RSS，默认 Cointelegraph |
| `NEWS_SOURCE_LABEL` | 快讯来源名 |
| `GATE_API_BASE` | 多空/资金费率，默认 `api.gateio.ws` |
| `CALENDAR_FF_URL` | 宏观日历 JSON（FF 本周） |

复制 `.env.example` → `.env.local`。失败自动回 mock。

Node ≥ 20.19（本地 20.12 可用但有引擎告警）。

## 数据

- `mock`：本地确定性假数据
- `live`：点位 ← Binance 4h；快讯 ← 华尔街见闻 blockchain（失败再 RSS）；多空 ← Gate；日历 ← Forex Factory 宏观 + 解锁/上币相对日程
- 自选币：浏览器 `localStorage`（点位页；首页胶带跟自选前 3）
- 解锁 API 多为付费/不可达，故解锁/上币用相对日程模板，接真源后可替换

## 文档

- Spec: `docs/specs/2026-08-05-dianxun-spec.md`
- UI: `docs/design/dianxun-ui.md`
- Preflight: `docs/design/preflight-coding.md`
- Review: `docs/reviews/2026-08-05-mvp-review.md`
- Tasks: `tasks/todo.md`
